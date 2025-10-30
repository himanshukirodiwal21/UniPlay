// src/app.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// ✅ Middleware setup
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*", // fallback to * for safety
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

// ✅ Routes declaration
app.use("/api/v1/users", userRouter);                   // User routes
app.use("/api/v1", requestEventRouter);                 // Event routes
app.use("/api/v1/admin", adminRouter);                  // Admin routes
app.use("/api/v1/team-registrations", teamRegistrationRoutes); // Team Registration routes
app.use("/api/v1/matches", matchRoutes);                        // Match routes

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("🚀 UniPlay Backend is running successfully!");
});

// ✅ Export app
export { app };