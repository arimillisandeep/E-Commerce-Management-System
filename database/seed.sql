-- Seed data: 1 admin + sample customers + sample products
-- Run: psql -U postgres -d ecommerce_db -f database/seed.sql
-- Admin email: admin@example.com / password: admin123
-- Customer:  customer@example.com / password: customer123

INSERT INTO users (name, email, password_hash, role) VALUES
('Admin User', 'admin@example.com',
 '$2a$10$jhB5h7/cfoSsp0fZqvbrnuouom4Hp0XoVsmg1LikXEV0bZXZz5pBO', 'admin'),
('John Customer', 'customer@example.com',
 '$2a$10$.46JA9sh6ak0Y6UEMw29w.70V3Vh7wfXGbYwE1xDz5Cqar8Ex7om2', 'customer');

INSERT INTO products (name, description, price, stock, category, image_url) VALUES
('Wireless Headphones', 'Noise-cancelling over-ear Bluetooth headphones', 199.99, 50, 'Electronics', 'https://picsum.photos/seed/headphones/400/300'),
('Smart Watch', 'Fitness tracker with heart-rate monitor', 149.50, 30, 'Electronics', 'https://picsum.photos/seed/watch/400/300'),
('Running Shoes', 'Lightweight breathable running shoes', 89.99, 100, 'Sports', 'https://picsum.photos/seed/shoes/400/300'),
('Backpack', 'Water-resistant 30L travel backpack', 59.99, 75, 'Accessories', 'https://picsum.photos/seed/backpack/400/300'),
('Coffee Maker', 'Programmable 12-cup coffee maker', 74.00, 20, 'Home', 'https://picsum.photos/seed/coffee/400/300'),
('Desk Lamp', 'LED adjustable desk lamp', 34.99, 60, 'Home', 'https://picsum.photos/seed/lamp/400/300'),
('Yoga Mat', 'Non-slip 6mm yoga mat', 24.99, 120, 'Sports', 'https://picsum.photos/seed/yoga/400/300'),
('Sunglasses', 'UV400 polarized sunglasses', 45.00, 80, 'Accessories', 'https://picsum.photos/seed/sunglasses/400/300'),
('Laptop Stand', 'Aluminum ergonomic laptop stand', 42.50, 40, 'Electronics', 'https://picsum.photos/seed/stand/400/300'),
('Water Bottle', 'Insulated stainless steel 750ml bottle', 19.99, 150, 'Sports', 'https://picsum.photos/seed/bottle/400/300');
