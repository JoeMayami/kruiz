

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
                        res.json({ success: true, message: 'User authenticated!', token: token }); // Return token in JSON object to controller
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

        














 


    return router; // Return the router object to server
};
