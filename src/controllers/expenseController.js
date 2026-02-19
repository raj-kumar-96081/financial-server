

const expenseService = require("../services/expenseService");

exports.createExpense = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userEmail = req.user.email;

        const { groupId, description, amount, splits } = req.body;

        if (!groupId || !amount || !splits?.length) {
            return res.status(400).json({
                message: "Missing required fields",
            });
        }

        const expense = await expenseService.addExpense({
            groupId,
            description,
            amount,
            splits,
            paidByEmail: userEmail,
        });

        res.status(201).json(expense);

    } catch (error) {
        console.error("Create Expense Error:", error);
        res.status(500).json({ message: "Error creating expense" });
    }
};

exports.getGroupExpenses = async (req, res) => {
    try {
        const expenses = await expenseService.getExpensesByGroup(
            req.params.groupId
        );

        res.json(expenses || []);

    } catch (error) {
        console.error("Fetch Expenses Error:", error);
        res.status(500).json({ message: "Error fetching expenses" });
    }
};

exports.getGroupSummary = async (req, res) => {
    try {
        const summary = await expenseService.getGroupSummary(
            req.params.groupId
        );

        res.json(summary || {});

    } catch (error) {
        console.error("Fetch Summary Error:", error);
        res.status(500).json({ message: "Error fetching summary" });
    }
};

exports.settleGroup = async (req, res) => {
    try {
        await expenseService.settleGroupExpenses(req.params.groupId);

        res.json({ message: "Group settled" });

    } catch (error) {
        console.error("Settle Error:", error);
        res.status(500).json({ message: "Error settling group" });
    }
};