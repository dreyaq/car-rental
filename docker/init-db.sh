#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS cars (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        owner_id UUID NOT NULL REFERENCES users(id),
        make VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        year INT NOT NULL,
        category VARCHAR(50) NOT NULL,
        transmission VARCHAR(50) NOT NULL,
        fuel_type VARCHAR(50) NOT NULL,
        seats INT NOT NULL,
        doors INT NOT NULL,
        location VARCHAR(255) NOT NULL,
        price_per_day DECIMAL(10, 2) NOT NULL,
        description TEXT,
        availability VARCHAR(20) DEFAULT 'available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS car_images (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
        image_path VARCHAR(255) NOT NULL,
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS car_features (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS car_to_features (
        car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
        feature_id UUID NOT NULL REFERENCES car_features(id) ON DELETE CASCADE,
        PRIMARY KEY (car_id, feature_id)
    );
    CREATE TABLE IF NOT EXISTS rentals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        car_id UUID NOT NULL REFERENCES cars(id),
        renter_id UUID NOT NULL REFERENCES users(id),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        payment_status VARCHAR(20) DEFAULT 'unpaid',
        payment_method VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        type VARCHAR(50) NOT NULL,
        reference_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Создание таблицы уведомлений
    CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        type VARCHAR(50) NOT NULL,
        reference_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Создание таблицы платежей
    CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        rental_id UUID NOT NULL REFERENCES rentals(id),
        amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_date TIMESTAMP,
        transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Вставка демонстрационных данных для опций автомобилей
    INSERT INTO car_features (name) VALUES
        ('GPS Navigation'),
        ('Bluetooth'),
        ('Backup Camera'),
        ('Sunroof'),
        ('Heated Seats'),
        ('Leather Seats'),
        ('Automatic Climate Control'),
        ('Cruise Control'),
        ('Apple CarPlay'),
        ('Android Auto'),
        ('Keyless Entry'),
        ('USB Charging')
    ON CONFLICT (name) DO NOTHING;
    
    -- Вставка примера пользователя-владельца
    INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
    VALUES (
        'owner@example.com',
        -- password: password123
        '$2a$10$CBVj9Lx6mKSKsV9xyLPsIujf5Qz93tCkj9r/1nYS1YhNQVrH2UwX.',
        'John',
        'Owner',
        '+1234567890',
        'owner'
    )
    ON CONFLICT (email) DO NOTHING;
    
    -- Вставка примера пользователя-арендатора
    INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
    VALUES (
        'user@example.com',
        -- password: password123
        '$2a$10$CBVj9Lx6mKSKsV9xyLPsIujf5Qz93tCkj9r/1nYS1YhNQVrH2UwX.',
        'Alice',
        'User',
        '+0987654321',
        'user'
    )
    ON CONFLICT (email) DO NOTHING;
EOSQL

echo "База данных инициализирована с демонстрационными данными"
