import "./src/config/env.js";

import app from './src/app.js';
import keepAlive from "./src/middlewares/keepAlive.js";
import { startIBKRFetchCron } from "./src/cron/ibkrFetchDataCron.js";
import { ensureIBKRSession } from "./src/utils/ensureIbkrSession.js";

keepAlive();
ensureIBKRSession();

const ibkrEnabled = process.env.IBRK_ENABLED || false;
if (ibkrEnabled && ibkrEnabled === 'true') {
  console.log("✅ IBKR ENABLED");
  startIBKRFetchCron();
} else {
  console.log("🚫 IBKR DISABLED → No IBKR cron will run");
}

// console.log(process.env.PORT, "PORT");

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});