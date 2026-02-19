const mongoose = require("mongoose");

const splitSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false }
);

const expenseSchema = new mongoose.Schema(
    {
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true,
        },

        paidByEmail: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            trim: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        splits: [splitSchema],

        isSettled: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);