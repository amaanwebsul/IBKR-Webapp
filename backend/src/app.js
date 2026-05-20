import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import ibkrRoutes from "./routes/ibkrRoute.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

app.use("/api/ibkr", ibkrRoutes);

app.get("/ping", (req, res) => {
  try {
    res.status(200).json({ Ping: "Pong!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/", (req, res) => {
  try {
    res.send("Server Running - Response from Express!")
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default app;