# Textile Workshop ERP

Web-based ERP system for managing textile and garment workshop operations. Replaces manual record-keeping (paper, Excel, verbal communication) with a centralized digital platform.

**Live:** https://textile-workshop-erp.com

---

## What is this project?

Small and medium textile workshops face daily challenges:
- Tracking orders across multiple clients and deadlines
- Monitoring fabric and accessory inventory
- Recording daily production output (sewn, packed, defective items)
- Calculating piecework employee salaries
- Understanding profitability and business performance

**Textile Workshop ERP** solves all of these in one application. It is specifically designed for garment production — not a generic business tool, but a system that understands fabrics, sewing operations, technical cards (Bill of Materials), and piecework pay.

### Core Modules

| Module | What it does |
|--------|-------------|
| **Orders** | Create, track, and manage client orders with status flow (New → Cutting → Sewing → Packaging → Shipped → Completed) |
| **Clients** | Client database with contact info and order history |
| **Inventory** | Track fabrics, accessories, and supplies with low-stock alerts and purchase recording |
| **Technical Cards** | Define materials required per product unit — inventory auto-deducts when production is recorded |
| **Production** | Daily reports: who sewed how many items, packaging count, defect tracking |
| **Employees & Salary** | Piecework salary calculation: `(items sewn - defective) × rate per item` |
| **Dashboard** | Revenue, active orders, production stats, low-stock alerts at a glance |
| **Reports** | Charts for revenue, production trends, order status distribution |

### Key Automations

- **Auto price calculation:** Order total = product price × quantity
- **Auto material deduction:** When a production report is created, materials are deducted from inventory based on the product's technical card
- **Insufficient stock protection:** System blocks production if materials are not available
- **Piecework salary:** Automatically calculated from production reports for any date range

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Tailwind CSS, Recharts, i18next (EN/RU/KG) |
| Backend | Java 17, Spring Boot 3.4, Spring Security, Hibernate (JPA) |
| Database | PostgreSQL 16 |
| File Storage | MinIO (S3-compatible) |
| Auth | JWT (JSON Web Tokens) |
| Deployment | Docker, Docker Compose, Nginx, Let's Encrypt SSL |

---

## How to work with the system

### Login

Open https://textile-workshop-erp.com and log in:
- **Username:** `admin`
- **Password:** `admin123`

The system supports three languages: Russian (default), English, and Kyrgyz. Switch using the **RU / EN / KG** buttons in the top header.

---

### Dashboard

The first page after login. Shows:
- **Monthly revenue** — total from completed orders
- **Total orders** — all orders in the system
- **Active orders** — orders currently in production
- **Low stock alerts** — materials below minimum threshold
- **Production chart** — weekly sewing/packing output
- **Recent orders table** — last 4 orders with status

---

### Orders

**View all orders** with search and status filter.

**Create an order:**
1. Click **"Новый заказ"** (New Order)
2. Select a client from the dropdown
3. Select a product (model) — price is shown
4. Enter quantity and deadline
5. Add notes if needed
6. Click **"Сохранить заказ"** (Save Order)

The system automatically calculates `total price = product price × quantity`.

**Change order status:** Use the dropdown in the Status column to move the order through stages:
`NEW → IN_PROGRESS → CUTTING → SEWING → PACKAGING → SHIPPED → COMPLETED`

**Edit/Delete:** Use the pencil/trash icons in the Actions column.

---

### Clients

Client cards showing name, phone, address, and number of orders.

**Add a client:**
1. Click **"Новый клиент"**
2. Fill in name, phone (format: +996...), address, notes
3. Click **"Сохранить"**

**Search:** Type in the search bar to filter by name or phone.

---

### Inventory (Склад)

**Overview cards** show total materials, critical stock count, and total inventory value.

**Materials table** lists all fabrics, accessories, and supplies with:
- Current quantity and unit (meters, kg, pieces, etc.)
- Minimum threshold — items below this are highlighted red with a warning icon
- Price per unit and supplier

**Add a material:**
1. Click **"Новый материал"**
2. Fill in name, unit, quantity, minimum level, price, supplier
3. Click **"Сохранить"**

**Record a purchase:**
1. Click **"Добавить закупку"**
2. Select the material, enter quantity purchased, total cost, and date
3. Click **"Сохранить"**

The material's stock quantity increases automatically.

---

### Production

This is where daily work is recorded.

**Left panel — Create a report:**
1. Select the **order** being worked on
2. Select the **employee** who did the work
3. Set the **date**
4. Enter counts: **Sewn / Packed / Defective**
5. Click **"Сохранить отчёт"**

**What happens automatically:**
- Materials are deducted from inventory based on the product's technical card
- If there isn't enough material, the system shows an error and blocks the report
- The data feeds into salary calculations and dashboard stats

**Right panel** shows:
- Total reports and active employees
- List of all production reports with employee name, product, quantities

---

### Employees & Salary

**Left column — Employee list:**
- Each card shows name, position, rate per item, and active status
- Click the edit icon to modify employee details
- Click **"Добавить сотрудника"** to add new staff

**Right column — Salary calculation:**
1. Select the **month** using the date picker
2. The table shows each employee's: items sewn, defects, rate, and calculated salary
3. **Formula:** `salary = (sewn - defective) × rate per item`
4. Bottom shows **total payroll** and **total defects**

---

### Reports

Visual analytics with charts:
- **Revenue & expenses** bar chart
- **Production trend** line chart (sewn items and defects over time)
- **Order status** pie chart
- **Top products** ranked by revenue

Export buttons for PDF and Excel (available for future implementation).

---

## Local Development

### Prerequisites
- Java 17+
- Node.js 18+
- Docker & Docker Compose

### Run locally

```bash
# 1. Start database and file storage
docker-compose up -d postgres minio

# 2. Start backend
cd backend
mvn spring-boot:run

# 3. Start frontend
cd frontend
npm install
npm start
```

Frontend opens at `http://localhost:3002`, backend API at `http://localhost:8082`.

### Environment variables

Backend reads from environment or defaults in `application.yml`:

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | localhost | PostgreSQL host |
| `DB_PORT` | 5436 | PostgreSQL port |
| `DB_NAME` | workshop_erp | Database name |
| `DB_USERNAME` | postgres | Database user |
| `DB_PASSWORD` | postgres | Database password |
| `JWT_SECRET` | (built-in) | Secret key for JWT signing |
| `SERVER_PORT` | 8082 | Backend server port |
| `MINIO_ENDPOINT` | http://localhost:9000 | MinIO endpoint |
| `MINIO_ACCESS_KEY` | minioadmin | MinIO access key |
| `MINIO_SECRET_KEY` | minioadmin | MinIO secret key |

---

## Production Deployment

The project is deployed on a VPS with Docker Compose.

```bash
# On the server
cd /opt/textile-workshop-erp
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

**Architecture:**
```
Client → Nginx (SSL termination, port 80/443)
           ├── /api/* → Backend (Spring Boot, port 8080)
           └── /*     → Frontend (React build served by nginx)
           
Backend → PostgreSQL (data)
        → MinIO (file storage)
```

SSL certificates are managed by Certbot with automatic renewal.

---

## API Reference

All endpoints require JWT authentication except `/api/auth/login`.

Include the token in the header: `Authorization: Bearer <token>`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login, returns JWT token |
| GET | `/api/dashboard` | Dashboard statistics |
| GET/POST | `/api/clients` | List / Create clients |
| GET/PUT/DELETE | `/api/clients/{id}` | Get / Update / Delete client |
| GET/POST | `/api/orders` | List / Create orders |
| GET/PUT/DELETE | `/api/orders/{id}` | Get / Update / Delete order |
| PATCH | `/api/orders/{id}/status` | Change order status |
| GET/POST | `/api/products` | List / Create products |
| GET/PUT/DELETE | `/api/products/{id}` | Get / Update / Delete product |
| GET/POST | `/api/materials` | List / Create materials |
| GET/PUT/DELETE | `/api/materials/{id}` | Get / Update / Delete material |
| GET | `/api/materials/low-stock` | Materials below minimum level |
| POST | `/api/materials/purchases` | Record a material purchase |
| GET/POST | `/api/employees` | List / Create employees |
| GET/PUT/DELETE | `/api/employees/{id}` | Get / Update / Delete employee |
| GET | `/api/employees/salary?month=YYYY-MM` | Calculate salaries for period |
| GET/POST | `/api/production` | List / Create production reports |
| GET | `/api/production/date/{date}` | Reports by date |
| GET | `/api/production/employee/{id}` | Reports by employee |
| GET | `/api/production/order/{id}` | Reports by order |
| POST | `/api/files/upload` | Upload file to MinIO |

---

## Project Structure

```
├── backend/
│   ├── src/main/java/kg/workshop/erp/
│   │   ├── config/          # Security, MinIO configuration
│   │   ├── controller/      # REST API controllers (9)
│   │   ├── dto/             # Request/Response DTOs
│   │   ├── entity/          # JPA entities (9 tables)
│   │   ├── enums/           # OrderStatus, Role, Unit
│   │   ├── exception/       # Global error handling
│   │   ├── repository/      # Spring Data JPA repositories
│   │   ├── security/        # JWT filter, token provider
│   │   └── service/         # Business logic (8 services)
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/    # Flyway SQL migrations
├── frontend/
│   └── src/
│       ├── api/             # Axios instance and API services
│       ├── components/
│       │   ├── common/      # Avatar, Modal, Pagination, StatusBadge...
│       │   ├── layout/      # Sidebar + Header layout
│       │   └── pages/       # 7 page components
│       ├── context/         # Auth context (JWT storage)
│       ├── hooks/           # useApi hook
│       └── locales/         # i18n translations (EN/RU/KG)
├── nginx/                   # Nginx config with SSL
├── docker-compose.yml       # Local development
├── docker-compose.prod.yml  # Production deployment
└── docs/                    # Diploma documentation and Figma screens
```

---

## License

This project was developed as a diploma thesis: *"Development of a Web-Based ERP System for Textile Workshop Management"*.
