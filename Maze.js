/*
Maze -> inits the new square Grid/Cell lengths
 gridSize -> amount of cells on each grid side
 cellSize -> length of each cell wall

Maze.create -> Generates a random maze with the given algorithm, draws it
 context -> The 2D Canvas context
 algorithm -> The String name of the algorithm
*/
var direction = Object.freeze({
  NORTH : 1,
  EAST : 2,
  SOUTH : 3,
  WEST : 4
});
function Maze(gridSize, cellSize) {
  var gridLength = gridSize;
  var cellLength = cellSize;
  var grid;
  this.create = function(context,algorithm) {
    grid = new Grid(gridLength, cellLength);
    if(algorithm==="Aldous Broder") {
      grid.aldousbroder();
    }
    else if(algorithm==="Sidewinder") {
      grid.sidewinder();
    }
    else {
      throw 'Algorithm given does not exist. Use "Aldous Broder" or "Sidewinder"';
    }
    grid.draw(context);
  }
}

function Cell(xPos, yPos, sz) {
  var x = xPos*sz;
  var y = yPos*sz;
  var northCell = null;
  var eastCell = null;
  var southCell = null;
  var westCell = null;
  var northWall = true;
  var eastWall = true;
  var southWall = true;
  var westWall = true;
  var visited = false;
  var size = sz;

  this.draw = function(context) {
    context.moveTo(x,y);
    northWall ? context.lineTo(x+size,y) : context.moveTo(x+size,y);
    context.stroke();
    eastWall ? context.lineTo(x+size,y+size) : context.moveTo(x+size,y+size);
    context.stroke();
    southWall ? context.lineTo(x,y+size) : context.moveTo(x,y+size);
    context.stroke();
    westWall ? context.lineTo(x,y) : context.moveTo(x,y);
    context.stroke();
  };
  this.carve = function(dir) {
    switch(dir) {
      case direction.NORTH:
        if(northCell)
          northCell.setSouthWall(false);
        northWall= false;
        break;
      case direction.EAST:
        if(eastCell)
          eastCell.setWestWall(false);
        eastWall = false;
        break;
      case direction.SOUTH:
        if(southCell)
          southCell.setNorthWall(false);
        southWall = false;
        break;
      case direction.WEST:
        if(westCell)
          westCell.setEastWall(false);
        westWall = false;
        break;
    }
  };
  this.setNorthCell = function(cell) {
    northCell = cell;
  };
  this.setEastCell = function(cell) {
    eastCell = cell;
  };
  this.setSouthCell = function(cell) {
    southCell = cell;
  };
  this.setWestCell = function(cell) {
    westCell = cell;
  };
  this.setNorthWall = function(wallBool) {
    northWall = wallBool;
  };
  this.setEastWall = function(wallBool) {
    eastWall = wallBool;
  };
  this.setSouthWall = function(wallBool) {
    southWall = wallBool;
  };
  this.setWestWall = function(wallBool) {
    westWall = wallBool;
  };
  this.getVisited = function() {
    return visited;
  };
  this.visit = function() {
    visited=true;
  };
  this.print = function() {
    console.log(this);
  }
}
function Grid(gridSize, cellSize) {
  var cell = [];
  for(var i = 0; i < gridSize; i++) {
    var row = [];
    for(var j = 0; j < gridSize; j++) {
      row.push(new Cell(i,j,cellSize));
    }
    cell.push(row);
  }
  for(var i = 0; i < gridSize; i++) {
    for(var j = 0; j < gridSize; j++) {
      if(j!==0)
        cell[i][j].setNorthCell(cell[i][j-1]);
      if(i+1!==gridSize)
        cell[i][j].setEastCell(cell[i+1][j]);
      if(j+1!==gridSize)
        cell[i][j].setSouthCell(cell[i][j+1]);
      if(i!==0)
        cell[i][j].setWestCell(cell[i-1][j]);
    }
  }
  this.draw = function(context) {
    for(var i = 0; i < gridSize; i++) {
      for(var j = 0; j < gridSize; j++) {
        cell[i][j].draw(context);
      }
    }
  };
  this.print = function() {
    for(var i = 0; i < gridSize; i++) {
      for(var j = 0; j < gridSize; j++) {
        cell[i][j].print();
      }
    }
  }
  this.sidewinder = function() {
    for(var j = gridSize-1; j >= 0; j--) {
      var k = 1; //The run
      for(var i = 0; i < gridSize; i++) {
        if(i+1===gridSize && j===0) //Northeast corner
          continue;
        else if(j===0) //Furthest north cells
          cell[i][j].carve(direction.EAST);
        else {
          var a = Math.random();
          if(a > .5) {//Go east
            k++;
            cell[i][j].carve(direction.EAST);
          }
          else { //Go north
            if(k===1)
              cell[i][j].carve(direction.NORTH);
            else {
              this.randCellOutOfRun(i,j,k-1).carve(direction.NORTH);
              k=1;
            }
          }
        }
      }
    }
  };
  this.randCellOutOfRun = function(i,j,k) {
    var divider = 1.0/k;
    var rand = Math.random();
    for(var d = 0.1; d < 1; d+=divider) {
      if(rand<=d){
        return cell[i-k][j];
      }
      k--;
    }
    return cell[i][j];
  };
  this.aldousbroder = function() {
    var a = Math.floor(Math.random()*(gridSize-1));
    var b = Math.floor(Math.random()*(gridSize-1));

    var c;
    var visitCount=0;
    while(visitCount!==gridSize*gridSize) {

      c = Math.random();
      if(c<.25) { //North
        if(b!==0) {
          visitCount += this.tryMove(cell[a][b],cell[a][b-1], direction.NORTH);
          b--; //Move North
        }
      }
      else if(c<.50) {//East
        if(a+1!==gridSize) {
          visitCount += this.tryMove(cell[a][b],cell[a+1][b], direction.EAST);
          a++;
        }
      }
      else if (c<.75) {
        if(b+1!==gridSize) {
          visitCount += this.tryMove(cell[a][b],cell[a][b+1], direction.SOUTH);
          b++;
        }
      }
      else {
        if(a!==0) {
          visitCount += this.tryMove(cell[a][b],cell[a-1][b], direction.WEST);
          a--;
        }
      }
    }
  };
  this.tryMove = function(A,B, dir) {
    if(!B.getVisited()) {
      B.visit();
      A.carve(dir);
      return 1;
    }
    return 0;
  };
}
