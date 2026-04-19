import express, { Request, Response } from 'express';
import authRouter from './routes/authRoutes.js';
import logger from './middleware/logger.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
app.use(express.json());

app.use(logger);
app.use("/api/auth", authRouter);
app.use(errorHandler)




app.listen(3001, () => {
  console.log('Innflux backend running');
});
