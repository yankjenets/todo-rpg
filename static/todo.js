var data;
var user;

//attempts to log in and populate user data on success
function login(username, password) {
  $.ajax({
    type: "get",
    url: "/login",
    data: {user: username, pass: password},
  	success: function(response) {
      if(response.success) {
        console.log("success?");
        user = username;
    	  data = response.userData;
      } else {
        console.log("incorrect password");
      }
  	}
  });
}

//create a new user
function new_user(username, password) {
  $.ajax({
    type: "post",
    url: "/new_user",
    data: {user: username, pass: password},
    success: function(response) {
      if(response.success) {
        console.log("new user created successfully");
        user = username;
        data = response.userData;
      } else {
        console.log("Sorry, that username already exists");
      }
    }
  });
}