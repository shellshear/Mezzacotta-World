// Avatar controller keeps track of items in the inventory and movement for a character.
// It is also responsible for which items have been saved.
function AvatarController(controller, avatarIndex, avatarCode)
{
    AvatarController.baseConstructor.call(this);

	this.controller = controller;

	this.avatarIndex = avatarIndex;
    this.avatarItem = this.controller.itemFactory.makeItem(avatarCode);
    this.avatarItem.params.isTemporary = true;

	this.avatarItem.params.itemTags.push("avatar"); 
	
    this.avatarItem.id = "avatar_" + this.avatarIndex;
    this.avatarItem.povHeight = 25;
    this.registerAvatar();
    
	// List of items held by this avatar
	this.heldItems = [];
	this.weildedItem = null;
}

KevLinDev.extend(AvatarController, ActionObject);

// Register the avatar in the model.
AvatarController.prototype.registerAvatar = function()
{
    this.controller.model.registerItem(this.avatarItem);
}

AvatarController.prototype.attemptMoveAvatar = function(direction)
{
	this.avatarItem.setDirection(direction);

    if (this.avatarItem.cellContents == null)
        return;
    
	var deltaX = 0;
	var deltaY = 0;	
	switch (direction)
	{
	case "b":
		deltaY = -1;
		break;
	
	case "r":
		deltaX = -1;
		break;

	case "f":
		deltaY = 1;
		break;
		
	case "l":
		deltaX = 1;
		break;
	}
	
    var destContents = this.controller.model.getContents(this.avatarItem.cellContents.x + deltaX, this.avatarItem.cellContents.y + deltaY);
    var topData = destContents.getTopItem();

	if (topData.src == "GridContents")
		return;

    var climbHeight = 0; // Can't climb at all, by default
    if (this.avatarItem.params.climbHeight != null)
        climbHeight = this.avatarItem.params.climbHeight;
    
    var dropHeight = null; // Can drop any distance, by default
    if (this.avatarItem.params.dropHeight != null)
        dropHeight = this.avatarItem.params.dropHeight;
        
    if (this.avatarItem.canMoveTo(topData, climbHeight, dropHeight))
    { 
        this.moveAvatar(topData);
    }
    else if (topData.params.isPushable)
    {
        // A pushable item can be pushed if:
        // - the user would be able to move into its cellContents
        //   if the pushable item wasn't there
        // - the cellContents that the pushable item would move into
        //   is the same level or lower than the cellContents it is
        //   currently in, and can be stood on.
        var deltaHeight = topData.params.elev - this.avatarItem.params.elev;
        if (deltaHeight < 20)
        {
            // User would be able to move into this cellContents
            var pushedDestContents = this.controller.model.getContents(this.avatarItem.cellContents.x + deltaX * 2, this.avatarItem.cellContents.y + deltaY * 2);            
            while (pushedDestContents.myItems.length > 0)
            {
                pushedDestContents = pushedDestContents.myItems[0];
            }
            
            var deltaPushedHeight = pushedDestContents.params.ht + pushedDestContents.params.elev - topData.params.elev;
            
            if (deltaPushedHeight <= 0)
            {
                topData.moveItem(pushedDestContents);
                topData = destContents.getTopItem();
                if (topData.params.canStandOn)
                {
                    this.moveAvatar(topData);
                }
            }
        }
    }   
    else
	{
		// Attempt to use the topData
		if (this.weildedItem == null || !this.weildedItem.useItemWith(topData))
		{
			// If the weilded item failed to do anything, try with the avatar directly.
			this.avatarItem.useItemWith(topData);
		}
	}
}

AvatarController.prototype.moveAvatar = function(destItem)
{
    // Check if character is in the model
    if (this.avatarItem.cellContents == null)
        return;
	else
		this.avatarItem.cellContents.tempParams.neverInWay = false;

    // If there are any takeable items, take them first
    while (destItem.params.isTakeable)
    {
        var owner = destItem.owner;
        if (owner)
        {            
            // Remove item
            owner.removeItem(destItem);

            // Add to our inventory
            this.addItemToInventory(this.current_map_id, destItem);
        }
        destItem = owner;
    }

	destItem.cellContents.tempParams.neverInWay = true;
    this.avatarItem.moveItem(destItem);    

    this.controller.view.setCellCentre(this.avatarItem.cellContents.x, this.avatarItem.cellContents.y);
}

AvatarController.prototype.placeAvatar = function()
{
	// Reset the start direction
	this.avatarItem.setDirection("f");
	
	// Find the start position
	var startX = 0;
	var startY = 0;

	// If there is a start marker, use that
	var startItemList = this.controller.model.findItemsByCode("S");
	if (startItemList != null)
	{
		// Find the appropriate start item
		// TODO: For the moment, just use the first item.
	    startX = startItemList[0].cellContents.x;
	    startY = startItemList[0].cellContents.y;
	}
  
	// Add the avatar to the world
	var currCell = this.controller.model.getContents(startX, startY);
	var topData = currCell.getTopItem();
	currCell.tempParams.neverInWay = true;
	topData.appendItem(this.avatarItem);
}

// Remove the avatar from the board.
AvatarController.prototype.removeAvatar = function()
{
    if (this.avatarItem.owner != null)
	{
        this.avatarItem.owner.removeItem(this.avatarItem);
		if (this.avatarItem.cellContents != null)
			this.avatarItem.cellContents.tempParams.neverInWay = false;
	}
}

// Clear the inventory and avatar item listeners.
AvatarController.prototype.clear = function()
{
	this.avatarItem.clearActionListeners();
	this.clearInventory();
}

// Clear the inventory and avatar item listeners.
AvatarController.prototype.clearInventory = function()
{
	this.heldItems = [];
	this.avatarItem.removeAllItems();
	this.tellActionListeners(this, {type:"inventoryUpdated"});
}

AvatarController.prototype.addItemToInventory = function(map_id, item)
{
	item.params.isInvisible = true;
	item.params.isCarried = true;
	this.avatarItem.appendItem(item);
	
	// Set the item's direction to correspond to the avatar
	item.setDirection(this.avatarItem.params.direction); 

	this.heldItems.push({map_id:map_id, item:item});
	this.tellActionListeners(this, {type:"inventoryUpdated"});
}

AvatarController.prototype.setItemSaved = function(item_id)
{
	for (var i = 0; i < this.heldItems.length; ++i)
	{
		if (this.heldItems[i].item.id == item_id)
		{
			this.heldItems[i].item.params.isSaved = true;
			break;
		}
	}
}

AvatarController.prototype.removeUnsavedItems = function()
{
	// Pull items out of the list if they're not tagged as saved.
	for (var i = 0; i < this.heldItems.length;)
	{
		if (!this.heldItems[i].item.params.isSaved)
		{
			// Remove this item
			this.heldItems.splice(i, 1);
		}
		else
			++i;
	}
	this.tellActionListeners(this, {type:"inventoryUpdated"});
}

// Reset the inventory as the items in the xml.
AvatarController.prototype.resetInventoryFromXML = function(xmlInventory)
{
	this.clearInventory();
    var xmlContentsList = xmlInventory.getElementsByTagName("item");
    
    for (var i = 0; i < xmlContentsList.length; i++)
    {
        var xmlContents = xmlContentsList.item(i);
        var avatar_index = parseInt(xmlContents.getAttribute("avatar_index"));
		if (avatar_index == this.avatarIndex)
		{
        	var map_id = xmlContents.getAttribute("map_id");
			var item = this.controller.itemFactory.makeItemFromXML(xmlContents.firstChild, this.controller.model);
			item.params.isSaved = true; // The item came from the server, so tag as saved.
			this.addItemToInventory(map_id, item);
    	}
	}   
}

// Update saved items, given an xml response from the server of the form:
// <result status="1" ...>
//   <update item_id=""/>
//   ...
//   <delete item_id=""/>
//   ...
//   <new item_id=""/>
//   ...
// </result>
//
// Update any unsaved items to saved if they're on the new list.
AvatarController.prototype.updateFromXML = function(xml)
{
    var xmlContentsList = xml.getElementsByTagName("new");
    
    for (var i = 0; i < xmlContentsList.length; i++)
    {
        var xmlContents = xmlContentsList.item(i);
		var item_id = xmlContents.getAttribute("item_id");
		
		// Locate the item with this id
		this.setItemSaved(item_id);
    }   
}

// Return a list of ids of saved items in the specified map.
AvatarController.prototype.getSavedItemIDs = function(map_id)
{
	var result = [];
	for (var i = 0; i < this.heldItems.length; ++i)
	{
		if (this.heldItems[i].map_id == map_id && this.heldItems[i].item.params.isSaved)
			result.push(this.heldItems[i].item.id);
	}
	return result;
}

// Create an HTTP string to add unsaved items
AvatarController.prototype.getUnsavedItemHTTPString = function()
{
	var serverString = "";
	for (var i = 0; i < this.heldItems.length; ++i)
	{
		var currItem = this.heldItems[i].item;
		if (!currItem.params.isSaved)
		{
		    if (currItem.id != null && currItem.params.itemCode != null && currItem.params.isSaveable)
		    {
				var itemXML = currItem.toXML();
				var itemXMLString = (new XMLSerializer()).serializeToString(itemXML);

		        serverString += "&itemId_" + i + "=" + currItem.id + "&itemXML_" + i + "=" + escape(itemXMLString) + "&avatarIndex_" + i + "=" + this.avatarIndex;
		    }
		}
	}
	return serverString;
}

AvatarController.prototype.copyItem = function()
{
	return this.controller.itemFactory.makeSimpleViewItem(this.avatarItem);
}

AvatarController.prototype.setWeilding = function(item)
{
	if (item == this.weildedItem)
		return;
		
	// Tell the avatar it is holding the specified item, and should therefore
	// attempt to change its state.
	if (this.weildedItem != null)
	{
		this.weildedItem.setItemParam("isInvisible", true);
	}
	
	this.weildedItem = item;
	
	if (this.weildedItem != null)
	{
		this.weildedItem.setItemParam("isInvisible", false);
	}
}