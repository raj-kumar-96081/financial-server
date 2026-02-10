const Group = require('../model/group');

const groupDao = {

    createdGroup: async (data) => {
        const newGroup = new Group(data);
        return await newGroup.save();
    },

    updateGroup: async (data) => {
        const { groupId, name, description, thumbnail, adminEmail, paymentStatus } = data;
        return await Group.findByIdAndUpdate(
            groupId,
            { name, description, thumbnail, adminEmail, paymentStatus },
            { new: true }
        );
    },

    addMembers: async (groupId, ...membersEmail) => {
        return await Group.findByIdAndUpdate(
            groupId,
            { $addToSet: { membersEmail: { $each: membersEmail } } },
            { new: true }
        );
    },

    removeMembers: async (groupId, ...membersEmail) => {
        return await Group.findByIdAndUpdate(
            groupId,
            { $pull: { membersEmail: { $in: membersEmail } } },
            { new: true }
        );
    },

    getGroupByEmail: async (email) => {
        return await Group.find({ membersEmail: email });
    },

    getGroupByStatus: async (status) => {
        return await Group.find({ "paymentStatus.isPaid": status });
    },

    /**
     * Returns audit/settlement information
     * @params{*} groupId
     */
    getAuditLog: async (groupId) => {
        const group = await Group.findById(groupId).select('paymentStatus.date');
        // return await Group.findById(groupId).select({
        //     paymentStatus: 1,
        //     _id: 0
        // });
        return group ? group.paymentStatus.date : null;
    },

    getGroupsPaginated: async (email, limit, skip, sortOptions = { createdAt: -1 }) => {

        const [groups, totalCount] = await Promise.all([
            // Find groups with given email, 
            // sort them to preserve order across 
            // pagination requests, and then perform 
            // skip and limit to get results of desired page. 
            Group.find({ membersEmail: email })
                .sort(sortOptions)
                .skip(skip)
                .limit(limit),

            // Count how many records are there in the collection +
            // with the given email +
            Group.countDocuments({ membersEmail: email }),
        ]);

        return { groups, totalCount };
    },
};

module.exports = groupDao;
