const express = require("express");
const app = express();
const helmet = require("helmet");
const { insertDataIntoUsersDB, 
    selectAllDataFromSignaturesDB, 
    insertDataIntoSignatureDB, 
    insertDataIntoUserProfilesDB, 
    selectJoinUsersAndUserProfilesDBs, 
    selectSignersFromSpecificCities, 
    selectJoinUsersAndSignaturesDBs, 
    deleteSignatureFromSignaturesDB, 
    selectJoinUsersAndUserProfilesDBsForEdit, 
    updatePasswordInUsersTable, 
    updateUserProfilesDBForEdit, 
    updateUsersDBForEdit, 
    deleteAllDataFromDB, 
    deleteFromUsersFromDB } = require('./db');
const { hashPass, compare} = require("./encrypt");
const PORT = 3000;

//countries experiment
// const countries = require("./countries.json");
// console.log(countries.length);
// get the user based on the req.session.signedIn
// get his country from DB

// console.log(countries);
// let matchingCountry = countries.find(el => {
//     return el.name === "Ukraine";//should match with req.session.signedIn country
// });
// console.log(matchingCountry);

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
    withSignedInCookie, 
    noSignedInWithSignatureCookie, 
    withSignedInWithSignatureCookie} = require("./middleware");




//                                                              GET
app.get('/', (req, res) => {
    res.redirect('/petition');
});

app.get("/petition", withSignedInCookie, noSignedInWithSignatureCookie, (req, res) => { //two simple buttons
    res.render("1petition", {
        layout: "main",
        cohortName,
        createdBy,
    });
});
app.get("/register", withSignedInCookie, noSignedInWithSignatureCookie, (req, res) => { //should have 4 validators
    res.render("2register", {
        layout: "main",
        cohortName,
        createdBy,
        showError:false
    });
});

app.get("/signin", withSignedInCookie, noSignedInWithSignatureCookie, (req, res) => { //2 validators
    res.render("3signin", {
        layout: "main",
        cohortName,
        createdBy,
        showError:false
    });
});
app.get("/user-profile", noSignedInCookie, noSignedInWithSignatureCookie, (req, res) => { //3 validators
    res.render("4userprofile", {
        layout: "main",
        cohortName,
        createdBy,
        showError:false
    });
});
app.get("/signature", noSignedInCookie, noSignedInWithSignatureCookie, (req, res) => {
    res.render("5signature", {
        layout: "main",
        cohortName,
        createdBy,
        showError:false
    });
});

let numberofItems;
let allDataRows;
let infoOfUser;
let final;
app.get("/thanks", noSignedInCookie, withSignedInWithSignatureCookie, (req, res) => {
    selectAllDataFromSignaturesDB()
        .then(allData => {
            numberofItems = allData.rows.length;
            infoOfUser = allData.rows.find(el => {
                return el.user_id === req.session.signedIn;
            });
            final = infoOfUser.signature;
            res.render("6thanks", {
                layout: "main",
                cohortName,
                final,
                numberofItems,
                createdBy
            });
            
        })
        .catch(err => {
            console.log('error appeared for query to get data from signatures table on the thanks get: ', err);
        });
});///works!!!

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
//
// :city is a placeholder and will be put in req.params object
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
//signout
app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/petition');
});
//register page from signin
app.get('/changemind', (req, res) => {
    req.session = null;
    res.redirect('/register');
});
//register page from signin
app.get('/deletion', (req, res) => {
    // req.session = null; 
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
            // console.log('deleted /redraw', req.session);
            req.session.signedWithSignature = null;
            // console.log('deleted cookie /redraw', req.session);
            res.redirect('/signature');
        })
        .catch((err) =>{
            console.log('why wrong?', err);
        });
});
//edit
let userIDEdit;
let theUserToEdit;
app.get("/edit", noSignedInCookie, withSignedInWithSignatureCookie, (req, res) => { //we need: first, last, pw, email, age, city, homepage
    userIDEdit = req.session.signedIn;
    selectJoinUsersAndUserProfilesDBsForEdit(userIDEdit)
        .then((data) => {
            let everything = data.rows;
            theUserToEdit = everything.find(el => {
                return el.user_id === req.session.signedIn;
            });
            // console.log('first: ', theUserToEdit.first);
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
//registration post
app.post('/register', (req, res) => {
    let firstNameValuesSaved = req.body.firstNameValues;
    let secondNameValuesSaved = req.body.secondNameValues;
    let emailValueSaved = req.body.emailValue;
    let passwordValueSavedd = req.body.passwordValue;
    //
    hashPass(passwordValueSavedd).then((hashedPassword) => {
        if(firstNameValuesSaved !== '' && secondNameValuesSaved !== '' && emailValueSaved !== '' && hashedPassword !== ''){
            insertDataIntoUsersDB(firstNameValuesSaved, secondNameValuesSaved, emailValueSaved, hashedPassword)
                .then((data)=>{
                    showError = false, 
                    req.session.signedIn = data.rows[0].id;
                    res.redirect('/user-profile');
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            res.render("2register", {
                layout: "main",
                cohortName,
                createdBy,
                showError: true
            });
        }
    });
});
//registration above
//signin post

let incorrectData = false;
let matchForUserIDs;
let matchForUserSignature;
app.post('/signin', (req, res) => {
    let emailValueSavedS = req.body.emailValueS;
    let passwordValueSavedS = req.body.passwordValueS;
    if(emailValueSavedS !== '' && passwordValueSavedS !== ''){
        selectJoinUsersAndSignaturesDBs()
            .then((allData) => {
                matchForUserIDs = allData.rows.find(el => {
                    return el.email === emailValueSavedS;
                });
                if (matchForUserIDs){
                    let pwdOfUSer = matchForUserIDs.password;
                    compare(passwordValueSavedS, pwdOfUSer)
                        .then((boolean)=>{
                            if(boolean === true){
                                req.session.signedIn = matchForUserIDs.id;
                                if(matchForUserIDs.signature){
                                    req.session.signedWithSignature = matchForUserIDs.id;
                                    res.redirect('/thanks');
                                }else{
                                    res.redirect('/signature');
                                }
                            }else{
                                res.render("3signin", {
                                    layout: "main",
                                    cohortName,
                                    createdBy,
                                    incorrectData: true
                                });
                            }
                        });
                }else {
                    res.render("3signin", {
                        layout: "main",
                        cohortName,
                        createdBy,
                        incorrectData: true
                    });
                }
            });
    } else {
        console.log('first time if else');
        res.render("3signin", {
            layout: "main",
            cohortName,
            createdBy,
            showError: true
        });
    }
});
//signin above
//user-profile
app.post('/user-profile', (req, res) => {
    let ageValueSaved = req.body.ageValue;
    let cityValueSaved = req.body.cityValue;
    let homepageValueSaved = req.body.homepageValue;
    // let countryValue = req.body.country;
    let userID = req.session.signedIn;
    insertDataIntoUserProfilesDB(ageValueSaved, cityValueSaved, homepageValueSaved, userID)
        .then((data)=>{
            req.session.userProfileID = data.rows[0].id;
            res.redirect('/signature');
        })
        .catch((err) => {
            console.log(err);
        });
});
//signature post
app.post('/signature', (req, res) => {
    let drawingCanvas = req.body.signature;
    let userID = req.session.signedIn;
    if(drawingCanvas){
        insertDataIntoSignatureDB(drawingCanvas, userID)
            .then((data)=>{
                // console.log('got here', data);
                showError = false,
                req.session.signedWithSignature = data.rows[0].id;
                res.redirect('/thanks');
            })//user ID not the signedIn property
            .catch((err) => {
                console.log(err);
            });
    } else {
        res.render("5signature", {
            layout: "main",
            cohortName,
            createdBy,
            showError: true
        });
    }

});
//signature above


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
            //userp_rofiles updates --- works in any case!!!
            let ageE = currentValueOfData.ageValue;
            let cityE = currentValueOfData.cityValue;
            let homeE = currentValueOfData.homepageValue;
            const updateTwo = userIDEdit;
            updateUserProfilesDBForEdit(ageE, cityE, homeE, updateTwo)
                .then(() => {
                    console.log('got updated in user_profiles');
                    // res.redirect('/thanks');
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
            // const findPwd = theUserToEdit.password;
            if (passwordValueEdit !== ''){ //what if password filed is empty???
                console.log('just a log');
                hashPass(passwordValueEdit)
                    .then((hPassword) => {
                        updatePasswordInUsersTable(hPassword, userIDEdit) // pwd vlaue has to change after we run comparison
                            .then(() => {
                                showError = false;
                                // res.redirect('/thanks');
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
    
    
