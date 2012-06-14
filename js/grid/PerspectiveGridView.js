// The view of a perspective grid model
function PerspectiveGridView(gridModel, idMap, itemIdMap, numCols, numRows, startCol, startRow, width, height)
{
    PerspectiveGridView.baseConstructor.call(this, gridModel, idMap, itemIdMap, numCols, numRows, startCol, startRow, width, height);

	this.extraBottomRows = 2; // Draw some extra bottom rows to avoid visual cutoff issues at the bottom.

	this.adjustCellBounds();
}

KevLinDev.extend(PerspectiveGridView, LitGridView);

PerspectiveGridView.prototype.setFixedCellCount = function(cellCountX)
{
    PerspectiveGridView.superClass.setFixedCellCount.call(this, cellCountX);   
	this.adjustCellBounds();
}

PerspectiveGridView.prototype.setViewSize = function(width, height)
{
    PerspectiveGridView.superClass.setViewSize.call(this, width, height);   
	this.adjustCellBounds();
}

// Calculate the max x and y.
PerspectiveGridView.prototype.adjustCellBounds = function()
{
	if (this.fixedCellCountX == null)
	{
		this.scaleFactor = 1.0;
		this.maxX = Math.ceil(this.viewWidth / this.cellWidth);
		this.maxY = Math.ceil(this.viewHeight / this.cellHeight / 2);
	}
	else
	{
		this.maxX = this.fixedCellCountX;

		// Work out how much scaling to apply
		this.scaleFactor = this.viewWidth / this.cellWidth / this.fixedCellCountX;

		// Also adjust the maximum y
		this.maxY = Math.ceil(this.viewHeight / this.cellHeight / this.scaleFactor);
	}
}

// Update the view appearance.
PerspectiveGridView.prototype.updateView = function()
{
	// Don't update if centre position is unset (can happen during init)
	if (this.cellCentreX == null)
		return;

	// Here is the grid, relative to the cellCentre:
	//    /\    /\    /\    /\    /\
	//   /  \  /  \  /  \  /  \  /  \
	//  / -1 \/  0 \/  1 \/  2 \/  3 \
	//  \ -3 /\ -2 /\ -1 /\  0 /\  1 /
	//   \  /  \  /  \  /  \  /  \  /
	//    \/ -1 \/  0 \/  1 \/  2 \/
	//    /\ -2 /\ -1 /\  0 /\  1 /\
	//   /  \  /  \  /  \  /  \  /  \
	//  / -2 \/ -1 \/  0 \/  1 \/  2 \
	//  \ -2 /\ -1 /\  0 /\  1 /\  2 /
	//   \  /  \  /  \  /  \  /  \  /
	//    \/ -2 \/ -1 \/  0 \/  1 \/
	//    /\ -1 /\  0 /\  1 /\  2 /\
	//   /  \  /  \  /  \  /  \  /  \
	//  / -3 \/ -2 \/ -1 \/  0 \/  1 \
	//  \ -1 /\  0 /\  1 /\  2 /\  3 /
	//   \  /  \  /  \  /  \  /  \  /
	//    \/    \/    \/    \/    \/
	// This grid shows the (i, j) coords of the cells.
	// We can convert to something more useful as follows:
	// x = j + i
	// y = j - i
	//    /\    /\    /\    /\    /\
	//   /  \  /  \  /  \  /  \  /  \
	//  / -4 \/ -2 \/  0 \/  2 \/  4 \
	//  \ -2 /\ -2 /\ -2 /\ -2 /\ -2 /
	//   \  /  \  /  \  /  \  /  \  /
	//    \/ -3 \/ -1 \/  1 \/  3 \/
	//    /\ -1 /\ -1 /\ -1 /\ -1 /\
	//   /  \  /  \  /  \  /  \  /  \
	//  / -4 \/ -2 \/  0 \/  2 \/  4 \
	//  \  0 /\  0 /\  0 /\  0 /\  0 /
	//   \  /  \  /  \  /  \  /  \  /
	//    \/ -3 \/ -1 \/  1 \/  3 \/
	//    /\  1 /\  1 /\  1 /\  1 /\
	//   /  \  /  \  /  \  /  \  /  \
	//  / -4 \/ -2 \/  0 \/  2 \/  4 \
	//  \  2 /\  2 /\  2 /\  2 /\  2 /
	//   \  /  \  /  \  /  \  /  \  /
	//    \/    \/    \/    \/    \/
	// This grid is 4 x 2 (the maxX and maxY vals)
	// We can convert back using
	// i = (x - y) / 2
	// j = (x + y) / 2

    for (var y = -this.maxY; y <= this.maxY + this.extraBottomRows; y++)
    {
		// Odd numbered rows are offset by 1
		var xOffset = (y % 2 == 0) ? 0 : 1;
        for (var x = xOffset; x <= this.maxX; x += 2)
        {
			// Convert back to native coordinates
            var i = (x - y) / 2;
            var j = (x + y) / 2;
            this.drawCell(i + this.cellCentreX, j + this.cellCentreY);
			if (x != 0)
			{
				i = (-x - y) / 2;
				j = (-x + y) / 2;
            	this.drawCell(i + this.cellCentreX, j + this.cellCentreY);
			}
		} 
    }

	// Set the cell Centre to be at (0,0) so we can do a scale. Then move it to the screen centre.
	var centreX = -(this.cellCentreX + this.cellCentreY) * this.cellWidth;
	var centreY = -(this.cellCentreY - this.cellCentreX) * this.cellHeight;
	
	// Show the transformed image. Note that the scaleFactor is divided by 2 - this is because
	// we actually show twice the maxX and maxY in width and height.
	this.transformLayer.setAttribute("transform", "translate(" + this.viewCentreX + "," + this.viewCentreY + ") scale(" + (this.scaleFactor / 2) + ") translate(" + centreX + "," + centreY + ")"); 
}

PerspectiveGridView.prototype.getLayoutX = function(i, j)
{
    return i + j;
}

PerspectiveGridView.prototype.getLayoutY = function(i, j)
{
    return j - i;
}

PerspectiveGridView.prototype.inView = function(i, j)
{
    var x = (i - this.cellCentreX) + (j - this.cellCentreY);
    var y = (j - this.cellCentreY) - (i - this.cellCentreX);

    return (Math.abs(x) <= this.maxX && (y >= -this.maxY && y <= this.maxY + this.extraBottomRows));
}

