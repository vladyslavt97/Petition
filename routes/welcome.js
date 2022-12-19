const express = require("express");
const router = express.Router();

const {
    selectAllDataFromSignaturesDB, 
    selectJoinUsersAndUserProfilesDBs, 
    selectSignersFromSpecificCities, 
    selectJoinUsersAndUserProfilesDBsForEdit, 
    updatePasswordInUsersTable, 
    updateUserProfilesDBForEdit, 
    updateUsersDBForEdit, 
    withSignedInWithSignatureCookie } = require('../db');


const {noSignedInCookie} = require("../middleware");

const {hashPass} = require("../encrypt");


let showError = false;
const cohortName = "Mint";
const createdBy = 'Vladyslav Tsurkanenko';
let numberofItems;
let allDataRows;
let infoOfUser;
let final;

router.get("/thanks", noSignedInCookie, withSignedInWithSignatureCookie, (req, res) => {
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
            console.log('error', err);
        });
});


router.get("/signers", noSignedInCookie, withSignedInWithSignatureCookie, (req, res) => {
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
            console.log('error: ', err);
        });
});

let signerscitiesRows;
router.get('/signers/:city', noSignedInCookie, withSignedInWithSignatureCookie, (req, res) => {
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
            console.log('error routereared for query: ', err);
        });
});


//edit
let userIDEdit;
let theUserToEdit;
router.get("/edit", noSignedInCookie, withSignedInWithSignatureCookie, (req, res) => {
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

//                                                                  POST
//edit
router.post('/edit', (req, res) => {
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

module.exports = router;