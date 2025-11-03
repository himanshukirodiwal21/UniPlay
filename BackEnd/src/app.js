// src/app.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// ✅ Middleware setup
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ✅ Routes import
import userRouter from './routes/user.routes.js';
import requestEventRouter from './routes/event.routes.js';
import adminRouter from './routes/admin.routes.js';
import teamRegistrationRoutes from "./routes/teamRegistration.routes.js";
import matchRoutes from "./routes/match.routes.js";
import liveMatchRoutes from "./routes/liveMatch.routes.js"; // ✨ NEW

// ✅ Routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1", requestEventRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/team-registrations", teamRegistrationRoutes);
app.use("/api/v1/matches", matchRoutes);
app.use("/api/v1/live-matches", liveMatchRoutes); // ✨ NEW LIVE MATCH ROUTE

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("🚀 UniPlay Backend is running successfully!");
});

// ✅ Export app
export { app };