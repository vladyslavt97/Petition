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
    return new Promise((resolve, reject) => {
        const allData = db.query(`SELECT * FROM users FULL OUTER JOIN user_profiles ON users.id = user_profiles.user_id ORDER BY users.created_at;`);
        resolve(allData);
        reject('Error: Could not fetch data from the API');
    });
    //  with FULL OUTER JOIN to get the data from users and user_profiles table
};
//join users and user_profiles
module.exports.selectJoinUsersAndSignaturesDBs = () => {
    return new Promise((resolve, reject) => {
        const allData = db.query(`SELECT * FROM users FULL OUTER JOIN signatures ON users.id = signatures.user_id;`);
        resolve(allData);
        reject('Error: Could not fetch data from the API');
    });
    //  with FULL OUTER JOIN to get the data from users and user_profiles table
};

module.exports.selectSignersFromSpecificCities = (cityFromSignersPage) => { //you will need a new function in your db.js where you want to get signers from a specific city
    return new Promise((resolve, reject) => {
        const allDataBasedOnCity = db.query(`SELECT * FROM users FULL OUTER JOIN user_profiles ON users.id = user_profiles.user_id WHERE city = $1;`, [cityFromSignersPage]); //+first last from user
        resolve(allDataBasedOnCity);
        reject('Error: Could not fetch data from the API'); //not cityValueSaved!!! but the value which we are clicking on next to the age
    });
};

// module.exports.selectSignersFromSpecificCities = (cityFromSignersPage) => { //you will need a new function in your db.js where you want to get signers from a specific city
//     return new Promise((resolve, reject) => {
//         const allDataBasedOnCity = db.query(`SELECT * FROM user_profiles WHERE city = $1;`, [cityFromSignersPage]); //+first last from user
//         resolve(allDataBasedOnCity);
//         reject('Error: Could not fetch data from the API'); //not cityValueSaved!!! but the value which we are clicking on next to the age
//     });
// };
