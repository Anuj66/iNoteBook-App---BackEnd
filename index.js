const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');

connectToMongo();
const app = express();

app.use(cors())

const port = 8080;

app.use(express.json())

app.use('/api/auth', require('./routes/Auth'))
app.use('/api/notes', require('./routes/Notes'))

app.listen(port, () => {
    console.log(`inotebook app listening on port ${port}`)
})