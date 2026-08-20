import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

// Middlewares
app.use(helmet()); // Security headers
app.use(cors()); 
app.use(express.json());
app.use(morgan('dev')); // log req

import disasterRoutes from './routes/disaster.routes';
    
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

app.use('/disasters', disasterRoutes);  

export default app;