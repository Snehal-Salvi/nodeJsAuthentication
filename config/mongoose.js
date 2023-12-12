import mongoose from "mongoose";

const url = process.env.DB_URL;

export const connectToDb = async () => {
    try {
        await mongoose.connect(url, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true
        });
        console.log("Mongodb connected");
    } catch (err) {
        console.log("Error while connecting to db");
        console.error(err);
    }
};