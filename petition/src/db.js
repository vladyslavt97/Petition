require('dotenv').config();
// const { USER, PWD } = process.env;
const { USER, PWD } = require("./../../secrets.json"); // .env did not read PWD from .end. Had to use .json.
const spicedPg = require('spiced-pg');
// console.log('u: ', USER);
// console.log('p: ', PWD);
const db = spicedPg(`postgres:${USER}:${PWD}@localhost:5432/petition`);
// const db = spicedPg(`postgres:vladyslavtsurkanenko:sql123@localhost:5432/petition`);

module.exports.selectAllDataFromSignaturesDB = () =>{
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
    
    //const insertDataToSql = db.query(`INSERT INTO signatures (firstname, lastname) VALUES ($1, $2) RETURNING *;`, ['Vladyslav', 'Tsurkanenko']);
    
};




