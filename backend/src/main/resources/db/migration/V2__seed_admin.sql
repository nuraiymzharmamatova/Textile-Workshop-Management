-- Default admin user (password: admin123)
-- BCrypt hash for 'admin123'
INSERT INTO users (username, password, full_name, phone, role, active)
VALUES ('admin', '$2b$10$gVCpVucx6AWMqRzW3YlGtOwmM6QgnfKnHf6tPalm/zstruzj1bqE6', 'System Administrator', '+996000000000', 'SUPER_ADMIN', true);
