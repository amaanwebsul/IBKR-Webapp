import ibkrApi from "../services/ibkrService.js";

export async function resetIBKRSession() {
  console.warn("🔄 Resetting IBKR session...");

  // Step 1: Init SSO
  await ibkrApi.get("/iserver/auth/ssodh/init");

  // Step 2: Poll until authenticated (max 10s)
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const res = await ibkrApi.get("/iserver/auth/status");
    if (res?.data?.authenticated) {
      return true;
    }
  }

  throw new Error("IBKR re-auth failed");
}
