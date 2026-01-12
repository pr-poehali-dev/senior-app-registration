-- Добавление полей для PIN-кода SOS и адреса дома
ALTER TABLE users ADD COLUMN IF NOT EXISTS sos_pin_code VARCHAR(6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS street VARCHAR(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS house VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS entrance VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS apartment VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS utility_account VARCHAR(50);

-- Создание таблицы лекарств
CREATE TABLE IF NOT EXISTS medications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    time_schedule TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы приёма лекарств
CREATE TABLE IF NOT EXISTS medication_logs (
    id SERIAL PRIMARY KEY,
    medication_id INTEGER REFERENCES medications(id),
    user_id INTEGER REFERENCES users(id),
    taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    skipped BOOLEAN DEFAULT FALSE
);

-- Создание таблицы заметок и дел
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(200),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы платежей ЖКХ
CREATE TABLE IF NOT EXISTS utility_payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    qr_code TEXT,
    status VARCHAR(50) DEFAULT 'pending'
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_user_id ON medication_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_utility_payments_user_id ON utility_payments(user_id);
