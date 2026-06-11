import ibkrApi from "../services/ibkrService.js";
import { resetIBKRSession } from "./resetIbkrSession.js";
// import { ibkrRequest } from "./ibkrRequest.js";
// import { resetIBKRSession } from "./resetIBKRSession.js";

export async function ensureIBKRSession() {
  try {
    const res = await ibkrApi.get("/iserver/auth/status");
    // console.log(res, "status ensureIBKR session");
    
    if (res?.data?.authenticated) return true;

    // HARD RESET
    // await resetIBKRSession();
    return true;

  } catch (err) {
    console.error("❌ IBKR session ensure failed");
    return false;
  }
}