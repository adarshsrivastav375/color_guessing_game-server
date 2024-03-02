import monngoose from "mongoose";
import { DB_NAME } from "../constants.js";

const DB_connect = async () => {
  try {
    const conectionInstance = await monngoose.connect(process.env.DB_URI);
    console.log(
      `\n app is connected to mongoDB... DB_Host ${conectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("failed to connect to the database", error);
    process.exit(1);
  }
};
export default DB_connect;
