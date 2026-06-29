import express from "express";
import cors from "cors";

const app = express();



const origins = process.env.ORIGINS_URLS
  ? process.env.ORIGINS_URLS.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173"];

const corsOptions = {
  origin: origins,
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

console.log("origin url:", process.env.ORIGINS_URLS);

export default app;
