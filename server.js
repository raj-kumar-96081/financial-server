// console.log("Hi, I'm your expense server");
const express = require('express');

const authRoutes = require('./src/routes/authRoutes');
const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies



app.use('/auth', authRoutes);



app.listen(5001,()=>{
    console.log("Expense server is running on port 5001");
})
