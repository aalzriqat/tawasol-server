import express from 'express';
import connectDB from './config/db.js';
import usersRouter from './routes/users.js';
import profileRouter from './routes/profiles.js';
import postsRouter from './routes/posts.js';
import uploadRouter from './routes/upload.js'; // Import the upload route
import cors from 'cors';
import path from 'path';

const app = express();

app.use(express.json({ extended: false }));
app.use(cors());

app.use('/api/users', usersRouter);
app.use('/api/profiles', profileRouter);
app.use('/api/posts', postsRouter);
app.use('/api/profiles/upload', uploadRouter); // Use the upload route

connectDB();

app.use(express.static(path.join(path.resolve(), './public')));

app.get("/", (req, res) => {
  res.send("Server is working correctly");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});
