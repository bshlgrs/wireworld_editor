var WireworldEditor = function (canvas, world) {
  this.world = world;
  // This is for debugging purposes.
  window.cont = this;

  this.canvas = canvas;
  this.ctx = canvas.getContext("2d");

  this.selecting = false;
  this.selectStart = undefined;
  this.selectEnd = undefined;

  this.colors = {"head": ["rgb(200,0,0)", "rgb(255,0,0)"],
                "tail": ["rgb(0,0,200)", "rgb(0,0,255)"],
                "wire": ["rgb(200,200,100)", "rgb(255,255,150)"]};

  this.mode = "view";
  this.stepTime = 100;

  var that = this;
  this.playing = false;

  this.drawCell = function(x, y, cellType) {
    if (cellType) {
      var startX = (x - this.world.screenX) * this.world.pixelsPerCell;
      var startY = (y - this.world.screenY) * this.world.pixelsPerCell;
      var selected = this.cellSelected(x, y)

      this.ctx.fillStyle = this.colors[cellType][0 + selected];

      var size;

      if (!selected) {
        if (this.world.pixelsPerCell > 10) {
          size = this.world.pixelsPerCell - 2;
        } else if (this.world.pixelsPerCell > 5) {
          size = this.world.pixelsPerCell - 1;
        } else {
          size = this.world.pixelsPerCell;
        }

        this.ctx.fillRect(startX, startY, size, size);
      } else {
        if (this.world.pixelsPerCell > 10) {
          size = this.world.pixelsPerCell - 4;
          this.ctx.fillRect(startX + 1, startY + 1, size, size);
        } else if (this.world.pixelsPerCell > 5) {
          size = this.world.pixelsPerCell - 2;
          this.ctx.fillRect(startX + 1, startY + 1, size, size);
        } else {
          size = this.world.pixelsPerCell;
          this.ctx.fillRect(startX, startY, size, size);
        }
      }
    }
  }

  this.cellSelected = function (x, y) {
    if (this.selectStart) {
      var start = that.calculateCell(this.selectStart);
      var end = that.calculateCell(this.selectEnd);
      return ((start.x <= x == end.x >= x) && (start.y <= y == end.y >= y));
    }
    return false;
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

    if (!this.playing) {
      this.ctx.fillStyle = "rgba(100, 100, 200, 0.2)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    if (this.selectStart) {
      if (this.selecting) {
        this.ctx.fillStyle = "rgba(150, 100, 256, 0.3)";
      } else {
        this.ctx.fillStyle = "rgba(100, 100, 256, 0.2)";
      }

      var start = that.selectStart;
      var end = that.selectEnd;
      this.ctx.fillRect(start.x, start.y, end.x - start.x, end.y - start.y);
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
      $("#play").addClass("active");
      $("#pause").removeClass("active");
      $("#fps").html("fps: ");
      setTimeout(this.step, this.stepTime);
    }
  };

  this.previousTime = Date.now();

  this.step = function () {
    if (that.playing) {
      setTimeout(that.step, that.stepTime);
      that.evolve();
      $("#fps").html("fps: "+ (1000 / (Date.now() - that.previousTime)))
      that.previousTime = Date.now()
    }
  };

  this.pause = function () {
    this.playing = false;
    $("#play").removeClass("active");
    $("#pause").addClass("active");
    this.drawWorld();
    $("#fps").html("paused");
  };

  this.getMousePos = function (canvas, e) {
    var rect = that.ctx.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  this.calculateCell = function (pos) {
    return {x: Math.floor(pos.x / that.world.pixelsPerCell + that.world.screenX),
            y: Math.floor(pos.y / that.world.pixelsPerCell + that.world.screenY)};
  }

  this.getMouseCell = function (canvas, evt) {
    var pos = this.getMousePos(canvas, evt);
    return {x: Math.floor(pos.x / that.world.pixelsPerCell + that.world.screenX),
            y: Math.floor(pos.y / that.world.pixelsPerCell + that.world.screenY)};
  }

  this.getCell = function (x, y) {
    return this.world.getCell(x, y);
  }

  this.placeCell = function (x, y, type) {
    return this.world.placeCell(x, y, type);
  }

  this.mousePressed = false;

  this.handleClick = function(e) {
    that.mousePressed = true;
    that.mousePos = that.getMousePos(that.canvas, e);
    Behaviors[that.mode].handleClick(that, e, that.getMouseCell(that.canvas, e));
    e.preventDefault();
  };

  this.handleUnclick = function(e) {
    that.mousePressed = false;
    that.selecting = false;
    that.drawWorld();

    if (Behaviors[that.mode].handleUnclick) {
      Behaviors[that.mode].handleUnclick(that, e, that.getMouseCell(that.canvas, e))
    }

    that.lastDrawn = undefined;
  }

  this.handleDrag = function(e) {
    that.mousePos = that.getMousePos(that.canvas, e);
    var cell = that.getMouseCell(that.canvas, e);
    $("#coords").html(cell.x + "," + cell.y);
    if (that.mousePressed && Behaviors[that.mode].handleDragWhileClicked) {
      Behaviors[that.mode].handleDragWhileClicked(that, e, cell);
    }
  }

  this.drawWorld();
  this.step();

  $(canvas).on("mousedown", this.handleClick);
  $(canvas).on("mouseup", this.handleUnclick);
  $(canvas).mousemove(this.handleDrag);

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

  this.changeMode = function (newMode) {
    that.mode = newMode;
    $(".mode-selector").removeClass("active");
    $(_.filter($(".mode-selector"), function(x) {
      return $(x).data("mode") == newMode;
    })[0]).addClass("active");

  };

  var key_bindings = {
        86: "view",
        73: "ignite",
        80: "pen",
        83: "select",
        77: "move",
        68: "douse",
        69: "erase"};

  $("body").keydown(" ", function (e) {
    if (e.which == 32) {
      if (that.playing) {
        that.pause();
      } else {
        that.play();
      }
    } else if (key_bindings[e.which]) {
      that.changeMode(key_bindings[e.which]);
    }
  });

  $(".mode-selector").on("click", function (e) {
    that.changeMode($(e.currentTarget).data('mode'));
  });

  $("#play").on("click", function(e) {
    that.play();
  });

  $("#pause").on("click", function(e) {
    that.pause();
  });

  $("#step").on("click", function(e) {
    that.evolve();
  });

  $("#clear").on("click", function (e) {
    that.clear();
  });

  $("#save").on('click', function (e) {
    that.world.save();
  });

  $("#zoom_in").on('click',function(e){
    that.zoomIn();
  });

  $("#zoom_out").on('click',function(e){
    that.zoomOut();
  });

  $("#filename").html(this.world.name);
};

