import "./src/config/env.js";

import app from './src/app.js';
import keepAlive from "./src/middlewares/keepAlive.js";

keepAlive();

// console.log(process.env.PORT, "PORT");

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});