var data = [];
var user;

var canvas;
var ctx;

//constants
var WELCOME=1;
var TASKADDED = 2;
var TASKCOMPLETE = 3; 
var LEVELUP = 4;
var NEWHIGHSCORE = 5;

var canvasState = WELCOME;

//Timing Variable
var TIMER_DELAY = 16.67; //60FPS

var MILLI_IN_SECOND = 1000;
var MILLI_IN_MINUTE = MILLI_IN_SECOND * 60;
var MILLI_IN_HOUR = MILLI_IN_MINUTE * 60;
var MILLI_IN_24_HOURS = MILLI_IN_HOUR * 24;

var POINTS_PER_LEVEL = 50;

var PRIORITY_ENUM = {
  LOW : {value : 1, name : "low"},
  MEDIUM : {value : 4, name : "medium"},
  HIGH : {value : 9, name : "high"}
};

/*****************
 * Canvas Controls
 *****************/

$(document).ready(function(){
  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext("2d");


  $("#userSignon").click(function() {
    userLoginDOM();
  });
  
  $("#userRegister").click(function() {
    userRegisterDOM();
  });

  $("#submitTask").click(function() {
    addItemDOM();
  });

  runCanvas();
});

//Constuctor 
function DynamicText(txt, x, y, speed){
  this.txt = txt;
  this.x = x;
  this.y = y;
  this.speed = speed;
}

//Dynamic Type Objects

//Welcome Message
var welMSG = new DynamicText("Welcome to RPG.Do",0,0,.3);
var nhsMSG = new DynamicText("NEW HIGH SCORE",0,40,1);
var modivation = new DynamicText("Carpe Diem"
    ,40,100,1);

function drawTime(){
  var date = new Date();
  var time = date.toLocaleTimeString();
  var day = date.toLocaleDateString();

  ctx.font = "bold 20px Nuntio";
  ctx.fillStyle = "#208AE3";
  ctx.textAlign = "end";
  ctx.fillText(time, 600, 20);
  ctx.fillText(day , 600, 40);

}

function setTaskToDraw(task) {
  taskMSG.txt = task;
  canvasState = TASKADDED;
}

function drawTaskAdded() {
  ctx.fillStyle = "#555";
  ctx.font = "bold 40px Nuntio";
  ctx.textAlign = "start";

  if(welMSG.y < 70){
  welMSG.y= welMSG.y+welMSG.speed;
  }

  ctx.fillText(welMSG.txt, welMSG.x, welMSG.y);
  drawTime();
}


function drawWelcome() {
  ctx.fillStyle = "#555";
  ctx.font = "bold 40px Nuntio";
  ctx.textAlign = "start";

  if(welMSG.y < 70){
    welMSG.y= welMSG.y+welMSG.speed;
  }

  ctx.fillText(welMSG.txt, welMSG.x, welMSG.y);
  drawTime();
}

function drawNewHighScore(){
  ctx.fillStyle = "#555";
  ctx.font="bold 40px Nuntio";
  ctx.textAlign = "end";

  if(nhsMSG.x < 400){
    nhsMSG.x = nhsMSG.x + nhsMSG.speed;
  }
  else if(modivation.y > 65){
    modivation.y = modivation.y - modivation.speed;
  }
  
  ctx.fillText(nhsMSG.txt, nhsMSG.x, nhsMSG.y);

  ctx.fillStyle = "#555";
  ctx.font="bold 15px Nuntio";
  ctx.textAlign = "start";

  ctx.fillText(modivation.txt, modivation.x, modivation.y);
  drawTime();
}


//DOM STUFF

function userLoginDOM() {
  var username = $("#username").val();
  var password = $("#pass").val();

  login(username, password);

  $("#username").val("");
  $("#pass").val("");
}

function userRegisterDOM() {
  var username = $("#username").val();
  var password = $("#pass").val();

  new_user(username, password);
  login(username, password);

  $("#username").val("");
  $("#pass").val("");
}  


function addItemDOM() {
  var title = $("#task-input").val();
  var priority = $("#priority-input").val();
  var date = $("#date-input").val();
  var hour = parseInt($("#hour-input").val());
  var minute = parseInt($("#minute-input").val());
  var time_parity = parseInt($("#time-parity-input").val());
  if(!(1 <= hour && hour <= 12) || !(0 <= minute && minute <= 59)) {
    hour = 24;
    minute = 0;
    console.log("Defaulting to midnight since a valid time was not entered.");
  } else {
    hour += time_parity;
  }
  var splitDate = date.split("-");
  if(splitDate.length != 3) {
    console.log("Please enter a valid date.");
    return;
  }

  var dateObject = new Date(splitDate[0], splitDate[1] - 1, splitDate[2], hour, minute, 0, 0);

  addItem(title, priority, dateObject.getTime());

  $("#task-input").val("");
  $("#priority-input").val("");
  $("#date-input").val("");
  refreshDOM();
}

function refreshDOM() {
  $(".todo").html("");
  var item;
  var dateObj = new Date();
  for(item in data.todoList) {

    //Create smaller components
    var title = $("<h3>").text(data.todoList[item].name);
    var priorityValue = data.todoList[item].priority;
    var priority;
    switch(priorityValue) {
      case 0: 
        priority = $("<h4>").text("Low");
        break;
      case 1: 
        priority = $("<h4>").text("Medium");
        break;
      case 2: 
        priority = $("<h4>").text("High");
        break;

    }
    if(priorityValue === 2){
      priority.addClass("red");
    }
    var dateobj = new Date(data.todoList[item].due_date);
    var duedate = $("<h4>").text("Due:"+dateobj.toLocaleDateString()+ " " + dateobj.toLocaleTimeString()); 

    var div = $("<div>");
    var points_label = $("<h6>").text("Points if copleted:");
    var points = $("<h6>").text(calculateScore(data.todoList[item], dateObj));
    points.addClass("tskPoints");
    div.append(points_label);
    div.append(points);
    
    var finished =$("<a>").html("Finished").addClass("complete button");
    var dateObject = new Date(data.todoList[item].timestamp);
    finished.attr('id', dateObject.getTime());
    finished.click(function() {
      completeTask(dateObject.getTime());
    });

    var todoAttributes = {
      "class": "task"
    }
    var todo = $("<li>", todoAttributes);
    if(data.todoList[item].complete){
      todo.addClass("done");
    }

    todo.append(title);
    todo.append(priority);
    todo.append(duedate);
    todo.append(div);
    todo.append(finished);
    $(".todo").append(todo);

    //Points and level
    $("#level").html(data.level);
    $("#points").html(data.total_points);

  }
}


function onTimer() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  switch(canvasState){
    case WELCOME:
      drawWelcome();
      break;
    case TASKADDED:
      drawTaskAdded();
      break;
    case TASKCOMPLETE:
      drawTaskComplete();
      break;
    case NEWHIGHSCORE:
      drawNewHighScore();
      break;
  }
}

function runCanvas() {
  canvas.focus();
  intervalID = setInterval(onTimer, TIMER_DELAY);
}

//RPG STUFF

//returns the priority multiplier times the number of hours ahead of due date you finished the task.
function calculateScore(task, time) {
  console.log("INSIDE CALCULATE SCORE");
  console.log("DUE DATE: " + task.due_date);
  var timeBeforeDue = new Date(task.due_date) - time;
  console.log("TIME BEFORE DUE: " + timeBeforeDue);

  return Math.floor(Math.pow((parseInt(task.priority) + 1), 2) * timeBeforeDue / MILLI_IN_HOUR) + 1;
}

function updateTotalPoints(score) {
  data.total_points += score;
}

function updateLevel() {
  if(data.total_points < 0) {
    data.level = 1;
  } else {
    data.level = Math.floor(data.total_points / POINTS_PER_LEVEL) + 1;
  }
}

function updateHighScore(time_period) {
  var date = new Date();
  var i;
  var highScore = 0;
  var numToDelete = 0;
  var history = data.completed_history;
  var COMPLETION_DATE_INDEX = 0;
  var SCORE_INDEX = 1;
  for(i = history.length - 1; i >= 0; i--) {
    if(date - history[i][COMPLETION_DATE_INDEX] > time_period) {
      history.splice(i, 1);
      numToDelete++;
    } else {
      highScore += history[i][SCORE_INDEX];
    }
  }
  $.ajax({
    type: "delete",
    url: "/todo/completed_history",
    data: {
      user: user,
      numToDelete: numToDelete
    },
    success: function() {

    }
  });
  if(highScore > data.high_score) {
    data.high_score = highScore;
    console.log("New high score in last 24 hours: " + data.high_score);
    canvasState = NEWHIGHSCORE;
  }
}

function completeTask(id) {
  var completionDate = new Date();
  var task = data.todoList[id];
  var score = calculateScore(task, complationDate);

  if(task.completed) {
    console.log("Error: task is already completed.");
    return;
  }
  
  console.log("TASK: " + JSON.stringify(task, null, 4));
  console.log("SCORE: " + score);

  $.ajax({
    type: "post",
    url: "/todo/complete",
    data: {
      user: user,
      id: id,
      completionDate: completionDate,
      points: score
    },
    success: function(response) {
      if(response.doesNotExist) {
        console.log("does not exist");
      } else {
        task.completed = true;
        console.log("PREVIOUS total points: " + data.total_points);
        updateTotalPoints(score);
        console.log("NEW total points: " + data.total_points);
        updateLevel();
        console.log("COMPLETED LAST 24 before: " + JSON.stringify(data.completed_history, null, 4));
        data.completed_history.push([completionDate, score]);
        console.log("COMPLETED LAST 24 after: " + JSON.stringify(data.completed_history, null, 4));
        console.log("PREV HIGH SCORE: " + data.high_score);
        updateHighScore(MILLI_IN_SECOND * 30);
        console.log("AFTER HIGH SCORE: " + data.high_score);
        updateUser();
      }
    },
    error: function(response) {
      console.log("something went wrong");
    }
  });
}

//TODO LIST

//update user page
function updateUser() {
  $.ajax({
    type: "put",
    url: "/profile",
    data: {
      user: user,
      level: data.level,
      powerups: data.powerups,
      total_points: data.total_points,
      high_score: data.high_score
    },
    success: function() {

    }
  });
}

//adds an item to the todo list
function addItem(name, priority, due_date) {
  var date = new Date();
  data.todoList[date.getTime()] =
    {
      "name": name,
      "priority": priority,
      "due_date": due_date,
      "timestamp": date,
      "completed": false
    };

  $.ajax({
    type: "post",
    url: "/todo",
    data: {
      user: user,
      name: name,
      priority: priority,
      due_date: due_date.toString(),
      timestamp: date
    },
    success: function() {
    
    },
    failure: function() {
      delete data.todoList[date.getTime()];
      refreshDOM();
    }
  });
}

//delete an item from the todo list
function deleteItem(date) {
  $.ajax({
    type: "delete",
    url: "/todo",
    data: {
      user: user,
      id: date
    },
    success: function() {
      delete data.todoList[date];
      refreshDOM();
    }
  });
}

//edit an item from the todo list
function editItem(date, name, priority, due_date, completed) {
  $.ajax({
    type: "put",
    url: "/todo",
    data: {
      user: user,
      id: date,
      name: name,
      priority: priority,
      due_date: due_date,
      completed: completed
    },
    success: function(response) {
      if(response.success) {
        data.todoList[date.getTime()] =
          {
            "name": name,
            "priority": priority,
            "due_date": due_date.toString(),
            "timestamp": date,
            "completed": completed
          };
      } else {
        console.log("item cannot be edited as it does not exist");
      }
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
        $(".login").addClass("clear");
        user = username;
      	data = response.userData;
      	console.log(data);
        refreshDOM();
      } else {
        $("#loginError").html("incorrect password");
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
        $(".login").addClass("clear");
        user = username;
        data = response.userData;
      } else {
        if(response.usernameTooShort) {
          $("#loginError").html("Please enter a valid username.(Username > 5 chars)");
        }
        if(response.passwordTooShort) {
          $("#loginError").html("Please enter a valid password.(5 or more characters");
        }
        if(response.alreadyExists) {
          $("#loginError").html("Sorry, that username is already taken.");
        }
      }
    }
  });
}
