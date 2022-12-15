require('dotenv').config();
const {DATABASE_URL} = process.env;
const spicedPg = require('spiced-pg');
const db = spicedPg(DATABASE_URL);

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

module.exports.insertDataIntoSignatureDB = (drawingCanvas, userID) => {
    return db.query(`INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING id;`,[drawingCanvas, userID]);
};
//users-profile

module.exports.selectAllDataFromUserProfilesDB = () =>{
    return new Promise((resolve, reject) => {
        const allData = db.query(`SELECT * FROM user_profiles;`);
        resolve(allData);
        reject('Error: Could not fetch data from the API');
    });
};

module.exports.insertDataIntoUserProfilesDB = (ageValueSaved, cityValueSaved, homepageValueSaved, userID) => {
    return db.query(`INSERT INTO user_profiles (city, age, homepage, user_id) VALUES ($1, $2, $3, $4) RETURNING id;`,[cityValueSaved, ageValueSaved, homepageValueSaved, userID]);
};
//join
module.exports.selectJoinUsersAndUserProfilesDBs = () => {
    return new Promise((resolve, reject) => {
        const allData = db.query(`SELECT * FROM users FULL OUTER JOIN user_profiles ON users.id = user_profiles.user_id;`);
        resolve(allData);
        reject('Error: Could not fetch data from the API');
    });
    //  with FULL OUTER JOIN to get the data from users and user_profiles table
};

module.exports.selectSignersFromSpecificCities = (cityNextToAge) => { //you will need a new function in your db.js where you want to get signers from a specific city
    return db.query(`SELECT * FROM user_profiles WHERE city = $1;`, [cityNextToAge]); //not cityValueSaved!!! but the value which we are clicking on next to the age
};
