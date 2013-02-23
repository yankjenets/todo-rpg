// super-todo version of simpleExpressServer.js
// A simple RESTful Express server for 15-237.

var express = require("express"); // imports express
var app = express();        // create a new instance of express

// imports the fs module (reading and writing to a text file)
var fs = require("fs");

// the bodyParser middleware allows us to parse the
// body of a request
app.use(express.bodyParser());

//minimum length for a username or password
var MIN_LENGTH = 5;

// The global datastore for user data
var users;
var globalData = {};

// Asynchronously read file contents, then call callbackFn
function readFile(filename, defaultData, callbackFn) {
  fs.readFile(filename, function(err, data) {
    if (err) {
      console.log("Error reading file: ", filename);
      data = defaultData;
    } else {
      console.log("Success reading file: ", filename);
    }
    if (callbackFn) callbackFn(err, data);
  });
}

// Asynchronously write file contents, then call callbackFn
function writeFile(filename, data, callbackFn) {
  fs.writeFile(filename, data, function(err) {
    if (err) {
      console.log("Error writing file: ", filename);
    } else {
      console.log("Success writing file: ", filename);
    }
    if (callbackFn) callbackFn(err);
  });
}

function getUserData(username) {
  return globalData[username];
}

function writeUserData(username, userData) {
  var filename = "" + username + ".txt";
  writeFile(filename, JSON.stringify(userData));
}

// login request
app.get("/login", function(request, response) {
  var username = request.param("user");
  var pass = request.param("pass");
  var password = users[username];

  if (password !== undefined && password === pass) {
    response.send({
      success: true,
      userData: getUserData(username)
    });
  } else {
    response.send({
      success: false
    });
  }
});

// new user request
app.post("/new_user", function(request, response) {
  var username = request.param("user");
  var pass = request.param("pass");

  if(username === undefined || username.length < MIN_LENGTH) {
    //the username isn't valid
    response.send({
      success: false,
      usernameTooShort: true
    });
  } else if(pass === undefined || pass.length < MIN_LENGTH) {
    //the password isn't valid
    response.send({
      success: false,
      passwordTooShort: true
    });
  } else if (users[username] !== undefined) {
    //the username is already taken
    response.send({
      success: false,
      alreadyExists: true
    });
  } else {
    //we're good! create the new user.
    users[username] = pass;
    writeFile("users.txt", JSON.stringify(users));
    
    var new_user_data = new Object()
    new_user_data.username = username;
    new_user_data.level = 1;
    new_user_data.powerups = "";
    new_user_data.total_points = 0;
    new_user_data.last_login = new Date();
    new_user_data.high_score = 0;
    new_user_data.todoList = [];
    writeUserData(username, new_user_data);
    
    response.send({
      success: true,
      userData : new_user_data
    });
  }
});

// create new item
app.post("/todo", function(request, response) {
  var username = request.param("user");
  var userData = getUserData(username);
  userData.todoList.push({
    "name": request.body.name,
    "priority": request.body.priority,
    "due_date": request.body.due_date,
    "desc": request.body.desc,
    "timestamp": request.body.timestamp,
    "completed": false
  });
  
  writeUserData(username, userData);
  response.send({
    userData: userData,
    success: true
  });
});

// update one item
app.put("/:user/todo/:timestamp", function(request, response){
  var username = request.body.name;
  var timestamp = request.params.timestamp;
  var todo = {
    "name": username,
    "priority": request.body.priority,
    "due_date": request.body.due_date,
    "desc": request.body.desc,
    "timestamp": timestamp,
    "completed": false
  };
  var userData = getUserData(username);
  userData.todoList[timestamp] = todo;
  writeUserData(username, userData);
  
  response.send({
    todoList: todoList,
    success: true
  });
});

// delete one item
app.delete("/:user/todo/:id", function(request, response){
  var id = request.params.id;
  todoList.splice(id, 1);
  writeFile("data.txt", JSON.stringify(todoList));
  response.send({
    todoList: todoList,
    success: true
  });
});

// This is for serving files in the static directory
app.get("/static/:staticFilename", function (request, response) {
    response.sendfile("static/" + request.params.staticFilename);
});

function initServer() {
  // When we start the server, we must load the stored data
  var defaultObj = "{}";
  readFile("users.txt", defaultObj, function(err, data) {
    users = JSON.parse(data);
    var name;
    for(name in users) {
      var filename = "" + name + ".txt";
      //must provide variable scope for callback function
      (function() {
        var tempName = name;
        readFile(filename, defaultObj, function(err, data) {
          globalData[tempName] = JSON.parse(data);
        });
      })();
    }
  });
}

// Finally, initialize the server, then activate the server at port 8889
initServer();
app.listen(8889);
