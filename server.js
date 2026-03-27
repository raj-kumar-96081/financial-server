require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
const groupRoutes = require('./src/routes/groupRoutes');
const cookieparser = require('cookie-parser');
const rbacRoutes = require('./src/routes/rbacRoutes');
const paymentsRoutes = require('./src/routes/paymentRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const expenseRoutes = require('./src/routes/expenseRoutes');


mongoose.connect(process.env.MONGO_DB_ATLAS_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log("Error connecting to MongoDB:", err));

const corsOptions = {
    origin: [

        process.env.FRONTEND_URL
        // process.env.CLIENT_URL,
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    optionSuccessStatus: 200
};


const app = express();

app.use(cors(corsOptions));

// app.use(express.json()); // Middleware to parse JSON request bodies
app.use((request, response, next) => {
    if (request.originalUrl.startsWith('/payments/webhook')) {
        console.log('Webhook request, skipping json middleware');
        return next();
    }
    express.json()(request, response, next);
})
app.use(cookieparser());//Middleware


app.use('/auth', authRoutes);
app.use('/groups', groupRoutes);
app.use('/users', rbacRoutes);
app.use('/payments', paymentsRoutes);
app.use('/profile', profileRoutes);
app.use("/api/expenses", expenseRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Expense server is running on port ${PORT}`);
})
