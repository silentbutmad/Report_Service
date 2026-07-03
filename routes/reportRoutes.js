import express from "express"
const router = express.Router()
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getPersonalTransactions,
  getExpenseByCategory,
  getPaymentMode,
  getBusinessTransactions,
  getSales,
  getPurchases,
  getExpenses,
  getParties,
  getTopCustomers,
  getTopSuppliers,
  getItemSales,
  getItemPurchases,
  getInventory,
  getGST,
  getGSTDetails,
  getProfitLoss,
  getCashFlow,
  getMonthly,
  getDashboard,
  getHistory
} from '../controller/reportController.js'

// Personal Reports
router.get('/personal/transactions', verifyToken, getPersonalTransactions)
router.get('/personal/category', verifyToken, getExpenseByCategory)
router.get('/personal/payment-mode', verifyToken, getPaymentMode)

// Business Reports
router.get('/business/transactions', verifyToken, getBusinessTransactions)
router.get('/business/sales', verifyToken, getSales)
router.get('/business/purchases', verifyToken, getPurchases)
router.get('/business/expenses', verifyToken, getExpenses)

// Party Reports
router.get('/party', verifyToken, getParties)
router.get('/top-customers', verifyToken, getTopCustomers)
router.get('/top-suppliers', verifyToken, getTopSuppliers)

// Item Reports
router.get('/items/sales', verifyToken, getItemSales)
router.get('/items/purchases', verifyToken, getItemPurchases)
router.get('/inventory', verifyToken, getInventory)

// GST Reports
router.get('/gst', verifyToken, getGST)
router.get('/gst/details', verifyToken, getGSTDetails)

// Financial Reports
router.get('/profit-loss', verifyToken, getProfitLoss)
router.get('/cash-flow', verifyToken, getCashFlow)
router.get('/monthly', verifyToken, getMonthly)

// Dashboard
router.get('/dashboard', verifyToken, getDashboard)

// Combined History
router.get('/history', verifyToken, getHistory)

export default router