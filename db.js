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
//join users and user_profiles 
module.exports.selectJoinUsersAndUserProfilesDBs = () => {
    return db.query(`SELECT * FROM users FULL OUTER JOIN user_profiles ON users.id = user_profiles.user_id ORDER BY users.created_at;`);
    //module.exports.getAllSigned = () => {
//     return db.query(`
//         SELECT * FROM users
//         INNER JOIN signatures
//         ON users.id = signatures.user_id
//         FULL JOIN users_profiles
//         ON users.id = users_profiles.user_id;`);
//     };
    //  with FULL OUTER JOIN to get the data from users and user_profiles table
};
//join users and user_profiles (for pw and email check?)
module.exports.selectJoinUsersAndSignaturesDBs = () => {
    return new Promise((resolve, reject) => {
        const allData = db.query(`SELECT * FROM users FULL OUTER JOIN signatures ON users.id = signatures.user_id;`);//pwd user id , signature email
        resolve(allData);
        reject('Error: Could not fetch data from the API');
    });

    //SELECT users.password, users.id, users.email, signatures.id FROM users FULL OUTER JOIN signatures ON users.id = signatures.user_id;
};//stop

module.exports.selectSignersFromSpecificCities = (cityFromSignersPage) => { //you will need a new function in your db.js where you want to get signers from a specific city
    return new Promise((resolve, reject) => {
        const allDataBasedOnCity = db.query(`SELECT * FROM users FULL OUTER JOIN user_profiles ON users.id = user_profiles.user_id WHERE city = $1;`, [cityFromSignersPage]);
        resolve(allDataBasedOnCity);
        reject('Error: Could not fetch data from the API');
    });
};

module.exports.deleteSignatureFromSignaturesDB = (userID) => { 
    return db.query(`DELETE FROM signatures WHERE user_id = $1;`, [userID]); //where user_id of signatures === id in users
};


//the signature should be deleted only if the user entered a new one (subsitute)
// 1. if ( something exists in the signature table for this ID)
// ---- delete and insert an new signature

//2. else if (nothing is in the signature table)
//otehrwise a user might end up without a signature in the DB
//I will cause an error when loggin in.