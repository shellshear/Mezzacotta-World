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

    this.params = (params == null) ? {} : params;
	this.params.saveVals = {};
	
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
	if (this.params.itemTags == null)
		this.params.itemTags = [];
	
    this.cellContents = null; // doesn't belong to anything yet
    this.canSee = {}; // Can't see anything yet

	this.dirns = ['r', 'b', 'l', 'f']; // default directions

	// Initialise all the item tag params
	for (var i = 0; i < this.params.itemTags.length; ++i)
	{
		this.setItemTagParam(this.params.itemTags[i]);
	}
}

KevLinDev.extend(GridItem, ItemContainer);

// Grid items can move between owners and layers.
GridItem.prototype.setOwner = function(owner)
{    
    GridItem.superClass.setOwner.call(this, owner);   

    // Set our elevation based on our owner.
    this.updateElev();

    // Set the cellContents
    this.updateOwnerContents();
}

// Update any POV affected by changes to this grid item
GridItem.prototype.updateAffectedPOV = function()
{
    // If we're in the path of any seeing items, update those
    if (this.cellContents != null)
    {
        // First get a list of the items that will need their povs updated
        // Note that the cellContents.seenBy list may change as we update the
        // povs of the items.
        var povItems = [];
        for (var i = 0; i < this.cellContents.seenBy.length; ++i)
        {
            povItems.push(this.cellContents.seenBy[i].item);
        }
        
        for (var j = 0; j < povItems.length; ++j)
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

	var xmlItem = null;
    if (xmlDoc == null)
	{
		xmlDoc = createXMLDoc("i");
		xmlItem = xmlDoc.firstChild;
	}
	else
	{
		xmlItem = xmlDoc.createElement("i");		
	}

	xmlItem.setAttribute("c", this.params.itemCode);

	if (this.params.saveVals.ht != null)
    	xmlItem.setAttribute("h", this.params.saveVals.ht);
	else
    	xmlItem.setAttribute("h", this.params.ht);

	// Lots of items can have directions that don't need to be saved - only
	// save if the user specifically set the initial direction.
	if (this.params.saveVals.direction != null)
		xmlItem.setAttribute("d", this.params.saveVals.direction);
    
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

// The item is being removed, so let listeners know
GridItem.prototype.cleanup = function()
{
    GridItem.superClass.cleanup.call(this);   
	this.updateCellContents(null);
	this.tellActionListeners(this, {type:"ItemBeingDeleted", item:this});
}

// Update the item and its children regarding the cellContents that
// it is part of
GridItem.prototype.updateOwnerContents = function()
{
    if (this.owner != null)
    {
        if (this.owner.src == "GridContents")
		{
			this.updateCellContents(this.owner);
        }
		else
        {
			this.updateCellContents(this.owner.cellContents);
    	}
	}
    
    for (var i = 0; i < this.myItems.length; ++i)
    {
        this.myItems[i].updateOwnerContents();
    }
}

// Update the cellContents for this item.
// Also handle all the things that happen when the item is placed in a new cell.
GridItem.prototype.updateCellContents = function(newCellContents)
{
	if (this.cellContents != newCellContents)
	{
    	this.cellContents = newCellContents;
		if (this.cellContents != null)
		{
			this.updatePOV();
			this.updateAffectedPOV();
		}
		else
		{
		    this.clearSeenBy();
		}
	}
}

// Set what is visible to this item.
//
// We tell the item what height it can see at each grid cellContents within the
// radius, and inform each of the cellContents that they can be seen by this item
// at that height.
// 
// We calculate the view height at each cellContents. Anything below that height
// is not visible. The view height for each viewed cellContents is a function of the 
// viewer elevation, the height of the objects between the viewer
// and the viewed, and the distance between the viewer and viewed.
// To simplify matters, we evaluate each viewed cellContents in an increasing 
// radius, so we never have to evaluate the height using more than just the
// cellContents one step away from the viewed cellContents.
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
    
    // Start with adjacent cellContents, the widen the field of view
    if (this.cellContents == null)
        return;
    var model = this.cellContents.model;
        
    var x = this.cellContents.x;
    var y = this.cellContents.y;
    var q = model.quadList;
    var sourceElevation = this.params.elev + this.params.ht;
   
    this.setVisibility(this.cellContents, this.params.elev, 0, x, y, viewType);

    // For each cellContents, set the height that can be seen at that
    // cellContents by the viewer.
    // This will depend on the height of the viewer, and the height
    // of objects between the viewer and the cellContents.
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
                for (var j = 0; j < q.length; ++j)
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
                for (var j = 0; j < q.length; ++j)
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
                for (var j = 0; j < q.length; ++j)
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
                for (var j = 0; j < q.length; ++j)
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

// This item can see this cellContents at this elevation
GridItem.prototype.setVisibility = function(cellContents, viewElev, distance, x, y, viewType)
{
    cellContents.addSeenBy(this, viewElev, distance, x, y, viewType);

    if (this.canSee[viewType] == null)
        this.canSee[viewType] = {};

    if (this.canSee[viewType][cellContents.x] == null)
        this.canSee[viewType][cellContents.x] = {};
   
    this.canSee[viewType][cellContents.x][cellContents.y] = {cellContents:cellContents, viewElev:viewElev, distance:distance};
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
                    this.canSee[s][i][j].cellContents.removeSeenBy(this);
                }
            }
        }        
        this.canSee = {};
    }
    else
    {
        for (var i in this.canSee[viewType])
        {
            for (var j in this.canSee[viewType][i])
            {
                this.canSee[viewType][i][j].cellContents.removeSeenBy(this);
            }
        }
        this.canSee[viewType] = {};
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

GridItem.prototype.setItemTag = function(tagName)
{
    // If there's already an itemTag with this name, don't do anything.
	for (var i = 0; i < this.params.itemTags.length; ++i)
	{
		if (this.params.itemTags[i] == tagName)
			return;
	}
	
    this.params.itemTags.push(tagName);

    // Tell our listeners
    this.tellActionListeners(this, {type:"tagAdded", value:tagName});

	this.setItemTagParam(tagName);
}

// An itemTagParam is an item parameter associated with a particular tag.
// Whenever you set the tag, the associated itemTagParams get set as well.
// Whenever you remove the tag, the original values of the params are restored.
GridItem.prototype.setItemTagParam = function(tagName)
{
	// check if there are any tagParams to set
	if (this.params.tagParams[tagName] != null)
	{
		for (var j in this.params.tagParams[tagName])
		{
			// We're going to set an item param using the tagParams
			
			// Save the original item parameter away for later use
			if (this.params.tagParamOriginals == null)
			{
				this.params.tagParamOriginals = {};
				this.params.tagParamOriginals[tagName] = {};
			}
			
			this.params.tagParamOriginals[tagName][j] = (this.params[j] == null) ? null : this.params[j];
			
			// Update the item param with the tag param.
			this.setItemParam(j, this.params.tagParams[tagName][j]);
		}
	}
}

// Update the elevation based on our owner's height and elevation
GridItem.prototype.updateElev = function()
{
    // The owner could be a GridContents or a GridItem
    // If the owner is a GridItem, we are sitting on top of it.
    if (this.owner == null)
    {
        this.setItemParam("elev", 0);
    }
    else if (this.owner.params != null && this.owner.params.elev != null)
    {
        if (this.owner.params.ht != null && !this.params.isCarried)
       		this.setItemParam("elev", this.owner.params.elev + this.owner.params.ht);
   		else
       		this.setItemParam("elev", this.owner.params.elev);
	}
	
	// Also update elevations of all our children
	for (var i = 0; i < this.myItems.length; ++i)
		this.myItems[i].updateElev();
}

// Set the direction of this item.
// Also update the direction of all its children, by rotating them correspondingly.
GridItem.prototype.setDirection = function(direction, doSave)
{
	var delta = this.getDirectionDelta(this.params.direction, direction);
	this.setItemParam("direction", direction, doSave);
	
	// Rotate all our children
	for (var i = 0; i < this.myItems.length; ++i)
    {
		this.myItems[i].rotateItem(delta, false); // Don't save the child direction rotations.
    }
}

// Find the delta between the src and dest
GridItem.prototype.getDirectionDelta = function(src, dest)
{
	// Find the index of the src
	var srcIndex = 0;
	for (var i = 0; i < this.dirns.length; ++i)
	{
		if (this.dirns[i] == src)
		{
			srcIndex = i;
			break;
		}
	}

	// Find the index of the dest relative to the src
	for (var i = 0; i < this.dirns.length; i++)
	{
		if (this.dirns[i] == dest)
			return (i - srcIndex + this.dirns.length) % this.dirns.length;
	}
	
	return 0;
}

// Rotate the specified item to the right, by the specified amount (-1 to turn left)
GridItem.prototype.rotateItem = function(rotation, doSave)
{
	// Check if the item has no direction specified
	if (this.params.direction == null)
	{
		this.params.direction = "f";
	}
	
	for (var i = 0; i < this.dirns.length; ++i)
	{
		if (this.dirns[i] == this.params.direction)
		{
			// Rotate to the specified direction
			i += rotation;
			i = i % this.dirns.length;
			while (i < 0)
				i += this.dirns.length;
			
			this.setDirection(this.dirns[i], doSave);
			
			break;
		}
	}
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
	for (var i = 0; i < items.length; ++i)
	{
		items[i].updateElev();
    	items[i].updatePOV();
	}
	
	// Update any items with a POV that touches this cellContents
	this.updateAffectedPOV();
}

// Attempt to use this item with another item.
// Any item that has one or more useAction params affects other items,
// adding, updating, or removing tags on the other item.
// e.g. useActions:[{otherTag:"fire", addTag:"burning"}]
GridItem.prototype.useItemWith = function(item)
{
	var result = false;
	if (this.params.useActions != null)
	{
		for (var i = 0; i < this.params.useActions.length; ++i)
		{
			var currUseAction = this.params.useActions[i];
			
			// Does the other item have the appropriate tag?
			for (var j = 0; j < item.params.itemTags.length; ++j)
			{
				if (currUseAction.otherTag == item.params.itemTags[j])
				{
					// Found a match
					this.setItemTag(currUseAction.addTag);
					result = true;
				}
			}
		}
	}
	return result;
}

// Return true if the item can be moved to the destination cellContents
// This is only true if the destination cellContents can be stood upon, and
// if the height of the cellContents is less than the item's current height
// plus the delta height specified (ie. can't climb too high)
GridItem.prototype.canMoveTo = function(destItem, maxClimbHeight, maxDropHeight)
{
	// Can only move items onto other items
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
            
            // Find if there are any items in this cellContents match our request
            // TODO: need a find function that gets all results, not just the first.
            var item = canSee.cellContents.find("itemCode", itemCode);

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
                for (var j = 0; j < closestItems.length; ++j)
                {
                    destContents = this.followSimplePathTo(closestItems[j].item);
                    sumX += (destContents.x - this.cellContents.x);
                    sumY += (destContents.y - this.cellContents.y);                    
                }
                
                if (Math.abs(sumX) > Math.abs(sumY))
                {
                    destContents = this.cellContents.model.getContents(this.cellContents.x + (sumX > 0 ? 1 : -1), this.cellContents.y);
                }
                else if (Math.abs(sumX) < Math.abs(sumY))
                {
                    destContents = this.cellContents.model.getContents(this.cellContents.x, this.cellContents.y + (sumY > 0 ? 1 : -1));
                }
                else if (sumX != 0)
                {
                    // sumX and sumY are equal - we default to X direction
                    destContents = this.cellContents.model.getContents(this.cellContents.x + (sumX > 0 ? 1 : -1), this.cellContents.y);
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
        var dirnLabel = (destContents.x != this.cellContents.x ? (destContents.x < this.cellContents.x ? "r" : "l") : (destContents.y < this.cellContents.y ? "b" : "f"));
        return {cellContents: destContents, params:{direction:dirnLabel}};
    }
    
    return null;
}

GridItem.prototype.getSimplePathPreferred = function(item, goLong)
{
    var deltaX = this.cellContents.x - item.cellContents.x;
    var deltaY = this.cellContents.y - item.cellContents.y;
    var destX = this.cellContents.x;
    var destY = this.cellContents.y;

    // Try the preferred direction first, with X as default.
    if (goLong == (Math.abs(deltaX) >= Math.abs(deltaY)))
    {
        destX += (deltaX == 0 ? 0 : (deltaX > 0 ? -1 : 1));
    }
    else 
    {
        destY += (deltaY == 0 ? 0 : (deltaY > 0 ? -1 : 1));
    }
    return this.cellContents.model.getContents(destX, destY);
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
    if (destContents == item.cellContents)
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
    if (destContents == this.cellContents)
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
