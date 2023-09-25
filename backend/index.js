import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import dbConnection from './db/connection.js';
import userRoutes from './view/user.routes.js';
import taskRoutes from './view/task.routes.js';

try {
  await dbConnection(process.env.MONGODB_URI);
  console.log('Connection to database is done');
} catch (error) {
  console.error(
    'An error occurred when trying to connect to the database',
    error
  );
}

const app = express();

app.use(
  cors({
    origin: '*',
  })
);
app.use(express.json());
app.use(userRoutes);
app.use(taskRoutes);

app.get('/', (_, res) => {
  return res.status(200).json({
    status: 'success',
    body: { message: 'Welcome to the Trello app 🥳' },
  });
});

app.all('*', (_, res) => {
  return res
    .status(404)
    .json({ status: 'error', message: 'Content not found' });
});

app.listen(process.env.PORT || 443);
