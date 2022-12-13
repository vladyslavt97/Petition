const express = require("express");
const app = express();
const helmet = require("helmet");
const { selectAllDataFromSignaturesDB, insertDataIntoSignatureDB } = require('./db');
const { hashPass, compare} = require("./encrypt");
// Handlebars Setup
const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
// End of setup


let showError = false;
app.use(express.static("../public"));
const urlEncodedMiddleware = express.urlencoded({ extended: false });
app.use(urlEncodedMiddleware);
app.use(helmet());
const cohortName = "Mint";
const createdBy = 'Vladyslav Tsurkanenko';

//cookiesSession NEW
const cookieSession = require("cookie-session");
// const {SESSION_SECRET} = process.env;
app.use(
    cookieSession({
        secret: `try`, //process.env.SESSION_SECRET,
        maxAge: 1000*60*60*24*14
    })
);

//                                                              USE
app.get('/', (req, res) => {
    res.redirect('/petition');
});
app.use((req, res, next) => {
    //with cookies
    if (req.url.startsWith("/petition") && req.session.signed) {
        res.redirect("/thanks");
    } else if (req.url.startsWith("/register") && req.session.signed) {
        res.redirect("/thanks");
    } else if (req.url.startsWith("/signin") && req.session.signed) {
        res.redirect("/thanks");
    } else if (req.url.startsWith("/signature") && req.session.signed) {
        res.redirect("/thanks");
    //if no cookies
    } else if (req.url.startsWith("/signature") && !req.session.signed) {
        res.redirect("/petition");
    } else if (req.url.startsWith("/thanks") && !req.session.signed) {
        res.redirect("/petition"); 
    } else if (req.url.startsWith("/signers") && !req.session.signed) {
        res.redirect("/petition");
    } else {
        next();
    }
});
//                                                        middleware ends here                                            \\
// get routes
app.get("/petition", (req, res) => { //petition has two simple buttons
    res.render("1petition", {
        layout: "main",
        cohortName,
        createdBy,
    });
});
app.get("/register", (req, res) => { //register page should have 4 validators
    res.render("2register", {
        layout: "main",
        cohortName,
        createdBy,
        showError:false
    });
});
app.get("/signin", (req, res) => { //register page should have 2 validators
    res.render("3signin", {
        layout: "main",
        cohortName,
        createdBy,
        showError:false
    });
});
app.get("/signature", (req, res) => { //register page should have 2 validators (is done!!!)
    res.render("4signature", {
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
app.get("/thanks", (req, res) => {
    selectAllDataFromSignaturesDB()
        .then(allData => {
            allDataRows = allData.rows[allData.rows.length -1].firstname;
            console.log('allDataRows', allData.rows[allData.rows.length -1].firstname);
            numberofItems = allData.rows.length;
            infoOfUser = allData.rows.find(el => {
                return el.id === req.session.signed;
            });
            final = infoOfUser.signature;
            res.render("5thanks", {
                layout: "main",
                cohortName,
                final,
                numberofItems,
                allDataRows,
                createdBy
            });
            
        })
        .catch(err => {
            console.log('error appeared for query 1: ', err);
        });
});

app.get("/signers", (req, res) => {
    selectAllDataFromSignaturesDB()
        .then(allData => {
            allDataRows = allData.rows;
            res.render("6signers", {
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
//get routes are above

//                                                              POST
//registration post
app.post('/register', (req, res) => {
    let firstNameValuesSaved = req.body.firstNameValues;
    let secondNameValuesSaved = req.body.secondNameValues;
    let emailValueSaved = req.body.emailValue;
    let passwordValueSaved = req.body.passwordValue;
    // save a new user
    // hash the password before saving to the Database
    // save cookies and redirect to Signature Page.
    if(firstNameValuesSaved !== '' && secondNameValuesSaved !== '' && emailValueSaved !== '' && passwordValueSaved !== ''){
        insertDataIntoSignatureDB(firstNameValuesSaved, secondNameValuesSaved, emailValueSaved, passwordValueSaved)
            .then((data)=>{
                showError = false, 
                req.session.signed = data.rows[0].id;
                res.redirect('/signin');
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
//registration above
//signin post
app.post('/signin', (req, res) => {
    let emailValueSaved = req.body.emailValue;
    let passwordValueSaved = req.body.passwordValue;
    //first check if the user exists in your database
    //if he/she exists then compare if the password matches
    if(emailValueSaved !== '' && passwordValueSaved !== ''){
        insertDataIntoSignatureDB(emailValueSaved, passwordValueSaved)
            .then((data)=>{
                showError = false, 
                req.session.signed = data.rows[0].id;
                res.redirect('/signature'); //go to the signature table to see if this use already signed
                //if the user has already signed, redirect to Thanks Page (done in middleware)
                //otherwise redirect to signature page (done above)
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        res.render("3signin", {
            layout: "main",
            cohortName,
            createdBy,
            showError: true
        });
    }

});
//signin above
//signature post
app.post('/signature', (req, res) => {
    let drawingCanvas = req.body.signature;
    if(drawingCanvas){
        insertDataIntoSignatureDB(drawingCanvas)
            .then((data)=>{
                showError = false, 
                req.session.signed = data.rows[0].id;
                res.redirect('/thanks');
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        res.render("4signature", {
            layout: "main",
            cohortName,
            createdBy,
            showError: true
        });
    }

});
//signature above

app.listen(3000, console.log("Petition: running server at 3000..."));