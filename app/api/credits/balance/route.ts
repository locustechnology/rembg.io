import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // First, ensure user exists in rembg_user table (sync from Better Auth's user table if needed)
    const { data: existingRembgUser } = await supabaseAdmin
      .from("rembg_user")
      .select("id")
      .eq("id", session.user.id)
      .maybeSingle();

    if (!existingRembgUser) {
      // User doesn't exist in rembg_user, try to sync from Better Auth's user table
      console.log("User not found in rembg_user, attempting to sync from user table");
      
      const { data: betterAuthUser } = await supabaseAdmin
        .from("user")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      let userCreated = false;

      if (betterAuthUser) {
        // Sync user from Better Auth's user table to rembg_user
        const { error: syncError } = await supabaseAdmin
          .from("rembg_user")
          .insert({
            id: betterAuthUser.id,
            name: betterAuthUser.name || session.user.name || session.user.email.split("@")[0],
            email: betterAuthUser.email || session.user.email,
            emailVerified: betterAuthUser.emailVerified || session.user.emailVerified || false,
            image: betterAuthUser.image || session.user.image || null,
            createdAt: betterAuthUser.createdAt || new Date().toISOString(),
            updatedAt: betterAuthUser.updatedAt || new Date().toISOString(),
          });

        if (syncError) {
          // Check if it's a duplicate key error (user was already created by trigger)
          if (syncError.code === '23505') {
            console.log("User already exists in rembg_user (likely created by trigger)");
            userCreated = true;
          } else {
            console.error("Error syncing user to rembg_user:", syncError);
          }
        } else {
          console.log("Successfully synced user to rembg_user");
          userCreated = true;
        }
      } else {
        // User doesn't exist in either table, create in rembg_user using session data
        console.log("User not found in user table either, creating from session data");
        const { error: createUserError } = await supabaseAdmin
          .from("rembg_user")
          .insert({
            id: session.user.id,
            name: session.user.name || session.user.email.split("@")[0],
            email: session.user.email,
            emailVerified: session.user.emailVerified || false,
            image: session.user.image || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });

        if (createUserError) {
          // Check if it's a duplicate key error (user was already created)
          if (createUserError.code === '23505') {
            console.log("User already exists in rembg_user");
            userCreated = true;
          } else {
            console.error("Error creating user in rembg_user:", createUserError);
          }
        } else {
          userCreated = true;
        }
      }

      // Verify user was created before proceeding
      if (!userCreated) {
        // Wait a bit and check again (might be a race condition with trigger)
        await new Promise(resolve => setTimeout(resolve, 500));
        const { data: verifyUser } = await supabaseAdmin
          .from("rembg_user")
          .select("id")
          .eq("id", session.user.id)
          .maybeSingle();
        
        if (!verifyUser) {
          console.error("Failed to create/sync user to rembg_user after retry");
          return NextResponse.json(
            { error: "User synchronization failed. Please try logging in again." },
            { status: 500 }
          );
        }
      }
    }

    // Fetch user's credit balance from Supabase
    const { data, error } = await supabaseAdmin
      .from("rembg_credits")
      .select("balance")
      .eq("userId", session.user.id)
      .maybeSingle();

    // If no credits record exists, create one with default 5 credits
    if (error || !data) {
      console.log("No credits record found, creating one with default 5 credits");
      
      // Create credits record with default 5 credits
      const { data: newCredits, error: createError } = await supabaseAdmin
        .from("rembg_credits")
        .insert({
          userId: session.user.id,
          balance: 5,
        })
        .select("balance")
        .single();

      if (createError) {
        console.error("Error creating credits:", createError);
        // If it's a foreign key error, the user still doesn't exist - return error
        if (createError.code === '23503') {
          return NextResponse.json(
            { error: "User not found. Please try logging in again." },
            { status: 500 }
          );
        }
        return NextResponse.json(
          { error: "Failed to create credits record" },
          { status: 500 }
        );
      }

      // Log the signup bonus transaction
      await supabaseAdmin
        .from("rembg_credit_transactions")
        .insert({
          userId: session.user.id,
          type: "signup_bonus",
          amount: 5,
          balanceAfter: 5,
          description: "Welcome bonus - 5 free credits",
          metadata: { source: "auto_created" },
        });

      return NextResponse.json({
        balance: newCredits?.balance || 5,
        userId: session.user.id,
      });
    }

    return NextResponse.json({
      balance: data.balance,
      userId: session.user.id,
    });
  } catch (error) {
    console.error("Credits balance API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
