const userDao = require('../dao/userDao');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const emailService = require('../services/emailServices');
const { validationResult } = require('express-validator');


const generateAccessToken = (user) =>
    jwt.sign(
        { userId: user._id, name: user.name, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" } // change to "1m" for testing
    );

const generateRefreshToken = (user) =>
    jwt.sign(
        { email: user.email },
        process.env.REFRESH_SECRET,
        { expiresIn: "7d" }
    );


const authController = {
    login: async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // if (!email || !password) {
        //     return req.status(400).json({
        //         message: "Both fields are mandatory"
        //     });
        // }

        // const user = users.find(u => u.email === email && u.password === password);

        const user = await userDao.findByEmail(email);

        if (!user) {
            return res.status(401).json({
                error: "Invalid credentials"
            });
        }
        if (user.googleId && !user.password) {
            return res.status(403).json({ error: "Please login using Google" });
        }

        const IsMatch = await bcrypt.compare(password, user.password);

        if (!IsMatch) {
            return res.status(401).json({
                error: "Invalid credentials"
            });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res
            .cookie("jwtToken", accessToken, {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge: 60 * 60 * 1000
            })
            .cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

        // CREATE JWT
        // const token = jwt.sign(
        //     { userId: user._id, email: user.email },
        //     process.env.JWT_SECRET,
        //     { expiresIn: '1h' }
        // );

        // //  SET COOKIE
        // res.cookie('jwtToken', token, {
        //     httpOnly: true,
        //     secure: false, // true only in HTTPS
        //     sameSite: 'strict'
        // });

        return res.status(200).json({
            user: {
                id: user._id,
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

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        userDao.create({
            name: name,
            email: email,
            password: hashedPassword
        })
            .then(u => {
                return res.status(200).json({
                    message: 'User registered successfully.',
                    user: {
                        id: u.id,
                        name: u.name,
                        email: u.email,
                    }
                });
            })
            .catch(error => {

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

    isUserLoggedIn: async (request, response) => {
        try {
            const token = request.cookies?.jwtToken;
            if (!token) {
                return response.status(401).json({
                    message: 'Unauthorized Access'
                });
            }

            jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
                if (error) {
                    return response.status(401).json({
                        message: 'Invalid token'
                    });
                } else {
                    response.json({
                        user: user
                    });
                }
            });
            const refreshToken = request.cookies?.refreshToken;
            if (!refreshToken) {
                return response.status(401).json({ message: "Not authenticated" });
            }

            const decodedRefresh = jwt.verify(
                refreshToken,
                process.env.REFRESH_SECRET
            );

            const user = await userDao.findByEmail(decodedRefresh.email);

            if (!user) {
                return response.status(401).json({ message: "User not found" });
            }


            const newAccessToken = generateAccessToken(user);

            response.cookie("jwtToken", newAccessToken, {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge: 60 * 60 * 1000
            });

            return response.status(200).json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            });


        } catch (error) {
            console.log(error);
            return response.status(500).json({
                message: "Invalid session"
            });
        }



    },

    logout: async (request, response) => {
        try {
            response
                .clearCookie("jwtToken")
                .clearCookie("refreshToken");
            // response.clearCookie('jwtToken');
            return response.json({ message: 'Logout successful' });
        } catch (error) {
            console.log(error);
            return response.status(500).json({
                message: 'Logout Failed'
            });
        }
    },

    googleSso: async (req, res) => {
        try {
            const { idToken } = req.body;

            if (!idToken) {
                return res.status(401).json({ message: "Invalid Google request" });
            }

            const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

            const googleResponse = await client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID
            });

            const payload = googleResponse.getPayload();
            const { sub: googleId, name, email } = payload;

            let user = await userDao.findByEmail(email);

            if (!user) {
                user = await userDao.create({ name, email, googleId });
            }

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            res
                .cookie("jwtToken", accessToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: "strict",
                    maxAge: 60 * 60 * 1000
                })
                .cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: "strict",
                    maxAge: 7 * 24 * 60 * 60 * 1000
                });

            return res.status(200).json({
                message: "Google login successful",
                user
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },


    resetPassword: async (req, res) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ msg: "Email is required" });
            }

            const user = await userDao.findByEmail(email);

            if (!user) {
                return res.status(404).json({ msg: "User not found" });
            }

            const now = Date.now();

            if (
                user.resetPasswordLastRequestedAt &&
                now - user.resetPasswordLastRequestedAt.getTime() < 2 * 60 * 1000
            ) {
                return res.status(429).json({
                    msg: "Please wait 2 minutes before requesting again"
                });
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            user.resetOtp = otp;
            user.resetOtpExpiry = now + 10 * 60 * 1000;
            user.resetPasswordLastRequestedAt = now;

            await user.save();

            res.status(200).json({ msg: "OTP sent to email" });

            emailService
                .send(email, "Password Reset OTP", `Your OTP is ${otp}`)
                .catch(console.error);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: "Internal server error" });
        }
    },


    changePassword: async (request, response) => {
        try {
            const errors = validationResult(request);

            if (!errors.isEmpty()) {
                return response.status(400).json({ errors: errors.array() });
            }

            const { email, otp, newPassword } = request.body;

            const user = await userDao.findByEmail(email);

            if (!user) {
                return response.status(404).json({ msg: "User not found" });
            }

            if (
                user.resetOtp !== otp ||
                user.resetOtpExpiry < Date.now()
            ) {
                return response.status(400).json({ msg: "Invalid or expired OTP" });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            user.password = hashedPassword;
            user.resetOtp = undefined;
            user.resetOtpExpiry = undefined;

            await user.save();

            return response.status(200).json({
                msg: "Password updated successfully"
            });

        } catch (error) {
            console.error("Change password error:", error);
            return response.status(500).json({ msg: "Internal server error" });
        }
    }

};

module.exports = authController;