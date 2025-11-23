import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

import connectToMongo from "./db.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.get("/api/health", (_req, res) =>
  res.json({ ok: true, service: "subflow" })
);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT;

connectToMongo().then(() => {
  app.listen(PORT, () => console.log(`API active on http://localhost:${PORT}`));
});
