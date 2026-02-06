const groupDao = require("../dao/groupDao");

const groupController = {

    create: async (request, response) => {
        try {
            const user = request.user;
            const { name, description, membersEmail, thumbnail } = request.body;

            let allMembers = [user.email];
            if (membersEmail && Array.isArray(membersEmail)) {
                allMembers = [...new Set([...allMembers, ...membersEmail])];
            }

            const newGroup = await groupDao.createdGroup({
                name,
                description,
                adminEmail: user.email,
                membersEmail: allMembers,
                thumbnail,
                paymentStatus: {
                    amount: 0,
                    currency: 'INR',
                    date: Date.now(),
                    isPaid: false
                }
            });

            return response.status(201).json({
                message: 'Group created',
                groupId: newGroup._id
            });

        } catch (error) {
            console.log(error);
            return response.status(500).json({ message: "Error creating group- server-groupController" });
        }
    },

    updateGroup: async (request, response) => {
        try {
            const updatedGroup = await groupDao.updateGroup(request.body);
            if (!updatedGroup) {
                return response.status(404).json({ message: "Group not found" });
            }
            // response.status(200).json(updatedGroup);
            response.status(200).json(updatedGroup);
        } catch (error) {
            console.log(error);
            return response.status(500).json({ message: "Internal server error: Unable to fetch updated group" });
        }
    },

    addMembers: async (request, response) => {
        try {
            const { groupId, membersEmail } = request.body;
            const group = await groupDao.addMembers(groupId, ...membersEmail);
            return response.status(200).json(group);
        } catch (error) {
            console.log(error);
            return response.status(500).json({ message: "Error adding members" });
        }
    },

    removeMembers: async (request, response) => {
        try {
            const { groupId, membersEmail } = request.body;
            const group = await groupDao.removeMembers(groupId, ...membersEmail);
            return response.status(200).json(group);
        } catch (error) {
            console.log(error);
            return response.status(500).json({ message: "Error removing members" });
        }
    },

    getGroupByEmail: async (request, response) => {
        try {
            // const { email } = request.params;
            const email = request.user.email;
            const groups = await groupDao.getGroupByEmail(email);
            return response.status(200).json(groups || []);
        } catch (error) {
            console.log(error);
            return response.status(500).json({ message: "Error Fetching groups" });
        }
    },

    getGroupsByPaymentStatus: async (request, response) => {
        try {
            const { isPaid } = request.query;
            const status = isPaid === 'true';
            const email = request.user.email;

            const groups = await groupDao.getGroupByStatus(email, status);
            response.status(200).json(groups);
        } catch (error) {
            response.status(500).json({ message: "Error filtering groups" });
        }
    },

    getAuditLog: async (request, response) => {
        try {
            const { groupId } = request.params;
            const auditLog = await groupDao.getAuditLog(groupId);
            return response.status(200).json(auditLog);
        } catch (error) {
            console.log(error);
            return response.status(500).json({ message: "Error fetching audit log" });
        }
    }
};

module.exports = groupController;
