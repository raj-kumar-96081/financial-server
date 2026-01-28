require('dotenv').config();
const express = require('express');
const mongoose=require('mongoose');

const authRoutes = require('./src/routes/authRoutes');
const groupRoutes=require('./src/routes/groupRoutes');
const cookieparser=require('cookie-parser');


mongoose.connect(process.env.MONGO_DB_URL)
    .then(()=> console.log("Connected to MongoDB"))
    .catch((err)=> console.log("Error connecting to MongoDB:", err));
const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cookieparser());//Middleware


app.use('/auth', authRoutes);
app.use('/group',groupRoutes);  


app.listen(5001,()=>{
    console.log("Expense server is running on port 5001");
})
