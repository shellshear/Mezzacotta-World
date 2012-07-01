// Inventory controller keeps track of items in the inventory for a character.
// It is also responsible for which items have been saved.
function InventoryController(controller)
{
    InventoryController.baseConstructor.call(this);

	this.controller = controller;
	// List of items
	this.items = [];
	
	// Avatar id
	this.avatarId = 0;
}

KevLinDev.extend(InventoryController, ActionObject);

InventoryController.prototype.clear = function()
{
	this.items = [];
	this.tellActionListeners(this, {type:"clear"});
}

InventoryController.prototype.addItem = function(map_id, item)
{
	this.items.push({map_id:map_id, item:item});
	this.tellActionListeners(this, {type:"addItem", item:item});
}

InventoryController.prototype.setItemSaved = function(item_id)
{
	for (var i = 0; i < this.items.length; ++i)
	{
		if (this.items[i].item.id == item_id)
		{
			this.items[i].item.params.isSaved = true;
			break;
		}
	}
}

InventoryController.prototype.removeUnsavedItems = function()
{
	// Pull items out of the list if they're not tagged as saved.
	for (var i = 0; i < this.items.length;)
	{
		if (!this.items[i].item.params.isSaved)
		{
			// Remove this item
			this.items.splice(i, 1);
		}
		else
			++i;
	}
	this.tellActionListeners(this, {type:"itemsRemoved"});
}

InventoryController.prototype.loadInventoryXML = function(inventoryXML)
{
	this.xmlInventory = inventoryXML;
}

// Reset the inventory as the items in the xml.
InventoryController.prototype.setFromXML = function(mapXML)
{
	this.clear();
    var xmlContentsList = mapXML.getElementsByTagName("item");
    
    for (var i = 0; i < xmlContentsList.length; i++)
    {
        var xmlContents = xmlContentsList.item(i);
        var map_id = xmlContents.getAttribute("map_id");
		var item = this.controller.itemFactory.makeItemFromXML(xmlContents.firstChild, this.controller.model);
		item.params.isSaved = true; // The item came from the server, so tag as saved.
		this.addItem(map_id, item);
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
InventoryController.prototype.updateFromXML = function(xml)
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
InventoryController.prototype.getSavedItemIDs = function(map_id)
{
	var result = [];
	for (var i = 0; i < this.items.length; ++i)
	{
		if (this.items[i].map_id == map_id && this.items[i].item.params.isSaved)
			result.push(this.items[i].item.id);
	}
	return result;
}

// Create an HTTP string to add unsaved items
InventoryController.prototype.getUnsavedItemHTTPString = function()
{
	var serverString = "";
	for (var i = 0; i < this.items.length; ++i)
	{
		var currItem = this.items[i].item;
		if (!currItem.params.isSaved)
		{
		    if (currItem.id != null && currItem.params.itemCode != null && currItem.params.isSaveable)
		    {
				var itemXML = currItem.toXML();
				var itemXMLString = (new XMLSerializer()).serializeToString(itemXML);

		        serverString += "&itemId_" + i + "=" + currItem.id + "&itemXML_" + i + "=" + escape(itemXMLString) + "&avatarXML_" + i + "=" + this.avatarId;
		    }
		}
	}
	return serverString;
}

