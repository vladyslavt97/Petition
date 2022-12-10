// require('dotenv').config();
// const { USER, PWD } = process.env; // add a .env file next to the db.js file with your PostgreSQL credentials
const spicedPg = require('spiced-pg');
// const db = spicedPg(`postgres:${USER}:${PWD}@localhost:5432/petition`);
const db = spicedPg(`postgres:vladyslavtsurkanenko:sql123@localhost:5432/petition`);

// query is a Promise
// create the following functions:
// Don't forget to export the functions with module.exports
module.exports.selectAllDataFromSignaturesDB = () =>{ //  - getAllSignatures - use db.query to get all signatures from table signatures
    return new Promise((resolve, reject) => {
        const allData = db.query(`SELECT * FROM signatures;`);
        resolve(allData);
        reject('Error: Could not fetch data from the API');
    });
};

module.exports.insertDataIntoSignatureDB = (firstNameValuesSaved, secondNameValuesSaved, drawingCanvas) => { //  - addSignature - use db.query to insert a signature to table signatures
    db.query(`INSERT INTO signatures (firstname, lastname, signature) VALUES ($1, $2, $3)`, [firstNameValuesSaved, secondNameValuesSaved, drawingCanvas])
        .then(data => {
            console.log('inserted data into table: ', data.rows);
        })
        .catch(err => {
            console.log('error appeared for query: ', err);
        });
    // return new Promise((resolve, reject) => {
    //     const insertDataToSql = db.query(`INSERT INTO signatures (firstname, lastname) VALUES ($1, $2) RETURNING *;`, ['Vladyslav', 'Tsurkanenko']);
    //     resolve(insertDataToSql);
    //     reject('Error: Could not fetch data from the API');
    // });
};




