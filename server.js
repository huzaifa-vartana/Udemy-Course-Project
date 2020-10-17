const express = require("express");
const connectMongo = require("./config/db");
const connect = require("./config/db");
const client = require("./config/db");
const app = express();
const promise = require("./config/db");

const userRoutes = require("./routes/api/users");
const profileRoutes = require("./routes/api/profile");
const authRoutes = require("./routes/api/auth");
const postRoutes = require("./routes/api/post");

connectMongo();
app.use(express.json({ extended: false }));
app.get("/", (req, res, next) => {
  res.send("Working");
});

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/posts", postRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT);
