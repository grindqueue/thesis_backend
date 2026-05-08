const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

const parentRouter = require('./router/parentRouter');

const connectToDatabase = require('./database/connectToDatabase');
connectToDatabase();

app.use(express.json());

app.listen(3000, () => {
    console.log('Server is running on port 3000');
    console.log ('click http://localhost:3000 to access the server');
})
app.get("/", (req, res) => {
    res.send("Welcome to the Parental Control Backend API");
})

app.use('/auth', parentRouter);