const express = require("express");
const app = express();
const helmet = require("helmet");
const { selectAllDataFromSignaturesDB, insertDataIntoSignatureDB } = require('./db');
// const cookieParser = require('cookie-parser');

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


///cookie midleware setup OLD
// app.use(cookieParser());

//cookiesSession NEW
const cookieSession = require("cookie-session");
// const {SESSION_SECRET} = process.env;
app.use(
    cookieSession({
        secret: `try`, //process.env.SESSION_SECRET,
        maxAge: 1000*60*60*24*14
    })
);

app.use((req, res, next) => {
    // console.log('req.session.signed', req.session.signed);
    if (req.url.startsWith("/petition") && req.session.signed) {
        res.redirect("/thanks");   
        // console.log('redirect!!');
    } else if (req.url.startsWith("/thanks") && !req.session.signed) {
        res.redirect("/petition"); 
    } else {
        next();
    }
    
});
// app.get('/thanks', (req, res, next)=>{
    
// });
app.get('/', (req, res) => {
    res.redirect('/petition');
});

app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main",
        cohortName,
        createdBy,
        showError:false, 
        helpers: {
            getStylesHelper: "/styles-petition.css" 
        }
    });
});



let numberofItems;
let allDataRows;
let infoOfUser;
let final;
app.get("/thanks", (req, res) => {
    selectAllDataFromSignaturesDB()
        .then(allData => {
            numberofItems = allData.rows.length;
            infoOfUser = allData.rows.find(el => {
                return el.id === req.session.signed;
            });
            final = infoOfUser.signature;
            res.render("thanks", {
                layout: "main",
                cohortName,
                final,
                numberofItems,
                createdBy, 
                helpers: {
                    getStylesHelper: "/styles-thanks.css" 
                }
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
        })
        .catch(err => {
            console.log('error appeared for query: ', err);
        });
});


app.post('/petition', (req, res) => {
    let firstNameValuesSaved = req.body.firstNameValues;
    let secondNameValuesSaved = req.body.secondNameValues;
    let drawingCanvas = req.body.signature;
    if(firstNameValuesSaved !== '' && secondNameValuesSaved !== '' && !drawingCanvas){
        insertDataIntoSignatureDB(firstNameValuesSaved, secondNameValuesSaved, drawingCanvas)
            .then((data)=>{
                // console.log('data', data.rows[0].id);
                showError = false, 
                // res.cookie('accepted', 'on');
                req.session.signed = data.rows[0].id;
                res.redirect('/thanks');
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        res.render("petition", {
            layout: "main",
            cohortName,
            createdBy,
            showError: true,  
            helpers: {
                getStylesHelper: "/styles-petition.css" 
            }
        });
    }
});

app.listen(3000, console.log("Petition: running server at 3000..."));

