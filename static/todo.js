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

var canvasState = NEWHIGHSCORE;

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


  $("#submitTask").click(function() {
    addItemDOM();
  });

//DOM STUFF

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

  var dateObject = new Date(splitDate[0], splitDate[1], splitDate[2], hour, minute, 0, 0);

  addItem(title, priority, dateObject);

  $("#task-input").val("");
  $("#priority-input").val("");
  $("#date-input").val("");
  refreshDOM();
}

function refreshDOM() {
  $(".todo").html("");
  var item;
  for(item in data.todoList) {

    var descriptionObject = $("<p>").text(data.todoList[item].name);
    var todoAttributes = {
      "class": "task"
    }
    var todo = $("<li>", todoAttributes);

    todo.append(descriptionObject);
    $(".todo").append(todo);
/*
    <li id="01" class="task">
          <h3>Description</h3>
          <h4 class="red">High</h4>
          <h4>Due: 2/12/13</h4>
          <div>
            <h6>Points if Completed today:</h6>
            <h6 class="tskPoints">120</h6>
          </div>
          <p> This is the Long Description......</p>

          <a id="01" class="complete">Finished!</a>
        </li>
*/

/*

      var deleteAttributes = {
        "href" : "#",
        "onclick" : "delRefresh(" + i + ")"
      };
      var deleteButton = $("<a>", deleteAttributes).text("Delete");

      var soldAttributes = {
        "href" : "#",
        "onclick" : "sold(" + i + ")"
      };
      var soldButton = $("<a>", soldAttributes).text("Sold!");

      var authorObject = $("<h3>").text(listings[i].author);
      var dateObject = $("<h6>").text(listings[i].date);
      var descObject = $("<p>").text(listings[i].desc);
      var priceObject = $("<p>").text("$" + listings[i].price);

      var soldClass = "notSold";
      if(listings[i].sold) {
        soldClass = "sold";
      }
      var listingAttributes = {
        //"id" : listings[i].date.toString().replace(/[!\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g, ''),
        "class" : soldClass
      }
      var listing = $("<li>", listingAttributes);
      authorObject.appendTo(listing);
      dateObject.appendTo(listing);
      descObject.appendTo(listing);
      priceObject.appendTo(listing);
      deleteButton.appendTo(listing);
      soldButton.appendTo(listing);

      $(".listings").append(listing);
    }*/
  }
}


function onTimer() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  switch(canvasState){
    case WELCOME:
      drawWelcome();
      break;
    case TASKADDED:
      drawAddedask();
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
  var timeBeforeDue = task.due_date - time;
  return Math.floor(task.priority.value * timeBeforeDue / MILLI_IN_HOUR) + 1;
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

  //TODO: FOR DEBUGGING ONLY DELETE LATER!!!
  if(id == -1) {
    var x;
    for(x in data.todoList) {
      id = x;
    }
  }

  var currTime = new Date();
  var task = data.todoList[id];
  var score = calculateScore(task, currTime);
  var completionDate = new Date();

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
      due_date: due_date,
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
      delete data.todoList[date.getTime()];
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
            "due_date": due_date,
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
        user = username;
    	data = response.userData;
    	console.log(data);
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
