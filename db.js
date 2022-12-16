require('dotenv').config();
const {DATABASE_URL} = process.env;
const spicedPg = require('spiced-pg');
const db = spicedPg(DATABASE_URL);

module.exports.selectAllDataFromUsersDB = () =>{
    return db.query(`SELECT * FROM users;`);
};

module.exports.insertDataIntoUsersDB = (firstNameValuesSaved, secondNameValuesSaved, emailValueSaved, passwordValueSaved) => {
    return db.query(`INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING *;`, [firstNameValuesSaved, secondNameValuesSaved, emailValueSaved, passwordValueSaved]);
};

//signature

module.exports.selectAllDataFromSignaturesDB = () =>{
    return db.query(`SELECT * FROM signatures;`);
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
    return db.query(`SELECT * FROM users 
                    INNER JOIN signatures
                 ON users.id = signatures.user_id 
                    FULL OUTER JOIN user_profiles 
                    ON users.id = user_profiles.user_id 
                    ORDER BY users.created_at;`);
};

//join users and user_profiles
module.exports.selectJoinUsersAndSignaturesDBs = () => {
    return db.query(`SELECT users.password, users.id, users.email, signatures.signature FROM users FULL OUTER JOIN signatures ON users.id = signatures.user_id;`);
};//stop

//signers from a specific city
module.exports.selectSignersFromSpecificCities = (cityFromSignersPage) => { 
    return db.query(`SELECT * FROM users FULL OUTER JOIN user_profiles ON users.id = user_profiles.user_id WHERE city = $1;`, [cityFromSignersPage]);
};

module.exports.deleteSignatureFromSignaturesDB = (userID) => { 
    return db.query(`DELETE FROM signatures WHERE user_id = $1;`, [userID]);
};



//edit GET  //we need: first, last, pw, email, age, city, homepage
module.exports.selectJoinUsersAndUserProfilesDBsForEdit = (userIDEdit) => { //user_profiles = user_id; //users = id
    return db.query(`SELECT * FROM users 
                    FULL OUTER JOIN user_profiles 
                    ON users.id = user_profiles.user_id WHERE user_id = $1;`, [userIDEdit]);//pwd user id , signature email
};//edit