var app = angular.module('wireworld', []);

app.controller("EditorController", function () {
  this.world = {26: {23:"head", 24:"tail",25:"wire"},
             27: {22:"wire",26:"wire"},
             28: {23:"wire",24:"wire",25:"wire"}};

  window.cont = this;

  this.pixelsPerCell = 20;
  this.screenX = 0;
  this.screenY = 0;
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
      var startX = (x - this.screenX) * this.pixelsPerCell;
      var startY = (y - this.screenY) * this.pixelsPerCell;
      this.ctx.fillStyle = this.colors[cellType];
      this.ctx.fillRect(startX, startY, this.pixelsPerCell, this.pixelsPerCell);
    }
  }

  this.drawWorld = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (var y in this.world) {
      if (this.world.hasOwnProperty(y)) {
        for (var x in this.world[y]) {
          if (this.world[y].hasOwnProperty(x)) {
            this.drawCell(x, y, this.world[y][x]);
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

    for (var y in this.world) {
      if (this.world.hasOwnProperty(y)) {
        y = parseInt(y);
        newWorld[y] = {}
        for (var x in this.world[y]) {
          if (this.world[y].hasOwnProperty(x)) {
            x = parseInt(x);
            var cell = this.world[y][x];

            if (cell == "tail") {
              newWorld[y][x] = "wire";
            } else if (cell == "head") {
              newWorld[y][x] = "tail"
            } else if (cell == "wire") {
              var count = 0;
              for (var dx = -1; dx <= 1; dx++) {
                for (var dy = -1; dy <= 1; dy++) {
                  if (this.world[y+dy] && this.world[y+dy][x+dx] == "head") {
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
    this.world = newWorld;
    this.drawWorld();
  };

  this.play = function () {
    if (!this.playing) {
      this.playing = true;
      this.evolve();
      setTimeout(this.step, this.stepTime);
    }
  };

  this.step = function () {
    if (that.playing) {
      that.evolve();
      setTimeout(that.step, that.stepTime);
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
    return {x: Math.floor(pos["x"] / this.pixelsPerCell + that.screenX),
            y: Math.floor(pos["y"] / this.pixelsPerCell + that.screenY)};
  }

  this.placeCell = function (x, y, type) {
    if (!that.world[y]) {
      that.world[y] = {};
    }

    that.world[y][x] = type;
  }

  this.getCell = function (x, y) {
    return that.world[y] && that.world[y][x];
  };

  this.mousePressed = false;

  this.handleClick = function(e) {
    that.mousePressed = true;
    if (that.mode=="view") {
      var pos = that.getMousePos(that.canvas, e);
      that.dragX = pos.x;
      that.dragY = pos.y;
    } else if (that.mode == "draw") {
      var cell = that.getMouseCell(that.canvas, e);
      that.placeCell(cell.x, cell.y, "wire");
      that.lastDrawn = cell;
      that.drawWorld();
    } else if (that.mode == "ignite") {
      var cell = that.getMouseCell(that.canvas, e);
      if (that.getCell(cell.x, cell.y) == "wire") {
        that.placeCell(cell.x, cell.y, "head");
        that.lastDrawn = cell;
        that.drawWorld();
      }
    } else if (that.mode == "select") {
      var pos = getMousePos(canvas, e);
      that.selecting = true;
      selectStartX = pos.x;
      selectStartY = pos.y;
    }
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

    $("#coords").html(cell.x + "," + cell.y)
    if (that.mode == "view" && that.mousePressed) {
      var pos = that.getMousePos(that.canvas, e);
      that.screenX += (that.dragX - pos.x)/that.pixelsPerCell;
      that.screenY += (that.dragY - pos.y)/that.pixelsPerCell;
      that.dragX = pos.x;
      that.dragY = pos.y;
      that.drawWorld();
    } else if (that.mode == "draw" && that.mousePressed) {
      if (that.lastDrawn) {
        Helper.drawLine(that.lastDrawn.x, that.lastDrawn.y, cell.x, cell.y,
          function (x, y) {
          that.placeCell(x, y, "wire");
        });
        that.lastDrawn = cell;
        that.drawWorld();
      } else {
        debugger;
        console.log("I don't think this should happen")
      }
    } else if (that.mode == "ignite" && that.mousePressed) {
      if (that.lastDrawn && (cell.x != that.lastDrawn.x || cell.y != that.lastDrawn.y)) {
        if (that.getCell(cell.x, cell.y) == "wire") {
          that.placeCell(cell.x, cell.y, "tail");
          that.lastDrawn = undefined;
          that.drawWorld();
        }
      }
    } else if (that.mode == "select" && that.mousePressed) {
      console.log(that.selecting);
      drawWorld();
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
    that.pixelsPerCell *= this.scalingFactor;
    that.screenX += that.canvas.width / (2.5*that.pixelsPerCell*this.scalingFactor);
    that.screenY += that.canvas.height / (2.5*that.pixelsPerCell*this.scalingFactor)
    that.drawWorld();
  };

  this.zoomOut = function() {
    that.screenX -= that.canvas.width / (2.5*that.pixelsPerCell*this.scalingFactor);
    that.screenY -= that.canvas.height / (2.5*that.pixelsPerCell*this.scalingFactor)
    that.pixelsPerCell /= this.scalingFactor;
    that.drawWorld();
  };

  this.clear = function () {
    this.world = {};
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

    for (row in this.world) {
      if (this.world.hasOwnProperty(row)) {
        for (cell in this.world[row]) {
          result[this.world[row][cell]] += 1;
        }
      }
    }

    return result;
  };
});
