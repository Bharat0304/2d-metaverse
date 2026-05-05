import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/v1/auth.js';
import { spaceRouter } from './routes/v1/space.js';
const app = express();
import dotenv from 'dotenv/config';
const port = 4000;
app.use(cors());
app.use(express.json());
app.use("/api/auth",authRouter);
app.use("/api/v1/space", spaceRouter);
app.get('/', (req, res) => {
  res.send('Hello World!');
});
console.log("DATABASE_URL =", process.env.DATABASE_URL);



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});