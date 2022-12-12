const express = require("express");
const app = express();
const { selectAllDataFromSignaturesDB,insertDataIntoSignatureDB } = require('./db');
const cookieParser = require('cookie-parser');
// const cookieSession = require("cookie-session");
// const {SESSION_SECRET} = process.env;
// Handlebars Setup
const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
// End of setup

let showError = false;
app.use(express.static("../public"));
const urlEncodedMiddleware = express.urlencoded({ extended: false });
app.use(urlEncodedMiddleware);


app.get('/', (req, res) => {
    res.redirect('/petition');
});

const cohortName = "Mint";
const createdBy = 'Vladyslav Tsurkanenko';


///cookie midleware setup OLD
app.use(cookieParser());
app.use((req, res, next) => {
    if (req.url.startsWith("/petition") && req.cookies.accepted === "on") {
        res.redirect("/thanks");   
    } else {
        next();
    }
});

//cookiesSession NEW
// app.use(
//     cookieSession({
//         secret: `try`, //process.env.SESSION_SECRET,
//         maxAge: 1000*60*60*24*14
//     })
// );

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

app.get("/thanks", (req, res) => {
    // console.log('req.session: ', req.session);
    // if(!req.session.signed || req.session.signed !== data.rows.id){
    //     insertDataIntoSignatureDB();
    //     return res.redirect('/');
    // }
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
    if(firstNameValuesSaved !== '' && secondNameValuesSaved !== '' && drawingCanvas !== ''){
        insertDataIntoSignatureDB(firstNameValuesSaved, secondNameValuesSaved, drawingCanvas);
        console.log('checking');
        showError = false, 
        res.cookie('accepted', 'on');
        res.redirect('/thanks');
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
//     insertDataIntoSignatureDB(firstNameValuesSaved, secondNameValuesSaved, drawingCanvas)
//         .then((data) => {
//             // console.log(data.rows); // log the data you get back from the db to see how you can access the id
//             req.session.signed = data.rows.id;
//             console.log('req.session.signed: ', data.rows.length);
//             res.redirect('/thanks');
//         })
//         .catch((err) => {
//             console.log('ups..: ', err);
//         });
// }

app.listen(3000, console.log("Petition: running server at 3000..."));

