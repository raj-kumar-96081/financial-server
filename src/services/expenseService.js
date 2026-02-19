const Expense = require("../model/expense");

// ✅ helper for safe rounding
const round = (num) => Number(num.toFixed(2));

const calculateBalances = (expenses) => {
    const balances = {};

    expenses.forEach((expense) => {
        if (expense.isSettled) return;

        const totalSplit = round(
            expense.splits.reduce(
                (sum, split) => sum + split.amount,
                0
            )
        );

        // ✅ payer gets credited
        balances[expense.paidByEmail] = round(
            (balances[expense.paidByEmail] || 0) + totalSplit
        );

        // ✅ members owe
        expense.splits.forEach((split) => {
            balances[split.email] = round(
                (balances[split.email] || 0) - split.amount
            );
        });
    });

    return balances;
};

exports.addExpense = async (expenseData) => {
    // ✅ ensure splits are rounded before saving
    if (expenseData.splits?.length) {
        expenseData.splits = expenseData.splits.map((split) => ({
            ...split,
            amount: round(split.amount),
        }));
    }

    expenseData.amount = round(expenseData.amount);

    return Expense.create(expenseData);
};

exports.getExpensesByGroup = async (groupId) => {
    return Expense.find({ groupId }).sort({ createdAt: -1 });
};

exports.getGroupSummary = async (groupId) => {
    const expenses = await Expense.find({ groupId });
    return calculateBalances(expenses);
};

exports.settleGroupExpenses = async (groupId) => {
    return Expense.updateMany(
        { groupId },
        { isSettled: true }
    );
};