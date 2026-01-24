const users= require('../dao/userDb');
const userDao=require('../dao/userDao');
const bcrypt = require('bcryptjs');

const authController={
    login: async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return req.status(400).json({
                message: "Both fields are mandatory"
            });
        }

        // const user = users.find(u => u.email === email && u.password === password);

        const user=await userDao.findByEmail(email);

        const IsMatch= await bcrypt.compare(password,user.password);

        if (user && IsMatch) {
            return res.status(200).json({
                message: `Login Successful.           Welcome ${user.name}`,
                user:user
            });
        }
        else {
            return req.status(400).json({
                message: "Incorrect email or password"
            });
        }
    },
    register: async (req, res) => {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
       
        
        // const user=await userDao.create({
        //     name:name,
        //     email:email,
        //     password:password
        // })

        const salt= await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);

        userDao.create({
            name:name,
            email:email,
            password:hashedPassword
        })
            .then(u=>{
                return res.status(200).json({
                    message: 'User registered successfully.',
                    user:{ id: u.id,
                        name: u.name,
                        email: u.email,
                    }
                });
            })
            .catch(error=>{
            
                if (error.code === 'USER_EXIST') { 
                    console.log(error); 
                    return res.status(400).json({ 
                        message: 'User with the email already exist' 
                    }); 
                } else { 
                    return res.status(500).json({ 
                        message: "Internal server error" 
                    }); 
                }
            })

        
        
        // res.status(200).json({ message: 'User registered successfully.', userId: newUser.id });
        
    },
};

module.exports=authController;