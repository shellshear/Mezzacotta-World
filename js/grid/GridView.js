// View corresponding to a grid model
// - each node has mouseover and mouseclick
// - overall view has key events
// - Queries model for what to show
// - Tells controller when user input happens
// - Receives update info from model.
function GridView(gridModel, idMap, itemFactory, numCols, numRows, startCol, startRow, width, height)
{
    GridView.baseConstructor.call(this, "g");

    this.idMap = idMap;
    this.itemFactory = itemFactory;
    this.numCols = numCols;
    this.numRows = numRows;
    this.width = width;
    this.height = height;
    this.coverLayer = new SVGElement("g"); // svg for the cover layer
    this.coverLayer2 = new SVGElement("g"); // svg for the cover2 layer
    
    this.view = []; // Keep an array for the view elements
   
    // Keep an array for the z-order groups
    // Cells are added to the view array, and also to a group
    // for each z-plane (as specified in the drawCell method)
    this.z_list = [];
   
    this.gridModel = gridModel;
   
    // Can't use setViewport here, as it also does other things
    // we don't want to do yet.
    this.startCol = startCol;
    this.startRow = startRow;
   
    this.drawView();
}

KevLinDev.extend(GridView, SVGElement);

GridView.prototype.setViewport = function(startCol, startRow, numCols, numRows)
{
	if (startCol != null)
    	this.startCol = startCol;

	if (startRow != null)
    	this.startRow = startRow;
	
	if (numCols != null)
		this.numCols = numCols;
	
	if (numRows != null)
		this.numRows = numRows;
     
    // Redraw the view, to ensure all cells in the view area
    // are visible.
    this.drawView();
   
    this.removeOutsideView();
   
    var transform = "translate(" + (this.getLayoutX(startCol, startRow) * -this.width) + "," + (this.getLayoutY(startCol, startRow) * -this.height) + ")";

    this.svg.setAttribute("transform", transform);
    this.coverLayer.svg.setAttribute("transform", transform);
    this.coverLayer2.svg.setAttribute("transform", transform);
}

GridView.prototype.drawCell = function(x, y)
{
    if (!this.inView(x, y))
       return;
       
    var modelContents = this.gridModel.getContents(x, y);

    // Register this cell in the view
    if (this.view[x] == null)
       this.view[x] = [];
       
    if (this.view[x][y] == null)
    {
        // Add a new grid object view
       
        var x_posn = this.getLayoutX(x, y) * this.width;
        var y_posn = this.getLayoutY(x, y) * this.height;

        // Update with the model contents
        var currCell = this.itemFactory.makeViewContents(this, x_posn, y_posn, x, y, modelContents, true);
   
        this.view[x][y] = currCell;
       
        // Receive user input from the grid buttons
        currCell.addActionListener(this);

        // Insert the node in the correct z-order position
       
        // Find the z-order group
        // Items at bottom are always in front
        var z = this.getLayoutY(x, y);
       
        var zGroup = this.z_list[z];
       
        if (zGroup == null)
        {
            // Start a new z-order group
            zGroup = new SVGElement("g");

            // Find the next highest z-order group
            var next_z = z;
            for (var curr_z in this.z_list)
            {
                // Note we have to go through the entire list
                // because the order they appear may not be
                // monotonic (in fact, saying z_list[z] = zGroup
                // always appends the zGroup to the end of the
                // list - at that point, it's an associative array
                // and the numbers are treated as strings. So be
                // careful.)
                var curr_z_index = parseInt(curr_z);
                if (curr_z_index > z)
                {
                    if (next_z == z || curr_z_index < next_z)
                    {
                        next_z = curr_z_index;
                    }
                }
            }
           
            if (next_z == z)
            {
                // There wasn't anything after z
                this.appendChild(zGroup);
            }
            else
            {
                this.insertBefore(zGroup, this.z_list[next_z]);
            }

            this.z_list[z] = zGroup;
        }
       
        zGroup.appendChild(currCell);
       
        // The cover is in a separate auxiliary component, ready
        // to be placed in a separate layer.
        this.coverLayer.appendChild(currCell.auxiliaryComponents[0]);
        
        // The items also can put visual elements into the cover layer
        // via their auxGroup.
        this.coverLayer.appendChild(currCell.auxiliaryComponents[1]);
    }
}

// Default visual layout of cells
GridView.prototype.getLayoutX = function(i, j)
{
    return i;
}

GridView.prototype.getLayoutY = function(i, j)
{
    return j;
}

// Remove any view contents that are outside the visible area
GridView.prototype.removeOutsideView = function()
{
    for (var i in this.view)
    {        
       for (var j in this.view[i])
       {
           if (!this.inView(parseInt(i), parseInt(j)))
           {
               this.view[i][j].remove();
               delete this.view[i][j];
           }
       }
    }
}

GridView.prototype.drawView = function()
{
    for (var i = 0; i < this.numCols; i++)
    {
       for (var j = 0; j < this.numRows; j++)
       {
           this.drawCell(i + this.startCol, j + this.startRow);
       }
    }
}

GridView.prototype.inView = function(i, j)
{
    return (i >= this.startCol &&
           i < this.startCol + this.numCols &&
           j >= this.startRow &&
           j < this.startRow + this.numRows);
}

// Update the view to include the points of view in the povList
GridView.prototype.updateView = function(povList)
{
    for (var i in this.view)
    {
        for (var j in this.view[i])
        {
            if (povList == null)
                this.view[i][j].setAble(true);
            else
                this.view[i][j].setAble(false);
           
            this.view[i][j].updateView(povList);
        }
    }
}

GridView.prototype.doAction = function(src, evt)
{
    if (evt.type == "contentsUpdate")
    {
       this.drawCell(src.x, src.y);
    }
   
    this.tellActionListeners(src, evt);
}

