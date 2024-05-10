import 'dotenv/config';
import dbConnect from "./db/index.js";
import { app } from "./app.js";

const port = process.env.PORT || 4000

dbConnect().then(
    app.listen(port, () => {
        console.log(`Connecting the Server...http://localhost:${port}`);
    })
).catch((err) => {
    console.log("DataBase Connection Failed...", err);
})