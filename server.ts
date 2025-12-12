import { PORT } from './src/config/env.config';
import fileRoutes from './src/routes/file.routes';
import express, { Request, Response } from 'express';

const app = express();

// Middleware
app.use(express.json());

// Health check route
app.get('/', async (req: Request, res: Response) => {
  return res.status(200).json({ message: 'Hello, World!' });
});

// Routes
app.use('/api/file', fileRoutes);

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));

