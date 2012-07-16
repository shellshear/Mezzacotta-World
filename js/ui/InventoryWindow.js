// InventoryWindow is used for displaying items the user is holding.
function InventoryWindow(controller)
{
    InventoryWindow.baseConstructor.call(this, "Inventory", 5, {fill:"none", stroke:"green", rx:4}, {width:382, height:225, storePrefix:"MW_InventoryWindow", contentsSpacing:3});

	this.controller = controller;
	this.avatar = null;
	this.snapDistance = 20;
	
	this.inventorySlots = [];
	this.inventorySlots.push(new InventorySlot(this, 14, 85, this.inventorySlots.length));
	this.inventorySlots.push(new InventorySlot(this, 74, 83, this.inventorySlots.length));

	this.inventorySlots.push(new InventorySlot(this, 147, 23, this.inventorySlots.length));
	this.inventorySlots.push(new InventorySlot(this, 147, 85, this.inventorySlots.length));
	this.inventorySlots.push(new InventorySlot(this, 147, 142, this.inventorySlots.length));

	this.inventorySlots.push(new InventorySlot(this, 207, 23, this.inventorySlots.length));
	this.inventorySlots.push(new InventorySlot(this, 207, 85, this.inventorySlots.length));
	this.inventorySlots.push(new InventorySlot(this, 207, 142, this.inventorySlots.length));

	this.inventorySlots.push(new InventorySlot(this, 267, 23, this.inventorySlots.length));
	this.inventorySlots.push(new InventorySlot(this, 267, 85, this.inventorySlots.length));
	this.inventorySlots.push(new InventorySlot(this, 267, 142, this.inventorySlots.length));

	this.inventorySlots.push(new InventorySlot(this, 327, 23, this.inventorySlots.length));
	this.inventorySlots.push(new InventorySlot(this, 327, 85, this.inventorySlots.length));
	this.inventorySlots.push(new InventorySlot(this, 327, 142, this.inventorySlots.length));
	
	this.itemArea = new SVGComponent(0, 0);
	this.contents.appendChild(this.itemArea);
	this.itemArea.childConstraints = {x:0, y:0, width:382, height:195};
}

KevLinDev.extend(InventoryWindow, SVGWindow);

InventoryWindow.prototype.setBgImage = function(bgImage)
{
	// Add a background image
	var currItem = new SVGElement();
	currItem.cloneElement(bgImage);
	currItem.removeAttribute("display");
	currItem.removeAttribute("style");
	currItem.setAttribute("transform", "matrix(5,0,0,5,66,188)");
	this.prependChild(currItem);
}


InventoryWindow.prototype.clear = function()
{
	this.clearAvatar();
	this.clearInventory();
}

InventoryWindow.prototype.clearAvatar = function()
{
	if (this.avatar != null)
	{
		this.avatar.removeActionListener(this);
		this.avatar = null;
	}
}

InventoryWindow.prototype.clearInventory = function()
{
	this.itemArea.removeChildren();
	for (var i = 0; i < this.inventorySlots.length; ++i)
	{
		this.inventorySlots[i].setViewItem(null);
	}
}

// Set the avatar for whom we are showing the inventory
InventoryWindow.prototype.setAvatar = function(avatar)
{
	this.clearAvatar();
	this.avatar = avatar;
	this.syncInventory();
	this.avatar.addActionListener(this);
}

InventoryWindow.prototype.syncInventory = function()
{
	this.clearInventory();
	if (this.avatar != null)
	{
		for (var i = 0; i < this.avatar.heldItems.length; ++i)
		{
			this.tryToCarryItem(this.avatar.heldItems[i].item);
		}
	}
}

// Try to carry the item.
// Return true if able, false if we couldn't.
InventoryWindow.prototype.tryToCarryItem = function(item)
{
	// Find an empty slot
	// Slots 0 and 1 are reserved for left and right hand.
	for (var i = 2; i < this.inventorySlots.length; ++i)
	{
		if (this.inventorySlots[i].isEmpty())
		{
			var newInventoryItem = new InventoryViewItem(this, item);
			
			// The itemBar is the thing that actually holds all the items.
			this.itemArea.appendChild(newInventoryItem);
			
			// Add to the inventory slot
			newInventoryItem.setSlot(this.inventorySlots[i]);
			break;
		}
	}
	
	return false; // unable to find an empty slot
}

InventoryWindow.prototype.doAction = function(src, evt)
{
    InventoryWindow.superClass.doAction.call(this, src, evt);

	if (evt.type == "mousedown" && src.src == "dragItem")
	{
		// Allow user to drag button
        dragndrop_Start(src, evt, src.x, src.y);
	}
	else if (evt.type == "viewItemDragMove")
	{
		// User is moving item. Make the item "sticky" near inventory slots.
		var distance = null;
		var bestSlot = null;
		for (var i = 0; i < this.inventorySlots.length; ++i)
		{
			var currDistance = this.inventorySlots[i].getDistance(evt.x, evt.y);
			if (distance == null || currDistance < distance)
			{
				distance = currDistance;
				bestSlot = i;
			}
		}
		
		var x = evt.x;
		var y = evt.y;
		if (distance != null && distance < this.snapDistance)
		{
			x = this.inventorySlots[bestSlot].x;
			y = this.inventorySlots[bestSlot].y;
		}
		src.setPosition(x, y);
	}
	else if (evt.type == "viewItemDragEnd")
	{
		// Decide where to put the inventory item
		var distance = null;
		var bestSlot = null;
		for (var i = 0; i < this.inventorySlots.length; ++i)
		{
			var currDistance = this.inventorySlots[i].getDistance(src.x, src.y);
			if (distance == null || currDistance < distance)
			{
				distance = currDistance;
				bestSlot = i;
			}
		}
		
		if (distance != null && distance < this.snapDistance)
		{
			if (!this.tryToPlaceItemInSlot(bestSlot, src))
				src.resetSlotPosition();
		}
		else
		{
			src.resetSlotPosition();
		}
	}
	else if (evt.type == "inventoryUpdated")
	{
		this.syncInventory();
	}
}

InventoryWindow.prototype.tryToPlaceItemInSlot = function(slot, viewItem)
{
	var result = false;
	
	// Ask the slot if its okay for this item to be placed there
	if (this.inventorySlots[slot].canAcceptItem(viewItem))
	{
		viewItem.setSlot(this.inventorySlots[slot]);
		result = true;
	}

	return result;
}

InventoryWindow.prototype.setWeilding = function(item)
{
	if (this.avatar != null)
		this.avatar.setWeilding(item);
}
