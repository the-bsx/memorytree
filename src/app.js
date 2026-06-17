// import dependencies
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// import
import errorHandler from "./middlewares/errorHandler.js";
import authRoutes from "./routes/auth.route.js";

//initialize app
const app = express();

//set middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

//routes declaration
app.use("/api/v1/auth", authRoutes);

// health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is working!!!" });
});
app.use(errorHandler);

export default app;
