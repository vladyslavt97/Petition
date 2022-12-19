const express = require("express");
const app = express();
const helmet = require("helmet");
const { selectAllDataFromUsersDB, selectAllDataFromSignaturesDB, 
    selectJoinUsersAndUserProfilesDBs,
    selectAllDataFromUserProfilesDB, 
    selectSignersFromSpecificCities, 
    deleteSignatureFromSignaturesDB, 
    selectJoinUsersAndUserProfilesDBsForEdit, 
    updatePasswordInUsersTable, 
    updateUserProfilesDBForEdit, 
    updateUsersDBForEdit, 
    deleteAllDataFromDB, 
    deleteFromUsersFromDB } = require('./db');
const { hashPass} = require("./encrypt");
const PORT = 3000;

const countries = require("./countries.json");

// Handlebars Setup
const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
// End of setup


let showError = false;
app.use(express.static("./public"));
const urlEncodedMiddleware = express.urlencoded({ extended: false });
app.use(urlEncodedMiddleware);
app.use(helmet());
const cohortName = "Mint";
const createdBy = 'Vladyslav Tsurkanenko';

const cookieSession = require("cookie-session");

const {SESSION_SECRET} = process.env;
app.use(
    cookieSession({
        secret: process.env.SESSION_SECRET,
        maxAge: 1000*60*60*24*14
    })
);
const {noSignedInCookie,
    withSignedInWithSignatureCookie} = require("./middleware");




const newuserRoutes = require('./routes/newuser');



//                                                              GET
app.get('/', (req, res) => {
    res.redirect('/petition');
});

app.use("/", newuserRoutes);

let numberofItems;
let allDataRows;
let infoOfUser;
let final;
// countries experiment
// console.log(countries.length);
// get the user based on the req.session.signedIn
// get his country from DB

// console.log(countries);

// console.log(matchingCountry);
app.get("/thanks", noSignedInCookie, withSignedInWithSignatureCookie, (req, res) => {
    let flag;
    let hisName;
    selectAllDataFromUserProfilesDB()
        .then((data) => {
            let matchingCountry = countries.find(el => {
                return el.code === data.rows[0].country;
            });
            flag = matchingCountry.emoji;
            return selectAllDataFromUsersDB();
        })
        .then(data => {
            let matchingRow = data.rows.find(el => {
                return el.id === req.session.signedIn;
            });
            hisName = matchingRow.first;
            return selectAllDataFromSignaturesDB();
        })
        .then(allData => {
            numberofItems = allData.rows.length;
            infoOfUser = allData.rows.find(el => {
                return el.user_id === req.session.signedIn;
            });
            final = infoOfUser.signature;
            res.render("6thanks", {
                layout: "main",
                cohortName,
                countries,
                flag,
                hisName,
                final,
                numberofItems,
                createdBy
            });
            
        })
        .catch(err => {
            console.log('error appeared for query to get data from signatures table on the thanks get: ', err);
        });
});

app.get("/signers", noSignedInCookie, withSignedInWithSignatureCookie, (req, res) => {
    selectJoinUsersAndUserProfilesDBs()
        .then(allData => {
            allDataRows = allData.rows;
            res.render("7signers", {
                layout: "main",
                numberofItems,
                cohortName,
                createdBy,
                allDataRows
            });
        })
        .catch(err => {
            console.log('error appeared for query: ', err);
        });
});


let signerscitiesRows;
app.get('/signers/:city', noSignedInCookie, withSignedInWithSignatureCookie, (req, res) => {
    const cityFromSignersPage = req.params.city;
    selectSignersFromSpecificCities(cityFromSignersPage)
        .then(allDataBasedOnCity => {
            signerscitiesRows = allDataBasedOnCity.rows;
            res.render("8signerscities", {
                layout: "main",
                numberofItems,
                cohortName,
                createdBy,
                signerscitiesRows,
                cityFromSignersPage
            });
        })
        .catch(err => {
            console.log('error appeared for query: ', err);
        });
});

app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/petition');
});

app.get('/changemind', (req, res) => {
    req.session = null;
    res.redirect('/register');
});

app.get('/deletion', (req, res) => {
    userID = req.session.signedIn;
    deleteAllDataFromDB(userID)
        .then(() => {
            return deleteSignatureFromSignaturesDB(userID);
        })
        .then(() => {
            return deleteFromUsersFromDB(userID);
        })
        .then(() => {
            req.session = null;
            res.redirect('/petition');
        })
        .catch((err) =>{
            console.log('why wrong?', err);
        });
});
//redraw
let userID;
app.get('/redraw', (req, res) => {
    userID = req.session.signedIn;
    deleteSignatureFromSignaturesDB(userID)
        .then(() => {
            req.session.signedWithSignature = null;
            res.redirect('/signature');
        })
        .catch((err) =>{
            console.log('why wrong?', err);
        });
});
//edit
let userIDEdit;
let theUserToEdit;
app.get("/edit", noSignedInCookie, withSignedInWithSignatureCookie, (req, res) => {
    userIDEdit = req.session.signedIn;
    selectJoinUsersAndUserProfilesDBsForEdit(userIDEdit)
        .then((data) => {
            let everything = data.rows;
            theUserToEdit = everything.find(el => {
                return el.user_id === req.session.signedIn;
            });
            let fn = theUserToEdit.first;
            let ln = theUserToEdit.last;
            let em = theUserToEdit.email;
            let ag = theUserToEdit.age;
            let hp = theUserToEdit.homepage;
            let ct = theUserToEdit.city;
            res.render("9edit", {
                layout: "main",
                cohortName,
                createdBy,
                fn, ln, em, ag, hp, ct
            });
        })
        .catch(err => {
            console.log('<error>:', err);
        });
});
//get routes are above

//                                                              POST


//edit
app.post('/edit', (req, res) => {
    const currentValueOfData = req.body;
    userIDEdit = req.session.signedIn;
    selectJoinUsersAndUserProfilesDBsForEdit(userIDEdit)
        .then((data) => {
            let everything = data.rows;
            theUserToEdit = everything.find(el => {
                return el.user_id === req.session.signedIn;
            });
            //
            let ageE = currentValueOfData.ageValue;
            let cityE = currentValueOfData.cityValue;
            let homeE = currentValueOfData.homepageValue;
            const updateTwo = userIDEdit;
            updateUserProfilesDBForEdit(ageE, cityE, homeE, updateTwo)
                .then(() => {
                })
                .catch((err) => {
                    console.log('wierd error... while updating profiles', err);
                });
            const passwordValueEdit = currentValueOfData.passwordValue;
            let fn = theUserToEdit.first;
            let ln = theUserToEdit.last;
            let em = theUserToEdit.email;
            let ag = theUserToEdit.age;
            let hp = theUserToEdit.homepage;
            let ct = theUserToEdit.city;
            if (passwordValueEdit !== ''){
                hashPass(passwordValueEdit)
                    .then((hPassword) => {
                        updatePasswordInUsersTable(hPassword, userIDEdit)
                            .then(() => {
                                showError = false;
                            })
                            .catch((err) => {
                                console.log('wierd...', err);
                            });
                    })
                    .catch((err) => {
                        console.log('ERROR!!!.', err);
                    });
            } else {
                res.render("9edit", {
                    layout: "main",
                    cohortName,
                    createdBy,
                    showError: true,
                    fn, ln, em, ag, hp, ct
                });
            }      

            //users table chagnes
            let nameE = currentValueOfData.firstNameValues;
            let secondE = currentValueOfData.secondNameValues;
            let emailE = currentValueOfData.emailValue;
            if (nameE !== '' && secondE !== '' && emailE !== '' && passwordValueEdit !== ''){
                updateUsersDBForEdit(nameE, secondE, emailE, userIDEdit)
                    .then(() => {
                        showError = false;
                        res.redirect('/thanks');
                    })
                    .catch((err) => {
                        console.log('error for updating users table... weird', err);
                    });
            } else {
                res.render("9edit", {
                    layout: "main",
                    cohortName,
                    createdBy,
                    showError: true,
                    fn, ln, em, ag, hp, ct
                });
            }
            
        })
        .catch((err) => {
            console.log('to tables togehter SELECT: ', err);
        });
});
app.listen(process.env.PORT || PORT, () => {
    console.log(`Petition: running server at ${PORT}...`);
});