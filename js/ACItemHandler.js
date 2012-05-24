// ACItemHandler is responsible for handling items that belong to actions and conditions.
// Actions and conditions sometimes use items to either perform actions on or with, or to check conditions.
// This class helps handle the items for the actions and conditions.
function ACItemHandler(model, item, itemName)
{
    ACItemHandler.baseConstructor.call(this);
    this.model = model;
	this.itemName = itemName;

	// Indicates whether the item is a specific item in the grid,
	// or a type of item
	this.isItemByType = false; 
	
	this.setItem(item);
}

KevLinDev.extend(ACItemHandler, ActionObject);

ACItemHandler.prototype.setItem = function(item)
{
	if (item == this.item)
		return;
		
    this.item = item;

    if (this.item != null)
    {
		// Add a listener to the item so we know if it gets deleted.
		this.item.addActionListener(this);
				
    	// Need to register this item so the action can use it.
		if (this.item.id == null)
		{
        	this.model.registerItem(item);
		}
    }
	this.tellActionListeners(this, {type:"itemUpdated", item:this.item});
}

ACItemHandler.prototype.setItemByType = function(isItemByType)
{
	if (isItemByType == this.isItemByType)
		return;
		
	this.isItemByType = isItemByType;
	this.tellActionListeners(this, {type:"itemUpdated", item:this.item});
}

ACItemHandler.prototype.matchesItem = function(item)
{
	if (item == null || this.item == null)
	{
		return (item == this.item);
	}
	else if (this.isItemByType)
	{
		if (item.params.itemCode == this.item.params.itemCode)
			return true;
	}
	else 
	{
		if (item.id == this.item.id)
			return true;
	}
	return false;
}


// This doesn't actually create any nodes, but adds item details to the existing node
ACItemHandler.prototype.addToXML = function(xml)
{
	if (this.item != null)
    {
		if (this.isItemByType)
		{
			xml.setAttribute(this.itemName + "ItemType", this.item.params.itemCode);
		}
		else
		{
			xml.setAttribute(this.itemName + "ItemId", this.item.id);
    	}
	}
}

ACItemHandler.prototype.fromXML = function(xml)
{
	var item = null;
	
	// First check if there's an id for this item
	var itemId = xml.getAttribute(this.itemName + "ItemId");
	if (itemId != null)
	{
		this.isItemByType = false;
	    item = this.model.getItemById(itemId);
	}
	else
	{
		// No id - see if there's an itemType for this item
		var itemType = xml.getAttribute(this.itemName + "ItemType");
		if (itemType != null)
		{
			this.isItemByType = true;
			item = this.model.itemFactory.makeItem(itemType);
		}
	}
	this.setItem(item);
}

ACItemHandler.prototype.doAction = function(src, evt)
{
	if (evt.type == "ItemBeingDeleted" && this.item.markedForDeath)
	{
		// A GridItem is politely letting us know it's being deleted.
		this.setItem(null);
	}
}

