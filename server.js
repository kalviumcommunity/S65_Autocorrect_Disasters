const express = require('express');
const dotenv = require('dotenv');
const app = express();

app.use(express.json());

dotenv.config();

app.get('/ping', (req, res) => {
  res.send('Hello World');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});