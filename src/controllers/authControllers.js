const users= require('../dao/userDb');
const userDao=require('../dao/userDao');

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

        if (user && user.password === password) {
            return res.status(200).json({
                message: `Login Successful.           Welcome ${user.name}`,
                user:user
            });
        }
        else {
            return req.status(400).json({
                message: "Inoccrect email or password"
            });
        }
    },
    register: (req, res) => {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const existingUser = users.find(user => user.email === email) ;
        if (existingUser) {
            return res.status(400).json({
                message: `User already exists with this email: ${email}`
            });
        }

        const newUser={id:users.length+1,
            name:name,
            email:email,
            password:password
        };
        users.push(newUser);
        // res.status(200).json({ message: 'User registered successfully.', userId: newUser.id });
        return res.status(200).json({
            message: 'User registered successfully.',
            user:{ id: newUser.id,
                name: newUser.name,
                email: newUser.email,
            }
        });
    },
};

module.exports=authController;