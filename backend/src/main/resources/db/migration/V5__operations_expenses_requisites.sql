-- Sewing operations per product (e.g. "горловина - 2 сом", "рукав - 3 сом")
CREATE TABLE sewing_operations (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    cost NUMERIC(10, 2) NOT NULL CHECK (cost >= 0)
);

CREATE INDEX idx_sewing_operations_product ON sewing_operations(product_id);

-- Employee-operation assignment (which operations each employee performs)
CREATE TABLE employee_operations (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    operation_id BIGINT NOT NULL REFERENCES sewing_operations(id) ON DELETE CASCADE,
    UNIQUE(employee_id, operation_id)
);

-- Employee requisites (bank details, INN etc.)
ALTER TABLE employees ADD COLUMN requisites TEXT;

-- Expenses (electricity, rent, transport etc.)
CREATE TABLE expenses (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expenses_date ON expenses(expense_date);
