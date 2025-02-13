const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const userRoutes = require('./routes/user-route');
const imageRoutes = require('./routes/image-route');
const connectDB = require('./config/db');

const app = express();

dotenv.config();
connectDB();

app.use(express.json());

app.get('/ping', (req, res) => {
    try {
        res.status(200).json({ message: 'Server is up and running' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.use('/', userRoutes);
app.use('/', imageRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});