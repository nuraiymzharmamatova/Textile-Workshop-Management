-- Requirement 4: Two salary types (fixed + piecework)
ALTER TABLE employees ADD COLUMN salary_type VARCHAR(20) NOT NULL DEFAULT 'PIECEWORK';
ALTER TABLE employees ADD COLUMN fixed_salary NUMERIC(12, 2) DEFAULT 0;

-- Requirement 2: Production reports without mandatory employee
ALTER TABLE production_reports ALTER COLUMN employee_id DROP NOT NULL;
