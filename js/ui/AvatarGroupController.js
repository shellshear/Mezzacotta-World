// Controls a group of avatars
function AvatarGroupController(controller)
{
    AvatarGroupController.baseConstructor.call(this);

	this.controller = controller;
	
	// List of avatars
	this.avatarList = [];
	this.currentAvatar = null;
	
	// The xml version of the inventory. We can reset the inventory to this
	// when required.
	this.xmlInventory = null;
}

KevLinDev.extend(AvatarGroupController, ActionObject);

// Add an avatar to the list
AvatarGroupController.prototype.addAvatar = function(itemCode)
{
	var avatarIndex = this.avatarList.length;
	var newAvatar = new AvatarController(this.controller, avatarIndex, itemCode);
	this.avatarList.push(newAvatar);
	this.currentAvatar = newAvatar;
	
	return newAvatar;
}

// Register all the avatars with the model.
AvatarGroupController.prototype.registerAvatars = function()
{
	for (var i = 0; i < this.avatarList.length; ++i)
	{
		this.avatarList[i].registerAvatar();
	}
}

AvatarGroupController.prototype.attemptMoveCurrentAvatar = function(direction)
{
	if (this.currentAvatar != null)
		this.currentAvatar.attemptMoveAvatar(direction);
}

AvatarGroupController.prototype.placeAvatars = function()
{
	for (var i = 0; i < this.avatarList.length; ++i)
	{
		this.avatarList[i].placeAvatar();
	}	
}

AvatarGroupController.prototype.removeAvatars = function()
{
	for (var i = 0; i < this.avatarList.length; ++i)
	{
		this.avatarList[i].removeAvatar();
	}
}

// Get the centre cell that shows the current avatar
AvatarGroupController.prototype.getAvatarCentreCell = function()
{
	if (this.currentAvatar != null && this.currentAvatar.avatarItem != null)
		return this.currentAvatar.avatarItem.cellContents;
	else
		return null;
}

// Get all the cells that the avatars can see
// TODO: For the moment, just make sure the avatar cell itself is visible.
AvatarGroupController.prototype.getAvatarViewedCells = function()
{
	if (this.currentAvatar != null && this.currentAvatar.avatarItem != null)
	{
		var visibleCells = [];
		var avatarViewElev = this.currentAvatar.avatarItem.params.elev + this.currentAvatar.avatarItem.params.ht;
		for (var i in this.currentAvatar.avatarItem.canSee["pov"])
	    {
	        for (var j in this.currentAvatar.avatarItem.canSee["pov"][i])
	        {
				var currView = this.currentAvatar.avatarItem.canSee["pov"][i][j];
				// Add this contents if it has any visible items.
				for (var k = 0; k < currView.cellContents.seenBy.length; ++k)
				{
					var currTarget = currView.cellContents.seenBy[k];
					if (currTarget.item == this.currentAvatar.avatarItem && currTarget.viewType == "pov" && currTarget.viewElev <= avatarViewElev)
					{
		            	visibleCells.push(currView.cellContents);
						break;
					}
				}
			}
		}
		return visibleCells; // [this.currentAvatar.avatarItem.cellContents];
	}
	else
		return null;
}

// Get a list of the avatars that are contributing to the pov
AvatarGroupController.prototype.getAvatarPOV = function()
{
	return [this.currentAvatar.avatarItem];
}

AvatarGroupController.prototype.clearTalkingAvatars = function()
{
	for (var i = 0; i < this.avatarList.length; ++i)
	{
		// Clear any existing speech bubbles.
		this.avatarList[i].avatarItem.setItemParam('speech', null, false);
	}
}

// Return any avatar that is at the specified location.
AvatarGroupController.prototype.getAvatarAt = function(locationString)
{
	for (var i = 0; i < this.avatarList.length; ++i)
	{
		var currAvatarItem = this.avatarList[i].avatarItem;
		if (currAvatarItem != null && currAvatarItem.cellContents != null && currAvatarItem.cellContents.getLocationString() == locationString)
			return this.avatarList[i];
	}
	return null;
}

// Attack the avatar. If there are no living avatars remaining, end the game.
// TODO: For the moment, just end the game anyway.
AvatarGroupController.prototype.attackAvatar = function(avatar, attacker)
{
    avatar.avatarItem.setItemParam('speech', "Death by " + attacker.params.fullname + "! Press space to restart.", false);
	this.controller.endGame();   

    // Oh dear. They've lost all their loot since their last save.
    //this.inventoryController.removeUnsavedItems();
}

AvatarGroupController.prototype.clear = function()
{
	for (var i = 0; i < this.avatarList.length; ++i)
	{
		// Clear any existing inventories
		this.avatarList[i].clear();
	}
}

AvatarGroupController.prototype.getUnsavedItemsHTTPString = function()
{
	var result = "";
	for (var i = 0; i < this.avatarList.length; ++i)
	{
		// Get the unsaved items from each avatar and concatinate
		result += this.avatarList[i].getUnsavedItemHTTPString();
	}
	return result;
}

// Update the inventories from the input xml
AvatarGroupController.prototype.updateFromXML = function(xml)
{
	for (var i = 0; i < this.avatarList.length; ++i)
	{
		this.avatarList[i].updateFromXML(xml);
	}
}

AvatarGroupController.prototype.getSavedItemIDs = function(map_id)
{
	var result = [];

	for (var i = 0; i < this.avatarList.length; ++i)
	{
		var savedIds = this.avatarList[i].getSavedItemIDs(map_id);
		result = result.concat(savedIds);
	}

	return result;
}

// This is the full inventory for all avatars, as loaded from the server xml.
AvatarGroupController.prototype.setInventoryXML = function(inventoryXML)
{
	this.xmlInventory = inventoryXML;
	this.resetInventoryFromXML();
}

AvatarGroupController.prototype.resetInventoryFromXML = function()
{
	if (this.xmlInventory != null)
	{
		for (var i = 0; i < this.avatarList.length; ++i)
		{
			this.avatarList[i].resetInventoryFromXML(this.xmlInventory);
		}
	}
}

