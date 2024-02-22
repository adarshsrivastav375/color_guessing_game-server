import dotenv from "dotenv";
import DB_connect from "./db/index.js";
import app from "./app.js";

dotenv.config();

const port = process.env.PORT || 3003;

DB_connect()
  .then(() => {
    app.listen(port, () => {
      console.log(`app is running at port ${port}`);
    });
  })
  .catch((error) => {
    console.log("connection error", error);
  });
