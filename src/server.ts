import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { initLapinou } from './lapinou';

mongoose.connect(process.env.MONGODB_URI as string, { useNewUrlParser: true, useUnifiedTopology: true } as any)
  .then(() => console.log('Successfully connected to MongoDB.'));

initLapinou();
