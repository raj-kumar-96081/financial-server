const permissions = require("../utility/permissions");


const authorize = (requiredPermission) => {
    return (request, response, next) => {
        const user = request.user;
        // console.log("this is the user role", user.role);

        if (!user) {
            return response.status(401).json({ message: "Unauthorized access" });
        }
        const userPermissions = permissions[user.role] || [];
        console.log(userPermissions);
        if (!userPermissions.includes(requiredPermission)) {
            return response.status(403).json({
                message: "Forbidden! Insufficient permission"
            });
        }
        next();
    }


};

module.exports = authorize;