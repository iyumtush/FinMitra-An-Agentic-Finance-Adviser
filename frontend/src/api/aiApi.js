import { transactionApi } from './transactionApi';
import { budgetApi } from './budgetApi';

export const aiApi = {
  getInsights: async () => {
    try {
      const transactions = await transactionApi.getTransactions();
      const budgets = await budgetApi.getBudgets();

      const totalIncome = transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      const totalExpense = transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      const netSavings = totalIncome - totalExpense;
      const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : '0.0';

      const insights = [];

      if (totalIncome === 0 && totalExpense === 0) {
        insights.push({
          title: "Welcome to FinMitra!",
          description: "Start by logging your monthly income and daily expenses to generate personalized AI financial advice.",
          type: "INFO"
        });
      } else {
        insights.push({
          title: `Savings Rate: ${savingsRate}%`,
          description: netSavings >= 0
            ? `Great job! You saved ₹${netSavings.toLocaleString('en-IN')} this period. Aim to invest at least 20% of net savings.`
            : `Warning: Expenses exceed income by ₹${Math.abs(netSavings).toLocaleString('en-IN')}. Review budget categories below.`,
          type: netSavings >= 0 ? "SUCCESS" : "WARNING"
        });

        // Category breakdown alerts
        budgets.forEach(b => {
          const catExpense = transactions
            .filter(t => t.type === 'EXPENSE' && t.category === b.category)
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);

          if (catExpense > Number(b.limitAmount || 0)) {
            insights.push({
              title: `Budget Exceeded: ${b.category}`,
              description: `Spent ₹${catExpense.toLocaleString('en-IN')} vs limit of ₹${Number(b.limitAmount).toLocaleString('en-IN')}.`,
              type: "DANGER"
            });
          }
        });
      }

      return { insights };
    } catch (e) {
      return { insights: [] };
    }
  },

  sendMessage: async (message) => {
    const text = message.toLowerCase();
    let reply = "I am your FinMitra Financial Adviser AI. Ask me about your spending, savings rate, or budget optimization!";

    if (text.includes("save") || text.includes("savings")) {
      reply = "To maximize your savings, adopt the 50/30/20 rule: 50% for Needs, 30% for Wants, and 20% dedicated directly to SIPs & Emergency Funds.";
    } else if (text.includes("budget") || text.includes("limit")) {
      reply = "You can set custom budget caps per category in the Budgets section. FinMitra automatically alerts you when category spending reaches 80%.";
    } else if (text.includes("invest") || text.includes("stocks")) {
      reply = "Consider allocating a portion of monthly surplus to index funds (Nifty 50) and high-yield instruments before taking individual equity risks.";
    }

    return { response: reply };
  }
};
