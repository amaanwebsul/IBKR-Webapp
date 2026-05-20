import axios from "axios";
import https from "https";

// console.log("IBKR URL:", process.env.IBKR_BASE_URL);

const agent = new https.Agent({
  rejectUnauthorized: false,
});

const ibkrApi = axios.create({
  // baseURL: "https://localhost:5000/v1/api",
  baseURL: process.env.IBKR_BASE_URL,
  httpsAgent: agent,
});

export default ibkrApi;