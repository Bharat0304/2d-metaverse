import express from 'express';
import { authRouter } from './routes/v1/auth.js';
import { spaceRouter } from './routes/v1/space.js';
import { discordRouter } from './routes/v1/discord.js'; // Added import
const app = express();
import dotenv from 'dotenv/config';
const port = 4000;
app.use(express.json());
app.use("/api/auth",authRouter);
app.use("/api/v1/space", spaceRouter);
app.use("/api/v1/discord", discordRouter); // Added route
app.get('/', (req, res) => {
  res.send('Hello World!');
});
console.log("DATABASE_URL =", process.env.DATABASE_URL);



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});