

path = require('path');

var jwt = require('jsonwebtoken'); // Import JWT Package
var secret = 'harrypotter'; // Create custom secret for use in JWT
var nodemailer = require('nodemailer'); // Import Nodemailer Package
var sgTransport = require('nodemailer-sendgrid-transport'); // Import Nodemailer Sengrid Transport Package
var multer = require('multer');

var upload = multer({storage: multer.diskStorage({

  destination: function (req, file, callback) 
  { callback(null, './uploads');},
  filename: function (req, file, callback) 
  { callback(null, file.fieldname +'-' + Date.now()+path.extname(file.originalname));}

}),

fileFilter: function(req, file, callback) {
  var ext = path.extname(file.originalname)
  if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
    return callback(/*res.end('Only images are allowed')*/ null, false)
  }
  callback(null, true)
}
});


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



	router.get('/gethello', function(req,res){
		res.json({success:true, message: "hello world"});
  });

  //TOKENIZE LICENSE KEY
  router.get('/encryptLicense', function(req, res){

    role = "Admin";
    subPeriod = 1;
       generateLicenseToken =  jwt.sign({ Role:role, subPeriod: subPeriod}, secret);
         
    res.json({success:true, message: "key: " + generateLicenseToken });
  });
  

  //GENERATE TIMESTAMP
  router.get('/timestamp', function(req, res){

    var generatedDate = new Date().getTime();
            var temp_day = new Date().getDate();
            var temp_month = new Date().getMonth();
            var temp_year= new Date().getYear();
            var temp_hour = new Date().getHours();
            var temp_minute = new Date().getMinutes();
            var temp_second = new Date().getSeconds();
    function toTimestamp(year,month,day,hour,minute,second){
         var datum = new Date(Date.UTC((temp_year +1),temp_month,temp_day,temp_hour,temp_minute,temp_second));
         console.log("DATUM_LOG: " +  datum.getTime());
         return datum.getTime()/1000;

            };
              var expdate = toTimestamp();
             
              res.json({success:true, message : "message timestamp " + expdate});
        

  });


  //VERIFY TOKEN
  router.post('/verifyToken', function(req, res){
    var licenseKey = req.body.licenseKey;
    jwt.verify(licenseKey, secret, function(err, decoded){

      if(err) {
          res.json({success: false, message: 'Tokend invalid'});
  
      }
      else {
          req.decoded = decoded;
          res.json({success: true, message: req.decoded.Role});
      }
  })

  });

//VALIDATING LICENSE KEY
router.post('/validlicense', function(req, res){
  var licenseKey = req.body.licenseKey;
if (licenseKey != null){

  jwt.verify(licenseKey, secret, function(err, decoded){

    if(err) {
        res.json({success: false, message: 'Tokend invalid'});

    }
    else {
         const rootRef =  firebase.database().ref('/license/').orderByChild("licenseKey").equalTo(licenseKey);
    rootRef.once("value")
    .catch (function(error){
      res.json({success:false, message: "An error occured LOG " + error});
    })
    .then(function(snapshot){
      const idData = snapshot.val();
      keyID = Object.keys(idData);
    key = snapshot.child(keyID).child("licenseKey").val();

 try {
  if (key != licenseKey){

    res.json({ success: false, message: "Invalid License Key" });
    
  } else {
    var status = snapshot.child(keyID).child("status").val();
    if (status == "fresh"){
      //Fresh Activation
      firebase.database().ref('license/' + keyID).update({
        status : "Active"
      }).then(success =>{
             //Activate License Key
        //Call the registration api passing this data to it
        var role = snapshot.child(keyID).child("role").val();
        res.json({ success: true, message: "New Management Activation" });
      }). catch(function(error){
        res.json({ success: false, message: "An Error Occured: " + error });
      });
      res.json({ success: true, message: "Fresh Activation" });
    } else {
      var limit = snapshot.child(keyID).child("limit").val();
      var users = snapshot.child(keyID).child("users").val();
      if (limit >= users) {
  
        res.json({ success: false, message: "Your License Key has exceeded it limit" });
        
      } else {
        //Activate License Key
        //Update Limit
        updateLimit = limit + 1;
        firebase.database().ref('license/' + keyID).update({
          limit : updateLimit
        }).then(success =>{
               //Activate License Key
          //Call the registration api passing this data to it
          var role = snapshot.child(keyID).child("role").val();
          res.json({ success: true, message: "New Management Activation" });
        }). catch(function(error){
          res.json({ success: false, message: "An Error Occured: " + error });
        });
      }
    }
    res.json({ success: true, message: key });
  };

 } catch(error) {
    res.json({success:false, message:"An error occured: " + error});
 }

    }); 
    }
});
 

} else {
  res.json({success:false, message:"Fields are empty"});
}
});


//GENERATE LICENSE KEY
  router.post('/license', function(req, res){

    var subPeriod = req.body.subPeriod;
    var role = req.body.role;
         if(role != null && subPeriod != null){
         var  generateLicenseToken =  jwt.sign({ Role:role, subPeriod: subPeriod}, secret);
          var temp_day = new Date().getDate();
          var temp_month = new Date().getMonth();
          var temp_year= new Date().getYear();
          var temp_hour = new Date().getHours();
          var temp_minute = new Date().getMinutes();
          var temp_second = new Date().getSeconds();
  function toTimestamp(year,month,day,hour,minute,second){
       var datum = new Date(Date.UTC((temp_year +1),temp_month,temp_day,temp_hour,temp_minute,temp_second));
       console.log("DATUM_LOG: " +  datum.getTime());
       return datum.getTime()/1000;
          };
            var expdate = toTimestamp();  
  function toGenDate(year,month,day,hour,minute,second){
        var datum = new Date(Date.UTC(temp_year,temp_month,temp_day,temp_hour,temp_minute,temp_second));
        console.log("DATUM_LOG: " +  datum.getTime());
        return datum.getTime()/1000;
                 }; 
                 var genDate = toGenDate();  
            
            firebase.database().ref('/license/').push().set({
              role : role,
              subPeriod : subPeriod,
              licenseKey : generateLicenseToken,
              generatedDate : genDate,
              status : "fresh",
              expiredDate : expdate,
              users : 5,
              limit : 0,
      })
        .then(success => {
            res.json({success:true, message:"License created"});
      })
        .catch( function(error){
            res.json({success:false, message:"Error in creating License "  + error});
           });
      }
        else
      {
                res.json({success:false, message:"Fields are empty"});
      }      
});


//UPDATE USER EMAIL
router.post('/updateuseremail', function(req, res){
  email = req.body.email
  user = firebase.auth.currentUser;
  if (user != null) {
  user.updateEmail(email).then(function() {
    // Update successful.
    res.json({success:true, message:"Email Updated!"});
  }).catch(function(error) {
    // An error happened.
    res.json({success:true, message:"Email Updated!"});
  });
} else {

  res.json({success:false, message: "You need to sign in first"});
}
});


//SIGN USER OUT
router.get('/usersignout', function(req, res){

  firebase.auth().signOut().then(function() {
    // Sign-out successful.
    res.json({sucess:true, message: "You are logout"});
  }).catch(function(error) {
    // An error happened.
    res.json({sucess:false, message: "An error occured loging you out. LOG: " + error});
  });

});

 //ROUTE TO GET PASSWORD RESET LINK
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

                   res.json({ success: false, message: 'An error ocurred. LOG: ' + error });
               });

});

//SETUP PROFILE
router.post('/setupprofile', function(req, res){
// File or Blob named mountains.jpg
var file = req.body.file;

// Create the file metadata
var metadata = {
  contentType: 'image/jpeg'
};

// Upload file and metadata to the object 'images/mountains.jpg'
var uploadTask = firebase.storage.child('profileImages/' + file.name).put(file, metadata);
// Listen for state changes, errors, and completion of the upload.
uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
  function(snapshot) {
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
    switch (snapshot.state) {
      case firebase.storage.TaskState.PAUSED: // or 'paused'
        console.log('Upload is paused');
        break;
      case firebase.storage.TaskState.RUNNING: // or 'running'
        console.log('Upload is running');
        break;
    }
  }, function(error) {
  // A full list of error codes is available at
  switch (error.code) {
    case 'storage/unauthorized':
      // User doesn't have permission to access the object
      break;
    case 'storage/canceled':
      // User canceled the upload
      break;
    case 'storage/unknown':
      // Unknown error occurred, inspect error.serverResponse
      break;
  }
}, function() {
  // Upload completed successfully, now we can get the download URL
  uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {

    var displayName = req.body.displayName;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var address = req.body.address;
    var telephone = req.body.telephone;
    var dateofbirth = req.body.dob;
    var bio = req.body.bio;
    var profileImg = downloadURL;
    var id = req.decoded.uid;

    profileRef = firebase.database().ref('userProfile/');

    if (profileRef.hasChild(id)){
      firebase.database().ref('userProfile/' + id).update({
        displayName: displayName,
        firstName:firstName,
        lastName:lastName,
        address:address,
        telephone:telephone,
        dateofbirth:dateofbirth,
        bio:bio,
        imageURL: profileImg
    })
    .then(function(success) {        
        res.json({ success: true, message: 'Profile Updated!'}); // Return token in JSON object to controller 
    })
    .catch(function(error) {
        console.log(error);
    });

    } else {
      firebase.database().ref('userProfile/' + id).set({
      displayName: displayName,
      firstName:firstName,
      lastName:lastName,
      address:address,
      telephone:telephone,
      dateofbirth:dateofbirth,
      bio:bio,
      imageURL: profileImg
  })
  .then(function(success) {        
      res.json({ success: true, message: 'Profile Updated!'}); // Return token in JSON object to controller 
  })
  .catch(function(error) {
      console.log(error);
  }); 

}
  });
});
});

  
  
//SIGN UP NEW USERS
router.post('/registration', function(req, res){
  
  var email = req.body.email; //Ensure email is checked in lowercase against databse
  var password = req.body.password; //Collect user password
  var mrole = "Admin";
  var mstatus= "Activated";
  firebase.auth().createUserWithEmailAndPassword(email, password)
  .then(success =>{
      // user signed in
      this.id = firebase.auth().currentUser.uid;
      if (id != null){
        console.log("i have goten the id " + id);
        const checkDB = firebase.database().ref('/users');
        checkDB.once("value").then(function(snapshot){
            if(snapshot.hasChild(id)){
              var token = jwt.sign({ Status:mstatus, email: email, uid:id, permission:mrole  }, secret, { expiresIn: '24h' }); // Logged in: Give user token
              res.json({ success: true, message: 'User authenticated!', token: token }); // Return token in JSON object to controller
            } else {
              
          // function writeUserData(id, email, mrole, mstatus){
              console.log("user email: " + email + " mrole: " + mrole + "mstatus " + mstatus + "id: " + id);
              firebase.database().ref('users/' + id).set({
                  email: email,
                  role: mrole,
                  status: mstatus
              })
              .then(function(success) {      
                  var token = jwt.sign({ Status:mstatus, email: email, uid:id, permission:mrole  }, secret, { expiresIn: '24h' }); // Logged in: Give user token
                  res.json({ success: true, message: 'User authenticated!', token: token }); // Return token in JSON object to controller 
              })
              .catch(function(error) {
                  console.log(error);
              }); 
            }
        });
      } else {
        console.log("i found no id " );
            res.json({ success: false, message: errorMessage });
      }
  })
  .catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    res.json({ success: false, message:  error});
  });
});




//AUTHTENTICATION ROUTING
  router.post('/authenticate', function(req, res) {

        var email  = req.body.email; // Ensure username is checked in lowercase against database
        var password = req.body.password;
        var mrole = "Admin";
        var mstatus= "Activated";
        firebase.auth().signInWithEmailAndPassword(email, password)
        .then(sucess=> {
        // user signed in
        this.id = firebase.auth().currentUser.uid;
        if(id != null){
            console.log("i have goten the id " + id);
            const checkDB = firebase.database().ref('/users');
            checkDB.once("value").then(function(snapshot){
                if(snapshot.hasChild(id)){
                  var token = jwt.sign({ Status:mstatus, email: email, uid:id, permission:mrole  }, secret, { expiresIn: '24h' }); // Logged in: Give user token
                  res.json({ success: true, message: 'User authenticated!', token: token }); // Return token in JSON object to controller
                } else { 
              // function writeUserData(id, email, mrole, mstatus){
                  console.log("user email: " + email + " mrole: " + mrole + "mstatus " + mstatus + "id: " + id);
                  firebase.database().ref('users/' + id).set({
                      email: email,
                      role: mrole,
                      status: mstatus
                  })
                  .then(function(success) {      
                      var token = jwt.sign({ Status:mstatus, email: email, uid:id, permission:mrole  }, secret, { expiresIn: '24h' }); // Logged in: Give user token
                      res.json({ success: true, message: 'User authenticated!', token: token }); // Return token in JSON object to controller 
                  })
                  .catch(function(error) {
                      console.log(error);
                  });
                }
            });
        }
        else{
            console.log("i found no id " );
            res.json({ success: false, message: errorMessage });
        }     
        })
        .catch(function(error) {
              // Handle Errors here.
              var errorCode = error.code;
              var errorMessage = error.message;
            res.json({ success: false, message:  error  });
            });
    });


//API TO GET ALL USER ID 

router.get('/getuser', function(req,res){
  
  const rootRef =  firebase.database().ref('/user_id/');
  rootRef.once("value").then(function(snapshot) {
const idData = snapshot.val();

              newArray = Object.keys(idData);

          // const newArray = Object.keys(idData).map(i => idData[i]);
             var typeLenght = typeof newArray;

              // if (userObject === 'Admin' || userObject   === 'moderator'){
            console.log('Return User with user permission');
              res.json({ success: true, usersid: idData , length: newArray }); // Return users, along with current user's permission
                // } else {
             console.log('Insufficient Permissions');
          res.json({ success: false, message: 'Insufficient Permissions' }); // Return access error
              // }



})
.catch( function(error){
  res.json({success:false , message:" our error " + error});
});


});




// MANAGEMENT PAGE ROUTING
router.get('/management', function(req, res) {
  
  const rootRef =  firebase.database().ref('/users/');
  rootRef.once("value").then(function(snapshot) {
const mUserID = "fyG33AiwbjQ9rruFOcooweGfFAC2";
const mainUser = snapshot.child(mUserID);
const userObject = mainUser.val();
const userData = snapshot.val();
if(  mainUser == null){
   console.log('No user Found');
   res.json({ success: false, message: 'No user found' }); // Return error
     } 
     else {
              if (userObject.role === 'Admin' || userObject.role === 'moderator'){
                     
                conData = Object.keys(userData);
           console.log('Return User with user permission');
              res.json({ success: true, users: userData, convData : conData, permission: userObject.role }); // Return users, along with current user's permission

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


// ME
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
               console.log("User not Found");

                 }
      

   });

 

        

    
       
  
      

});

        






 
 








 


    return router; // Return the router object to server
};
