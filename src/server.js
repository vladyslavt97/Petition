const express = require("express");
const app = express();
const helmet = require("helmet");
const { selectAllDataFromUsersDB, insertDataIntoUsersDB, selectAllDataFromSignaturesDB, insertDataIntoSignatureDB, selectAllDataFromUserProfilesDB, insertDataIntoUserProfilesDB, selectJoinUsersAndUserProfilesDBs } = require('./db');
const { hashPass, compare} = require("./encrypt");
const PORT = 3000;
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
        // } else if (req.url.startsWith("/signature") && req.session.signed) {
        //     res.redirect("/thanks");
    //if no cookies
    } else if (req.url.startsWith("/signature") && !req.session.signed) {
        res.redirect("/petition");
    } else if (req.url.startsWith("/thanks") && !req.session.signed) {
        res.redirect("/petition"); 
    } else if (req.url.startsWith("/signers") && !req.session.signed) {
        res.redirect("/petition");
    } else {
        next();    }
});

//                                                       middleware ends here                                            \\
//                                                              GET
// 
// app.get("/hashing", (req, res)=>{ //TODO works but comparison is always true
//     const str = "MintCohort";
//     hashPass(str).then((hashedPassword) => {
//         console.log(hashedPassword);
//         compare(str, hashedPassword).then((boolean)=>{
//             console.log(`match: ${boolean}`);
//         });
//     });
// });

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
app.get("/user-profile", (req, res) => { //register page should have 4 validators
    res.render("3userprofile", {
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
// user id
// signed or not
let numberofItems;
let allDataRows;
let infoOfUser;
let final;
app.get("/thanks", (req, res) => {
    selectAllDataFromSignaturesDB()
        .then(allData => {
            // console.log('allData', allData);
            numberofItems = allData.rows.length;
            infoOfUser = allData.rows.find(el => {
                return el.id === req.session.signed;
            });
            // console.log('infoOfUser undefined?', infoOfUser);
            final = infoOfUser.signature;
            res.render("5thanks", {
                layout: "main",
                cohortName,
                final,
                numberofItems,
                createdBy
            });
            
        })
        .catch(err => {
            console.log('error appeared for query to get data from signatures table: ', err);
        });
});

app.get("/signers", (req, res) => {
    selectJoinUsersAndUserProfilesDBs()
        .then()
    selectAllDataFromUsersDB()
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
//
// :city is a placeholder and will be put in req.params object
app.get('/signers/:city', (req, res) => {
    const projectDirectory = req.params.projectDirectory; // 'kitty-caroussel';
    const selectedCity = projects.find(p => {
        return p.url === projectDirectory;
    });
    
    if (selectedCity === undefined){// TASK: check if selectedProject is undefined.
        res.status(404).send("Wrong request"); //      if it is undefined. set statuscode 404 and send response.
    }

    res.render('show-lists', {
        layout: "main",
        projects: projects,
        showImage: false,
        selectedCity: selectedCity,
        helpers: {
            getStylesHelper: "/stylesforprojects.css",
            getActiveClass: (url) => {
                // console.log(selectedProject);
                if(selectedProject.url === url){
                    return 'active';
                }  
            }
        }
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
        // console.log(hashedPassword);
        // compare(str, hashedPassword).then((boolean)=>{
        //     console.log(`match: ${boolean}`);
        // });
        if(firstNameValuesSaved !== '' && secondNameValuesSaved !== '' && emailValueSaved !== '' && hashedPassword !== ''){
            insertDataIntoUsersDB(firstNameValuesSaved, secondNameValuesSaved, emailValueSaved, hashedPassword)
                .then((data)=>{
                    showError = false, 
                    req.session.signed = data.rows[0].id;
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
    // SELECT from signature to find out if they've signed (post /login)
    //
    
});
//registration above
//signin post
app.post('/signin', (req, res) => {
    let emailValueSaved = req.body.emailValue;
    let passwordValueSaved = req.body.passwordValue;
    //first check if the user exists in your database
    //if he/she exists then compare if the password matches
    selectAllDataFromUsersDB()
        .then((allData) => {
            // console.log('allData: ', allData.rows[0].password);
            //check email as well
            let pwdOfUSer = allData.rows[0].password;
            // let pwdOfUSer = allData.rows[password];
            compare(passwordValueSaved, pwdOfUSer).then((boolean)=>{
                console.log(`match: ${boolean}`);
                if(boolean === true){
                    if(emailValueSaved !== '' && passwordValueSaved !== ''){
                        insertDataIntoUsersDB(emailValueSaved, passwordValueSaved)
                            .then((data)=>{
                                showError = false, 
                                req.session.signed = data.rows[0].id;
                                res.redirect('/thanks'); //go to the signature table to see if this use already signed
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
                }
            });
        });
});
//signin above
//user-profile post
app.post('/user-profile', (req, res) => {
    let ageValueSaved = req.body.ageValue;
    let cityValueSaved = req.body.cityValue;
    let homepageValueSaved = req.body.homepageValue;
    let userID = req.session.signed;
    insertDataIntoUserProfilesDB(ageValueSaved, cityValueSaved, homepageValueSaved, userID)
        .then((data)=>{
            req.session.signed = data.rows[0].id;
            res.redirect('/signature');
        })
        .catch((err) => {
            console.log(err);
        });
});
//signature post
app.post('/signature', (req, res) => {
    let drawingCanvas = req.body.signature; //works
    let userID = req.session.signed;
    if(drawingCanvas){
        insertDataIntoSignatureDB(drawingCanvas, userID)
            .then((data)=>{
                console.log('got here');
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

app.listen(process.env.PORT || PORT, () => {
    console.log(`Petition: running server at ${PORT}...`);
} );


