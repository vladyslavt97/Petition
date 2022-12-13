require('dotenv').config();
const { USER_DB, PWD_DB } = process.env;
const spicedPg = require('spiced-pg');
const db = spicedPg(`postgres:${USER_DB}:${PWD_DB}@localhost:5432/petition`);

module.exports.selectAllDataFromUsersDB = () =>{
    return new Promise((resolve, reject) => {
        const allData = db.query(`SELECT * FROM users;`);
        resolve(allData);
        reject('Error: Could not fetch data from the API');
    });
};

module.exports.insertDataIntoUsersDB = (firstNameValuesSaved, secondNameValuesSaved, emailValueSaved, passwordValueSaved) => {
    return db.query(`INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING *;`, [firstNameValuesSaved, secondNameValuesSaved, emailValueSaved, passwordValueSaved]);
};

//signature

module.exports.selectAllDataFromSignaturesDB = () =>{
    return new Promise((resolve, reject) => {
        const allData = db.query(`SELECT * FROM signatures;`);
        resolve(allData);
        reject('Error: Could not fetch data from the API');
    });
};

module.exports.insertDataIntoSignatureDB = (drawingCanvas, userId) => {
    return db.query(`INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING id;`,[drawingCanvas, 1]);
};