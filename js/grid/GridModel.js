// Model for a two-dimensional grid
// - Each (i, j) position contains a GridContents object
// - It's a sparce array, so don't bother generating the GridContents
//   until someone tries to access that coordinate.
function GridModel(itemFactory)
{
    GridModel.baseConstructor.call(this);
    this.src = "GridModel";

	this.xmlDoc = createXMLDoc("m");
    this.xmlModel = this.xmlDoc.firstChild;
    
    this.gridData = {};

	// Keep track of the moveable items in the model
	this.moveableItems = [];

    // Items need ids so actions and conditions can refer 
    // to them for serialisation purposes.
    this.itemIdIndex = 0;
    this.itemIdList = [];

    this.itemFactory = itemFactory;
    
    this.quadList = [{x:1,y:1},{x:-1,y:1},{x:-1,y:-1},{x:1,y:-1}];
    
    // Default list of adjacent cellContents
    this.adjList = [
        {x:1,y:0,inFront:false, side:0},
        {x:0,y:1,inFront:true, side:1},
        {x:-1,y:0,inFront:true, side:0},
        {x:0,y:-1,inFront:false, side:1}
        ];
    
    // Whether to show items that have the isInvisible param set to true.
    this.showInvisible = false;    
}

KevLinDev.extend(GridModel, ActionObject);

GridModel.prototype.clear = function()
{
    for (var i in this.gridData)
    {
        for (var j in this.gridData[i])
        {
            this.gridData[i][j].clear();
        }
    }
    this.moveableItems = [];

    this.itemIdIndex = 0;
    this.itemIdList = [];
}

GridModel.prototype.registerItem = function(item)
{
    if (item.id == null)
        item.id = "i_" + this.itemIdIndex++;
        
    this.itemIdList[item.id] = item;
}

// Add the item to the itemIdList, so that we can later more easily retrieve items with ids.
// Also ensure that any new id we create doesn't overlap existing ids.
GridModel.prototype.importItem = function(item)
{
    // We only care about items with ids.
    if (item.id == null)
        return;
        
    // When importing items, we need to take into account existing item ids,
    // to ensure we don't issue one that already exists.
    // We do so by ensuring our item id index is always greater than any
    // imported item id.
    var idIndex = parseInt(item.id.slice(2)); // remove the prefix "i_"
    if (idIndex >= this.itemIdIndex)
        this.itemIdIndex = idIndex + 1;
        
    this.itemIdList[item.id] = item;
}

GridModel.prototype.getItemById = function(itemId)
{
    return this.itemIdList[itemId];
}

GridModel.prototype.addToMoveableItems = function(item)
{
    // Check that it's not already here.
    for (var i = 0; i < this.moveableItems.length; ++i)
    {
     	if (this.moveableItems[i] == item)
     	{
         	return;
     	}
    }

    this.moveableItems.push(item);
}

GridModel.prototype.removeFromMoveableItems = function(item)
{
    for (var i = 0; i < this.moveableItems.length; ++i)
    {
     	if (this.moveableItems[i] == item)
     	{
         	this.moveableItems.splice(i, 1);
         	break;
     	}
    }
}

// Return a GridContents for the coordinates
GridModel.prototype.getContents = function(x, y)
{
    if (this.gridData[x] == null)
       this.gridData[x] = [];
   
    if (this.gridData[x][y] == null)
    {
        this.gridData[x][y] = this.itemFactory.makeContents(this, x, y, 0);
    }

    return this.gridData[x][y];
}

// Default is for a rect grid
GridModel.prototype.getWithinRadius = function(x, y, radius)
{
    var result = [];
    for (var x1 = x - radius; x1 <= x + radius; x1++)
    {
       for (var y1 = y - radius; y1 <= y + radius; y1++)
       {
           var dist = this.getDistance(x, y, x1, y1);

           if (dist != null && dist < radius)
           {
               result.push(this.getContents(x1, y1));
           }
       }
    }
    return result;
}

// Default is for a rect grid
GridModel.prototype.getDistance = function(x1, y1, x2, y2)
{
    // Default is the D&D approximation
    var x = Math.abs(x2 - x1);
    var y = Math.abs(y2 - y1);
    return (x > y) ? x + Math.floor(y / 2) : y + Math.floor(x / 2);
}

/*
GridModel.prototype.toString = function()
{
    var result = "";
   
    for (var i in this.gridData)
    {
       for (var j in this.gridData[i])
       {
           var gridContents = this.gridData[i][j].toString();
           if (gridContents != null)
           {
               result += "[" + i + "," + j + "," + gridContents + "]";
           }
       }
    }
    return result;
}
*/

GridModel.prototype.clearXML = function()
{
    // Remove all child nodes of the model element
    while (this.xmlModel.firstChild != null)
        this.xmlModel.removeChild(this.xmlModel.firstChild);
}

GridModel.prototype.toXML = function()
{
    this.clearXML();
    
    for (var i in this.gridData)
    {
        for (var j in this.gridData[i])
        {
            var cellContentsXML = this.gridData[i][j].toXML(this.xmlDoc);
            if (cellContentsXML != null)
                this.xmlModel.appendChild(cellContentsXML);
        }
    }
    
    return this.xmlModel;
}

GridModel.prototype.fromXML = function(xml)
{
    if (xml == null)
        return;
        
    var xmlContentsList = xml.getElementsByTagName("c");
    
    for (var i = 0; i < xmlContentsList.length; i++)
    {
        var xmlContents = xmlContentsList.item(i);
        var x = parseInt(xmlContents.getAttribute("x"));
        var y = parseInt(xmlContents.getAttribute("y"));
        var cellContents = this.getContents(x, y);
        
        cellContents.fromXML(xmlContents);
    }    
}

// String is of form [x,y,content][x,y,content]...
// Content cannot contain "," or "[" or "]"
GridModel.prototype.fromString = function(str)
{
    var nodeList = str.split("]");
    for (var k in nodeList)
    {
       if (nodeList[k][0] == "[")
       {
           var bits = nodeList[k].split(",");
           var x = parseInt(bits[0].substr(1)); // skip the "["
           var y = parseInt(bits[1]);
           var cellContents = this.getContents(x, y);
           cellContents.fromString(bits[2]);
       }
    }
}

// Find the items with the specified item code
GridModel.prototype.findItemsByCode = function(itemCode)
{
	var result = [];
    for (var i in this.gridData)
    {
        for (var j in this.gridData[i])
        {
            var currItem = this.gridData[i][j].findItemByCode(itemCode);
            if (currItem != null)
                result.push(currItem);
        }
    }
	if (result.length == 0)
    	return null;
	else
		return result;
}
