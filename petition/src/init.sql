CREATE TABLE signatures(
           id SERIAL PRIMARY KEY,
           signature TEXT NOT NULL,
           user_id INTEGER NOT NULL REFERENCES users(id),
           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    id SERIAL primary key,
    city VARCHAR(255) NOT NULL,
    age VARCHAR(255) NOT NULL,
    homepage VARCHAR(255) NOT NULL,
    user_id INT REFERENCES users,
    created_at TIMESTAMP DEFAULT current_timestamp
);