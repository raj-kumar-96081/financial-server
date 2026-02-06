const rbacDao = require("../dao/rbacDao");
const bcrypt = require('bcryptjs');
const { generateTemporaryPassword } = require("../utility/passwordUtil");
const emailService = require("../services/emailServices");
const { USER_ROLES } = require("../utility/userRoles")

const rbacController = {
    create: async (request, response) => {
        try {
            const adminUser = request.user;
            const { name, email, role } = request.body;

            if (!USER_ROLES.include(role)) {
                return response.status(400).json({
                    message: "Invalid role"
                });
            }

            const tempPassword = generateTemporaryPassword(8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(tempPassword, salt);

            //validate role begore adding tothe database
            const user = await rbacDao.create(email, name, role, hashedPassword, adminUser._id);

            try {
                await emailService.send(
                    email, 'temporary Password',
                    `Your temporary Password is: ${tempPassword}`
                );
            } catch (error) {
                //let the create user call succeed ever though sending email
                //failed. we can after re-trigger sending temporary password  functionality to the admins
                console.log(`Error sending email , temporary password is ${tempPassword} `, error);
            }

            //todo:send temporary password in email
            return response.status(200).json({
                message: 'user created',
                user: user
            });

        } catch (error) {
            console.log(error);
            response.status(500).json({ message: "Error creating Users -server" });
        }
    },
    update: async (request, response) => {
        try {
            const { name, role, userId } = request.body;
            const user = await rbacDao.update(userId, name, role);
            return response.status(200).json({
                message: 'User updated!',
                user: user
            });



        } catch (error) {
            console.log(error);
            response.status(500).json({ message: "Error updating Users -server" });
        }
    },
    delete: async (request, response) => {
        try {
            const { userId } = request.body;
            await rbacDao.delete(userId);
            return response.status(200).json({
                message: 'User deleted!'
            });

        } catch (error) {
            console.log(error);
            response.status(500).json({ message: "Error deleting Users -server" });
        }
    },
    getAllUsers: async (request, response) => {
        try {
            const adminId = request.user.adminId;
            const users = await rbacDao.getUsersByAdminId(adminId);
            return response.status(200).json({
                users: users
            })

        } catch (error) {
            console.log(error);
            response.status(500).json({ message: "Error Fetching Users -server" });
        }
    },

};

module.exports = rbacController;