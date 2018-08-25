// var User = require('../models/user'); // Import User Model
// var Profile = require('../models/profile'); // Import User Model
// var Bank = require('../models/bank'); // Import User Model
// var Car= require('../models/car'); // Import User Model
// var Documents= require('../models/documents'); // Import User Model

path = require('path');

var jwt = require('jsonwebtoken'); // Import JWT Package
var secret = 'harrypotter'; // Create custom secret for use in JWT
var nodemailer = require('nodemailer'); // Import Nodemailer Package
var sgTransport = require('nodemailer-sendgrid-transport'); // Import Nodemailer Sengrid Transport Package
var multer = require('multer');

var paystack_key = 'sk_test_07134b2e250c1ba75a2270d9122a402615bba4fc';
var paystack = require('paystack')('sk_test_07134b2e250c1ba75a2270d9122a402615bba4fc');

var moment = require('moment');





var firebase = require("firebase");
// Get a reference to the database service




var config = {
    apiKey: "AIzaSyATwye1E5wW7tUXIDd3oGfMWjIPk1qf34o",
    authDomain: "kruiz-4b38e.firebaseapp.com",
    databaseURL: "https://kruiz-4b38e.firebaseio.com",
    projectId: "kruiz-4b38e",
    storageBucket: "kruiz-4b38e.appspot.com",
    messagingSenderId: "102987166318"
  };
  firebase.initializeApp(config);

  var database = firebase.database();

// trigger for onAuthLogin
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
    } else {
      // No user is signed in.
    }
  });

module.exports = function(router) {

    // Start Sendgrid Configuration Settings (Use only if using sendgrid)
    // var options = {
    //     auth: {
    //         api_user: 'dbrian332', // Sendgrid username
    //         api_key: 'PAssword123!@#' // Sendgrid password
    //     }
    // };

    // Nodemailer options (use with g-mail or SMTP)
    // var client = nodemailer.createTransport({
    //     service: 'Zoho',
    //     auth: {
    //         user: 'cruiserweights@zoho.com', // Your email address
    //         pass: 'PAssword123!@#' // Your password
    //     },
    //     tls: { rejectUnauthorized: false }
    // });
    // var client = nodemailer.createTransport(sgTransport(options)); // Use if using sendgrid configuration
    // End Sendgrid Configuration Settings



    // Route to register new users
    router.post('/users', function(req, res) {
        var user = new User(); // Create new User object
        user.username = req.body.username; // Save username from request to User object // Save password from request to User object
        user.email = req.body.email; // Save email from request to User object
        user.name = req.body.name; // Save name from request to User object
        user.permission = req.body.permission;
        // user.temporarytoken = jwt.sign({ username: user.username, email: user.email}, secret, { expiresIn: '24h' }); // Create a token for activating account through e-mail

        // Check if request is valid and not empty or null
        if (req.body.username === null || req.body.username === '' || req.body.email === null || req.body.email === '' || req.body.name === null || req.body.name === '') {
            res.json({ success: false, message: 'Ensure username, email, and password were provided' });
        } else {

          user.temporarytoken = false; // Remove temporary token
          user.active = true;
            // Save new user to database
            user.save(function(err,record) {
                if (err) {
                    // Check if any validation errors exists (from user model)
                    if (err.errors !== null) {
                        if (err.errors.name) {
                            res.json({ success: false, message: err.errors.name.message }); // Display error in validation (name)
                        } else if (err.errors.email) {
                            res.json({ success: false, message: err.errors.email.message }); // Display error in validation (email)
                        } else if (err.errors.username) {
                            res.json({ success: false, message: err.errors.username.message }); // Display error in validation (username)
                        }else if (err.errors.permission) {
                            res.json({ success: false, message: err.errors.permission.message }); // Display error in validation (password)
                        } 
                        else {
                            res.json({ success: false, message: err }); // Display any other errors with validation
                        }
                    } else if (err) {
                        // Check if duplication error exists
                        if (err.code == 11000) {
                            if (err.errmsg[61] == "u") {
                                res.json({ success: false, message: 'That phone number is already taken' }); // Display error if username already taken
                            } else if (err.errmsg[61] == "e") {
                                res.json({ success: false, message: 'That e-mail is already taken' }); // Display error if e-mail already taken
                            }
                        } else {
                            res.json({ success: false, message: err }); // Display any other error
                        }
                    }
                } else {
                   
                    user.temporarytoken = false; // Remove temporary token
                    user.active = true;
                    res.json({ success: true, message: 'Account registered!' , id:record._id , permission:record.permission}); // Send success message back to controller/request
                }
            });
        }
    });


//Route to License Key
    router.post('/License', function(req, res){



        if(req != null){

          console.log("i coss boreder")

            if(req.body.role != null && req.body.subPeriod != null){
            
                var subPeriod = req.body.subPeriod;

                var role = req.body.role;

                 var generateLicenseToken = jwt.sign({ Role:role, subPeriod: subPeriod}, secret);

                var generatedDate = new Date().getTime();

                var temp_day = new Date().getDate();

                var temp_month = new Date().getMonth();

                var temp_year= new Date().getYear();

                var temp_hour = new Date().getHours();

                 var temp_minute = new Date().getMinutes();

                 var temp_second = new Date().getSeconds();

        const expiredDate = function toTimestamp(year,month,day,hour,minute,second){
             var datum = new Date(Date.UTC(temp_year +1,temp_month,temp_day,temp_hour,temp_minute,temp_second));
             return datum.getTime()/1000;
            }
 
        var licenseKey = generateLicenseToken;
            firebase.database().ref('licenseKey' + licenseKey ).set({
                role: role,
                 subPeriod: subPeriod,
                  licenseKey :licenseKey,
                  generatedDate: generatedDate,
                  status: "fresh",
                  expiredDate:expiredDate,
                  users:5,
                  limit:0


              })
            .then(success => {

                console.log("sucess on License");
                res.json({success:true, message:"License created"});

            })

            .catch( function(error){

               console.log("failure on License");
                res.json({success:false, message:"Error in creating License "  + error});


               });

                }
                else{
                    res.json({success:false, message:"Fields are empty"});
                }
    

        }
              

    });



 router.post('/active', function(req, res) {
        var user = new User(); // Create new User object
        user.email = req.body.email; // Save email from request to User object
        user.password = req.body.password; 
        user.activation = req.body.activation;

        // Check if request is valid and not empty or null
        if (req.body.email === null || req.body.email === '' || req.body.password === null || req.body.password === '' ) {
            res.json({ success: false, message: 'Ensure username, email, and password were provided' });
        } else {

        user.findOneAndUpdate({ "_id": user.activation }, { "$set": { "email": user.email, "password": user.password}}).exec(function(err, user){
   if(err) {
       

    if (err.errors !== null) {
                        if (err.errors.email) {
                            res.json({ success: false, message: err.errors.email.message }); // Display error in validation (name)
                        } else if (err.errors.password) {
                            res.json({ success: false, message: err.errors.password.message }); // Display error in validation (email)
                        }                     
                        else {
                            res.json({ success: false, message: err }); // Display any other errors with validation
                        }
                    } else if (err) {
                        // Check if duplication error exists
                        if (err.code == 11000) {
                           
                                res.json({ success: false, message: 'That already taken' }); // Display error if username already taken
                           
                        } else {
                            res.json({ success: false, message: err }); // Display any other error
                        }
                    }



   } else {
       res.json({ success: true, message: 'Account authenticated!' });     
   }
});

            user.save(function(err,record) {
                if (err) {
                    // Check if any validation errors exists (from user model)
                    if (err.errors !== null) {
                        if (err.errors.name) {
                            res.json({ success: false, message: err.errors.name.message }); // Display error in validation (name)
                        } else if (err.errors.email) {
                            res.json({ success: false, message: err.errors.email.message }); // Display error in validation (email)
                        } else if (err.errors.username) {
                            res.json({ success: false, message: err.errors.username.message }); // Display error in validation (username)
                        }else if (err.errors.permission) {
                            res.json({ success: false, message: err.errors.permission.message }); // Display error in validation (password)
                        } 
                        else {
                            res.json({ success: false, message: err }); // Display any other errors with validation
                        }
                    } else if (err) {
                        // Check if duplication error exists
                        if (err.code == 11000) {
                            if (err.errmsg[61] == "u") {
                                res.json({ success: false, message: 'That phone number is already taken' }); // Display error if username already taken
                            } else if (err.errmsg[61] == "e") {
                                res.json({ success: false, message: 'That e-mail is already taken' }); // Display error if e-mail already taken
                            }
                        } else {
                            res.json({ success: false, message: err }); // Display any other error
                        }
                    }
                } else {
             

                    user.temporarytoken = false; // Remove temporary token
                    user.active = true;
                    res.json({ success: true, message: 'Account registered!' , id:record._id , permission:record.permission}); // Send success message back to controller/request
                }
            });
        }
    });



 

//Route to set profile
    //  router.post('/setprofile/:id',upload.any(), function(req, res) {
    //     var profile = new Profile(); // Create new profile object

    //                   console.log(req.body); //form fields
    //                   console.log(req.body);
    //                   console.log(req.file);
    //                   console.log(req.files); //form files
                      
    //                   if(!req.body && !req.files){
    //                     res.json({success: false});
    //                   } else {    
    //                     var c=1;
    //                     Profile.findOne({user:req.body.id}).select('unique_id').exec(function(err,data){
                          
    //                         if (err) {
    //                             console.log(err);
    //                             res.json({ success: false, message: 'Something went wrong' });
    //                                res.sendFile(__dirname + "/setprofile/kol=req.body.id");
    //                         }
                          
    //                       else{
    //                         console.log("if");
                           

    //                         if (data) {
    //                             res.json({ success: false, message: 'That e-mail is already taken' }); // If user is returned, then e-mail is taken
    //                              res.sendFile(__dirname + "/setprofile/kol=req.body.id");
    //                         } else { 
    //                             c = data.unique_id + 1;                              
    //                         }

    //                       }

    //                       var profile = new Profile({

    //                         unique_id:c,
    //                         displayname: req.body.displayname,
    //                         user: req.body.id,
    //                         image:req.files[0].filename,
                           
    //                       });

    //                      profile.save(function(err,record){
    //                         if(err){
    //                             res.json({ success: false, message:err });
    //                           console.log(err);
    //                         }
                                
    //                         else{
    //                              res.json({ success: true, message: 'Account registered!', id:record.user });
    //                             res.send('/');

    //                             res.json({ success: true, message: 'Account registered!' ,id:record.user });
    //                         }
                           

    //                       });

    //                     });

    //                   }


      
    // });

// //Route to set documents
//      router.post('/setdocument/:id',upload.any(), function(req, res) {
//         var documents = new Documents(); // Create new profile object
        
//                       console.log("req.body"); //form fields
//                       console.log(req.body);
//                       console.log("req.file");
//                       console.log(req.files); //form files
                      
//                       if(!req.body && !req.files){
//                         res.json({success: false});
//                       } else {    


//                           var documents = new Documents({

//                             user: req.body.id,
//                             driverLicense:req.files[0].filename,
//                             nationalId:req.files[1].filename,
                           
//                           });

//                          documents.save(function(err,record){
//                             if(err){
//                                 res.json({ success: false, message:err });
//                               console.log(err);
//                             }
                                
//                             else{
//                                  // res.json({ success: true, message: 'Account registered!', id: record.user });
                                  
//                                  res.send("/generateActivation/kol="+record.user);
//                                   // res.sendFile(__dirname + "/generateActivation/kol="+record.user);
//                             }
                           

//                           });

//                       }
//     });


    
//Route to get bank details
    router.post('/bank/:user_id', function(req, res) {
        var bank = new Bank(); // Create new User object
       bank.user = req.body.id; // Save username from request to User object
        bank.acctname= req.body.accountName; // Save password from request to User object
        bank.acctnum = req.body.accountNumber; // Save email from request to User object
        bank.bankname = req.body.bankName; // Save name from request to User object
        bank.bvn = req.body.bvn;
       
        // Check if request is valid and not empty or null
        if (req.body.id === null || req.body.id === '' || req.body.accountName === null || req.body.accountName === '' || req.body.accountNumber === null || req.body.accountNumber === '' || req.body.bvn === null || req.body.bvn === '') {
            res.json({ success: false, message: 'Ensure all fields were provided' });
        } else {

          // user.temporarytoken = false; // Remove temporary token
          // user.active = true;
            // Save new user to database
           bank.save(function(err,record) {
                if (err) {
                    // Check if any validation errors exists (from user model)
                    if (err.errors !== null) {
                        if (err.errors.acctname) {
                            res.json({ success: false, message: err.errors.acctname.message }); // Display error in validation (name)
                        }
                         // else if (err.errors.user) {
                        //     res.json({ success: false, message: err.errors.user.message }); // Display error in validation (email)
                        // } 

                        else if (err.errors.acctnum) {
                            res.json({ success: false, message: err.errors.acctnum.message }); // Display error in validation (username)
                        }else if (err.errors.carmake) {
                            res.json({ success: false, message: err.errors.permission.carmake }); // Display error in validation (password)
                        } 
                        else if (err.errors.bankname) {
                            res.json({ success: false, message: err.errors.bankname.carcolor}); // Display error in validation (password)
                        } 
                        else if (err.errors.bvn) {
                            res.json({ success: false, message: err.errors.permission.bvn }); // Display error in validation (password)
                        } 
                      
                        else {
                            res.json({ success: false, message: err }); // Display any other errors with validation
                        }
                    } else if (err) {
                        // Check if duplication error exists
                        if (err.code == 11000) {
                           
                                res.json({ success: false, message: 'Duplicate error' }); // Display error if username already taken
                           

                        } else {
                            res.json({ success: false, message: err }); // Display any other error
                        }
                    }
                } else {
                   
                    res.json({ success: true, message: 'Account registered!' , id:record._id }); // Send success message back to controller/request
                }
            });
        }
    });


//Route to get cars
    router.post('/car/:user_id', function(req, res) {
        var car = new Car(); // Create new User object
        car.user = req.body.id; // Save username from request to User object
        car.carname= req.body.carName; // Save password from request to User object
        car.cartype = req.body.carType; // Save email from request to User object
        car.carmake = req.body.carMake;
        car.carcolor = req.body.carColor;
        car.caryear = req.body.carYear;
        car.carplatenum = req.body.carPlatenum;
      
        // Check if request is valid and not empty or null
        if (req.body.id === null || req.body.id === '' || req.body.carName === null || req.body.carName === '' || req.body.carType=== null || req.body.carType === '' || req.body.carMake === null || req.body.carMake === ''|| req.body.carColor === null || req.body.carColor  === ''|| req.body.carYear === null || req.body.carYear  === '' || req.body.carPlatenum === null || req.body.carPlatenum  === '') {
            res.json({ success: false, message: 'Ensure all fields were provided' });
        } else {

            // Save new user to database
            car.save(function(err,record) {
                if (err) {
                    // Check if any validation errors exists (from user model)
                    if (err.errors !== null) {
                        if (err.errors.carname) {
                            res.json({ success: false, message: err.errors.carname.message }); // Display error in validation (name)
                        }

                        else if (err.errors.cartype) {
                            res.json({ success: false, message: err.errors.cartype.message }); // Display error in validation (username)
                        }else if (err.errors.carmake) {
                            res.json({ success: false, message: err.errors.permission.carmake }); // Display error in validation (password)
                        } 
                        else if (err.errors.carcolor) {
                            res.json({ success: false, message: err.errors.permission.carcolor}); // Display error in validation (password)
                        } 
                        else if (err.errors.caryear) {
                            res.json({ success: false, message: err.errors.permission.caryear }); // Display error in validation (password)
                        } 
                        else if (err.errors.carplatenum) {
                            res.json({ success: false, message: err.errors.permission.carplatenum }); // Display error in validation (password)
                        } 
                        else {
                            res.json({ success: false, message: err }); // Display any other errors with validation
                        }
                    } else if (err) {
                        // Check if duplication error exists
                        if (err.code == 11000) {
                           
                                res.json({ success: false, message: 'Duplicate error' }); // Display error if username already taken
                           

                        } else {
                            res.json({ success: false, message: err }); // Display any other error
                        }
                    }
                } else {

                    // user.temporarytoken = false; // Remove temporary token
                    // user.active = true;
                    res.json({ success: true, message: 'Account registered!' , id:record._id }); // Send success message back to controller/request
                }
            });
        }
    });

    // Route to get password reset link
    router.post('/getresetlink', function(req,res){
           var auth = firebase.auth();
                        var emailAddress = req.body.email;
                        auth.sendPasswordResetEmail(emailAddress).then(function() {
                          // Email sent.
                          console.log(" Email sent ");
                          res.json({ success: true, message: 'ok' });
                        }).catch(function(error) {
                          // An error happened.
                            console.log(error);

                            res.json({ success: false, message: 'error' });
                        });

    })


    // Route to check if username chosen on registration page is taken
    router.post('/checkusername', function(req, res) {
        //Write your firebase code here
    });

//Route to check display name
      router.post('/checkdisplayname', function(req, res) {
       //Write your firebase code here
    });


    // Route to check if e-mail chosen on registration page is taken
    router.post('/checkemail', function(req, res) {
        //Write your firebase code
    });

  
    // Route to activate the user's account
    router.put('/activate/:token', function(req, res) {
       //Write your firebase code here
    });

    // Route to verify user credentials before re-sending a new activation link
    router.post('/resend', function(req, res) {
        //Write your firebase code here
    });

    // Route to send user a new activation link once credentials have been verified
    router.put('/resend', function(req, res) {
       //Write your firebase code here
    });

    // Route to send user's username to e-mail
    router.get('/resetusername/:email', function(req, res) {
        //Write your firebase code here
    });

    // Route to send reset link to the user
    router.put('/resetpassword', function(req, res) {
        //Write your firebase code here
    });

    // Route to verify user's e-mail activation link
    router.get('/resetpassword/:token', function(req, res) {
       //Write your firebase code here
    });

    // Save user's new password to database
    router.put('/savepassword', function(req, res) {
        //Write your firebase code here
    });

   

    // Route to provide the user with a new token to renew session
    router.get('/renewToken/:username', function(req, res) {

     var mstatus = req.decoded.Status;
     var email = req.decoded.email;
     var id = req.decoded.uid;
     var mrole = req.decoded.permission;  

     if (id == null || mstatus == null || email == null || mrole == null ) {
                //Fields are empty
     }  else {
                var newToken = jwt.sign({ Status : mstatus, email : email, uid : id, permission : mrole  }, secret, { expiresIn: '24h' }); // Give user a new token
                res.json({ success: true, token: newToken }); // Return newToken in JSON object to controller
                console.log("TOKEN: " + token);

     }; 
                        
    });




//  
//     // Route to delete a user
//     router.delete('/management/:username', function(req, res) {
       
//          //write your firebase code here

//     });

//     // Route to get the user that needs to be edited
//     router.get('/edit/:id', function(req, res) {
      
//        //write your firebase code here

//     });

//     // Route to update/edit a user
//     router.put('/edit', function(req, res) {
   
//     //write your firebase code here
  
//     });




   


//AUTHTENTICATION ROUTING
  router.post('/authenticate', function(req, res) {
        var email  = req.body.email; // Ensure username is checked in lowercase against database
        var password = req.body.password;
        var user = firebase.auth().currentUser;
        firebase.auth().signInWithEmailAndPassword(email, password)
        .then(sucess=> {
        // user signed in
        this.id = firebase.auth().currentUser.uid;
        if(id != null){
            console.log("i have gooten the id " + id);

            // ########################################################################################
            // ########################################################################################
                   
                    var mrole = "Admin";
                    var mstatus= "active";

                // function writeUserData(id, email, mrole, mstatus){
                    console.log("user email: " + email + " mrole: " + mrole + "mstatus " + mstatus + "id: " + id);
                    firebase.database().ref('users/' + id).set({
                        email: email,
                        role: mrole,
                        status: mstatus
                    })
                    .then(function(success) {      
                        var token = jwt.sign({ Status:mstatus, email: email, uid:id, permission:mrole  }, secret, { expiresIn: '24h' }); // Logged in: Give user token
                        res.json({ success: true, message: email + ' authenticated!', token: token }); // Return token in JSON object to controller
                        console.log("TOKEN: " + token);
                    })
                    .catch(function(error) {
                        console.log(error);
                    });

              
            // ########################################################################################
            // // ########################################################################################  
        }
        else{
            console.log("i have no id " );
            res.json({ success: false, message: errorMessage });
        }
                
        })
        .catch(function(error) {
              // Handle Errors here.
              var errorCode = error.code;
              var errorMessage = error.message;
              // ...
            //    console.log(errorMessage);
            //     res.json({ success: false, message: errorMessage });

            res.json({ success: false, message:  error  });
            });
    });


 //MIDDLEWARE FOR ROUTES THAT CHECKS FOR TOEKEN - PLACE ALL ROUTES AFTER THEIS ROUTE THAT REQUIRE THE USER TO ALREADY BE LOGGED IN
    router.use(function(req, res, next) {
        var token = req.body.token || req.body.query || req.headers['x-access-token']; // Check for token in body, URL, or headers
        // Check if token is valid and not expired
        if (token) {
            // Function to verify token
            jwt.verify(token, secret, function(err, decoded) {
                if (err) {
                    res.json({ success: false, message: 'Token invalid' }); // Token has expired or is invalid
                } else {
                    req.decoded = decoded; // Assign to req. variable to be able to use it in next() route ('/me' route)
                    next(); // Required to leave middleware
                }
            });
        } else {
            res.json({ success: false, message: 'No token provided' }); // Return error if no token was provided in the request
        }
    });



     // ME ROUTING
    router.post('/me', function(req, res) {
   
        res.send(req.decoded); // Return the token acquired from middleware
     
    });
 

//PERMISSION ROUTING
  router.get('/permission', function(req, res) {


 const rootRef =  firebase.database().ref('/users/');
     

 firebase.auth().onAuthStateChanged(function(user) {

               if (user) {

                   var getUser = firebase.auth().currentUser;
                  var mUserID = getUser.uid;

         rootRef.once("value").then(function(snapshot) {

                      const mainUser = snapshot.child(mUserID);
                      const userObject = mainUser.val();
                      const role = userObject.role;

                            if (role !=null) {
                                                   res.json({ success: true, permission: role });
                                              }

                                              else{
                                                   res.json({ success: false, message: 'Cannot find permission' });
                                              }

                            res.json({ success: false, message: "Error Catch:2 " + errorMessage });
           
          });
                

                } else {

               res.json({ success: false, message: "user not found" });
               console.log("JApa");

                 }
      

   });


});

// MANAGEMENT PAGE ROUTING
router.get('/management', function(req, res) {


  const mUserID = req.decoded.role;

  



  const rootRef =  firebase.database().ref('/users/');
  rootRef.once("value")

.then(function(snapshot) {

const mUserID = req.decoded.uid;

const mainUser = snapshot.child(mUserID);
const userObject = mainUser.val();
if(  mainUser == null){
   console.log('No user Found');
   res.json({ success: false, message: 'No user found' }); // Return error
     } 
     else {
              if (userObject.role === 'Admin' || userObject.role === 'moderator'){
                     
                 

            let conData = Object.keys(snapshot);


          console.log('TEEST USER: ' + snapshot);
           console.log('Return User with user permission');
              res.json({ success: true, users:snapshot.val(),user_id:conData,  permission: userObject.role }); // Return users, along with current user's permission

                } else {
             console.log('Insufficient Permissions');
         res.json({ success: false, message: 'Insufficient Permissions' }); // Return access error
              }
}


})

.catch( function(error){
  res.json({success:false , message:" our error " + error});
});


});

  

                                        

  // ########################################################################################
  // #################################### PAY STACK  API         #########################
  // ########################################################################################
  
  


      router.get('/getTransactionList',function(req,res){

                  paystack.transaction
                  .list()
                  .then(function(body) {
                    console.log(body);
                    res.json({success:true, message:"sucessful", transObject: body });
                  })
                  .catch(function(error) {
                    res.json({success:false, message:error});
                  });


                } );


     router.get('/getTotalSales',function(req,res){

                  var today = moment();
                  var tomorrow = moment(today).add(1, 'days');

             paystack.transaction
                  .totals({
                    from:today,
                    to:tomorrow

                  })
                        .then(function(body) {

                          res.json({success:true, message:body});

                          console.log(today+ '/n');
                          console.log(tomorrow+ '/n'); 
                          
                          console.log(body);
                        })
                        .catch(function(error) {
                          console.log(error);
                          res.json({success:false, message:error});
                        });


                } );




                        






// ########################################################################################
//  ########################################################################################
//   ########################################################################################










    return router; // Return the router object to server
};
