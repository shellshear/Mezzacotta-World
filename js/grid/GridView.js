// View corresponding to a grid model
// - each node has mouseover and mouseclick
// - overall view has key events
// - queries model for what to show
// - tells controller when user input happens
// - receives update info from model.
// 
// Has the following structure
// <svg x="" y="" width="" height=""> // clip layer
//     <g transform=""> // Transform layer
//         <g/> // Objects go in here
//         <g/> // Covers go in here
//         <g/> // Bonus covers go in here
//     </svg>
// </g>
function GridView(gridModel, idMap, itemFactory, numCols, numRows, startCol, startRow, cellWidth, cellHeight)
{
	// Setup the view area
	this.cellWidth = cellWidth;
	this.cellHeight = cellHeight;
	
	this.setCellCentre(startCol, startRow);
	this.setViewCentre(187, 165);
	this.setViewSize(375, 330);

    GridView.baseConstructor.call(this, {width:375, height:330});

    this.itemFactory = itemFactory;

	this.transformLayer = new SVGElement("g");
	this.appendChild(this.transformLayer);
	
	this.objectLayer = new SVGElement("g");
	this.transformLayer.appendChild(this.objectLayer);
    this.coverLayer = new SVGElement("g"); // svg for the cover layer
	this.transformLayer.appendChild(this.coverLayer);
    this.coverLayer2 = new SVGElement("g"); // svg for the cover2 layer
	this.transformLayer.appendChild(this.coverLayer2);
    
	
	this.idMap = idMap;

    this.view = []; // Keep an array for the view elements
   
    // Keep an array for the z-order groups
    // Cells are added to the view array, and also to a group
    // for each z-plane (as specified in the drawCell method)
    this.z_list = [];
   
    this.gridModel = gridModel;
   
	this.setFixedCellCount(8);
    this.updateView();
}

KevLinDev.extend(GridView, SVGRoot);

// Set the size of the view area. This will dictate the pattern of cells 
// that we draw.
GridView.prototype.setViewSize = function(width, height)
{
	this.viewWidth = width;
	this.viewHeight = height;
}

// Set the viewpoint centre.
// - centre_x, centre_y: the view is centred around this point
GridView.prototype.setViewCentre = function(centre_x, centre_y)
{
	this.viewCentreX = centre_x;
	this.viewCentreY = centre_y;
}

// Set the cell that is at the viewCentre.
GridView.prototype.setCellCentre = function(i, j)
{
	this.cellCentreX = i;
	this.cellCentreY = j;
}

// Set a fixed cell count in the x direction
GridView.prototype.setFixedCellCount = function(cellCountX)
{
	this.fixedCellCountX = cellCountX;
}

// Update the view appearance
// 
// Prototype method. Derived classes should implement this.
GridView.prototype.updateView = function()
{
}

// Default visual layout of cells
// (These functions will get overriden by child classes if they require
// more sophisticated mappings)
GridView.prototype.getLayoutX = function(i, j)
{
    return i;
}

GridView.prototype.getLayoutY = function(i, j)
{
    return j;
}

GridView.prototype.inView = function(i, j)
{
}

// Set the bounds of the gridView to be within the specified bbox.
// Also adjust the width or height of the clipBox
GridView.prototype.setBounds = function(bbox)
{
	// We have a fixed aspect ratio, so trim the bbox correspondingly.
	var testWidth = this.cellWidth * bbox.height / this.cellHeight;
	if (bbox.width > testWidth)
	{
		// trim width and maintain centre.
		bbox.x += (bbox.width - testWidth) / 2.0;
		bbox.width = testWidth;
	}
	else
	{
		// trim height and maintain centre.
		var testHeight = this.cellHeight * bbox.width / this.cellWidth;
		bbox.y += (bbox.height - testHeight) / 2.0;
		bbox.height = testHeight;
	}
	this.setClipRect(bbox);
	this.setViewSize(bbox.width, bbox.height);
	this.setViewCentre(bbox.width / 2.0, bbox.height / 2.0);
	this.updateView();
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
       
        var x_posn = this.getLayoutX(x, y) * this.cellWidth;
        var y_posn = this.getLayoutY(x, y) * this.cellHeight;

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
                this.objectLayer.appendChild(zGroup);
            }
            else
            {
                this.objectLayer.insertBefore(zGroup, this.z_list[next_z]);
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

// Update the view to include the points of view in the povList
GridView.prototype.updatePOV = function(povList)
{
    for (var i in this.view)
    {
        for (var j in this.view[i])
        {
            if (povList == null)
                this.view[i][j].setAble(true);
            else
                this.view[i][j].setAble(false);
           
            this.view[i][j].updatePOV(povList);
        }
    }
}

GridView.prototype.clear = function()
{
    for (var i in this.view)
    {
        for (var j in this.view[i])
        {
			this.view[i][j].clear();
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

