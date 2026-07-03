import {
  getPersonalTransactionReport,
  getExpenseByCategoryReport,
  getPaymentModeReport,
  getBusinessTransactionReport,
  getSalesReport,
  getPurchaseReport,
  getExpenseReport,
  getPartySummaryReport,
  getTopCustomersReport,
  getTopSuppliersReport,
  getItemSalesReport,
  getItemPurchaseReport,
  getInventoryReport,
  getGSTSummaryReport,
  getGSTDetailedReport,
  getProfitLossReport,
  getCashFlowReport,
  getMonthlyTrendReport,
  getDashboardReport,
  getCombinedTransactionHistory
} from "../services/reportService.js";

// ==================== PERSONAL REPORTS ====================

export const getPersonalTransactions = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const result = await getPersonalTransactionReport(user_id, req.query);

    return res.status(200).json({
      success: true,
      message: "Personal transactions fetched successfully",
      ...result
    });
  } catch (error) {
    console.error("Error in getPersonalTransactions:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getExpenseByCategory = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const result = await getExpenseByCategoryReport(user_id, req.query);

    return res.status(200).json({
      success: true,
      message: "Expense by category fetched successfully",
      data: result
    });
  } catch (error) {
    console.error("Error in getExpenseByCategory:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getPaymentMode = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const result = await getPaymentModeReport(user_id, req.query);

    return res.status(200).json({
      success: true,
      message: "Payment mode report fetched successfully",
      data: result
    });
  } catch (error) {
    console.error("Error in getPaymentMode:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== BUSINESS REPORTS ====================

export const getBusinessTransactions = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const result = await getBusinessTransactionReport(user_id, req.query);

    return res.status(200).json({
      success: true,
      message: "Business transactions fetched successfully",
      ...result
    });
  } catch (error) {
    console.error("Error in getBusinessTransactions:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getSales = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const result = await getSalesReport(user_id, req.query);

    return res.status(200).json({
      success: true,
      message: "Sales report fetched successfully",
      ...result
    });
  } catch (error) {
    console.error("Error in getSales:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getPurchases = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const result = await getPurchaseReport(user_id, req.query);

    return res.status(200).json({
      success: true,
      message: "Purchase report fetched successfully",
      ...result
    });
  } catch (error) {
    console.error("Error in getPurchases:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const result = await getExpenseReport(user_id, req.query);

    return res.status(200).json({
      success: true,
      message: "Expense report fetched successfully",
      ...result
    });
  } catch (error) {
    console.error("Error in getExpenses:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== PARTY REPORTS ====================

export const getParties = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const result = await getPartySummaryReport(user_id, req.query);

    return res.status(200).json({
      success: true,
      message: "Party summary fetched successfully",
      data: result
    });
  } catch (error) {
    console.error("Error in getParties:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getTopCustomers = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const result = await getTopCustomersReport(user_id, req.query);

    return res.status(200).json({
      success: true,
      message: "Top customers fetched successfully",
      data: result
    });
  } catch (error) {
    console.error("Error in getTopCustomers:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getTopSuppliers = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const result = await getTopSuppliersReport(user_id, req.query);

    return res.status(200).json({
      success: true,
      message: "Top suppliers fetched successfully",
      data: result
    });
  } catch (error) {
    console.error("Error in getTopSuppliers:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== ITEM REPORTS ====================

export const getItemSales = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const result = await getItemSalesReport(user_id, req.query);

    return res.status(200).json({
      success: true,
      message: "Item sales report fetched successfully",
      data: result
    });
  } catch (error) {
    console.error("Error in getItemSales:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getItemPurchases = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const result = await getItemPurchaseReport(user_id, req.query);

    return res.status(200).json({
      success: true,
      message: "Item purchase report fetched successfully",
      data: result
    });
  } catch (error) {
    console.error("Error in getItemPurchases:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getInventory = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const result = await getInventoryReport(user_id, req.query);

    return res.status(200).json({
      success: true,
      message: "Inventory report fetched successfully",
      data: result
    });
  } catch (error) {
    console.error("Error in getInventory:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== GST REPORTS ====================

export const getGST = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const result = await getGSTSummaryReport(user_id, req.query);

    return res.status(200).json({
      success: true,
      message: "GST summary fetched successfully",
      data: result
    });
  } catch (error) {
    console.error("Error in getGST:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getGSTDetails = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const result = await getGSTDetailedReport(user_id, req.query);

    return res.status(200).json({
      success: true,
      message: "GST detailed report fetched successfully",
      ...result
    });
  } catch (error) {
    console.error("Error in getGSTDetails:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== FINANCIAL REPORTS ====================

export const getProfitLoss = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const result = await getProfitLossReport(user_id, req.query);

    return res.status(200).json({
      success: true,
      message: "Profit & Loss report fetched successfully",
      data: result
    });
  } catch (error) {
    console.error("Error in getProfitLoss:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getCashFlow = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const result = await getCashFlowReport(user_id, req.query);

    return res.status(200).json({
      success: true,
      message: "Cash flow report fetched successfully",
      data: result
    });
  } catch (error) {
    console.error("Error in getCashFlow:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getMonthly = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const result = await getMonthlyTrendReport(user_id, req.query);

    return res.status(200).json({
      success: true,
      message: "Monthly trend report fetched successfully",
      data: result
    });
  } catch (error) {
    console.error("Error in getMonthly:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== DASHBOARD ====================

export const getDashboard = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const result = await getDashboardReport(user_id, req.query);

    return res.status(200).json({
      success: true,
      message: "Dashboard report fetched successfully",
      data: result
    });
  } catch (error) {
    console.error("Error in getDashboard:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== COMBINED HISTORY ====================

export const getHistory = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const result = await getCombinedTransactionHistory(user_id, req.query);

    return res.status(200).json({
      success: true,
      message: "Transaction history fetched successfully",
      ...result
    });
  } catch (error) {
    console.error("Error in getHistory:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};