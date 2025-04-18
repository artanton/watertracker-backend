import express from "express";
import swaggerUi from "swagger-ui-express"
import swaggerDocument from "./swagger.json" with { type: 'json' };

import morgan from "morgan";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import waterRouter from "./routes/waterRouter.js";
import authRouter from "./routes/authRouter.js";
import userSettingsRouter from "./routes/userSettingsRouter.js";


dotenv.config();
export const app = express();

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);

app.use("/api/water", waterRouter);

app.use("/api/updateProfile", userSettingsRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

const { DB_HOST, PORT = 3000 } = process.env;

mongoose
  .connect(DB_HOST)
  .then(() => {
    app.listen(PORT);
    console.log("Database connection successful");
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });
 