DROP TABLE IF EXISTS signatures;

-- CREATE TABLE signatures (
--     id SERIAL primary key,
--     firstname VARCHAR(255) NOT NULL,
--     lastname VARCHAR(255) NOT NULL,
--     signature VARCHAR NOT NULL,
--     created_at TIMESTAMP DEFAULT current_timestamp
-- );

CREATE TABLE signatures(
           id SERIAL PRIMARY KEY,
           -- get rid of first and last!
           signature TEXT NOT NULL,
           user_id INTEGER NOT NULL REFERENCES users(id),
           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
       )