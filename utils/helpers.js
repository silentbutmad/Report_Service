// Pagination helper
export const getPaginationParams = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

// Format pagination response
export const formatPaginationResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      total_pages: totalPages,
      has_next_page: page < totalPages,
      has_previous_page: page > 1,
    },
  };
};

// Build where clause for business filtering
export const buildBusinessWhereClause = (user_id, business_id = null) => {
  const where = {
    user_id,
  };

  if (business_id) {
    where.business_id = business_id;
  }

  return where;
};

// Build date range filter
export const buildDateFilter = (start_date, end_date) => {
  const dateFilter = {};
  
  if (start_date) {
    dateFilter.gte = new Date(start_date);
  }
  
  if (end_date) {
    dateFilter.lte = new Date(end_date);
  }
  
  return dateFilter;
};

// Format date to YYYY-MM-DD
export const formatDate = (date) => {
  if (!date) return null;
  return date.toISOString().split('T')[0];
};

// Format time to HH:mm
export const formatTime = (date) => {
  if (!date) return null;
  return date.toISOString().split('T')[1].substring(0, 5);
};

// Parse decimal values
export const parseDecimal = (value) => {
  return value ? parseFloat(value) : 0;
};

// Build search filter for multiple fields
export const buildSearchFilter = (search, fields) => {
  if (!search) return {};
  
  return {
    OR: fields.map(field => ({
      [field]: {
        contains: search,
        mode: 'insensitive'
      }
    }))
  };
};

// Soft delete filter
export const getSoftDeleteFilter = (include_deleted = "false") => {
  if (include_deleted === "true") {
    return {};
  }
  return {
    is_deleted: false
  };
};

// Sort options
export const getSortOrder = (sort_by = "created_at", sort_order = "desc") => {
  return {
    [sort_by]: sort_order.toLowerCase() === "asc" ? "asc" : "desc"
  };
};