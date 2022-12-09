require('dotenv').config();
const { SQL_USER, SQL_PASSWORD } = process.env; // add a .env file next to the db.js file with your PostgreSQL credentials
const spicedPg = require('spiced-pg');
const db = spicedPg(`postgres:${SQL_USER}:${SQL_PASSWORD}@localhost:5432/petition`);

// create the following functions:
//  - getAllSignatures - use db.query to get all signatures from table signatures
//  - addSignature - use db.query to insert a signature to table signatures
// Don't forget to export the functions with module.exports