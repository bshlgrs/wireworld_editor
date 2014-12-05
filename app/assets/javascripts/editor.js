var app = angular.module('wireworld', []);

app.controller("EditorController", function ($scope, $http) {

  this.world = {};
  this.world.grid = window.grid;

  // This is for debugging purposes.
  window.cont = this;

  this.world.pixelsPerCell = 20;
  this.world.screenX = 0;
  this.world.screenY = 0;

  this.canvas = $("#c")[0];
  this.ctx = this.canvas.getContext("2d");

  this.selecting = false;
  this.selectStartX = 0;
  this.selectStartY = 0;
  this.selectEndX = 0;
  this.selectEndY = 0;

  this.colors = {"head": "rgb(255,0,0)",
                "tail": "rgb(0,0,255)",
                "wire": "rgb(200,200,100)"};

  this.mode = "view";
  this.stepTime = 100;

  var that = this;
  this.playing = false;

  this.drawCell = function(x, y, cellType) {
    if (cellType) {
      var startX = (x - this.world.screenX) * this.world.pixelsPerCell;
      var startY = (y - this.world.screenY) * this.world.pixelsPerCell;
      this.ctx.fillStyle = this.colors[cellType];
      this.ctx.fillRect(startX, startY, this.world.pixelsPerCell, this.world.pixelsPerCell);
    }
  }

  this.drawWorld = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (var y in this.world.grid) {
      if (this.world.grid.hasOwnProperty(y)) {
        for (var x in this.world.grid[y]) {
          if (this.world.grid[y].hasOwnProperty(x)) {
            this.drawCell(x, y, this.world.grid[y][x]);
          }
        }
      }
    }

    if (! this.playing) {
      this.ctx.fillStyle = "rgba(100, 100, 200, 0.2)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    if (this.selecting) {
      ctx.strokeStyle = "rgba(100, 100, 200, 0.2)";
      var pos = getMousePos();
      ctx.strokeRect(selectStartX, selectStartY, pos.x, pos.y);
    }
  };

  this.evolve = function () {
    var newWorld = {};

    for (var y in this.world.grid) {
      if (this.world.grid.hasOwnProperty(y)) {
        y = parseInt(y);
        newWorld[y] = {}
        for (var x in this.world.grid[y]) {
          if (this.world.grid[y].hasOwnProperty(x)) {
            x = parseInt(x);
            var cell = this.world.grid[y][x];

            if (cell == "tail") {
              newWorld[y][x] = "wire";
            } else if (cell == "head") {
              newWorld[y][x] = "tail"
            } else if (cell == "wire") {
              var count = 0;
              for (var dx = -1; dx <= 1; dx++) {
                for (var dy = -1; dy <= 1; dy++) {
                  if (this.world.grid[y+dy] && this.world.grid[y+dy][x+dx] == "head") {
                    count++;
                  }
                };
              };

              if (count == 1 || count == 2) {
                newWorld[y][x] = "head";
              } else {
                newWorld[y][x] = "wire";
              }
            }
          }
        }
      }
    }
    this.world.grid = newWorld;
    this.drawWorld();
  };

  this.play = function () {
    if (!this.playing) {
      this.playing = true;
      this.evolve();
      setTimeout(this.step, this.stepTime);
    }
  };

  this.previousTime = Date.now();

  this.step = function () {
    if (that.playing) {
      that.evolve();
      setTimeout(that.step, that.stepTime);
      $("#fps").html("fps: "+ (1000 / (Date.now() - that.previousTime)))
      that.previousTime = Date.now()
    }
  };

  this.pause = function () {
    this.playing = false;
    this.drawWorld();
  };

  this.getMousePos = function (canvas, evt) {
    var rect = this.ctx.canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  this.getMouseCell = function (canvas, evt) {
    var pos = this.getMousePos(canvas, evt);
    return {x: Math.floor(pos["x"] / this.world.pixelsPerCell + that.world.screenX),
            y: Math.floor(pos["y"] / this.world.pixelsPerCell + that.world.screenY)};
  }

  this.placeCell = function (x, y, type) {
    if (!that.world.grid[y]) {
      that.world.grid[y] = {};
    }

    that.world.grid[y][x] = type;
  }

  this.getCell = function (x, y) {
    return that.world.grid[y] && that.world.grid[y][x];
  };

  this.mousePressed = false;

  this.handleClick = function(e) {
    that.mousePressed = true;
    Behaviors[that.mode].handleClick(that, e, that.getMouseCell(that.canvas, e));
    e.preventDefault();
  };

  this.handleUnclick = function(e) {
    that.mousePressed = false;
    that.selecting = false;
    that.drawWorld();

    that.lastDrawn = undefined;
  }

  this.handleDrag = function(e) {
    var cell = that.getMouseCell(that.canvas, e);
    $("#coords").html(cell.x + "," + cell.y);
    if (that.mousePressed) {
      Behaviors[that.mode].handleDragWhileClicked(that, e, cell);
    }
  }

  this.drawWorld();
  this.step();

  $("#c").on("mousedown", this.handleClick);
  $("#c").on("mouseup", this.handleUnclick);
  $("#c").mousemove(this.handleDrag);

  this.scalingFactor = 1.5;

  // What's 2.5 in the following functions? A magic number. I should probably
  // fix that at some point.

  this.zoomIn = function() {
    that.world.pixelsPerCell *= this.scalingFactor;
    that.world.screenX += that.canvas.width / (2.5*that.world.pixelsPerCell*this.scalingFactor);
    that.world.screenY += that.canvas.height / (2.5*that.world.pixelsPerCell*this.scalingFactor)
    that.drawWorld();
  };

  this.zoomOut = function() {
    that.world.screenX -= that.canvas.width / (2.5*that.world.pixelsPerCell*this.scalingFactor);
    that.world.screenY -= that.canvas.height / (2.5*that.world.pixelsPerCell*this.scalingFactor)
    that.world.pixelsPerCell /= this.scalingFactor;
    that.drawWorld();
  };

  this.clear = function () {
    this.world.grid = {};
    this.drawWorld();
  };

  $("#speed-controller").on("input", function () {
    var newSpeed = parseInt($("#speed-controller").val());
    that.stepTime = 150 - newSpeed*1.4;
  })

  window.onload = function() {
    var viewportWidth = window.innerWidth;
    var viewportHeight = window.innerHeight;

    var canvasWidth = viewportWidth;
    var canvasHeight = viewportHeight;
    that.canvas.setAttribute("width", canvasWidth);
    that.canvas.setAttribute("height", canvasHeight);
    that.canvas.style.top = (viewportHeight - canvasHeight) / 2;
    that.canvas.style.left = (viewportWidth - canvasWidth) / 2;
    that.canvas.visibility = 'normal';
  };

  window.onresize = function () {
    window.onload();
    that.drawWorld();
  };

  this.play();

  this.stats = function () {
    var result = {"head":0, "tail": 0, "wire": 0};

    for (row in this.world.grid) {
      if (this.world.grid.hasOwnProperty(row)) {
        for (cell in this.world.grid[row]) {
          result[this.world.grid[row][cell]] += 1;
        }
      }
    }

    return result;
  };

  this.save = function () {
    $http.post('/api/worlds', {world: {contents: this.world}}).
    success(function(data, status, headers, config) {
      debugger;
    }).
    error(function(data, status, headers, config) {
      debugger;
    });
  }

  var key_bindings = {
        86: "view",
        73: "ignite",
        80: "pen",
        68: "douse",
        69: "erase"};

  // CHECK THIS
  $("body").keydown(" ", function (e) {
    if (e.which == 32) {
      if (that.playing) {
        that.pause();
      } else {
        that.play();
      }
    } else if (key_bindings[e.which]) {
        that.mode = key_bindings[e.which];
    }
  });
});
