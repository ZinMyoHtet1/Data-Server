const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const dbRoutes = require("./routes/dbRoutes.js");
const directoryRoutes = require("./routes/directoryRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
// const directoryRoutes = require("./routes/direct.js");

const app = express();

app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use("/api/v0/database", dbRoutes);
app.use("/api/v0/directory", directoryRoutes);
app.use("/api/v0/auth", authRoutes);
// app.use("/api/v0/directory", directoryRoutes);

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const status =
    (error.statusCode >= 400) & (error.statusCode < 500) ? "fail" : "error";
  res.status(statusCode).json({
    status: status,
    message: error.message,
    stack: error.stack,
    error: error,
  });
});

app.listen("5000", () => {
  console.log("server is running on port 5000");
});
