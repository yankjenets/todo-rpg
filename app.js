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
var localData = {};

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

function writeUserData(username, userData) {
  var filename = "" + username + ".txt";
  //easier debugging when stringifying in this manner...maybe change later for "production"
  writeFile(filename, JSON.stringify(userData, null, 2));
}

// login request
app.get("/login", function(request, response) {
  var username = request.param("user");
  var pass = request.param("pass");
  var password = users[username];

  if (password !== undefined && password === pass) {
    var defaultList = "{}";
    var filename = "" + username + ".txt";
  
    readFile(filename, defaultList, function(err, data) {
      localData[username] = JSON.parse(data);
      localData[username].last_login = new Date();
      writeUserData(username, localData[username]);
      
      response.send({
        success: true,
        userData: localData[username]
      });
    });
  } else {
    if(password == undefined) {
      response.send({
        doesNotExist: true,
        success: false
      });
    } else {
      response.send({
        wrongPassword: true,
        success: false
      });
    }
  }
});

//logout request
//nothing to do serverside besides not leak memory
app.put("/logout", function(request, response) {
  var username = request.body.user;
  if(localData[username] === undefined) {
    response.send({
      success: false
    });
  } else {
    delete localData[username];
    response.send({
      success: true
    });
  }
});

// new user request
app.post("/new_user", function(request, response) {
  var username = request.param("user");
  var pass = request.param("pass");

  if(users[username] !== undefined) {
    //the username is already taken
    response.send({
      success: false,
      alreadyExists: true
    });
  } else if(username === undefined || username.length < MIN_LENGTH) {
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
  } else {
    //we're good! create the new user.
    users[username] = pass;
    writeFile("users.txt", JSON.stringify(users));
    
    var new_user_data = new Object()
    new_user_data.username = username;
    new_user_data.level = "1";
    new_user_data.powerups = "";
    new_user_data.total_points = "0";
    new_user_data.last_login = new Date();
    new_user_data.high_score = "0";
    new_user_data.completed_history = [];
    new_user_data.todoList = {};
    new_user_data.running_total = "0";

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
  var taskname = request.body.name;
  var priority = request.body.priority;
  var due_date = request.body.due_date;
  var timestamp = request.body.timestamp;
  
  if (username != undefined &&
       taskname != undefined &&
       priority != undefined &&
       due_date != undefined &&
       timestamp != undefined) {
    localData[username].todoList[timestamp] = 
      {
        "name": taskname,
        "priority": priority,
        "due_date": due_date,
        "timestamp": timestamp,
        "completed": false
      };
  
    writeUserData(username, localData[username]);
    response.send({
      userData: localData[username],
      success: true
    });
  } else {
    response.send({
      success: false
    });
  }
});

// update one item
app.put("/todo", function(request, response){
  var username = request.param("user");
  var taskname = request.body.name;
  var priority = request.body.priority;
  var due_date = request.body.due_date;
  var timestamp = request.body.timestamp
  var completed = request.body.completed;
  
  if (username != undefined &&
       taskname != undefined &&
       priority != undefined &&
       due_date != undefined &&
       timestamp != undefined &&
       completed != undefined) {
    if(localData[username].todoList[timestamp] === undefined) {
      response.send({
        success: false,
        doesNotExist: true
      });
    } else {
      localData.todoList[timestamp] = 
        {
          "name": taskname,
          "priority": priority,
          "due_date": due_date,
          "timestamp": timestamp,
          "completed": completed
        };
    
      writeUserData(username, userData);
      response.send({
        userData: userData,
        success: true
      });
    }
  } else {
    response.send({
      success: false
    });
  }
});

// complete an item
app.post("/todo/complete", function(request, response) {
  var username = request.param("user");
  var id = parseInt(request.param("id"));
  var completionDate = request.param("completionDate");
  var points = request.param("points");
  console.log(localData);
  
  if (username != undefined &&
      id != undefined &&
      completionDate != undefined &&
      points != undefined) {
    var userData = localData[username];
    if(userData === undefined || userData.todoList[id] === undefined) {
      console.log(userData);
      console.log(userData.todoList[id]);
      response.send({
        success: false,
        doesNotExist: true
      });
    } else {
      userData.todoList[id].completed = true;
      userData.completed_history.push([completionDate, points]);
      writeUserData(username, userData);
      response.send({
        success: true
      });
    }
  }
});

// clean out last 24 hours list
app.delete("/todo/completed_history", function(request, response) {
  var username = request.param("user");
  var numToDelete = request.param("numToDelete");
  
  if (username != undefined && numToDelete != undefined) {
    var userData = localData[username];
    if(userData === undefined ||
       userData.completed_history === undefined ||
       userData.completed_history.length < numToDelete) {
      response.send({
        success: false,
        doesNotExist: true
      });
    } else {
      for(i = 0; i < numToDelete; i++) {
        // delete the first numToDelete entries in the list
        userData.completed_history.splice(0, 1);
        writeUserData(username, userData);
        response.send({
          success: true
        });
      }
    }
  }
});

// delete one list item
app.delete("/todo", function(request, response){
  var username = request.param("user");
  var id = parseInt(request.param("id"));
  
  if (username != undefined && id != undefined) {
    var userData = localData[username];
    if (userData != undefined) {
      delete userData.todoList[id];
      writeUserData(username, userData);
      response.send({
        todoList: userData.todoList,
        success: true
      });
    }
  }
});

//update user stats
app.put("/profile", function(request, response){
  var username = request.body.user;
  var level = request.body.level;
  var powerups = request.body.powerups;
  var total_points = request.body.total_points;
  var high_score = request.body.high_score;
  var running_total = request.body.running_total;
  
  if (username != undefined &&
      level != undefined &&
      powerups != undefined &&
      total_points != undefined &&
      high_score != undefined &&
      running_total != undefined) {
    var userData = localData[username];
    if(userData !== undefined) {
      userData.level = level;
      userData.powerups = powerups;
      userData.total_points = total_points;
      userData.high_score = high_score;
      userData.running_total = running_total;
    
      writeUserData(username, userData);
      response.send({
        userData: userData,
        success: true
      });
    } else {
      response.send({
        success: false
      });
    }
  } else {
    response.send({
      success: false
    });
  }
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
  });
}

// Finally, initialize the server, then activate the server at port 8889
initServer();
app.listen(8889);