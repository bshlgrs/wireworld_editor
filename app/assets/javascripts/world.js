(function () {
  var World = window.World = function (details) {
    if (details.grid && details.grid[0] == "{") {
      this.grid = JSON.parse(details.grid);
    } else {
      this.grid = details.grid || {};
    }

    this.pixelsPerCell = details.pixelsPerCell || 20;
    this.screenX = details.screenX || 0;
    this.screenY = details.screenY || 0;
    this.id = details.id;
    this.name = details.name || "Unnamed wireworld";
    this.description = details.description || "Write notes here!";
  }

  World.newWorld = function (grid) {
    var world = new World({});
    world.grid = grid;
    world.pixelsPerCell = 20;
    world.screenX = 0;
    world.screenY = 0;
    return world;
  }

  World.prototype.placeCell = function (x, y, type) {
    if (!this.grid[y]) {
      this.grid[y] = {};
    }

    this.grid[y][x] = type;
  }

  World.prototype.getCell = function (x, y) {
    return this.grid[y] && this.grid[y][x];
  };

  World.prototype.save = function () {
    if (this.id) {
      this.ajaxUpdate();
    } else {
      this.ajaxCreate();
    }
  }

  World.prototype.toJSON = function () {
    return {
      grid: JSON.stringify(this.grid),
      pixelsPerCell: this.pixelsPerCell,
      screenX: this.screenX,
      screenY: this.screenY,
      id: this.id,
      name: this.name,
      description: this.description
    };
  }

  World.prototype.ajaxCreate = function () {
    var that = this;
    $.ajax("/api/worlds",{
      type: "POST",
      data: {
        world: that.toJSON()
      },
      success: function (data, status) {
        that.id = data.id;
        console.log(data + " " + status);
      },
      error: function (thing, status, error) {
        console.log(status + " " + error);
      }
    });
  }

  World.prototype.ajaxUpdate = function () {
    var that = this;
    $.ajax("/api/worlds/"+this.id,{
      type: "PUT",
      data: {
        world: that.toJSON()
      },
      success: function (data, status) {
        console.log(data + " " + status);
      },
      error: function (thing, status, error) {
        console.log(status + " " + error);
      }
    });
  }
})();
