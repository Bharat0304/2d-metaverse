import express from 'express';
import { authRouter } from './routes/v1/auth.js';
const app = express();
import dotenv from 'dotenv/config';
const port = 3000;
app.use(express.json());
app.use("/api/auth",authRouter);
app.get('/', (req, res) => {
  res.send('Hello World!');
});
console.log("DATABASE_URL =", process.env.DATABASE_URL);



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});