import mongoose from "mongoose";
import Grid from "gridfs-stream";

const mongoURI = process.env.MONGO_URI || "mongodb+srv://demoadmin:sw8M6RwtzL3v_VN@cluster0.ocsokf8.mongodb.net/testdb?retryWrites=true&w=majority";

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
