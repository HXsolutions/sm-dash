import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import prisma from './config/db';
import authRoutes from './routes/auth';
import mediaRoutes from './routes/media';
import postRoutes from './routes/posts';
import socialRoutes from './routes/social';
import { startScheduler } from './workers/scheduler';
import bcrypt from 'bcryptjs';

const app = express();

// Connect Database & setup default user
const setupDB = async () => {
  try {
    await prisma.$connect();
    console.log('PostgreSQL connected..');
    
    const count = await prisma.user.count();
    if (count === 0) {
      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash('admin123', salt);
      await prisma.user.create({
        data: { name: 'Admin', email: 'admin@haxxcel.com', password }
      });
      console.log('Created default admin: admin@haxxcel.com / admin123');
    }
  } catch (err) {
    console.log('Startup DB error:', err);
  }
};

setupDB();

// Start post scheduler
startScheduler();

// Init Middleware
app.use(cors());
app.use(express.json());

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/social', socialRoutes);

app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
