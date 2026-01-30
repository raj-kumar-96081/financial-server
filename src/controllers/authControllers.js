const userDao=require('../dao/userDao');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


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

        if (!user) {
            return res.status(401).json({
                error: "Invalid credentials"
            });
        }

        const IsMatch= await bcrypt.compare(password,user.password);

        if (!IsMatch) {
            return res.status(401).json({
                error: "Invalid credentials"
            });
        }

        // CREATE JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        //  SET COOKIE
        res.cookie('jwtToken', token, {
            httpOnly: true,
            secure: false, // true only in HTTPS
            sameSite: 'strict'
        });

        return res.status(200).json({
            user:{ id: user._id,
                name: user.name,
                email: user.email,
            },
            message: "Login successful"
            
        });

        // if (user && IsMatch) {
        //     return res.status(200).json({
        //         message: `Login Successful.           Welcome ${user.name}`,
        //         user:user
        //     });
        // }
        // else {
        //     return req.status(400).json({
        //         message: "Incorrect email or password"
        //     });
        // }
    },
    register: async (req, res) => {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const userExists = await userDao.findByEmail(email);

        if (userExists) {
            return res.status(409).json({
                error: "User already exists"
            });
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

    isUserLoggedIn: async (request,response)=>{
        try{
            const token=request.cookies?.jwtToken;
            if(!token){
                return response.status(401).json({
                    message:'Unauthorized Access'
                });
            }

            jwt.verify(token,process.env.JWT_SECRET,(error,user)=>{
                if(error){
                    return response.status(401).json({
                        message:'Invalid token'
                    });
                }else{
                    response.json({
                        user:user
                    });
                }
            });

        }catch(error){
            console.log(error);
            return response.status(500).json({
                message:"Internal Server Error"
            });
        }

    },

    logout:async(request,response)=>{
        try{
            response.clearCookie('jwtToken');
            response.json({message:'Logout successful'});
        }catch(error){
            console.log(error);
            return response.status(500).json({
                message:'Internal Server Error'
            });
        }
    },

};

module.exports=authController;