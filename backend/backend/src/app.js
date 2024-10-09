// import express from "express";
// import cors from "cors";
// import createError from "http-errors";
// import { config } from "./config/config";
// import dbConnect from "./config/d   bConnect";
// import { apiRoutes } from "./routes/apiRoutes";

// const app = express();

// app.use(express.json());
// app.use(cors());

// app.use("/", routes);

// app.use((req, res, next) => {
//   next(createError(404, "Not Found"));
// });

// dbConnect()
//   .then(() => {
//     app.listen(config.port, () => {
//       console.log(`Server is running on http://localhost:${config.port}`);
//     });
//   })
//   .catch((err) => {
//     console.log(`Error connecting database:${err}`);
//   });



import express from 'express';
import mongoose from 'mongoose';
import transactionRoutes from './routes/transactionRoutes.js';

const app = express();
const PORT = 3000;
const DB_URI = 'mongodb://localhost:27017/transactionDB';

app.use(express.json());

const dbConnect = async () => {
    const connection = await mongoose.connect(DB_URI);
    if (connection) {
      console.log("connected to db");
    } else {
      console.log("not connected to db");
    }
  };

app.use('/api', transactionRoutes);

dbConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Error connecting database:${err}`);
  });