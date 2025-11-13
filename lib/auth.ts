import { betterAuth } from "better-auth";
import { Pool } from "pg";

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const auth = betterAuth({
  database: pool as any,

  emailAndPassword: {
    enabled: false, // We're using Google OAuth + Email OTP only
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  // Email OTP (Magic Link) - Enabled with new Resend credentials
  emailVerification: {
    enabled: true,
    sendEmailVerificationOnSignUp: true,
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    async sendVerificationEmail({ user, url, token }) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      try {
        await resend.emails.send({
          from: process.env.FROM_EMAIL!,
          to: [user.email],
          subject: "Verify your RemBG account",
          reply_to: process.env.REPLY_TO_EMAIL,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
                  .container { max-width: 600px; margin: 40px auto; background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
                  .logo { text-align: center; margin-bottom: 32px; }
                  .logo h1 { color: #6366f1; font-size: 32px; margin: 0; font-weight: 700; }
                  .content { color: #374151; font-size: 16px; line-height: 1.6; }
                  .button { display: inline-block; background-color: #6366f1; color: white !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 24px 0; }
                  .button:hover { background-color: #4f46e5; }
                  .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; text-align: center; }
                  .credits-badge { background-color: #f0fdf4; border: 1px solid #86efac; color: #166534; padding: 12px 20px; border-radius: 8px; margin: 24px 0; text-align: center; font-weight: 600; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="logo">
                    <h1>RemBG</h1>
                  </div>
                  <div class="content">
                    <h2 style="color: #111827; margin-top: 0;">Welcome to RemBG!</h2>
                    <p>Hi${user.name ? ` ${user.name}` : ''},</p>
                    <p>Thanks for signing up! Click the button below to verify your email address and get started:</p>
                    <div style="text-align: center;">
                      <a href="${url}" class="button">Verify Email Address</a>
                    </div>
                    <div class="credits-badge">
                      🎉 You'll receive 5 FREE credits after verification!
                    </div>
                    <p style="font-size: 14px; color: #6b7280;">
                      If the button doesn't work, copy and paste this link into your browser:<br>
                      <a href="${url}" style="color: #6366f1; word-break: break-all;">${url}</a>
                    </p>
                    <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
                      This link will expire in 24 hours.
                    </p>
                  </div>
                  <div class="footer">
                    <p>If you didn't create an account, you can safely ignore this email.</p>
                    <p style="margin-top: 8px;">&copy; 2025 RemBG. All rights reserved.</p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });

        console.log(`Verification email sent to ${user.email}`);
      } catch (error) {
        console.error("Failed to send verification email:", error);
        throw error;
      }
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  // Base URL for callbacks
  baseURL: process.env.BETTER_AUTH_URL,

  // Advanced options
  advanced: {
    generateId: () => {
      // Generate custom IDs (using nanoid for shorter IDs)
      return crypto.randomUUID();
    },
  },

  // Callbacks
  callbacks: {
    async onSignUp(user: any) {
      console.log(`New user signed up: ${user.email}`);
      // Credits are automatically created via database trigger
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = Session['user'];
