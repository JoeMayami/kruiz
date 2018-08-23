angular.module('userControllers', ['userServices'])

// .config(function($locationProvider) {
//     $locationProvider.html5Mode(true);
    
// })

// Controller: regCtrl is used for users to register an account
.controller('regCtrl', function($http, $location, $timeout, User, $scope) {

    var app = this;

    // app.getId = $location.search('');


    app.License_items = [{ value: 'Franchise', display: 'Franchise' }, { value: 'Owner', display: 'Owner' }];
    app.Admin_items = [{ value: 'Admin', display: 'Admin' }, { value: 'Sub-admin', display: 'Sub-admin' }];
    $scope.Admin_selection = app.Admin_items[0];

     $scope.License_selection = app.License_items[0];

 // app.items = [ { value: 'Admin', display: 'Admin' }, { value: 'Sub-admin', display: 'Sub-admin' }, { value: 'Franchise', display: 'Franchise' }, { value: 'Driver', display: 'Driver' }, { value: 'User', display: 'User' }];

    // Custom function that registers the user in the database      
    this.regUser = function(regData, valid) {
        app.disabled = true; // Disable the form when user submits to prevent multiple requests to server
        app.loading = true; // Activate bootstrap loading icon
        app.errorMsg = false; // Clear errorMsg each time user submits


       

        // app.regData.permission = app.items;

        // If form is valid and passwords match, attempt to create user         
        if (valid) {
            app.regData.name = app.regData.firstName + " " + app.regData.lastName; // Combine first and last name before submitting to database
            // Runs custom function that registers the user in the database 
            User.createUser(app.regData).then(function(data) {
                // Check if user was saved to database successfully
                if (data.data.success) {

                    var id = data.data.id;
                    // app.permission = ;
                    app.loading = false; // Stop bootstrap loading icon
                    $scope.alert = 'alert alert-success'; // Set class for message
                   
                   
                            if (data.data.permission == "Driver") {

                                app.str1 = "?user_id=";
                                app.str2 = data.data.id;

                                app.res = app.str1.concat(app.str2);

                                app.successMsg = data.data.message  + '...Redirecting'; // If successful, grab message from JSON object and redirect to login page
                            // Redirect after 2000 milliseconds (2 seconds)
                               $location.path( "/setcar/" + "user=" +id);

                               // app.router.navigate(['/setprofile/user'], { queryParams: { user_id: 'popular' } });

                            }

                            else if (data.data.permission == "Franchise") {

                                app.str1 = "?user_id=";
                                app.str2 = data.data.id;

                                app.res = app.str1.concat(app.str2);

                                app.successMsg = data.data.message  + '...Redirecting'; // If successful, grab message from JSON object and redirect to login page
                            // Redirect after 2000 milliseconds (2 seconds)
                               $location.path( "/getActivation/" + "user=" +id);

                               // app.router.navigate(['/setprofile/user'], { queryParams: { user_id: 'popular' } });

                            }


                            else{

                            app.successMsg = data.data.message  + data.data.role + '...Redirecting'; // If successful, grab message from JSON object and redirect to login page
                            // Redirect after 2000 milliseconds (2 seconds)
                            
                                $location.path('/user');
                            }



                } else {
                    app.loading = false; // Stop bootstrap loading icon
                    app.disabled = false; // If error occurs, remove disable lock from form
                    $scope.alert = 'alert alert-danger'; // Set class for message
                    app.errorMsg = data.data.message; // If not successful, grab message from JSON object
                }
            });
        } else {
            app.disabled = false; // If error occurs, remove disable lock from form
            app.loading = false; // Stop bootstrap loading icon
            $scope.alert = 'alert alert-danger'; // Set class for message
            app.errorMsg = 'Please ensure form is filled our properly'; // Display error if valid returns false
        }
    }


// register profile

    







    //  Custom function that checks if username is available for user to use    
    this.checkUsername = function(regData) {
        app.checkingUsername = true; // Start bootstrap loading icon
        app.usernameMsg = false; // Clear usernameMsg each time user activates ngBlur
        app.usernameInvalid = false; // Clear usernameInvalid each time user activates ngBlur

        // Runs custom function that checks if username is available for user to use
        User.checkUsername(app.regData).then(function(data) {
            // Check if username is available for the user
            if (data.data.success) {
                app.checkingUsername = false; // Stop bootstrap loading icon
                app.usernameMsg = data.data.message; // If successful, grab message from JSON object
            } else {
                app.checkingUsername = false; // Stop bootstrap loading icon
                app.usernameInvalid = true; // User variable to let user know that the chosen username is taken already
                app.usernameMsg = data.data.message; // If not successful, grab message from JSON object
            }
        });
    };







    this.regCar = function(regData) {
        app.disabled = true; // Disable the form when user submits to prevent multiple requests to server
        app.loading = true; // Activate bootstrap loading icon
        app.errorMsg = false; // Clear errorMsg each time user submits

        

        // console.log("user_id" + app.getId);


        // If form is valid and passwords match, attempt to create user         
        if (app.regData) {
            
            // Runs custom function that registers the user in the database 
            User.createCarDetails(app.regData).then(function(data) {
                // Check if user was saved to database successfully
                if (data.data.success) {

                    app.id = data.data.id;
                
                    app.loading = false; // Stop bootstrap loading icon
                    $scope.alert = 'alert alert-success'; // Set class for message
                    

                    
                    app.successMsg = data.data.message + '...Redirecting'; // If successful, grab message from JSON object and redirect to login page
                    // Redirect after 2000 milliseconds (2 seconds)
                    $timeout(function() {
                 

                          $location.path( "/setdocument/"+"user=" + data.data.id );

                    }, 2000);
                } else {
                    app.loading = false; // Stop bootstrap loading icon
                    app.disabled = false; // If error occurs, remove disable lock from form
                    $scope.alert = 'alert alert-danger'; // Set class for message
                    app.errorMsg = data.data.message; // If not successful, grab message from JSON object
                }
            });
        } else {
            app.disabled = false; // If error occurs, remove disable lock from form
            app.loading = false; // Stop bootstrap loading icon
            $scope.alert = 'alert alert-danger'; // Set class for message
            app.errorMsg = 'Please ensure form is filled our properly'; // Display error if valid returns false
        }
    };




 

     this.checkDisplayname = function(regData) {
        app.checkingDisplayname = true; // Start bootstrap loading icon
        app.displaynameMsg = false; // Clear usernameMsg each time user activates ngBlur
        app.displaynameInvalid = false; // Clear usernameInvalid each time user activates ngBlur

        // Runs custom function that checks if username is available for user to use
        User.checkDisplayname(app.regData).then(function(data) {
            // Check if username is available for the user
            if (data.data.success) {
                app.checkingDisplayname = false; // Stop bootstrap loading icon
                app.displaynameMsg = data.data.message; // If successful, grab message from JSON object
            } else {
                app.checkingDisplayname = false; // Stop bootstrap loading icon
                app.displaynameInvalid = true; // User variable to let user know that the chosen username is taken already
                app.displaynameMsg = data.data.message; // If not successful, grab message from JSON object
            }
        });
    };

    // Custom function that checks if e-mail is available for user to use       
    this.checkEmail = function(regData) {
        app.checkingEmail = true; // Start bootstrap loading icon
        app.emailMsg = false; // Clear emailMsg each time user activates ngBlur
        app.emailInvalid = false; // Clear emailInvalid each time user activates ngBlur

        // Runs custom function that checks if e-mail is available for user to use          
        User.checkEmail(app.regData).then(function(data) {
            // Check if e-mail is available for the user
            if (data.data.success) {
                app.checkingEmail = false; // Stop bootstrap loading icon
                app.emailMsg = data.data.message; // If successful, grab message from JSON object
            } else {
                app.checkingEmail = false; // Stop bootstrap loading icon
                app.emailInvalid = true; // User variable to let user know that the chosen e-mail is taken already
                app.emailMsg = data.data.message; // If not successful, grab message from JSON object
            }
        });
    };
})

// Custom directive to check matching passwords 
.directive('match', function() {
    return {
        restrict: 'A', // Restrict to HTML Attribute
        controller: function($scope) {
            $scope.confirmed = false; // Set matching password to false by default

            // Custom function that checks both inputs against each other               
            $scope.doConfirm = function(values) {
                // Run as a loop to continue check for each value each time key is pressed
                values.forEach(function(ele) {
                    // Check if inputs match and set variable in $scope
                    if ($scope.confirm == ele) {
                        $scope.confirmed = true; // If inputs match
                    } else {
                        $scope.confirmed = false; // If inputs do not match
                    }
                });
            };
        },

        link: function(scope, element, attrs) {

            // Grab the attribute and observe it            
            attrs.$observe('match', function() {
                scope.matches = JSON.parse(attrs.match); // Parse to JSON
                scope.doConfirm(scope.matches); // Run custom function that checks both inputs against each other   
            });

            // Grab confirm ng-model and watch it           
            scope.$watch('confirm', function() {
                scope.matches = JSON.parse(attrs.match); // Parse to JSON
                scope.doConfirm(scope.matches); // Run custom function that checks both inputs against each other   
            });
        }
    };
})

// Controller: facebookCtrl is used finalize facebook login
.controller('facebookCtrl', function($routeParams, Auth, $location, $window, $scope) {

    var app = this;
    app.errorMsg = false; // Clear errorMsg on page load
    app.expired = false; // Clear expired on page load
    app.disabled = true; // On page load, remove disable lock from form

    // Check if callback was successful 
    if ($window.location.pathname == '/facebookerror') {
        $scope.alert = 'alert alert-danger'; // Set class for message
        app.errorMsg = 'Facebook e-mail not found in database.'; // If error, display custom message
    } else if ($window.location.pathname == '/facebook/inactive/error') {
        app.expired = true; // Variable to activate "Resend Link Button"
        $scope.alert = 'alert alert-danger'; // Set class for message
        app.errorMsg = 'Account is not yet activated. Please check your e-mail for activation link.'; // If error, display custom message
    } else {
        Auth.socialMedia($routeParams.token); // If no error, set the token
        $location.path('/'); // Redirect to home page
    }
})

// Controller: twitterCtrl is used finalize facebook login  
.controller('twitterCtrl', function($routeParams, Auth, $location, $window, $scope) {

    var app = this;
    app.errorMsg = false; // Clear errorMsg on page load
    app.expired = false; // Clear expired on page load
    app.disabled = true; // On page load, remove disable lock from form

    // Check if callback was successful         
    if ($window.location.pathname == '/twittererror') {
        $scope.alert = 'alert alert-danger'; // Set class for message
        app.errorMsg = 'Twitter e-mail not found in database.'; // If error, display custom message
    } else if ($window.location.pathname == '/twitter/inactive/error') {
        app.expired = true; // Variable to activate "Resend Link Button"
        $scope.alert = 'alert alert-danger'; // Set class for message
        app.errorMsg = 'Account is not yet activated. Please check your e-mail for activation link.'; // If error, display custom message
    } else if ($window.location.pathname == '/twitter/unconfirmed/error') {
        $scope.alert = 'alert alert-danger'; // Set class for message
        app.errorMsg = 'Your twitter account is either inactive or does not have an e-mail address attached to it.'; // If error, display custom message
    } else {
        Auth.socialMedia($routeParams.token); // If no error, set the token
        $location.path('/'); // Redirect to home page
    }
})

// Controller: googleCtrl is used finalize facebook login   
.controller('googleCtrl', function($routeParams, Auth, $location, $window, $scope) {

    var app = this;
    app.errorMsg = false; // Clear errorMsg on page load
    app.expired = false; // Clear expired on page load
    app.disabled = true; // On page load, remove disable lock from form

    // Check if callback was successful         
    if ($window.location.pathname == '/googleerror') {
        $scope.alert = 'alert alert-danger'; // Set class for message
        app.errorMsg = 'Google e-mail not found in database.'; // If error, display custom message
    } else if ($window.location.pathname == '/google/inactive/error') {
        app.expired = true; // Variable to activate "Resend Link Button"
        $scope.alert = 'alert alert-danger'; // Set class for message
        app.errorMsg = 'Account is not yet activated. Please check your e-mail for activation link.'; // If error, display custom message
    } else {
        Auth.socialMedia($routeParams.token); // If no error, set the token
        $location.path('/'); // Redirect to home page
    }
});
