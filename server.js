const express = require('express');
const app = express();

app.get('/ping', function (req, res) {
  res.send('pong');
});

const PORT = 6000;
app.listen(PORT, function () {
  console.log('Server is running on port ' + PORT);
});