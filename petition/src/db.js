require('dotenv').config();
const { USER_DB, PWD_DB } = process.env;
const spicedPg = require('spiced-pg');
const db = spicedPg(`postgres:${USER_DB}:${PWD_DB}@localhost:5432/petition`);

module.exports.selectAllDataFromSignaturesDB = () =>{
    return new Promise((resolve, reject) => {
        const allData = db.query(`SELECT * FROM signatures;`);
        resolve(allData);
        reject('Error: Could not fetch data from the API');
    });
};

module.exports.insertDataIntoSignatureDB = (firstNameValuesSaved, secondNameValuesSaved, drawingCanvas) => { //  - addSignature
    return db.query(`INSERT INTO signatures (firstname, lastname, signature) VALUES ($1, $2, $3) RETURNING *;`, [firstNameValuesSaved, secondNameValuesSaved, drawingCanvas]);
};




