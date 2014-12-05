$(function () {
  var Behaviors = window.Behaviors = {};

  Behaviors.view = {
    handleClick: function (that, e, cell) {
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

  Behaviors.select = {
    handleClick: function (that, e, cell) {
      var pos = getMousePos(canvas, e);
      that.selecting = true;
      selectStartX = pos.x;
      selectStartY = pos.y;
    }
  }

  Behaviors.douse = {
    handleClick : function (that, e, cell) {
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
      that.placeCell(cell.x, cell.y, undefined);
      that.drawWorld();
    },

    handleDragWhileClicked: function (that, e, cell) {
      that.placeCell(cell.x, cell.y, undefined);
      that.drawWorld();
    }
  }
});