// super-todo version of simpleExpressServer.js
// A simple RESTful Express server for 15-237.

var express = require("express"); // imports express
var app = express();        // create a new instance of express

// imports the fs module (reading and writing to a text file)
var fs = require("fs");

// the bodyParser middleware allows us to parse the
// body of a request
app.use(express.bodyParser());

// The global datastore for this example
var todoList;

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

// get all items
app.get("/todo", function(request, response){
  response.send({
    todoList: todoList,
    success: true
  });
});

// create new item
app.post("/todo", function(request, response) {
  todoList.push({"desc": request.body.desc,
                 "completed": false});
  writeFile("data.txt", JSON.stringify(todoList));
  response.send({
    todoList: todoList,
    success: true
  });
});

// update one item
app.put("/todo/:id", function(request, response){
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

// delete entire list
app.delete("/todo", function(request, response){
  todoList = [];
  writeFile("data.txt", JSON.stringify(todoList));
  response.send({
    todoList: todoList,
    success: true
  });
});

// delete one item
app.delete("/todo/:id", function(request, response){
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
  readFile("data.txt", defaultList, function(err, data) {
    todoList = JSON.parse(data);
  });
}

// Finally, initialize the server, then activate the server at port 8889
initServer();
app.listen(8889);
