const calculateNetBalances = (expenses) => {
    const balanceMap = {};

    expenses.forEach((expense) => {
        if (expense.isSettled) return;

        const totalSplit = expense.splits.reduce(
            (sum, s) => sum + s.amount,
            0
        );

        // payer gets credit
        balanceMap[expense.paidBy] =
            (balanceMap[expense.paidBy] || 0) + totalSplit;

        // split users owe money
        expense.splits.forEach(({ userId, amount }) => {
            balanceMap[userId] =
                (balanceMap[userId] || 0) - amount;
        });
    });

    return balanceMap;
};

module.exports = calculateNetBalances;