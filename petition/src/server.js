const express = require("express");
const app = express();
const { selectAllDataFromSignaturesDB,insertDataIntoSignatureDB } = require('./db');
const cookieParser = require('cookie-parser');
// Handlebars Setup
const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
// End of setup

app.use(express.static("../public"));
const urlEncodedMiddleware = express.urlencoded({ extended: false });
app.use(urlEncodedMiddleware);


app.get('/', (req, res) => {
    res.redirect('/petition');
});

const cohortName = "Mint";
const createdBy = 'Vladyslav Tsurkanenko';


///cookie midleware setup
app.use(cookieParser());
//cookies!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
app.use((req, res, next) => {
    if (req.url.startsWith("/petition") && req.cookies.accepted === "on") {
        res.redirect("/thanks");   
    } else {
        next();
    }
});
//
app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main",
        cohortName,
        createdBy,
        // showError: false, 
        helpers: {
            getStylesHelper: "/styles-petition.css" 
        }
    });
});



let numberofItems;
let allDataRows;

app.get("/thanks", (req, res) => { 
    selectAllDataFromSignaturesDB()
        .then(allData => {
            numberofItems = allData.rows.length;
            res.render("thanks", {
                layout: "main",
                cohortName,
                numberofItems,
                createdBy, 
                helpers: {
                    getStylesHelper: "/styles-thanks.css" 
                }
            });
            
        })
        .catch(err => {
            console.log('error appeared for query: ', err);
        });
});

app.get("/signers", (req, res) => {
    selectAllDataFromSignaturesDB()
        .then(allData => {
            allDataRows = allData.rows;
            res.render("signers", {
                layout: "main",
                // numberofItems,
                cohortName,
                createdBy,
                allDataRows, 
                helpers: {
                    getStylesHelper: "/styles-signers.css" 
                }
            });
        })
        .catch(err => {
            console.log('error appeared for query: ', err);
        });
});
app.post('/petition', (req, res) => {
    let firstNameValuesSaved = req.body.firstNameValues;
    let secondNameValuesSaved = req.body.secondNameValues;
    let drawingCanvas = req.body.signature;
    insertDataIntoSignatureDB(firstNameValuesSaved, secondNameValuesSaved, drawingCanvas);
    
    let showError;
    if(firstNameValuesSaved === "" || secondNameValuesSaved === "" || drawingCanvas === ""){
        console.log('reached');
        // res.render("petition", {
        showError = true, 
        // });
        res.redirect('/petition');
        console.log('reac3123ed');
    }
    showError;
    if(firstNameValuesSaved !== null && secondNameValuesSaved !== null && drawingCanvas !== null){
        showError = false, 
        console.log('reached!!!');
        res.cookie('accepted', 'on');
        // insertDataIntoSignatureDB(firstNameValuesSaved, secondNameValuesSaved, drawingCanvas);
        res.redirect('/thanks');
        console.log('also reached!!!');
    }///
});

app.listen(3000, console.log("Petition: running server at 3000..."));

