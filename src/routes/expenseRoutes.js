const express = require("express");
const router = express.Router();

const {
    createExpense,
    getGroupExpenses,
    getGroupSummary,
    settleGroup,
    getRecentExpensesForUser
} = require("../controllers/expenseController");
const authMiddleware = require("../middleware/authMiddleware");


router.post("/", authMiddleware.protect, createExpense);
router.get("/group/:groupId", authMiddleware.protect, getGroupExpenses);
router.get("/group/:groupId/summary", authMiddleware.protect, getGroupSummary);
router.post("/group/:groupId/settle", authMiddleware.protect, settleGroup);
router.get("/recent", authMiddleware.protect, getRecentExpensesForUser);

module.exports = router;