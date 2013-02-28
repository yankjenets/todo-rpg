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

/*****************
 * Canvas Controls
 *****************/

$(document).ready(function(){
  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext("2d");


  $("#userSignon").click(function() {
    userLoginDOM();
  });
  
  $("#userSignout").click(function() {
    userLogoutDOM();
  });

  $("#userRegister").click(function() {
    userRegisterDOM();
  });

  $("#submitTask").click(function() {
    addItemDOM();
  });

  $("#achievementButton").click(function() {
    showAchievements();
  });

  $("#todoButton").click(function() {
    hideAchievements();
  });

  resetDateFields();

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
var taskMSG = new DynamicText("task", 0, 0, .3);
var scoreMSG = new DynamicText("score", 20, 50, 0);

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

function setCanvasScore(score){
  scoreMSG.txt = "You Gained "+score+" points!";
  canvasState = TASKCOMPLETE;
}

function drawTaskComplete(){
  ctx.fillStyle = "#555";
  ctx.font = "bold 40px Nuntio";
  ctx.textAlign = "start";

  ctx.fillText(scoreMSG.txt, scoreMSG.x, scoreMSG.y);
  drawTime();

}

function setTaskToDraw(task) {
  taskMSG.txt = task +" Added.";
  canvasState = TASKADDED;
}

function drawTaskAdded() {
  ctx.fillStyle = "#555";
  ctx.font = "bold 40px Nuntio";
  ctx.textAlign = "start";

  if(taskMSG.y < 70){
  taskMSG.y= taskMSG.y+taskMSG.speed;
  }

  ctx.fillText(taskMSG.txt, taskMSG.x, taskMSG.y);
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

function refreshData() {
  updateLevel();
  updateHighScore(MILLI_IN_24_HOURS * 30);
  updateAchievements();
  updateUser();
  refreshDOM();
}

function hideAchievements() {
  $(".wrapper").removeClass("clear");
  $(".achievements").addClass("clear");
}

function showAchievements() {
  $("#achievementList").html(""); 
  var achievement;
  var i;
  for(i = 0; i < data.achievements.length; i++) {
    achievement = data.achievements[i];
    var achievementAttributes = {
      "class": "task"
    }
    var description = $("<h6>").text(achievement.description);
    achievementObject = $("<li>", achievementAttributes);
    achievementObject.append(description);
    if(!(achievement.completed === true || achievement.completed === "true")) {
      achievementObject.addClass("grayedOut");
    }
    $("#achievementList").append(achievementObject);
  }

  $(".wrapper").addClass("clear");
  $(".achievements").removeClass("clear");
}

function resetDateFields() {
  var currDate = new Date();
  var today = currDate.toISOString().split("T")[0];
  var hour = currDate.getHours();
  var minute = currDate.getMinutes();
  if(minute < 10) {
    minute = "0" + minute;
  }
  $("#date-input").val(today);
  $("#hour-input").val(hour % 12);
  if($("#hour-input").val() == "0") {
    $("#hour-input").val(12);
  }
  $("#minute-input").val(minute);
  if(hour > 12) {
    $("#time-parity-input").val(12);
  } else {
    $("#time-parity-input").val(0);
  }
}

function userLoginDOM() {
  var username = $("#username").val();
  var password = $("#pass").val();

  login(username, password);
}

function userLogoutDOM() {
  $(".login").removeClass("clear");
  $(".wrapper").addClass("clear");
  logout(user);
  user = undefined;
  data = [];
}

function userRegisterDOM() {
  var username = $("#username").val();
  var password = $("#pass").val();

  new_user(username, password);
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
    $("#taskInputError").html("Defaulting to midnight since a valid time was not entered.");
  } else {
    hour += time_parity;
  }
  var splitDate = date.split("-");
  if(splitDate.length != 3) {
    $("#taskInputError").html("Please enter a valid date.");
    return;
  }
  if(title === "") {
    $("#taskInputError").html("Please enter a task name.");
    return;
  }

  var dateObject = new Date(splitDate[0], splitDate[1] - 1, splitDate[2], hour, minute, 0, 0);

  setTaskToDraw(title);
  addItem(title, priority, dateObject.getTime());

  $("#task-input").val("");
  $("#priority-input").val("");

  resetDateFields();
  refreshDOM();
}

function refreshDOM() {
  $(".todo").html("");
  var item;
  var dateObj = new Date();
  for(item in data.todoList) {

    //Create smaller components
    var title = $("<h3>").text(data.todoList[item].name);
    var priorityValue = parseInt(data.todoList[item].priority);
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
    var dateobj = new Date(parseInt(data.todoList[item].due_date));
    var duedate = $("<h4>").text("Due:"+dateobj.toLocaleDateString()+ " " + dateobj.toLocaleTimeString()); 

    var div = $("<div>");
    var points_label = $("<h6>").text("Points if completed:");
    var points = $("<h6>").text(calculateScore(data.todoList[item], dateObj));
    points.addClass("tskPoints");
    div.append(points_label);
    div.append(points);

    //HTML for buying things. 
    var powerups = $("<select>").addClass("powerups");
    var i;
    for(i = 0; i < data.powerups.length; i++) {
      var powerup = $("<option>").attr("value", data.powerups[i].id).html(data.powerups[i].description + " (" + data.powerups[i].cost + " points)");
      powerups.append(powerup);
    }

    
    //Get id for use in functions
    var dateObject = data.todoList[item].timestamp;

    var usepower = $("<a>").html("Use").addClass("usePower button");
    usepower.click(usePowerUp(data.todoList[item]));
    
    //Buttons to finish/delete tasks
    var finished =$("<a>").html("Finished").addClass("complete button");
    var deleteBut = $("<a>").html("Delete").addClass("delete button");
    var buttonCont = $("<div>").addClass("buttonCont");
    buttonCont.append(deleteBut);
    buttonCont.append(finished);

    finished.attr('id', dateObject);
    finished.click(completeClick(dateObject));

    deleteBut.attr('id', dateObject);
    deleteBut.click(deleteClick(dateObject));

    var todoAttributes = {
      "class": "task"
    }
    var todo = $("<li>", todoAttributes);
    if(String(data.todoList[item].completed) === "true") {
      todo.removeClass("task").addClass("done task");
    }

    todo.append(title);
    todo.append(priority);
    todo.append(duedate);
    todo.append(div);
    todo.append(powerups);
    todo.append(usepower);
    todo.append(buttonCont);
    $(".todo").append(todo);

  }

  //Points and level
  $("#level").html(data.level);
  $("#points").html(data.total_points);
  $("#running_total").html(data.running_total);
  $("#high_score").html(data.high_score);

  $("#taskInputError").html("");
}

function usePowerUp(item){
  return function(){
    var index = parseInt($(this).parent().children("select").find(":selected").val());
    var cost = parseInt(data.powerups[index].cost);
    if(data.total_points > cost) {
      switch(index) {
        case 0:
          item.due_date = String(parseInt(item.due_date) + MILLI_IN_24_HOURS);
          //subtract cost from your points
          updateTotalPoints(-1 * parseInt(data.powerups[index].cost));
          break;
        case 1:
          if(item.priority < 2) {
            item.priority = String(parseInt(item.priority) + 1);
            updateTotalPoints(-1 * parseInt(data.powerups[index].cost));
          } else {
            $("#taskInputError").html("Already at highest priority.");
            return;
          }
          break;
      }
    } else {
      $("#taskInputError").html("You do not have enough points to use that powerup.");
      return;
    }
    //send new item stats to the server
    editItem(item.timestamp, item.name, item.priority, item.due_date, item.completed);
    refreshData();
  }
}

function completeClick(date) {
  return function() {
    completeTask(date);
    $(this).addClass("clear");
    refreshDOM();
  }
}

function deleteClick(date) {
  return function() {
    deleteItem(date);
    refreshDOM();
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
  var timeBeforeDue = new Date(parseInt(task.due_date)) - time;
  return Math.floor(Math.pow((parseInt(task.priority) + 1), 2) * timeBeforeDue / MILLI_IN_HOUR) + 1;
}

function updateTotalPoints(score) {
  data.total_points = parseInt(data.total_points) + parseInt(score);
}

function updateLevel() {
  if(data.total_points < 0) {
    data.level = 1;
  } else {
    data.level = Math.floor(data.total_points / POINTS_PER_LEVEL) + 1;
  }
}

function updateAchievements() {
  if(data.total_tasks >= 1) {
    data.achievements[0].completed = true;
  } else {
    data.achievements[0].completed = false;
  }

  if(data.total_tasks >= 5) {
    data.achievements[1].completed = true;
  } else {
    data.achievements[1].completed = false;
  }

  if(data.level >= 5) {
    data.achievements[4].completed = true;
  } else {
    data.achievements[4].completed = false;
  }

  if(data.total_points >= 1000) {
    data.achievements[5].completed = true;
  } else {
    data.achievements[5].completed = false;
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
      highScore = parseInt(highScore) + parseInt(history[i][SCORE_INDEX]);
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
  data.running_total = highScore;
}

function completeTask(id) {
  var completionDate = new Date();
  var task = data.todoList[id];
  var score = calculateScore(task, completionDate);

  if(task.completed) {
    console.log("Error: task is already completed.");
    return;
  }

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
        updateTotalPoints(score);
        data.total_tasks = parseInt(data.total_tasks) + 1;
        data.completed_history.push([completionDate, score]);
        console.log("priority: " + task.priority);
        if(task.priority == 2) {
          data.achievements[2].completed = true;
        }
        if(score >= 100) {
          data.achievements[3].completed = true;
        }
        if(parseInt(task.due_date) - parseInt(completionDate.getTime()) >= MILLI_IN_24_HOURS) {
          data.achievements[6].completed = true;
        }

        refreshData();
        setCanvasScore(score);
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
      high_score: data.high_score,
      running_total: data.running_total,
      total_tasks: data.total_tasks,
      achievements: data.achievements
    },
    success: function() {

    }
  });
}

//adds an item to the todo list
function addItem(name, priority, due_date) {
  var date = new Date().getTime();
  data.todoList[date] =
    {
      "name": name,
      "priority": priority,
      "due_date": due_date.toString(),
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
      delete data.todoList[date];
      refreshDOM();
    }
  });
}

//edit an item from the todo list
function editItem(timestamp, name, priority, due_date, completed) {
  $.ajax({
    type: "put",
    url: "/todo",
    data: {
      user: user,
      timestamp: timestamp,
      name: name,
      priority: priority,
      due_date: due_date,
      completed: (String(completed) === "true")
    },
    success: function(response) {
      if(response.success) {

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
        $("#loginError").html("");
        $(".login").addClass("clear");
        $(".wrapper").removeClass("clear");
        user = username;
      	data = response.userData;
        $("#username").val("");
        $("#pass").val("");
        refreshData();
        refreshDOM();
      } else {
        //only clear password field if failed login
        $("#pass").val("");
        if(response.doesNotExist) {
          $("#loginError").html("User does not exist.");
        }
        if(response.wrongPassword) {
          $("#loginError").html("Incorrect password");
        }
      }
  	}
  });
}

function logout() {
  $.ajax({
    type: "put",
    url: "/logout",
    data: {user: user},
    success: function(response) {

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
        user = username;
        data = response.userData;
        login(username, password);
      } else {
        //only clear password field if failed register
        $("#pass").val("");
        if(response.usernameTooShort) {
          $("#loginError").html("Please enter a valid username.(5 or more characters)");
        }
        if(response.passwordTooShort) {
          $("#loginError").html("Please enter a valid password.(5 or more characters)");
        }
        if(response.alreadyExists) {
          $("#loginError").html("Sorry, that username is already taken.");
        }
      }
    }
  });
}
