// super-todo version of simpleExpressServer.js
// A simple RESTful Express server for 15-237.

var express = require("express"); // imports express
var app = express();        // create a new instance of express

// imports the fs module (reading and writing to a text file)
var fs = require("fs");

// the bodyParser middleware allows us to parse the
// body of a request
app.use(express.bodyParser());

// The global datastore for user data
var users;

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
  var defaultList = "[]";
  var filename = "" + username + ".txt";
  
  readFile(filename, defaultList, function(err, data) {
    userData = JSON.parse(data);
  });
  return userData;
}

function writeUserData(username, userData) {
  var filename = "" + username + ".txt";
  writeFile(filename, JSON.stringify(userData));
}

// login request
app.get("/login/:user/:pass", function(request, response) {
  var username = request.params.username;
  var pass = request.params.pass;
  var userData = users[username];
  
  if (userData !== undefined && userData === pass) {
    response.send({
      success: true
    });
  } else {
    response.send({
      success: false
    });
  }
});

// new user request
app.post("/new_user/:user/:pass", function(request, response) {
  var username = request.params.username;
  var pass = request.params.pass;
  var data = users[username];
  
  if (data !== undefined) {
    response.send({
      success: false
    });
  } else {
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
      success: true
    });
  }
});

// get a user's todo list
app.get("/:user/data", function(request, response){
  var username = request.params.username;
  var userData = getUserData(username);

  response.send({
    userData: userData,
    success: true
  });
});

// create new item
app.post("/:user/todo", function(request, response) {
  var username = request.params.username;
  var userData = getUserData(username);

  userData.todoList.push({
    "name": request.body.name,
    "priority": request.body.priority,
    "due_date": request.body.due_date,
    "desc": request.body.desc,
    "timestamp": new Date(),
    "completed": false
  });
  
  writeUserData(username, userData);
  response.send({
    userData: userData,
    success: true
  });
});

// update one item
app.put("/:user/todo/:id", function(request, response){
  // change todo at index, to the new todo
  var id = request.params.id;
  var todo = { "desc": request.body.desc,
               "completed": JSON.parse(request.body.completed) };
  todoList[id] = todo;
  writeFile("data.txt", JSON.stringify(todoList));
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
  var defaultList = "[]";
  readFile("users.txt", defaultList, function(err, data) {
    users = JSON.parse(data);
  });
}

// Finally, initialize the server, then activate the server at port 8889
initServer();
app.listen(8889);
