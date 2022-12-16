const express = require("express");
const app = express();
const helmet = require("helmet");
const { selectAllDataFromUsersDB, insertDataIntoUsersDB, selectAllDataFromSignaturesDB, insertDataIntoSignatureDB, selectAllDataFromUserProfilesDB, insertDataIntoUserProfilesDB, selectJoinUsersAndUserProfilesDBs, selectSignersFromSpecificCities, selectJoinUsersAndSignaturesDBs, deleteSignatureFromSignaturesDB } = require('./db');
const { hashPass, compare} = require("./encrypt");
const PORT = 3000;


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

//                                                              USE
app.get('/', (req, res) => {
    res.redirect('/petition');
});
app.use((req, res, next) => {
    // console.log('req.session use 1: ', req.session); //just (req.session:  Session { signed: 4 })
    if (req.url.startsWith("/petition") && req.session.signedIn) {
        res.redirect("/thanks");
    } else if (req.url.startsWith("/register") && req.session.signedIn) {
        res.redirect("/thanks");
    } else if (req.url.startsWith("/signin") && req.session.signedIn) {//signedWithSignature
        res.redirect("/thanks");
    // } else if (req.url.startsWith("/user-profile") && req.session.signedIn) {
    //     res.redirect("/thanks");
        // } else if (req.url.startsWith("/signature") && req.session.sigsignedInned) {
        //     res.redirect("/thanks");
    // } else if (req.url.startsWith("/signature") && !req.session.signedWithSignature) {
    //     res.redirect("/petition");
    } else if (req.url.startsWith("/signature") && !req.session.signedIn) {
        res.redirect("/register");
    } else if (req.url.startsWith("/thanks") && !req.session.signedIn) {
        res.redirect("/petition"); 
    } else if (req.url.startsWith("/signers") && !req.session.signedIn) {
        res.redirect("/petition");
    } else {
        next();    }
});

//need to save user_id property somewhere === userProfileID (for age, city homepage, if entered)
app.use((req, res, next) => {
    // console.log('req.session.userProfileID', req.session.userProfileID);
    if (req.url.startsWith("/user-profile") && req.session.userProfileID) {
        res.redirect("/thanks");
    } else {
        next();    }
});
// signedWithSignature or not
app.use((req, res, next) => {
    console.log('req.session: ', req.session);
    if (req.url.startsWith("/signature") && req.session.signedWithSignature) {
        res.redirect("/thanks");
    } else {
        next();    
    }
});
//                                                       middleware ends here                                            







//                                                              GET
app.get("/petition", (req, res) => { //two simple buttons
    res.render("1petition", {
        layout: "main",
        cohortName,
        createdBy,
    });
});
app.get("/register", (req, res) => { //should have 4 validators
    res.render("2register", {
        layout: "main",
        cohortName,
        createdBy,
        showError:false
    });
});

app.get("/signin", (req, res) => { //2 validators
    res.render("3signin", {
        layout: "main",
        cohortName,
        createdBy,
        showError:false
    });
});
app.get("/user-profile", (req, res) => { //3 validators
    res.render("4userprofile", {
        layout: "main",
        cohortName,
        createdBy,
        showError:false
    });
});
app.get("/signature", (req, res) => { // 1 validation
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
app.get("/thanks", (req, res) => { //works!!!
    selectAllDataFromSignaturesDB()
        .then(allData => {
            console.log();
            numberofItems = allData.rows.length;
            // console.log('allData.rows: ', allData.rows);
            infoOfUser = allData.rows.find(el => {//5
                return el.id === req.session.signedWithSignature;
            });
            // console.log('infoOfUser', infoOfUser);
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

app.get("/signers", (req, res) => {//first, last (users table);  //age city homepage (user_profiles table)
    selectJoinUsersAndUserProfilesDBs()//we get everything from here: first, last (users table);//age city homepage (user_profiles table)
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
app.get('/signers/:city', (req, res) => {
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
//redraw
let userID;
app.get('/redraw', (req, res) => {
    userID = req.session.signedIn;
    console.log('userID: ', userID);
    deleteSignatureFromSignaturesDB(userID)
        .then(() => {
            console.log('deleted /redraw', req.session);
            req.session.signedWithSignature = null;
            console.log('deleted cookie /redraw', req.session);
            res.redirect('/signature');
        })
        .catch((err) =>{
            console.log('why wrong?', err);
        });
});
//edit
app.get("/edit", (req, res) => { // 1 validation
    res.render("9edit", {
        layout: "main",
        cohortName,
        createdBy,
    });
});
//get routes are above




//                                          POST
//registration post
app.post('/register', (req, res) => {
    let firstNameValuesSaved = req.body.firstNameValues;
    let secondNameValuesSaved = req.body.secondNameValues;
    let emailValueSaved = req.body.emailValue;
    let passwordValueSavedd = req.body.passwordValue;
    //
    hashPass(passwordValueSavedd).then((hashedPassword) => {
        // compare(str, hashedPassword).then((boolean)=>{
        //     console.log(`match: ${boolean}`);
        // });
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
    //
    // save a new user || grab the user input and read it on the server
    // hash the password before saving to the Database
    // save cookies and redirect to Signature Page.
    //
    // INSERT in users table (in post /registration)
    // SELECT to get user info by email address (in post /login)
    // INSERT for signatures table needs to be changed to include the user_id (in post /petition)
    // SELECT from signature to find out if they've signedIn (post /login)
    //
    
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
                // console.log('allData.rows: ', allData.rows);
                matchForUserIDs = allData.rows.find(el => {
                    return el.email === emailValueSavedS;
                });
                console.log('matchForUserIDs', matchForUserIDs);
                // final = matchForUserIDs.email;
                if (matchForUserIDs){
                    let pwdOfUSer = matchForUserIDs.password;
                    // console.log('log before the compare', matchForUserIDs, '2: ', passwordValueSavedS);
                    compare(passwordValueSavedS, pwdOfUSer).then((boolean)=>{
                        console.log(`match: ${boolean}`);
                        if(boolean === true){
                            req.session.signedIn = matchForUserIDs.user_id;
                            console.log('qqqqqqqqq: ', allData);
                            // matchForUserSignature = allData.rows.find(el => {
                            //     console.log('element: ', el);
                            //     return el.signature === matchForUserIDs;
                            // });
                            // console.log('matchForUserSignature: ', matchForUserSignature);
                            if(matchForUserIDs.signature){//it exsist - redirect to thanks
                                req.session.signedWithSignature = matchForUserIDs.id;
                                res.redirect('/thanks');
                                console.log('cooooooookies: ', req.session);
                            }else{//redirect to signature
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
                    console.log('why is it wrong');
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
            showError: true //not all fields are filled
        });
    }
});
//signin above
//user-profile
app.post('/user-profile', (req, res) => { //nop need for a cookie, because it has to be eddited
    let ageValueSaved = req.body.ageValue;
    let cityValueSaved = req.body.cityValue;
    let homepageValueSaved = req.body.homepageValue;
    let userID = req.session.signedIn;
    insertDataIntoUserProfilesDB(ageValueSaved, cityValueSaved, homepageValueSaved, userID)
        .then((data)=>{
            console.log('ID of the user_profile inserted: ', data.rows[0].id);
            req.session.userProfileID = data.rows[0].id;
            res.redirect('/signature');
        })
        .catch((err) => {
            console.log(err);
        });
});
//signature post
app.post('/signature', (req, res) => { ///should have an update in DB because the signature already exists!!
    //how to check if an insert or update query should run!
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


app.listen(process.env.PORT || PORT, () => {
    console.log(`Petition: running server at ${PORT}...`);
});
