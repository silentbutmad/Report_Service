import {prisma} from "../models/db.js";
import {
  getPaginationParams,
  formatPaginationResponse,
  buildDateFilter,
  formatDate,
  formatTime,
  parseDecimal,
  buildSearchFilter,
  getSoftDeleteFilter,
  getSortOrder
} from "../utils/helpers.js";

// ==================== PERSONAL REPORTS ====================

export const getPersonalTransactionReport = async (user_id, query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const {
    transaction_type,
    loan_type,
    payment_mode,
    category,
    name,
    search,
    start_date,
    end_date,
    include_deleted = "false",
    sort_by = "transaction_date",
    sort_order = "desc"
  } = query;

  const where = {
    user_id,
    ...getSoftDeleteFilter(include_deleted)
  };

  if (transaction_type) {
    where.transaction_type = transaction_type;
  }

  if (loan_type) {
    where.loan_type = loan_type;
  }

  if (payment_mode) {
    where.payment_mode = payment_mode;
  }

  if (category) {
    where.category = category;
  }

  if (name) {
    where.name = {
      contains: name,
      mode: 'insensitive'
    };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { remark: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (start_date || end_date) {
    where.transaction_date = buildDateFilter(start_date, end_date);
  }

  const [transactions, total] = await Promise.all([
    prisma.personalTransaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: getSortOrder(sort_by, sort_order),
    }),
    prisma.personalTransaction.count({ where })
  ]);

  const formattedTransactions = transactions.map(transaction => ({
    transaction_id: transaction.transaction_id,
    transaction_type: transaction.transaction_type,
    amount: transaction.amount,
    name: transaction.name,
    email: transaction.email,
    category: transaction.category,
    remark: transaction.remark,
    payment_mode: transaction.payment_mode,
    loan_type: transaction.loan_type,
    transaction_date: formatDate(transaction.transaction_date),
    due_date: formatDate(transaction.due_date),
    created_at: formatDate(transaction.created_at)
  }));

  return formatPaginationResponse(formattedTransactions, total, page, limit);
};

export const getExpenseByCategoryReport = async (user_id, query) => {
  const { start_date, end_date, include_deleted = "false" } = query;

  const where = {
    user_id,
    transaction_type: "EXPENSE",
    ...getSoftDeleteFilter(include_deleted)
  };

  if (start_date || end_date) {
    where.transaction_date = buildDateFilter(start_date, end_date);
  }

  const categories = await prisma.personalTransaction.groupBy({
    by: ['category'],
    where,
    _sum: {
      amount: true
    },
    _count: {
      transaction_id: true
    },
    orderBy: {
      _sum: {
        amount: 'desc'
      }
    }
  });

  return categories.map(cat => ({
    category: cat.category || 'Uncategorized',
    total_amount: parseDecimal(cat._sum.amount),
    transaction_count: cat._count.transaction_id
  }));
};

export const getPaymentModeReport = async (user_id, query) => {
  const { start_date, end_date, include_deleted = "false" } = query;

  const where = {
    user_id,
    ...getSoftDeleteFilter(include_deleted)
  };

  if (start_date || end_date) {
    where.transaction_date = buildDateFilter(start_date, end_date);
  }

  const paymentModes = await prisma.personalTransaction.groupBy({
    by: ['payment_mode'],
    where,
    _sum: {
      amount: true
    },
    _count: {
      transaction_id: true
    },
    orderBy: {
      _sum: {
        amount: 'desc'
      }
    }
  });

  return paymentModes.map(mode => ({
    payment_mode: mode.payment_mode,
    total_amount: parseDecimal(mode._sum.amount),
    transaction_count: mode._count.transaction_id
  }));
};

// ==================== BUSINESS REPORTS ====================

export const getBusinessTransactionReport = async (user_id, query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const {
    business_id,
    transaction_type,
    start_date,
    end_date,
    include_deleted = "false",
    sort_by = "transaction_date",
    sort_order = "desc"
  } = query;

  // Get all businesses for the user
  const userBusinesses = await prisma.business.findMany({
    where: { user_id },
    select: { business_id: true }
  });

  const businessIds = userBusinesses.map(b => b.business_id);
  
  const where = {
    business_id: { in: businessIds },
    context_type: "BUSINESS",
    ...getSoftDeleteFilter(include_deleted)
  };

  if (business_id) {
    where.business_id = business_id;
  }

  if (transaction_type) {
    where.transaction_type = transaction_type;
  }

  if (start_date || end_date) {
    where.transaction_date = buildDateFilter(start_date, end_date);
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: getSortOrder(sort_by, sort_order),
      include: {
        party: {
          select: {
            name: true,
            party_type: true
          }
        }
      }
    }),
    prisma.transaction.count({ where })
  ]);

  const formattedTransactions = transactions.map(transaction => ({
    transaction_id: transaction.transaction_id,
    transaction_number: transaction.transaction_number,
    title: transaction.title,
    business_id: transaction.business_id,
    party_id: transaction.party_id,
    party_name: transaction.party?.name,
    party_type: transaction.party?.party_type,
    transaction_type: transaction.transaction_type,
    transaction_date: formatDate(transaction.transaction_date),
    due_date: formatDate(transaction.due_date),
    subtotal_amount: transaction.subtotal_amount,
    total_gst_amount: transaction.total_gst_amount,
    total_amount: transaction.total_amount,
    created_at: formatDate(transaction.created_at)
  }));

  return formatPaginationResponse(formattedTransactions, total, page, limit);
};

export const getSalesReport = async (user_id, query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const { business_id, start_date, end_date, include_deleted = "false" } = query;

  const userBusinesses = await prisma.business.findMany({
    where: { user_id },
    select: { business_id: true }
  });

  const businessIds = userBusinesses.map(b => b.business_id);

  const where = {
    business_id: { in: businessIds },
    transaction_type: "SALE",
    context_type: "BUSINESS",
    ...getSoftDeleteFilter(include_deleted)
  };

  if (business_id) {
    where.business_id = business_id;
  }

  if (start_date || end_date) {
    where.transaction_date = buildDateFilter(start_date, end_date);
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { transaction_date: "desc" },
      include: {
        party: {
          select: {
            name: true,
            party_type: true
          }
        },
        items: {
          include: {
            item: {
              select: {
                name: true
              }
            }
          }
        }
      }
    }),
    prisma.transaction.count({ where })
  ]);

  const formattedTransactions = transactions.map(transaction => ({
    transaction_id: transaction.transaction_id,
    transaction_number: transaction.transaction_number,
    party_name: transaction.party?.name,
    party_type: transaction.party?.party_type,
    total_amount: transaction.total_amount,
    transaction_date: formatDate(transaction.transaction_date),
    items_count: transaction.items.length
  }));

  return formatPaginationResponse(formattedTransactions, total, page, limit);
};

export const getPurchaseReport = async (user_id, query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const { business_id, start_date, end_date, include_deleted = "false" } = query;

  const userBusinesses = await prisma.business.findMany({
    where: { user_id },
    select: { business_id: true }
  });

  const businessIds = userBusinesses.map(b => b.business_id);

  const where = {
    business_id: { in: businessIds },
    transaction_type: "PURCHASE",
    context_type: "BUSINESS",
    ...getSoftDeleteFilter(include_deleted)
  };

  if (business_id) {
    where.business_id = business_id;
  }

  if (start_date || end_date) {
    where.transaction_date = buildDateFilter(start_date, end_date);
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { transaction_date: "desc" },
      include: {
        party: {
          select: {
            name: true
          }
        },
        items: {
          include: {
            item: {
              select: {
                name: true,
                price: true
              }
            }
          }
        }
      }
    }),
    prisma.transaction.count({ where })
  ]);

  const formattedTransactions = transactions.map(transaction => ({
    transaction_id: transaction.transaction_id,
    transaction_number: transaction.transaction_number,
    party_name: transaction.party?.name,
    total_amount: transaction.total_amount,
    transaction_date: formatDate(transaction.transaction_date),
    items: transaction.items.map(item => ({
      item_name: item.item?.name,
      quantity: item.quantity,
      price: item.price
    }))
  }));

  return formatPaginationResponse(formattedTransactions, total, page, limit);
};

export const getExpenseReport = async (user_id, query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const { business_id, start_date, end_date, include_deleted = "false" } = query;

  const userBusinesses = await prisma.business.findMany({
    where: { user_id },
    select: { business_id: true }
  });

  const businessIds = userBusinesses.map(b => b.business_id);

  const where = {
    business_id: { in: businessIds },
    transaction_type: "EXPENSE",
    context_type: "BUSINESS",
    ...getSoftDeleteFilter(include_deleted)
  };

  if (business_id) {
    where.business_id = business_id;
  }

  if (start_date || end_date) {
    where.transaction_date = buildDateFilter(start_date, end_date);
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { transaction_date: "desc" },
      include: {
        items: {
          include: {
            item: {
              select: {
                name: true
              }
            }
          }
        }
      }
    }),
    prisma.transaction.count({ where })
  ]);

  const formattedTransactions = transactions.map(transaction => ({
    transaction_id: transaction.transaction_id,
    transaction_number: transaction.transaction_number,
    title: transaction.title,
    total_amount: transaction.total_amount,
    transaction_date: formatDate(transaction.transaction_date),
    items: transaction.items.map(item => ({
      item_name: item.item?.name,
      description: item.description,
      quantity: item.quantity,
      price: item.price
    }))
  }));

  return formatPaginationResponse(formattedTransactions, total, page, limit);
};

// ==================== PARTY REPORTS ====================

export const getPartySummaryReport = async (user_id, query) => {
  const { business_id } = query;

  const userBusinesses = await prisma.business.findMany({
    where: { user_id },
    select: { business_id: true }
  });

  const businessIds = business_id 
    ? [business_id]
    : userBusinesses.map(b => b.business_id);

  if (businessIds.length === 0) {
    return [];
  }

  const parties = await prisma.party.findMany({
    where: {
      business_id: { in: businessIds }
    },
    include: {
      transactions: {
        where: {
          is_deleted: false,
          context_type: "BUSINESS"
        },
        select: {
          transaction_type: true,
          total_amount: true
        }
      }
    }
  });

  return parties.map(party => {
    const totalTransactions = party.transactions.length;
    const totalSales = party.transactions
      .filter(t => t.transaction_type === "SALE")
      .reduce((sum, t) => sum + parseFloat(t.total_amount), 0);
    const totalPurchase = party.transactions
      .filter(t => t.transaction_type === "PURCHASE")
      .reduce((sum, t) => sum + parseFloat(t.total_amount), 0);
    const totalAmount = totalSales + totalPurchase;

    return {
      party_id: party.party_id,
      party_name: party.name,
      phone: party.phone,
      party_type: party.party_type,
      total_transactions: totalTransactions,
      total_sales: totalSales,
      total_purchase: totalPurchase,
      total_amount: totalAmount
    };
  });
};

export const getTopCustomersReport = async (user_id, query) => {
  const { limit = 10, business_id } = query;

  const userBusinesses = await prisma.business.findMany({
    where: { user_id },
    select: { business_id: true }
  });

  const businessIds = business_id 
    ? [business_id]
    : userBusinesses.map(b => b.business_id);

  if (businessIds.length === 0) {
    return [];
  }

  const customers = await prisma.party.findMany({
    where: {
      business_id: { in: businessIds },
      party_type: "CUSTOMER"
    },
    include: {
      transactions: {
        where: {
          is_deleted: false,
          transaction_type: "SALE"
        },
        select: {
          total_amount: true
        }
      }
    }
  });

  const customersWithStats = customers.map(customer => ({
    party_id: customer.party_id,
    party_name: customer.name,
    phone: customer.phone,
    total_sales: customer.transactions.reduce((sum, t) => sum + parseFloat(t.total_amount), 0),
    transaction_count: customer.transactions.length
  }));

  customersWithStats.sort((a, b) => b.total_sales - a.total_sales);

  return customersWithStats.slice(0, parseInt(limit));
};

export const getTopSuppliersReport = async (user_id, query) => {
  const { limit = 10, business_id } = query;

  const userBusinesses = await prisma.business.findMany({
    where: { user_id },
    select: { business_id: true }
  });

  const businessIds = business_id 
    ? [business_id]
    : userBusinesses.map(b => b.business_id);

  if (businessIds.length === 0) {
    return [];
  }

  const suppliers = await prisma.party.findMany({
    where: {
      business_id: { in: businessIds },
      party_type: "SUPPLIER"
    },
    include: {
      transactions: {
        where: {
          is_deleted: false,
          transaction_type: "PURCHASE"
        },
        select: {
          total_amount: true
        }
      }
    }
  });

  const suppliersWithStats = suppliers.map(supplier => ({
    party_id: supplier.party_id,
    party_name: supplier.name,
    phone: supplier.phone,
    total_purchase: supplier.transactions.reduce((sum, t) => sum + parseFloat(t.total_amount), 0),
    transaction_count: supplier.transactions.length
  }));

  suppliersWithStats.sort((a, b) => b.total_purchase - a.total_purchase);

  return suppliersWithStats.slice(0, parseInt(limit));
};

// ==================== ITEM REPORTS ====================

export const getItemSalesReport = async (user_id, query) => {
  const { business_id, start_date, end_date } = query;

  const userBusinesses = await prisma.business.findMany({
    where: { user_id },
    select: { business_id: true }
  });

  const businessIds = business_id 
    ? [business_id]
    : userBusinesses.map(b => b.business_id);

  if (businessIds.length === 0) {
    return [];
  }

  const where = {
    transaction: {
      business_id: { in: businessIds },
      transaction_type: "SALE",
      is_deleted: false
    }
  };

  if (start_date || end_date) {
    where.transaction.transaction_date = buildDateFilter(start_date, end_date);
  }

  const itemSales = await prisma.transactionItem.groupBy({
    by: ['item_id'],
    where,
    _sum: {
      quantity: true
    },
    _count: {
      id: true
    }
  });

  const itemIds = itemSales.map(s => s.item_id).filter(id => id);

  if (itemIds.length === 0) {
    return [];
  }

  const items = await prisma.item.findMany({
    where: {
      item_id: { in: itemIds }
    },
    include: {
      category: {
        select: {
          category_name: true
        }
      }
    }
  });

  const itemMap = new Map(items.map(item => [item.item_id, item]));

  return itemSales.map(sale => {
    const item = itemMap.get(sale.item_id);
    if (!item) return null;

    const totalRevenue = sale._sum.quantity * parseFloat(item.price);

    return {
      item_id: item.item_id,
      item_name: item.name,
      category_name: item.category?.category_name || 'Uncategorized',
      total_quantity_sold: sale._sum.quantity,
      total_revenue: totalRevenue,
      gst_rate: item.gst_rate
    };
  }).filter(item => item !== null);
};

export const getItemPurchaseReport = async (user_id, query) => {
  const { business_id, start_date, end_date } = query;

  const userBusinesses = await prisma.business.findMany({
    where: { user_id },
    select: { business_id: true }
  });

  const businessIds = business_id 
    ? [business_id]
    : userBusinesses.map(b => b.business_id);

  if (businessIds.length === 0) {
    return [];
  }

  const where = {
    transaction: {
      business_id: { in: businessIds },
      transaction_type: "PURCHASE",
      is_deleted: false
    }
  };

  if (start_date || end_date) {
    where.transaction.transaction_date = buildDateFilter(start_date, end_date);
  }

  const itemPurchases = await prisma.transactionItem.groupBy({
    by: ['item_id'],
    where,
    _sum: {
      quantity: true
    }
  });

  const itemIds = itemPurchases.map(p => p.item_id).filter(id => id);

  if (itemIds.length === 0) {
    return [];
  }

  const items = await prisma.item.findMany({
    where: {
      item_id: { in: itemIds }
    },
    include: {
      category: {
        select: {
          category_name: true
        }
      }
    }
  });

  const itemMap = new Map(items.map(item => [item.item_id, item]));

  return itemPurchases.map(purchase => {
    const item = itemMap.get(purchase.item_id);
    if (!item) return null;

    const totalCost = purchase._sum.quantity * parseFloat(item.price);

    return {
      item_id: item.item_id,
      item_name: item.name,
      category_name: item.category?.category_name || 'Uncategorized',
      total_quantity_purchased: purchase._sum.quantity,
      total_cost: totalCost
    };
  }).filter(item => item !== null);
};

export const getInventoryReport = async (user_id, query) => {
  const { business_id } = query;

  const userBusinesses = await prisma.business.findMany({
    where: { user_id },
    select: { business_id: true }
  });

  const businessIds = business_id 
    ? [business_id]
    : userBusinesses.map(b => b.business_id);

  if (businessIds.length === 0) {
    return [];
  }

  const items = await prisma.item.findMany({
    where: {
      business_id: { in: businessIds }
    },
    include: {
      category: {
        select: {
          category_name: true
        }
      },
      transaction_items: {
        where: {
          transaction: {
            is_deleted: false
          }
        },
        include: {
          transaction: {
            select: {
              transaction_type: true
            }
          }
        }
      }
    }
  });

  return items.map(item => {
    const totalSold = item.transaction_items
      .filter(ti => ti.transaction.transaction_type === "SALE")
      .reduce((sum, ti) => sum + ti.quantity, 0);
    
    const totalPurchased = item.transaction_items
      .filter(ti => ti.transaction.transaction_type === "PURCHASE")
      .reduce((sum, ti) => sum + ti.quantity, 0);

    return {
      item_id: item.item_id,
      item_name: item.name,
      category_name: item.category?.category_name || 'Uncategorized',
      price: item.price,
      gst_rate: item.gst_rate,
      hsn_code: item.hsn_code,
      total_sold: totalSold,
      total_purchased: totalPurchased
    };
  });
};

// ==================== GST REPORTS ====================

export const getGSTSummaryReport = async (user_id, query) => {
  const { business_id, start_date, end_date, include_deleted = "false" } = query;

  const userBusinesses = await prisma.business.findMany({
    where: { user_id },
    select: { business_id: true }
  });

  const businessIds = business_id 
    ? [business_id]
    : userBusinesses.map(b => b.business_id);

  if (businessIds.length === 0) {
    return {
      total_gst_collected: 0,
      total_gst_paid: 0,
      net_gst: 0
    };
  }

  const where = {
    business_id: { in: businessIds },
    context_type: "BUSINESS",
    ...getSoftDeleteFilter(include_deleted)
  };

  if (start_date || end_date) {
    where.transaction_date = buildDateFilter(start_date, end_date);
  }

  const [salesResult, purchaseResult] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        ...where,
        transaction_type: "SALE"
      },
      _sum: {
        total_gst_amount: true
      }
    }),
    prisma.transaction.aggregate({
      where: {
        ...where,
        transaction_type: "PURCHASE"
      },
      _sum: {
        total_gst_amount: true
      }
    })
  ]);

  const totalGstCollected = parseDecimal(salesResult._sum.total_gst_amount);
  const totalGstPaid = parseDecimal(purchaseResult._sum.total_gst_amount);
  const netGst = totalGstCollected - totalGstPaid;

  return {
    total_gst_collected: totalGstCollected,
    total_gst_paid: totalGstPaid,
    net_gst: netGst
  };
};

export const getGSTDetailedReport = async (user_id, query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const { business_id, transaction_type, start_date, end_date, include_deleted = "false" } = query;

  const userBusinesses = await prisma.business.findMany({
    where: { user_id },
    select: { business_id: true }
  });

  const businessIds = business_id 
    ? [business_id]
    : userBusinesses.map(b => b.business_id);

  if (businessIds.length === 0) {
    return formatPaginationResponse([], 0, page, limit);
  }

  const where = {
    business_id: { in: businessIds },
    context_type: "BUSINESS",
    ...getSoftDeleteFilter(include_deleted)
  };

  if (transaction_type) {
    where.transaction_type = transaction_type;
  }

  if (start_date || end_date) {
    where.transaction_date = buildDateFilter(start_date, end_date);
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { transaction_date: "desc" },
      include: {
        party: {
          select: {
            name: true
          }
        }
      }
    }),
    prisma.transaction.count({ where })
  ]);

  const formattedTransactions = transactions.map(transaction => ({
    transaction_number: transaction.transaction_number,
    transaction_type: transaction.transaction_type,
    transaction_date: formatDate(transaction.transaction_date),
    subtotal_amount: transaction.subtotal_amount,
    total_gst_amount: transaction.total_gst_amount,
    total_amount: transaction.total_amount,
    party_name: transaction.party?.name
  }));

  return formatPaginationResponse(formattedTransactions, total, page, limit);
};

// ==================== FINANCIAL REPORTS ====================

export const getProfitLossReport = async (user_id, query) => {
  const { business_id, start_date, end_date, include_deleted = "false" } = query;

  const userBusinesses = await prisma.business.findMany({
    where: { user_id },
    select: { business_id: true }
  });

  const businessIds = business_id 
    ? [business_id]
    : userBusinesses.map(b => b.business_id);

  if (businessIds.length === 0) {
    return {
      total_sales: 0,
      total_purchase: 0,
      total_expenses: 0,
      gross_profit: 0,
      net_profit: 0
    };
  }

  const dateFilter = buildDateFilter(start_date, end_date);

  const baseWhere = {
    business_id: { in: businessIds },
    context_type: "BUSINESS",
    ...getSoftDeleteFilter(include_deleted)
  };

  if (start_date || end_date) {
    baseWhere.transaction_date = dateFilter;
  }

  const [salesResult, purchaseResult, expenseResult] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        ...baseWhere,
        transaction_type: "SALE"
      },
      _sum: {
        total_amount: true
      }
    }),
    prisma.transaction.aggregate({
      where: {
        ...baseWhere,
        transaction_type: "PURCHASE"
      },
      _sum: {
        total_amount: true
      }
    }),
    prisma.transaction.aggregate({
      where: {
        ...baseWhere,
        transaction_type: "EXPENSE"
      },
      _sum: {
        total_amount: true
      }
    })
  ]);

  const totalSales = parseDecimal(salesResult._sum.total_amount);
  const totalPurchase = parseDecimal(purchaseResult._sum.total_amount);
  const totalExpenses = parseDecimal(expenseResult._sum.total_amount);

  const grossProfit = totalSales - totalPurchase;
  const netProfit = grossProfit - totalExpenses;

  return {
    total_sales: totalSales,
    total_purchase: totalPurchase,
    total_expenses: totalExpenses,
    gross_profit: grossProfit,
    net_profit: netProfit
  };
};

export const getCashFlowReport = async (user_id, query) => {
  const { business_id, start_date, end_date, include_deleted = "false" } = query;

  const userBusinesses = await prisma.business.findMany({
    where: { user_id },
    select: { business_id: true }
  });

  const businessIds = business_id 
    ? [business_id]
    : userBusinesses.map(b => b.business_id);

  if (businessIds.length === 0) {
    return [];
  }

  const where = {
    business_id: { in: businessIds },
    context_type: "BUSINESS",
    ...getSoftDeleteFilter(include_deleted)
  };

  if (start_date || end_date) {
    where.transaction_date = buildDateFilter(start_date, end_date);
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { transaction_date: "asc" },
    select: {
      transaction_date: true,
      transaction_type: true,
      total_amount: true
    }
  });

  let balance = 0;
  
  return transactions.map(transaction => {
    const amount = parseFloat(transaction.total_amount);
    const amountIn = transaction.transaction_type === "SALE" ? amount : 0;
    const amountOut = transaction.transaction_type !== "SALE" ? amount : 0;
    
    balance += amountIn - amountOut;

    return {
      date: formatDate(transaction.transaction_date),
      transaction_type: transaction.transaction_type,
      context_type: "BUSINESS",
      amount_in: amountIn,
      amount_out: amountOut,
      balance: balance
    };
  });
};

export const getMonthlyTrendReport = async (user_id, query) => {
  const { business_id, start_date, end_date, include_deleted = "false" } = query;

  const userBusinesses = await prisma.business.findMany({
    where: { user_id },
    select: { business_id: true }
  });

  const businessIds = business_id 
    ? [business_id]
    : userBusinesses.map(b => b.business_id);

  if (businessIds.length === 0) {
    return [];
  }

  const where = {
    business_id: { in: businessIds },
    context_type: "BUSINESS",
    ...getSoftDeleteFilter(include_deleted)
  };

  if (start_date || end_date) {
    where.transaction_date = buildDateFilter(start_date, end_date);
  }

  const transactions = await prisma.transaction.findMany({
    where,
    select: {
      transaction_date: true,
      transaction_type: true,
      total_amount: true
    }
  });

  // Group by month
  const monthlyData = {};

  transactions.forEach(transaction => {
    const date = new Date(transaction.transaction_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        total_sales: 0,
        total_purchase: 0,
        total_expenses: 0
      };
    }

    const amount = parseFloat(transaction.total_amount);
    
    if (transaction.transaction_type === "SALE") {
      monthlyData[monthKey].total_sales += amount;
    } else if (transaction.transaction_type === "PURCHASE") {
      monthlyData[monthKey].total_purchase += amount;
    } else if (transaction.transaction_type === "EXPENSE") {
      monthlyData[monthKey].total_expenses += amount;
    }
  });

  return Object.values(monthlyData).map(data => ({
    ...data,
    net_profit: data.total_sales - data.total_purchase - data.total_expenses
  })).sort((a, b) => a.month.localeCompare(b.month));
};

// ==================== DASHBOARD REPORT ====================

export const getDashboardReport = async (user_id, query) => {
  const { business_id, start_date, end_date, include_deleted = "false" } = query;

  const userBusinesses = await prisma.business.findMany({
    where: { user_id },
    select: { business_id: true }
  });

  const businessIds = business_id 
    ? [business_id]
    : userBusinesses.map(b => b.business_id);

  const dateFilter = buildDateFilter(start_date, end_date);

  // Get total sales
  const salesWhere = {
    business_id: { in: businessIds },
    transaction_type: "SALE",
    context_type: "BUSINESS",
    ...getSoftDeleteFilter(include_deleted)
  };
  if (start_date || end_date) {
    salesWhere.transaction_date = dateFilter;
  }

  const salesResult = await prisma.transaction.aggregate({
    where: salesWhere,
    _sum: { total_amount: true }
  });

  // Get total purchase
  const purchaseWhere = {
    business_id: { in: businessIds },
    transaction_type: "PURCHASE",
    context_type: "BUSINESS",
    ...getSoftDeleteFilter(include_deleted)
  };
  if (start_date || end_date) {
    purchaseWhere.transaction_date = dateFilter;
  }

  const purchaseResult = await prisma.transaction.aggregate({
    where: purchaseWhere,
    _sum: { total_amount: true }
  });

  // Get total expenses
  const expenseWhere = {
    business_id: { in: businessIds },
    transaction_type: "EXPENSE",
    context_type: "BUSINESS",
    ...getSoftDeleteFilter(include_deleted)
  };
  if (start_date || end_date) {
    expenseWhere.transaction_date = dateFilter;
  }

  const expenseResult = await prisma.transaction.aggregate({
    where: expenseWhere,
    _sum: { total_amount: true }
  });

  // Get total parties
  const totalParties = await prisma.party.count({
    where: {
      business_id: { in: businessIds }
    }
  });

  // Get total items
  const totalItems = await prisma.item.count({
    where: {
      business_id: { in: businessIds }
    }
  });

  // Get pending reminders
  const today = new Date();
  const pendingReminders = await prisma.reminder.count({
    where: {
      transaction: {
        business_id: { in: businessIds }
      },
      status: "PENDING",
      scheduled_date: { lte: today }
    }
  });

  // Get recent transactions
  const recentTransactions = await prisma.transaction.findMany({
    where: {
      business_id: { in: businessIds },
      context_type: "BUSINESS",
      ...getSoftDeleteFilter(include_deleted)
    },
    take: 5,
    orderBy: { created_at: "desc" },
    include: {
      party: {
        select: {
          name: true
        }
      }
    }
  });

  return {
    total_sales: parseDecimal(salesResult._sum.total_amount),
    total_purchase: parseDecimal(purchaseResult._sum.total_amount),
    total_expenses: parseDecimal(expenseResult._sum.total_amount),
    total_parties: totalParties,
    total_items: totalItems,
    pending_reminders: pendingReminders,
    recent_transactions: recentTransactions.map(t => ({
      transaction_id: t.transaction_id,
      transaction_number: t.transaction_number,
      transaction_type: t.transaction_type,
      total_amount: t.total_amount,
      transaction_date: formatDate(t.transaction_date),
      party_name: t.party?.name
    }))
  };
};

// ==================== COMBINED TRANSACTION HISTORY ====================

export const getCombinedTransactionHistory = async (user_id, query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const { start_date, end_date, include_deleted = "false" } = query;

  // Get personal transactions
  const personalWhere = {
    user_id,
    ...getSoftDeleteFilter(include_deleted)
  };

  if (start_date || end_date) {
    personalWhere.transaction_date = buildDateFilter(start_date, end_date);
  }

  const personalTransactions = await prisma.personalTransaction.findMany({
    where: personalWhere,
    select: {
      transaction_id: true,
      transaction_type: true,
      amount: true,
      transaction_date: true,
      name: true,
      remark: true
    }
  });

  // Get business transactions
  const userBusinesses = await prisma.business.findMany({
    where: { user_id },
    select: { business_id: true }
  });

  const businessIds = userBusinesses.map(b => b.business_id);

  const businessWhere = {
    business_id: { in: businessIds },
    context_type: "BUSINESS",
    ...getSoftDeleteFilter(include_deleted)
  };

  if (start_date || end_date) {
    businessWhere.transaction_date = buildDateFilter(start_date, end_date);
  }

  const businessTransactions = await prisma.transaction.findMany({
    where: businessWhere,
    select: {
      transaction_id: true,
      transaction_type: true,
      total_amount: true,
      transaction_date: true,
      title: true,
      party: {
        select: {
          name: true
        }
      }
    }
  });

  // Combine and format
  const combined = [
    ...personalTransactions.map(t => ({
      transaction_id: t.transaction_id,
      context_type: "PERSONAL",
      transaction_type: t.transaction_type,
      amount: t.amount,
      transaction_date: formatDate(t.transaction_date),
      party_name: t.name,
      description: t.remark || t.category
    })),
    ...businessTransactions.map(t => ({
      transaction_id: t.transaction_id,
      context_type: "BUSINESS",
      transaction_type: t.transaction_type,
      amount: t.total_amount,
      transaction_date: formatDate(t.transaction_date),
      party_name: t.party?.name || t.title,
      description: t.title
    }))
  ];

  // Sort by date descending
  combined.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));

  // Apply pagination
  const total = combined.length;
  const paginatedData = combined.slice(skip, skip + limit);

  return formatPaginationResponse(paginatedData, total, page, limit);
};