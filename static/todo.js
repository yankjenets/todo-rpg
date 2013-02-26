var data = [];
var user;

//constants

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

//DOM STUFF



function addItemDOM() {
  var description = $("#task-input").val();
  var priority = $("#priority-input").val();
  var date = $("#date-input").val();

  addItem(description, "", priority, date);

  $("#task-input").val("");
  $("#priority-input").val("");
  $("#date-input").val("");
  refreshDOM();
}

function refreshDOM() {
  $(".todo").html("");
  var item;
  for(item in data) {
    var todoAttributes = {
      "class": "task"
    }
    var todo = $("<li>", todoAttributes);
    $(".todo").append(todo);
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
    // TODO run sprite animation here or some shit
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
      data.todoList[date] =
        {
          "name": name,
          "priority": priority,
          "due_date": due_date,
          "desc": desc,
          "timestamp": date,
          "completed": false
        };
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
    }
  });
}

//edit an item from the todo list
function editItem(id, name, desc, priority, due_date, completed) {
  $.ajax({
    type: "put",
    url: "/todo",
    data: {
      user: user,
      id: id,
      name: name,
      desc: desc,
      priority: priority,
      due_date: due_date,
      completed: completed
    },
    success: function(response) {
      if(response.success) {
        data.todoList[id] =
          {
            "name": name,
            "priority": priority,
            "due_date": due_date,
            "desc": desc,
            "timestamp": id ,
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