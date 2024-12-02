import express, { Express, Request, Response } from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import db from "./models";
import userRoutes from "./routes/userRoute";
import articleRoutes from "./routes/articleRoute";
import genreRoute from "./routes/genreRoute";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// Middlewares
// we should allow all origin for now
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Home route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hey there! Server is up and running now." });
});

// Synchronize the database without forcing
db.sequelize.sync({ alter: true }).then(() => {
  console.log("db has been re-synced");
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes());
app.use('/api/genres', genreRoute);

// Start the server
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
