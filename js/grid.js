// Model for a two-dimensional grid
// - Each (i, j) position contains a GridContents object
// - It's a sparce array, so don't bother generating the GridContents
//   until someone tries to access that coordinate.
function GridModel(itemFactory)
{
    GridModel.baseConstructor.call(this);
    this.src = "GridModel";

    if (document.implementation && document.implementation.createDocument) 
    {
        this.xmlDoc = document.implementation.createDocument(null, "m", null);
    }
    else
    {
        this.xmlDoc = new ActiveXObject("MSXML2.DOMDocument"); 
        this.xmlDoc.loadXML("<m/>");
    }
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
    
    // Default list of adjacent contents
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
            var contentsXML = this.gridData[i][j].toXML(this.xmlDoc);
            if (contentsXML != null)
                this.xmlModel.appendChild(contentsXML);
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
        var contents = this.getContents(x, y);
        
        contents.fromXML(xmlContents);
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
           var contents = this.getContents(x, y);
           contents.fromString(bits[2]);
       }
    }
}

// Find the first item with the specified item code
GridModel.prototype.findItemByCode = function(itemCode)
{
    for (var i in this.gridData)
    {
        for (var j in this.gridData[i])
        {
            var result = this.gridData[i][j].findItemByCode(itemCode);
            if (result != null)
                return result;
        }
    }
    return null;
}

function GridContents(model, x, y)
{
    GridContents.baseConstructor.call(this);
    this.src = "GridContents";

    this.model = model;
    this.x = x;
    this.y = y;

    this.seenBy = []; // List of [item, elevation, distance] that can see this contents
}

KevLinDev.extend(GridContents, ItemContainer);

GridContents.prototype.clear = function()
{
    while (this.myItems.length > 0)
        this.removeItemByIndex(0);
}

GridContents.prototype.toString = function()
{
    var result = "";
    var isFirst = true;
    for (var i = 0; i < this.myItems.length; ++i)
    {
        if (this.myItems[i] != null)
        {
            if (!isFirst)
                result += ";";
            else
                isFirst = false;
                   
            result += this.myItems[i].toString();
        }
    }
   
    if (result.length == 0)
        return null;
       
    return result;
}

GridContents.prototype.getLocationString = function()
{
	return this.x + "," + this.y;
}

// String is of the form a;b;c;...
// The item contents get parsed into this.myItems
GridContents.prototype.fromString = function(str)
{
    this.myItems = [];
    if (str != null)
    {
        var itemCodes = str.split(";");
        for (var i in itemCodes)
        {
            var currItem = this.model.itemFactory.makeItem(itemCodes[i]);
            this.appendItem(currItem);
        }
    }
}

GridContents.prototype.toXML = function(xmlDoc, showAll)
{
    // Only add a contents if there's actually something in it.
    if (this.myItems.length == 0)
        return null;
    
    var xmlContents = xmlDoc.createElement("c");
    xmlContents.setAttribute("x", this.x);
    xmlContents.setAttribute("y", this.y);
    
    for (var i = 0; i < this.myItems.length; ++i)
    {
        var xmlItem = this.myItems[i].toXML(xmlDoc, showAll);
        if (xmlItem != null)
            xmlContents.appendChild(xmlItem);
    }

    if (showAll)
    {
        for (var i in this.seenBy)
        {
            var xmlSeen = xmlDoc.createElement("seen");
            xmlSeen.setAttribute("item", this.seenBy[i].item);
            xmlSeen.setAttribute("elev", this.seenBy[i].viewElev);
            xmlSeen.setAttribute("dist", this.seenBy[i].distance);
            xmlSeen.setAttribute("x", this.seenBy[i].x);
            xmlSeen.setAttribute("y", this.seenBy[i].y);
            xmlSeen.setAttribute("type", this.seenBy[i].viewType);
            xmlContents.appendChild(xmlSeen);
        }
    }
    return xmlContents;
}

GridContents.prototype.fromXML = function(xml)
{
    for (var i = 0; i < xml.childNodes.length; i++)
    {
        var xmlItem = xml.childNodes.item(i);
        
        // We need to know the item code in advance, so the factory
        // knows what kind of item to make.
        // The factory uses its template data to preset a bunch
        // of parameters for the item.
        var itemCode = xmlItem.getAttribute("c");
        var currItem = this.model.itemFactory.makeItem(itemCode);
        
        this.appendItem(currItem);

        // The item itself updates its children and non-template
        // parameters from the xml.
        currItem.fromXML(xmlItem);        
    }
}

GridContents.prototype.addSeenBy = function(item, viewElev, distance, x, y, viewType)
{
    this.seenBy.push({
         item:item, 
         viewElev:viewElev, 
         distance:distance,
         x:x,
         y:y,
         viewType:viewType
         });
}

GridContents.prototype.removeSeenBy = function(item)
{
    for (var i in this.seenBy)
    {
        if (this.seenBy[i].item == item)
        {
            this.seenBy.splice(i, 1);
            return;
        }
    }
}

// Find the highest elevation of any item that blocks
GridContents.prototype.getBlockingHeight = function()
{
    var result = 0;
    for (var i = 0; i < this.myItems.length; ++i)
    {
        var currHt = this.myItems[i].getBlockingHeight();
        if (currHt > result)
            result = currHt;
    }
    return result;
}

// Bit of a hack, because this really only gets the first child at each
// layer
GridContents.prototype.getTopItem = function()
{
    var topData = this;
    while (topData.myItems.length > 0)
    {
        topData = topData.myItems[0];
    }
    return topData;
}

// Find the first item with the specified item code
GridContents.prototype.findItemByCode = function(itemCode)
{
    return this.find("itemCode", itemCode);
}

// params is a list {} of parameters. It must include the following:
//      itemName - the full name of the item
//      itemCode - code for the item, used by templates
// Optional parameters are:
//      ht - the height of the item (default 0)
//      blockView - whether it stops pov from seeing through it (default false)
//      povRange - the range that this item can "see" with a pov (default 0)
//      isTemporary - don't save the item when writing to xml (default false)
//      canStandOn - indicates whether this item can be stood on (default true)
//      speech - what the item is speaking (default null)
//      isInvisible - if true, hide the item from the user unless
//                  the model specifies showInvisible=true (default false)
// Read-only params are:
//      elev - base elevation of the item (depends on what items it's sitting on)

function GridItem(params)
{
    GridItem.baseConstructor.call(this);
    this.src = "GridItem";

    this.params = params;
	this.params.saveVals = [];
	
    if (this.params.ht == null)
        this.params.ht = 0; 
    if (this.params.elev == null)
        this.params.elev = 0; 
    if (this.params.blockView == null)
        this.params.blockView = false; 
    if (this.params.povRange == null)
        this.params.povRange = 0; 
    if (this.params.isTemporary == null)
        this.params.isTemporary = false; 
    if (this.params.canStandOn == null)
        this.params.canStandOn = false; 
    if (this.params.isInvisible == null)
        this.params.isInvisible = false; 
	if (this.params.isHighlighted == null)
		this.params.isHighlighted = false;
		
    this.contents = null; // doesn't belong to anything yet
    this.canSee = {}; // Can't see anything yet
}

KevLinDev.extend(GridItem, ItemContainer);

// Grid items can move between owners and layers.
GridItem.prototype.setOwner = function(owner)
{    
    GridItem.superClass.setOwner.call(this, owner);   

    // Set our elevation based on our owner.
    this.updateElev();

    // Set the contents
    this.updateOwnerContents();    
    
    this.updateAffectedPOV();
    this.updatePOV();
}

// Update the elevation based on our owner's height and elevation
GridItem.prototype.updateElev = function()
{
    // The owner could be a GridContents or a GridItem
    // If the owner is a GridItem, we are sitting on top of it.
    if (this.owner == null)
    {
        this.params.elev = 0;
    }
    else if (this.owner.params != null)
    {
        if (this.owner.params.elev != null)
            this.params.elev = this.owner.params.elev;
    
        if (this.owner.params.ht != null)
            this.params.elev += this.owner.params.ht;
    }
}

// Update any POV affected by changes to this grid item
GridItem.prototype.updateAffectedPOV = function()
{
    // If we're in the path of any seeing items, update those
    if (this.contents != null)
    {
        // First get a list of the items that will need their povs updated
        // Note that the contents.seenBy list may change as we update the
        // povs of the items.
        var povItems = [];
        for (var i in this.contents.seenBy)
        {
            povItems.push(this.contents.seenBy[i].item);
        }
        
        for (var j in povItems)
        {
            povItems[j].updatePOV();
        }
    }
}

GridItem.prototype.updatePOV = function()
{
    // update what we can see
    if (this.params.povRange > 0)
    {
        this.updateVisibleWithinRadius(this.params.povRange, "pov");
    }
}

GridItem.prototype.toString = function()
{
    var result = this.params.itemCode + this.params.ht;
    
    if (this.myItems.length > 0)
        result += "(";
        
    for (var i = 0; i < this.myItems.length; ++i)
    {
        if (i != 0)
            result += " ";
            
        result += this.myItems[i].toString();
    }
    
    if (this.myItems.length > 0)
        result += ")";
    
    return result;
}

GridItem.prototype.toXML = function(xmlDoc, showAll)
{
    // Temporary items shouldn't get saved
    if (this.params.isTemporary)
        return null;
        
    var xmlItem = xmlDoc.createElement("i");
    xmlItem.setAttribute("c", this.params.itemCode);

	if (this.params.saveVals.ht != null)
    	xmlItem.setAttribute("h", this.params.saveVals.ht);
	else
    	xmlItem.setAttribute("h", this.params.ht);
    
    if (this.id != null)
    {
        xmlItem.setAttribute("id", this.id);
    }
    
    if (showAll)
    {
        xmlItem.setAttribute("e", this.params.elev);
    }
    
    for (var i = 0; i < this.myItems.length; ++i)
    {
        var xmlChildItem = this.myItems[i].toXML(xmlDoc);
        if (xmlChildItem != null)
            xmlItem.appendChild(xmlChildItem);
    }
    
    return xmlItem;
}


GridItem.prototype.fromXML = function(xml)
{
    this.setHeight(parseInt(xml.getAttribute("h")), true);
    if (xml.hasAttribute("id"))
    {
        this.id = xml.getAttribute("id");
        this.contents.model.importItem(this);
    }
                
    // Update all the child items of this item as well
    for (var i = 0; i < xml.childNodes.length; i++)
    {
        var xmlItem = xml.childNodes.item(i);
        
        // We need to know the item code in advance, so the factory
        // knows what kind of item to make.
        // The factory uses its template data to preset a bunch
        // of parameters for the item.
        var itemCode = xmlItem.getAttribute("c");
        var currItem = this.contents.model.itemFactory.makeItem(itemCode);
        
        this.appendItem(currItem);
        
        // If the item is moveable, add it to the moveable list.
        if (currItem.params.moveTowards != null)
        {
            this.contents.model.addToMoveableItems(currItem);
        }

        // The item itself updates its children and non-template
        // parameters from the xml.
        currItem.fromXML(xmlItem);        
    }
}

// The item is being removed, so clean up any light references and let listeners know
GridItem.prototype.cleanup = function()
{
    GridItem.superClass.cleanup.call(this);   
    this.clearSeenBy();
	this.tellActionListeners(this, {type:"ItemBeingDeleted", item:this});
}

// Update the item and its children regarding the contents that
// it is part of
GridItem.prototype.updateOwnerContents = function()
{
    if (this.owner != null)
    {
        if (this.owner.src == "GridContents")
            this.contents = this.owner;
        else
            this.contents = this.owner.contents;
    }
    
    for (var i = 0; i < this.myItems.length; ++i)
    {
        this.myItems[i].updateOwnerContents();
    }
}

// Set what is visible to this item.
//
// We tell the item what height it can see at each grid contents within the
// radius, and inform each of the contents that they can be seen by this item
// at that height.
// 
// We calculate the view height at each contents. Anything below that height
// is not visible. The view height for each viewed contents is a function of the 
// viewer elevation, the height of the objects between the viewer
// and the viewed, and the distance between the viewer and viewed.
// To simplify matters, we evaluate each viewed contents in an increasing 
// radius, so we never have to evaluate the height using more than just the
// contents one step away from the viewed contents.
// To calculate what we have to look at, we use the following chart:
//
// dddlllllddd  
// dddklllkddd  
// ddddllldddd
// lkddklkddkl  
// lllkdldklll     
// lllll*lllll
// lllkdldklll  
// lkddklkddkl  
// ddddllldddd  
// dddklllkddd
// dddlllllddd
//
//
// l: Calculate height one closer to the origin is not visible or is opaque
//    and higher than the viewer,
//    this point is not visible.
//
// d: If the point one closer to the origin is not visible or is opaque,
//    this point is not visible.
//    If both of the diagonal lines either side of the diagonal are blocked
//    (at any point) this point is not visible.
//
// k: If the adjacent diagonal is not visible or opaque, AND either of the
//    adjacent straight line points is not visible or opaque, this point
//    is not visible (eg. the "k" points are blocked by the closer "d"
//    plus either of the closer "l"s)
//
GridItem.prototype.updateVisibleWithinRadius = function(radius, viewType)
{
    this.clearSeenBy(viewType);
    
    // Start with adjacent contents, the widen the field of view
    if (this.contents == null)
        return;
    var model = this.contents.model;
        
    var x = this.contents.x;
    var y = this.contents.y;
    var q = model.quadList;
    var sourceElevation = this.params.elev + this.params.ht;
   
    this.setVisibility(this.contents, this.params.elev, 0, x, y, viewType);

    // For each contents, set the height that can be seen at that
    // contents by the viewer.
    // This will depend on the height of the viewer, and the height
    // of objects between the viewer and the contents.
    for (var i = 1; i <= radius; i++)
    {
        // Test central l
        
        var target = model.getContents(x + i, y);
        var viewElev = this.getViewElevation(model, x + i - 1, y, sourceElevation, i, viewType);
        this.setVisibility(target, viewElev, i, x, y, viewType);
               
        target = model.getContents(x - i, y);
        viewElev = this.getViewElevation(model, x - i + 1, y, sourceElevation, i, viewType);
        this.setVisibility(target, viewElev, i, x, y, viewType);

        target = model.getContents(x, y + i);
        viewElev = this.getViewElevation(model, x, y + i - 1, sourceElevation, i, viewType);
        this.setVisibility(target, viewElev, i, x, y, viewType);

        target = model.getContents(x, y - i);
        viewElev = this.getViewElevation(model, x, y - i + 1, sourceElevation, i, viewType);
        this.setVisibility(target, viewElev, i, x, y, viewType);
    }
   
    // d is diagonal index, i is distance along that diagonal.
    for (var d = 1; d < radius; d++)
    {
        for (var i = 0; i <= radius - d; i++)
        {
            if (i == 0)
            {
                // Test d
                var dist = d * 1.4142;
                for (var j in q)
                {
                    var x1 = x + q[j].x * d;
                    var y1 = y + q[j].y * d;

                    var target = model.getContents(x1, y1);
                    var viewElev = this.getViewElevation(model, x1 - q[j].x, y1 - q[j].y, sourceElevation, dist, viewType);
                    this.setVisibility(target, viewElev, dist, x, y, viewType);
                }
            }
            else if (i < d)
            {
                // Test off-diagonal "d"s
                var dist = Math.sqrt(d * d + (d + i) * (d + i));
                for (var j in q)
                {
                    var x1 = x + q[j].x * (d + i);
                    var y1 = y + q[j].y * d;
                   
                    var target = model.getContents(x1, y1);
                    var viewElev = this.getViewElevation(model, x1 - q[j].x, y1 - q[j].y, sourceElevation, dist, viewType);
                    this.setVisibility(target, viewElev, dist, x, y, viewType);

                    var x1 = x + q[j].x * d;
                    var y1 = y + q[j].y * (d + i);
                   
                    target = model.getContents(x1, y1);
                    viewElev = this.getViewElevation(model, x1 - q[j].x, y1 - q[j].y, sourceElevation, dist, viewType);
                    this.setVisibility(target, viewElev, dist, x, y, viewType);
                }
            }
            else if (i == d)
            {
                // Test k
                var dist = Math.sqrt(d * d + (d + i) * (d + i));
                for (var j in q)
                {
                    // (x-dx,y) || (x-dx,y-dy) && (x,y-dy))
                    var x1 = x + q[j].x * (d + i);
                    var y1 = y + q[j].y * d;
                   
                    var target = model.getContents(x1, y1);
                    
                    var v1 = this.getViewElevation(model, x1 - q[j].x, y1, sourceElevation, dist, viewType);
                    var v2 = this.getViewElevation(model, x1 - q[j].x, y1 - q[j].y, sourceElevation, dist, viewType);
                    var v3 = this.getViewElevation(model, x1, y1 - q[j].y, sourceElevation, dist, viewType);
                   
                    var viewElev = (v2 < v3) ? v2 : v3;
                    viewElev = (v1 > viewElev) ? v1 : viewElev;
                    this.setVisibility(target, viewElev, dist, x, y, viewType);
                   
                    // (x,y-dy) || (x-dx,y-dy) && (x-dx,y))
                    x1 = x + q[j].x * d;
                    y1 = y + q[j].y * (d + i);
                   
                    target = model.getContents(x1, y1);
                    
                    v1 = this.getViewElevation(model, x1, y1 - q[j].y, sourceElevation, dist, viewType);
                    v2 = this.getViewElevation(model, x1 - q[j].x, y1 - q[j].y, sourceElevation, dist, viewType);
                    v3 = this.getViewElevation(model, x1 - q[j].x, y1, sourceElevation, dist, viewType);
                   
                    viewElev = (v2 < v3) ? v2 : v3;
                    viewElev = (v1 > viewElev) ? v1 : viewElev;
                    this.setVisibility(target, viewElev, dist, x, y, viewType);
                }
            }
            else
            {
                // Test off-centre l
                var dist = Math.sqrt(d * d + (d + i) * (d + i));
                for (var j in q)
                {
                    var x1 = x + q[j].x * (d + i);
                    var y1 = y + q[j].y * d;

                    var target = model.getContents(x1, y1);
                    var viewElev = this.getViewElevation(model, x1 - q[j].x, y1, sourceElevation, dist, viewType);
                    this.setVisibility(target, viewElev, dist, x, y, viewType);

                    var x1 = x + q[j].x * d;
                    var y1 = y + q[j].y * (d + i);

                    target = model.getContents(x1, y1);
                    viewElev = this.getViewElevation(model, x1, y1 - q[j].y, sourceElevation, dist, viewType);
                    this.setVisibility(target, viewElev, dist, x, y, viewType);
                }
            }
        }
    }
}

GridItem.prototype.getViewElevation = function(model, x, y, sourceElevation, distance, viewType)
{
    var blockerViewElev = this.canSee[viewType][x][y].viewElev;
    var blockerBlockElev = model.getContents(x, y).getBlockingHeight();
    var h = blockerViewElev > blockerBlockElev ? blockerViewElev : blockerBlockElev;
    return h - (sourceElevation - h) / distance * 2; // TODO: The *2 is a fudge factor
}

// This item can see this contents at this elevation
GridItem.prototype.setVisibility = function(contents, viewElev, distance, x, y, viewType)
{
    contents.addSeenBy(this, viewElev, distance, x, y, viewType);

    if (this.canSee[viewType] == null)
        this.canSee[viewType] = [];

    if (this.canSee[viewType][contents.x] == null)
        this.canSee[viewType][contents.x] = [];
   
    this.canSee[viewType][contents.x][contents.y] = {contents:contents, viewElev:viewElev, distance:distance};
}

GridItem.prototype.clearSeenBy = function(viewType)
{
    if (viewType == null)
    {
        for (var s in this.canSee)
        {
            for (var i in this.canSee[s])
            {
                for (var j in this.canSee[s][i])
                {
                    this.canSee[s][i][j].contents.removeSeenBy(this);
                }
            }
        }        
        this.canSee = [];
    }
    else
    {
        for (var i in this.canSee[viewType])
        {
            for (var j in this.canSee[viewType][i])
            {
                this.canSee[viewType][i][j].contents.removeSeenBy(this);
            }
        }
        this.canSee[viewType] = [];
    }
}

// Find the blocking height of this item and anything it's holding.
GridItem.prototype.getBlockingHeight = function()
{
    var result = 0;
    
    if (this.params.blockView)
        result = this.params.elev + this.params.ht;
        
    for (var i = 0; i < this.myItems.length; ++i)
    {
        var currHt = this.myItems[i].getBlockingHeight();
        if (currHt > result)
            result = currHt;
    }
    return result;
}

// Set a parameter that will be associated with this item
GridItem.prototype.setItemParam = function(name, value, doSave)
{
	if (doSave)
	{
		this.params.saveVals[name] = value;
	}
	
    // If the param is already in this state, don't bother sending
    // an action event.
    if (this.params[name] == value)
        return;
        
    this.params[name] = value;

    // Tell our listeners
    this.tellActionListeners(this, {type:"paramChanged", name:name, value:value});
}

// Object height is a special case of an item param because it can affect pov,
// and items with a wtPerHt have their weight calculated according to height
GridItem.prototype.setHeight = function(height, doSave)
{
	this.setItemParam("ht", height, doSave);
	
	// Weight can be a function of height for some items.
	if (this.params.wtPerHt != null)
		this.params.wt = this.params.wtPerHt * height;
	
	// Update the POV of this item and each item on top of it
	var items = this.getFlattenedTree();
	for (var i in items)
	{
		items[i].updateElev();
    	items[i].updatePOV();
	}
	
	// Update any items with a POV that touches this contents
	this.updateAffectedPOV();
}


// Return true if the item can be moved to the destination contents
// This is only true if the destination contents can be stood upon, and
// if the height of the contents is less than the item's current height
// plus the delta height specified (ie. can't climb too high)
GridItem.prototype.canMoveTo = function(destItem, maxClimbHeight, maxDropHeight)
{
	if (destItem.src == "GridContents")
		return false;
		
    if (!destItem.params.canStandOn)
        return false;
    
    var delta = destItem.params.ht + destItem.params.elev - this.params.elev;
    if (delta >= 0 && delta <= maxClimbHeight)
        return true;
    else if (delta < 0 && (maxDropHeight == null || -delta <= maxDropHeight))
        return true;
    else
        return false;
}

// Return a list of items with the matching item codes that this item can see,
// in the form of a list of {item, distance}
GridItem.prototype.searchFor = function(itemCode)
{
    var itemList = [];
    
    for (var i in this.canSee["pov"])
    {
        for (var j in this.canSee["pov"][i])
        {
            var canSee = this.canSee["pov"][i][j];
            
            // Find if there are any items in this contents match our request
            // TODO: need a find function that gets all results, not just the first.
            var item = canSee.contents.find("itemCode", itemCode);

            // Is it in view?
            if (item != null && item.params.elev + item.params.ht >= canSee.viewElev)
            {
                itemList.push({item:item, distance:canSee.distance})
            }
        }
    }
    
    return itemList;
}

// Summarise this item's desires. 
// Relevent parameters are:
// moveTowards: {list} - a list of itemCode, ordered by preference
// scaredOf: {list} - a list of itemCode. Will not move towards any item in this list
//                    that is facing it (ie. facing in the opposite direction to
//                    the direction this wants to move).
//                    If the scaredOf item has no direction, this will not move towards
//                    it at all.
// Returns:
// {x:desired_x, y:desired_y, params:updated_param_list}
GridItem.prototype.requestChange = function()
{
    var destContents = null;
    
    if (this.params.moveTowards == null)
        return null;
    
    for (var i in this.params.scaredOf)
    {
        // Can we see an item we want to avoid moving towards?
        var items = this.searchFor(this.params.scaredOf[i]);
        if (items.length > 0)
        {
            // Found one or more items to fear
            // TODO
        }
    }

    for (var i in this.params.moveTowards)
    {
        // Can we see an item we want to move towards?
        var items = this.searchFor(this.params.moveTowards[i]);
        if (items.length > 0)
        {
            // Found one or more items
            
            // Is there one that is unambiguously closest?
            var closestDist = items[0].distance;
            var closestItems = [items[0]];
            for (var j = 1; j < items.length; j++)
            {
                if (items[j].distance < closestDist)
                {
                    closestDist = items[j].distance;
                    closestItems.push(items[j]);
                }
                else if (items[j].distance == closestDist)
                {
                    closestItems = [items[j]];
                }
            }

            if (closestItems.length == 1)
            {
                destContents = this.followSimplePathTo(closestItems[0].item);
            }
            else
            {
                var sumX = 0;
                var sumY = 0;
                // Try to get a mean direction
                for (var j in closestItems)
                {
                    destContents = this.followSimplePathTo(closestItems[j].item);
                    sumX += (destContents.x - this.contents.x);
                    sumY += (destContents.y - this.contents.y);                    
                }
                
                if (Math.abs(sumX) > Math.abs(sumY))
                {
                    destContents = this.contents.model.getContents(this.contents.x + (sumX > 0 ? 1 : -1), this.contents.y);
                }
                else if (Math.abs(sumX) < Math.abs(sumY))
                {
                    destContents = this.contents.model.getContents(this.contents.x, this.contents.y + (sumY > 0 ? 1 : -1));
                }
                else if (sumX != 0)
                {
                    // sumX and sumY are equal - we default to X direction
                    destContents = this.contents.model.getContents(this.contents.x + (sumX > 0 ? 1 : -1), this.contents.y);
                }
                else
                {
                    // We are perilously indecisive. Don't move.
                    destContents = null;
                }
            }
            break; // We found something/s we wanted to move towards.
        }
    }
    
    if (destContents != null)
    {
        // Hooray! We have a destination. We'll also want to set the direction label.
        var dirnLabel = (destContents.x != this.contents.x ? (destContents.x < this.contents.x ? "r" : "l") : (destContents.y < this.contents.y ? "b" : "f"));
        return {contents: destContents, params:{direction:dirnLabel}};
    }
    
    return null;
}

GridItem.prototype.getSimplePathPreferred = function(item, goLong)
{
    var deltaX = this.contents.x - item.contents.x;
    var deltaY = this.contents.y - item.contents.y;
    var destX = this.contents.x;
    var destY = this.contents.y;

    // Try the preferred direction first, with X as default.
    if (goLong == (Math.abs(deltaX) >= Math.abs(deltaY)))
    {
        destX += (deltaX == 0 ? 0 : (deltaX > 0 ? -1 : 1));
    }
    else 
    {
        destY += (deltaY == 0 ? 0 : (deltaY > 0 ? -1 : 1));
    }
    return this.contents.model.getContents(destX, destY);
}

// Calculate the simple "as the crow flies" direction to go towards the
// specified item. 
GridItem.prototype.followSimplePathTo = function(item)
{
    // Try the more compelling direction
    var destContents = this.getSimplePathPreferred(item, true);
    if (destContents == null)
        return null;
    
    // If we're right next to it, we can move there
    if (destContents == item.contents)
    {
        // Need to check whether we'd be able to move to where the item is
        // standing
        if (this.canMoveTo(item.owner, this.params.climbHeight))
            return destContents;
        else
            return null;
    }
    
    if (this.canMoveTo(destContents.getTopItem(), this.params.climbHeight))
    {
        // Good. That's where we'll say we're going.
        return destContents;
    }
    
    // Oookay, we'll try the less compelling direction.
    var destContents = this.getSimplePathPreferred(item, false);
    if (destContents == this.contents)
    {
        // That's where we are now, so let's not move at all.
        // (This happens if the simple path is a straight line in x or y direction)
        return null;
    }

    if (this.canMoveTo(destContents.getTopItem(), this.params.climbHeight))
    {
        // Good. That's where we'll say we're going.
        return destContents;
    }
    
    // Couldn't go anywhere.
    return null;
}


/**************************************************/
/* View Elements                                  */
/**************************************************/


function GridViewItem(modelItem, viewItemFactory, itemGraphics)
{
    this.itemGraphics = null; // The item graphics, as distinct from the item's children
    
    GridViewItem.baseConstructor.call(this, 0, 0, modelItem, viewItemFactory);
    
    this.appendItemContents(itemGraphics);
    
    if (modelItem.params.speech != null)
        this.doSpeech(modelItem.params.speech);
}
     
KevLinDev.extend(GridViewItem, ViewItemContainer);

// Append components of the item contents
// A view item contents can contain several bits (eg. the item and the
// item's shadow)
GridViewItem.prototype.appendItemContents = function(itemGraphics)
{
    if (itemGraphics != null)
    {
        if (this.itemGraphics == null)
        {
            this.itemGraphics = itemGraphics;
            this.insertBefore(this.itemGraphics, this.containedItems); 
        }
        else
        {
            this.itemGraphics.appendChild(itemGraphics);
        }
    }
}

GridViewItem.prototype.doAction = function(src, evt)
{
    GridViewItem.superClass.doAction.call(this, src, evt);   

    if (evt.type == "paramChanged")
    {
        if (evt.name == 'speech')
        {
            // This item says something
            this.doSpeech(evt.value);
        }
    }
}

GridViewItem.prototype.doSpeech = function(text)
{
    // Show what the character says

    // Clear out any existing speech bubbles
    if (this.speechBubble != null)
    {
        this.auxGroup.removeChild(this.speechBubble);
        this.speechBubble = null;
    }
    
    if (text != null)
    {
        this.speechBubble = this.viewItemFactory.createSpeechBubble(text);

        // Update the height
        var ht = -this.modelItem.params.elev;
        this.auxGroup.setAttribute("transform", "translate(0, " + ht + ")");
        this.auxGroup.appendChild(this.speechBubble);
    }
}

// Update how this item is viewed based on the povList.
// The povList is an array of items whose point of view inform what is seen.
// This item can only be seen if it can be seen by one of the items in the
// list.
// If the povList is null, show the item anyway.
GridViewItem.prototype.updateView = function(povList)
{
    var contents = this.modelItem.contents;
    if (contents == null)
        return;

    if (povList == null)
    {
        this.setVisibilityTop(true);
    }
    else if (this.itemGraphics != null)
    {
        var povTop = false;
        for (var j in contents.seenBy)
        {
            if (contents.seenBy[j].viewType == "pov")
            {
                // Check whether this pov is one in the list
                for (var k in povList)
                {
                    if (povList[k] == contents.seenBy[j].item)
                    {
                        if (contents.seenBy[j].viewElev <= this.modelItem.params.elev + this.modelItem.params.ht)
                        {
                            povTop = true;
                        }
                        
                        // Found the povList item we were looking for
                        break;
                    }
                }
            }
        }
        
        this.setVisibilityTop(povTop);
    }
    
    for (var i in this.containedItems.childNodes)
    {
        this.containedItems.childNodes[i].updateView(povList);
    }
}

GridViewItem.prototype.setVisibilityTop = function(isVisible)
{
    // Always override if parameter says it's invisible.
    if (this.modelItem.params.isInvisible && !this.modelItem.contents.model.showInvisible)
        isVisible = false;
    
    this.itemGraphics.setVisible(isVisible);
}

// Draw the grid button and contents

function GridViewContents(view, x, y, x_index, y_index, modelContents, doSeparateCoverLayer)
{
    var bg = new SVGElement("use", {"xlink:href": view.idMap.buttonOutline});
    
    // mouseover is an SVGComponent because we may wish to move the mouseover
    // graphic according to the contents of the button
    var mouseover = new SVGComponent(0, 0);
    var mouseoverContents = new SVGElement("use", {"xlink:href": view.idMap.buttonMouseover});
    mouseover.appendChild(mouseoverContents);

    var select = new SVGElement("use", {"xlink:href": view.idMap.buttonSelect});
    var cover = new SVGElement("use", {"xlink:href": view.idMap.buttonCover});
   
    // These indexes are so that user input events know which grid point
    // they're on.
    this.x_index = x_index;
    this.y_index = y_index;
   
    this.view = view;
    this.modelContents = modelContents;
      
    GridViewContents.baseConstructor.call
       (this, view.idMap.buttonName, x, y, 
        bg, mouseover, select, cover, doSeparateCoverLayer
       );   
    this.viewItems = new ViewItemContainer(0, 0, modelContents, this.view.itemFactory);
    this.viewItems.rootContainer = this;
    this.setContents(this.viewItems);
    
    if (doSeparateCoverLayer)
    {
        var newGroup = new SVGComponent(x, y);
        newGroup.appendChild(this.viewItems.auxGroup);
        this.addAuxiliaryComponent(newGroup);
    }
    
    // Fill out according to model
    this.viewItems.updateChildrenFromModel();
    
    // viewItems listens for updates to items
    this.modelContents.addActionListener(this.viewItems);
    
    // this listens for other updates from the contents
    this.modelContents.addActionListener(this);
}

KevLinDev.extend(GridViewContents, ParamButton);

GridViewContents.prototype.setAble = function(isAble)
{
    GridViewContents.superClass.setAble.call(this, isAble);   
    if (isAble)
    {
        this.svg_bg.show();
    }
    else
    {
        this.svg_bg.hide();
    }
}

GridViewContents.prototype.remove = function()
{
    this.modelContents.removeActionListener(this);
    this.viewItems.removeActionListeners();
    this.detach();
}

GridViewContents.prototype.updateView = function(povList)
{
    for (var i in this.viewItems.containedItems.childNodes)
    {
        this.viewItems.containedItems.childNodes[i].updateView(povList);
    }
}

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

GridView.prototype.setViewport = function(startCol, startRow)
{
    this.startCol = startCol;
    this.startRow = startRow;  
     
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

// Default content factory
function ContentFactory()
{
}

ContentFactory.prototype.makeContents = function(model, x, y, baseHeight)
{
    return new GridContents(model, x, y, baseHeight);
}

ContentFactory.prototype.makeItem = function(itemCode)
{
    return null;
}

ContentFactory.prototype.makeViewContents = function(view, x, y, x_index, y_index, modelContents)
{
    return new GridViewContents(view, x, y, x_index, y_index, modelContents);
}

ContentFactory.prototype.makeSimpleViewItem = function(item)
{
    return null;
}

ContentFactory.prototype.makeViewItem = function(item)
{
    return null;
}
