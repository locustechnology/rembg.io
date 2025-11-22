// Session debugging utilities

export function logSessionDebug() {
  console.log("=== SESSION DEBUG INFO ===");

  // Check all cookies
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  console.log("All cookies:", cookies);
  console.log("Has session token:", 'better-auth.session_token' in cookies);
  console.log("Has debug session:", cookies['debug_session_set']);
  console.log("Debug user ID:", cookies['debug_user_id']);

  // Check localStorage
  console.log("LocalStorage keys:", Object.keys(localStorage));

  // Try to fetch session directly
  fetch('/api/auth/session', {
    credentials: 'include',
  })
    .then(res => res.json())
    .then(data => {
      console.log("Direct session fetch result:", data);
    })
    .catch(err => {
      console.error("Failed to fetch session:", err);
    });

  console.log("========================");
}

// Check if session should exist but doesn't
export function checkSessionMismatch() {
  const hasBetterAuthCookie = document.cookie.includes('better-auth.session_token');
  const hasDebugCookie = document.cookie.includes('debug_session_set=true');

  if (hasDebugCookie && !hasBetterAuthCookie) {
    console.error("⚠️ SESSION MISMATCH: Debug cookie exists but Better Auth cookie is missing!");
    return true;
  }

  return false;
}
