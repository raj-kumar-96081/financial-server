// console.log("Hi, I'm your expense server");
const express = require('express');
const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

let users=[];

app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const newUser={id:users.length+1,
        name:name,
        email:email,
        password:password
    };
    users.push(newUser);
    res.status(200).json({ message: 'User registered successfully.', userId: newUser.id });

});
