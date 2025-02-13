const express = require('express');
const dotenv = require('dotenv');
<<<<<<< HEAD
const connectDB = require('./config/database');
const userRoutes = require('./routes/user-route');
const imageRoutes = require('./routes/image-route');
=======
const connectDB = require('./config/db');
>>>>>>> eca112168ce40be86580ac8c696c9b51a7bc2696

const app = express();

dotenv.config();
connectDB();

app.use(express.json());

app.get('/ping', (req, res) => {
<<<<<<< HEAD
    try {
        res.status(200).json({ message: 'Server is up and running' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
=======
	try {
		res.status(200).json({ message: 'Server is up and running' });
	} catch (error) {
		res.status(500).json({ message: 'Internal server error' });
	}
>>>>>>> eca112168ce40be86580ac8c696c9b51a7bc2696
});

app.use('/', userRoutes);
app.use('/', imageRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
<<<<<<< HEAD
    console.log(`Server is running on port ${PORT}`);
=======
	console.log(`Server is running on port ${PORT}`);
>>>>>>> eca112168ce40be86580ac8c696c9b51a7bc2696
});