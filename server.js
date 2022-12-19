const express = require("express");
const app = express();
const helmet = require("helmet");
const { 
    deleteSignatureFromSignaturesDB, 
    deleteAllDataFromDB, 
    deleteFromUsersFromDB } = require('./db');
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


app.use(express.static("./public"));
const urlEncodedMiddleware = express.urlencoded({ extended: false });
app.use(urlEncodedMiddleware);
app.use(helmet());

const cookieSession = require("cookie-session");

const {SESSION_SECRET} = process.env;
app.use(
    cookieSession({
        secret: process.env.SESSION_SECRET,
        maxAge: 1000*60*60*24*14
    })
);


const newuserRoutes = require('./routes/newuser');
const welcomeRoutes = require('./routes/welcome');

app.use("/", newuserRoutes);
app.use("/welcome", welcomeRoutes);

//                                                              GET
app.get('/', (req, res) => {
    res.redirect('/petition');
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


app.listen(process.env.PORT || PORT, () => {
    console.log(`Petition: running server at ${PORT}...`);
});