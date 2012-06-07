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