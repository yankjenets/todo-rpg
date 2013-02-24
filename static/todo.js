var data = [];
var user;

//TODO LIST

//adds an item to the todo list
function addItem(name, desc, priority, due_date) {
  var date = new Date();
  $.ajax({
    type: "post",
    url: "/todo",
    data: {
      user: user,
      name: name,
      desc: desc,
      priority: priority,
      due_date: due_date,
      timestamp: date
    },
    success: function() {
      data[date] = {
        "name": name,
        "priority": priority,
        "due_date": due_date,
        "desc": desc,
        "completed": false
      };
    }
  });
}

//USER FUNCTIONALITY

//attempts to log in and populate user data on success
function login(username, password) {
  $.ajax({
    type: "get",
    url: "/login",
    data: {user: username, pass: password},
  	success: function(response) {
      if(response.success) {
        console.log("Logged in successfully as " + username + ".");
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
        if(response.usernameTooShort) {
          console.log("Please enter a valid username.");
        }
        if(response.passwordTooShort) {
          console.log("Please enter a valid password.");
        }
        if(response.alreadyExists) {
          console.log("Sorry, that username is already taken.");
        }
      }
    }
  });
}