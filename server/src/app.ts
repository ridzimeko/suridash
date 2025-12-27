import express from "express";
import cors from "cors";

const app = express();

import "dotenv/config";

const corsOptions = {
  origin: process.env.ORIGIN_URL || "http://localhost:5173", // frontend origin
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "x-requested-with"],
  exposedHeaders: ["set-cookie"],
};

// =====================
// MIDDLEWARES
// =====================
app.use(cors(corsOptions));
app.options("*", cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

console.log("origin url:", process.env.ORIGIN_URL);

export default app;
