// The view of a perspective grid model
function PerspectiveGridView(gridModel, idMap, itemIdMap, numCols, numRows, startCol, startRow, width, height)
{
    PerspectiveGridView.baseConstructor.call(this, gridModel, idMap, itemIdMap, numCols, numRows, startCol, startRow, width, height);
}

KevLinDev.extend(PerspectiveGridView, LitGridView);

PerspectiveGridView.prototype.getLayoutX = function(x, y)
{
    return x + y;
}

PerspectiveGridView.prototype.getLayoutY = function(x, y)
{
    return y - x;
}

// In this case, we want to draw a diamond
PerspectiveGridView.prototype.drawView = function()
{
    for (var i = 0; i < this.numCols; i++)
    {
        for (var j = 0; j < this.numRows; j++)
        {
            var real_i = i - j;
            var real_j = i + j;
            this.drawCell(real_i + this.startCol, real_j + this.startRow);
            this.drawCell(real_i + this.startCol, real_j + this.startRow + 1);            
        }
    }
}

PerspectiveGridView.prototype.inView = function(x, y)
{
    
    var i = (x - this.startCol) + (y - this.startRow);
    var j = (y - this.startRow) - (x - this.startCol);

    return (i >= 0 && 
            i < this.numCols &&
            j >= 0 &&
            j < this.numRows);
}

