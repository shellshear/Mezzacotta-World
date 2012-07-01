// ACItemHandler is responsible for handling items that belong to actions and conditions.
// Actions and conditions sometimes use items to either perform actions on or with, or to check conditions.
// This class helps handle the items for the actions and conditions.
function ACItemHandler(model, item, itemName)
{
    ACItemHandler.baseConstructor.call(this);
    this.model = model;
	this.itemName = itemName;

	// Match criterion is "id", "code", or "tag". Default is "id".
    this.matchCriterion = "id"; 
	
	this.setItem(item);
}

KevLinDev.extend(ACItemHandler, ActionObject);

ACItemHandler.prototype.setItem = function(item)
{
	if (item == this.item)
		return;
	
	// Remove our old action listener
	if (this.item != null)
		this.item.removeActionListener(this);
		
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

// Set the match criterion for this item.
// - "id" - the id of this item needs to be matched by the input item.
// - "code" - the item's itemCode must match the input item.
// - "tag" - the items must have at least one tag in common.
ACItemHandler.prototype.setItemMatchCriterion = function(matchCriterion, itemTag)
{
	if (matchCriterion == this.matchCriterion && (itemTag == null || (this.item.params.itemTags != null && this.item.params.itemTags[0] == itemTag)))
		return;

	if (itemTag != null)
		this.item.params.itemTags = [itemTag];
		
	this.matchCriterion = matchCriterion;
	this.tellActionListeners(this, {type:"itemUpdated", item:this.item});
}

ACItemHandler.prototype.matchesItem = function(item)
{
	if (item == null || this.item == null)
	{
		return (item == this.item);
	}
	else if (this.matchCriterion == "code")
	{
		if (item.params.itemCode != null && item.params.itemCode == this.item.params.itemCode)
			return true;
	}
	else if (this.matchCriterion == "id")
	{
		if (item.id == this.item.id)
			return true;
	}
	else if (this.matchCriterion == "tag")
	{
		if (item.params.itemTags != null && this.item.params.itemTags != null)
		{
			for (var i = 0; i < item.params.itemTags.length; ++i)
			{
				for (var j = 0; j < this.item.params.itemTags.length; ++j)
				{
					if (item.params.itemTags[i] == this.item.params.itemTags[j])
						return true;
				}
			}
		}
	}
	return false;
}


// This doesn't actually create any nodes, but adds item details to the existing node
ACItemHandler.prototype.addToXML = function(xml)
{
	if (this.item != null)
    {
		if (this.matchCriterion == "code")
		{
			xml.setAttribute(this.itemName + "ItemCode", this.item.params.itemCode);
		}
		else if (this.matchCriterion == "id")
		{
			xml.setAttribute(this.itemName + "ItemId", this.item.id);
    	}
		else if (this.matchCriterion == "tag")
		{
			// TODO: Cope with more than one tag
			xml.setAttribute(this.itemName + "ItemTag", this.item.params.itemTags[0]);
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
		this.matchCriterion = "id";
	    item = this.model.getItemById(itemId);
	}
	else
	{
		// No id - see if there's an ItemCode for this item
		var itemCode = xml.getAttribute(this.itemName + "ItemCode");
		if (itemCode != null)
		{
			this.matchCriterion = "code";
			item = this.model.itemFactory.makeItem(itemCode);
		}
		else
		{
			// No itemCode - see if there's an itemTag for this item
			// TODO: Cope with more than one tag
			var itemTag = xml.getAttribute(this.itemName + "ItemTag");
			if (itemTag != null)
			{
				this.matchCriterion = "tag";
				item = this.model.itemFactory.makeItem("t");
				item.params.itemTags = [itemTag];
			}			
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

ACItemHandler.prototype.onDelete = function()
{
	// Remove our action listener
	if (this.item != null)
		this.item.removeActionListener(this);		
}
