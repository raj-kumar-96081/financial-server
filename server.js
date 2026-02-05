require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
const groupRoutes = require('./src/routes/groupRoutes');
const cookieparser = require('cookie-parser');
const rbacRoutes = require('./src/routes/rbacRoutes');

mongoose.connect(process.env.MONGO_DB_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log("Error connecting to MongoDB:", err));

const corsOptions = {
    origin: process.env.CLIENT_URL,
    credentials: true,
    optionSuccessStatus: 200
};


const app = express();

app.use(cors(corsOptions));

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cookieparser());//Middleware


app.use('/auth', authRoutes);
app.use('/group', groupRoutes);
app.use('/users', rbacRoutes);


app.listen(5001, () => {
    console.log("Expense server is running on port 5001");
})
