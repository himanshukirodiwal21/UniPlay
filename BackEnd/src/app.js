// src/app.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    // ✅ allow localhost
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // ✅ allow ANY Vercel deployment
    if (origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));


// ✅ IMPORTANT: allow preflight requests
// app.options("/*", cors());


app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ✅ Routes import
import userRouter from './routes/user.routes.js';
import requestEventRouter from './routes/event.routes.js';
import adminRouter from './routes/admin.routes.js';
import teamRegistrationRoutes from "./routes/teamRegistration.routes.js";
import matchRoutes from "./routes/match.routes.js";
import liveMatchRoutes from "./routes/liveMatch.routes.js"; // ✨ NEW
import playerRouter from "./routes/player.routes.js";
import autoPlayRouter from "./routes/autoPlay.routes.js";
import predictionRoutes from './routes/predictions.routes.js';


// ✅ Routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1", requestEventRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/team-registrations", teamRegistrationRoutes);
app.use("/api/v1/matches", matchRoutes);
app.use("/api/v1/live-matches", liveMatchRoutes); // ✨ NEW LIVE MATCH ROUTE
app.use("/api/v1/players", playerRouter);
app.use("/api/v1/auto-play", autoPlayRouter);
app.use('/api/v1', predictionRoutes);



// ✅ Health check route
app.get("/", (req, res) => {
  res.send("🚀 UniPlay Backend is running successfully!");
});

// ✅ Export app
export { app };