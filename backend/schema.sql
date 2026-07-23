-- Inventory Management & Automated Reorder System
-- Database Schema for PostgreSQL

-- Drop tables if exists for fresh initialization
DROP TABLE IF EXISTS reorder_requests;
DROP TABLE IF EXISTS products;

-- 1. Products Table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    available_quantity INT NOT NULL DEFAULT 0 CHECK (available_quantity >= 0),
    low_stock_threshold INT NOT NULL DEFAULT 10 CHECK (low_stock_threshold >= 0),
    cost_price NUMERIC(10, 2) NOT NULL CHECK (cost_price >= 0),
    supplier_name VARCHAR(255) NOT NULL DEFAULT 'Global Supplies Co.',
    category VARCHAR(100) DEFAULT 'General',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Reorder Requests Table
-- Statuses: PENDING_APPROVAL, PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED
CREATE TABLE reorder_requests (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    quantity_ordered INT NOT NULL CHECK (quantity_ordered > 0),
    unit_cost NUMERIC(10, 2) NOT NULL,
    total_cost NUMERIC(10, 2) NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    reorder_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    is_high_value BOOLEAN DEFAULT FALSE,
    otp_code VARCHAR(10),
    otp_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient querying
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_reorders_status ON reorder_requests(reorder_status);
CREATE INDEX idx_reorders_product ON reorder_requests(product_id);

-- Initial Seed Data
INSERT INTO products (name, sku, available_quantity, low_stock_threshold, cost_price, supplier_name, category) VALUES
('Wireless Mechanical Keyboard', 'KB-PRO-01', 25, 10, 89.99, 'KeyTech Supplies', 'Electronics'),
('UltraWide Gaming Monitor 34"', 'MON-UW-34', 4, 8, 450.00, 'DisplayCorp International', 'Electronics'),
('Ergonomic Office Chair', 'CHR-ERG-99', 3, 5, 199.50, 'ComfortSeating Ltd.', 'Furniture'),
('USB-C Docking Station 10-in-1', 'DCK-HUB-10', 45, 15, 65.00, 'ConnectTech Inc.', 'Accessories'),
('Noise Cancelling Headphones', 'AUD-NC-700', 8, 12, 280.00, 'SoundWave Audio', 'Audio'),
('Smart Security Camera 4K', 'CAM-SEC-4K', 2, 6, 120.00, 'VisionGuard Security', 'Electronics');
