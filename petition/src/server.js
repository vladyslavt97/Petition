const express = require("express");
const app = express();
const { selectAllDataFromSignaturesDB,insertDataIntoSignatureDB } = require('./db');

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

app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main",
        cohortName,
        createdBy, 
        helpers: {
            getStylesHelper: "/styles-petition.css" 
        }
    });
});
app.post('/petition', (req, res) => {
    let firstNameValuesSaved = req.body.firstNameValues;
    let secondNameValuesSaved = req.body.secondNameValues;
    let drawingCanvas = req.body.signature;
    // console.log("First name: ", firstNameValuesSaved, "Last name: ", secondNameValuesSaved, 'drawingCanvas: ', drawingCanvas);
    insertDataIntoSignatureDB(firstNameValuesSaved, secondNameValuesSaved, drawingCanvas);
    res.redirect("/petition/thanks");
});
//
// if(req.body.firstNameValues !== null && req.body.secondNameValues === null){
    //     res.cookie('accepted', 'on');
    //     res.redirect('/petition/thanks');
    // } else {
    //     res.redirect('/petition/');
    // }



let numberofItems;
let allDataRows;

app.get("/petition/thanks", (req, res) => { 
    selectAllDataFromSignaturesDB()
        .then(allData => {
            numberofItems = allData.rows.length;
        })
        .catch(err => {
            console.log('error appeared for query: ', err);
        });
    res.render("thanks", {
        layout: "main",
        cohortName,
        numberofItems,
        createdBy, 
        helpers: {
            getStylesHelper: "/styles-thanks.css" 
        }
    });
});
app.get("/petition/signers", (req, res) => {
    selectAllDataFromSignaturesDB()
        .then(allData => {
            allDataRows = allData.rows;
        })
        .catch(err => {
            console.log('error appeared for query: ', err);
        });
    res.render("signers", {
        layout: "main",
        numberofItems,
        cohortName,
        createdBy,
        allDataRows, 
        helpers: {
            getStylesHelper: "/styles-signers.css" 
        }
    });
});

app.listen(3000, console.log("Petition: running server at 3000..."));


