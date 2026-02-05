const User = require("../model/User");

const generateTemporaryPassword = (desiredlength) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';

    let result = '';
    for (i = 0; i < desiredlength; i++) {
        result += chars.charAt(Math.floor[Math.random() * chars.length]);
    }
    return result;
};



const rbacDao = {



    create: async (email, name, role, adminId) => {
        return await User.create({
            email: email,
            password: generateTemporaryPassword(8),
            name: name,
            role: role,
            adminId: adminId,
        });


    },
    update: async (userId, name, role) => {

        return await User.findByIdAndUpdate(
            userId,
            { name, role },
            { new: true }
        );

    },

    delete: async (userId) => {

        return await User.findByIdAndDelete(userId);

    },

    getUsersByAdminId: async (adminId) => {
        return await User.find((adminId)).select("~password");
    },

};

module.export = rbacDao;