import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

//routes import
import userRouter from "./routes/userRoutes.js";
import gameRoute from "./routes/gameRoutes.js";
import betRoute from "./routes/betRoutes.js";
import adminRoute from "./routes/adminRoutes.js";
import transactionRoute from "./routes/transactionRoute.js";

//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/game", gameRoute);
app.use("/api/v1/users", betRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/transaction", transactionRoute);

app.use((err, req, res, next) => {
  res.locals.error = err;
  const status = err.status || 500;
  res.status(status);
  res.render("error");
});

export default app;
