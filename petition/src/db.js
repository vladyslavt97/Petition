// require('dotenv').config();
// const { USER, PWD } = process.env; // add a .env file next to the db.js file with your PostgreSQL credentials
const spicedPg = require('spiced-pg');
// const db = spicedPg(`postgres:${USER}:${PWD}@localhost:5432/petition`);
const db = spicedPg(`postgres:vladyslavtsurkanenko:sql123@localhost:5432/petition`);

// query is a Promise
// create the following functions:

module.exports.selectAllDataFromSignaturesDB = () =>{ //  - getAllSignatures - use db.query to get all signatures from table signatures
    db.query(`SELECT * FROM signatures;`)
        .then(data => {
            console.log('db.js', data.rows); // in rows property is the actual data
        })
        .catch(err => {
            console.log('error appeared for query: ', err);
        });
};

module.exports.insertDataIntoSignatureDB = () => { //  - addSignature - use db.query to insert a signature to table signatures
    db.query(`INSERT INTO signatures (firstname, lastname) VALUES ($1, $2) RETURNING *;`, ['Vladyslav', 'Tsurkanenko'])
        .then(data => {
            console.log('inserted data into table: ', data.rows);
        });
};

// Don't forget to export the functions with module.exports


