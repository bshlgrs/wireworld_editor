$(function () {
  var Behaviors = window.Behaviors = {};

  var deselect = function (that) {
    that.selecting = false;
    that.selectStart = undefined;
    that.selectEnd = undefined;
  }

  Behaviors.view = {
    handleClick: function (that, e, cell) {
      deselect(that);
      var pos = that.getMousePos(that.canvas, e);
      that.dragX = pos.x;
      that.dragY = pos.y;
    },
    handleDragWhileClicked: function (that, e, cell) {
      var pos = that.getMousePos(that.canvas, e);
      that.world.screenX += (that.dragX - pos.x)/that.world.pixelsPerCell;
      that.world.screenY += (that.dragY - pos.y)/that.world.pixelsPerCell;
      that.dragX = pos.x;
      that.dragY = pos.y;
      that.drawWorld();
    }
  };


  Behaviors.pen = {
    handleClick: function (that, e, cell) {
      deselect(that);
      if (!that.getCell(cell.x, cell.y)) {
        that.placeCell(cell.x, cell.y, "wire");
        that.lastDrawn = cell;
        that.drawWorld();
      }
    },
    handleDragWhileClicked: function (that, e, cell) {
      if (!that.getCell(cell.x, cell.y)) {
        if (that.lastDrawn) {
          Helper.drawLine(that.lastDrawn.x, that.lastDrawn.y, cell.x, cell.y,
            function (x, y) {
            that.placeCell(x, y, "wire");
          });
        } else {
          that.placeCell(cell.x, cell.y, "wire");
        }
        that.lastDrawn = cell;
        that.drawWorld();
      }
    }
  };

  Behaviors.ignite = {
    handleClick: function (that, e, cell) {
      deselect(that);
      if (that.getCell(cell.x, cell.y) == "wire") {
        that.placeCell(cell.x, cell.y, "head");
        that.lastDrawn = cell;
        that.drawWorld();
      }
    },
    handleDragWhileClicked: function(that, e, cell) {
      if (that.lastDrawn && (cell.x != that.lastDrawn.x || cell.y != that.lastDrawn.y)) {
        if (that.getCell(cell.x, cell.y) == "wire" || that.getCell(cell.x, cell.y) == "head") {
          that.placeCell(cell.x, cell.y, "tail");
          that.lastDrawn = undefined;
          that.drawWorld();
        }
      }
    }
  }

  Behaviors.douse = {
    handleClick : function (that, e, cell) {
      deselect(that);
      if (that.getCell(cell.x, cell.y) == "head") {
        that.placeCell(cell.x, cell.y, "tail");
        that.drawWorld();
      }
    },

    handleDragWhileClicked: function (that, e, cell) {
      if (that.getCell(cell.x, cell.y) == "head") {
        that.placeCell(cell.x, cell.y, "tail");
        that.drawWorld();
      }
    }
  }

  Behaviors.erase = {
    handleClick : function (that, e, cell) {
      deselect(that);
      that.placeCell(cell.x, cell.y, undefined);
      that.drawWorld();
    },

    handleDragWhileClicked: function (that, e, cell) {
      that.placeCell(cell.x, cell.y, undefined);
      that.drawWorld();
    }
  }

  Behaviors.select = {
    handleClick : function (that, e, cell) {
      if (that.selectStart && that.cellSelected(cell.x, cell.y)) {
        that.moving = true;
        // If the cursor is inside the area already selected...
        // we want to move the selection
        console.log("moving");
        that.lastDrawn = cell;
      } else {
        // we want to select
        that.selecting = true;
        that.selectStart = that.selectEnd = that.getMousePos(that.canvas, e);
      }
      that.drawWorld();
    },

    handleDragWhileClicked : function (that, e, cell) {
      if (that.moving) {
        // TODO: I need to move the box around here.

      } else {
        that.selectEnd = that.getMousePos(that.canvas, e);
      }

      that.drawWorld();
    },

    handleUnclick : function (that, e, cell) {
      that.selecting = false;
      that.drawWorld();
    }
  }

  Behaviors.move = {
    handleClick : function (that, e, cell) {
      deselect(that);
      that.selectedCellType = that.getCell(cell.x, cell.y);
      that.previousCellType = undefined;
      that.lastDrawn = cell;
    },
    handleDragWhileClicked : function (that, e, cell) {
      if (that.selectedCellType) {
        if (that.lastDrawn && (cell.x != that.lastDrawn.x || cell.y != that.lastDrawn.y)) {
          that.placeCell(that.lastDrawn.x, that.lastDrawn.y, that.previousCellType);
          that.previousCellType = that.getCell(cell.x, cell.y);
          that.placeCell(cell.x, cell.y, that.selectedCellType);
          that.lastDrawn = cell;
          that.drawWorld();
        }
      }
    }
  }

});