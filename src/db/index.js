import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const dbConnect = async () => {

    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`DataBase Connected SuccessFully... & Here is the instance:-${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("DataBase Connection Failed...", error);
        process.exit(1);
    }
}

export default dbConnect;