var cellsToFill = [0, 1, 1, 1, 0, 
                   1, 1, 1, 1, 1,
                   1, 0, 1, 0, 1,
                   0, 1, 0, 1, 0,
                   1, 0, 1, 0, 1,
                   1, 0, 0, 0, 1]

function drawAlien(size = 10){
  var columns = 5;
  var rows = 6;
  for(var i = 0; i < cellsToFill.length; i++){
    var x = i % columns
    var y = Math.floor(i / columns)
    if(cellsToFill[i]){
      rect(x * size, y * size, size, size)
    }
  }
}