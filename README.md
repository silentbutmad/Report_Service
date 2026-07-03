# Report Microservice

A standalone microservice for generating comprehensive reports for the Expense Management System.

## Features

- Personal Transaction Reports
- Business Transaction Reports
- Party Summary Reports
- Item Sales & Purchase Reports
- Inventory Reports
- GST Reports
- Financial Reports (Profit & Loss, Cash Flow, Monthly Trends)
- Dashboard Reports
- Combined Transaction History

## Technology Stack

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL (Neon Database)
- JWT Authentication
- Eureka Service Discovery

## Project Structure

```
report_service/
├── controller/
│   └── reportController.js
├── routes/
│   └── reportRoutes.js
├── services/
│   └── reportService.js
├── middleware/
│   └── authMiddleware.js
├── utils/
│   └── helpers.js
├── models/
│   └── db.js
├── prisma/
│   └── schema.prisma
├── config/
├── app.js
├── server.js
├── package.json
├── .env
└── .gitignore
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Generate Prisma client:
```bash
npx prisma generate
```

3. Configure environment variables in `.env`:
```env
DATABASE_URL=your_database_url
JWT_ACCESS_SECRET=your_jwt_secret
EUREKA_HOST=eurekadiscoveryserver.onrender.com
PORT=5001
```

## Running the Service

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The service will run on port 5001 (or the port specified in the `.env` file).

## API Endpoints

All endpoints require JWT authentication via Bearer token in the Authorization header.

### Personal Reports

- `GET /reports/personal/transactions` - Get personal transaction report with filters
- `GET /reports/personal/category` - Get expense by category report
- `GET /reports/personal/payment-mode` - Get payment mode report

### Business Reports

- `GET /reports/business/transactions` - Get business transaction report
- `GET /reports/business/sales` - Get sales report
- `GET /reports/business/purchases` - Get purchase report
- `GET /reports/business/expenses` - Get expense report

### Party Reports

- `GET /reports/party` - Get party summary report
- `GET /reports/top-customers` - Get top customers by sales
- `GET /reports/top-suppliers` - Get top suppliers by purchase

### Item Reports

- `GET /reports/items/sales` - Get item sales report
- `GET /reports/items/purchases` - Get item purchase report
- `GET /reports/inventory` - Get inventory report

### GST Reports

- `GET /reports/gst` - Get GST summary report
- `GET /reports/gst/details` - Get detailed GST report

### Financial Reports

- `GET /reports/profit-loss` - Get profit & loss report
- `GET /reports/cash-flow` - Get cash flow report
- `GET /reports/monthly` - Get monthly trend report

### Dashboard

- `GET /reports/dashboard` - Get dashboard summary report

### Combined History

- `GET /reports/history` - Get combined transaction history (personal + business)

## Common Query Parameters

Most endpoints support the following query parameters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `start_date` - Start date filter (YYYY-MM-DD)
- `end_date` - End date filter (YYYY-MM-DD)
- `business_id` - Filter by specific business
- `include_deleted` - Include soft-deleted records (default: false)
- `sort_by` - Sort field (default: created_at)
- `sort_order` - Sort order: asc or desc (default: desc)

## Response Format

All responses follow a consistent format:

```json
{
  "success": true,
  "message": "Report fetched successfully",
  "data": { ... }
}
```

For paginated responses:

```json
{
  "success": true,
  "message": "Report fetched successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5,
    "has_next_page": true,
    "has_previous_page": false
  }
}
```

## Authentication

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

The token is verified using the `JWT_ACCESS_SECRET` environment variable.

## Error Handling

The service returns appropriate HTTP status codes and error messages:

- `200` - Success
- `401` - Unauthorized (missing or invalid token)
- `404` - Not found
- `500` - Internal server error

## Service Discovery

The service registers with Eureka Server for service discovery. The Eureka configuration is in `eurukaregister.js`.

## Database

The service uses the same PostgreSQL database as other microservices. The Prisma schema is defined in `prisma/schema.prisma` and includes all necessary models:

- PersonalTransaction
- Transaction
- Business
- Party
- Item
- ExpenseCategory
- TransactionItem
- Reminder

## Performance Considerations

- Uses Prisma's `Promise.all()` for parallel queries where possible
- Implements efficient pagination with skip/take
- Uses database indexes for optimized queries
- Avoids N+1 query problems with proper includes
- Implements soft delete filtering

## Security

- JWT-based authentication
- User-level data isolation
- Business-level access control
- Input validation and sanitization
- SQL injection prevention via Prisma ORM

## Development

The service follows the same patterns as other microservices in the system:

- Thin controllers with business logic in services
- Reusable utility functions
- Consistent error handling
- Comprehensive logging
- Modular architecture

## License

ISC