import mongoose from "mongoose";
import Grid from "gridfs-stream";

const mongoURI = process.env.MONGO_URI || "mongodb+srv://demoproject:VLSTJRwMJ7EUcCuZ@cluster0.8sal0ze.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Normal Mongo connection
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let gfs;
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("resumes"); // files will be stored in "resumes"
});

export { conn, gfs };
