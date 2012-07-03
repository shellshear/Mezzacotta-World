// InventoryWindow is used for displaying items the user is holding.
function InventoryWindow(controller)
{
    InventoryWindow.baseConstructor.call(this, "Inventory", 5, {fill:"lightGreen", stroke:"green", rx:4}, {width:170, height:170, storePrefix:"MW_InventoryWindow", contentsSpacing:3});

	this.controller = controller;
	this.avatar = null;
	
    this.itemBar = new FlowLayout(0, 0, {minSpacing:5});
    this.contents.appendChild(this.itemBar);

}

KevLinDev.extend(InventoryWindow, SVGWindow);

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
	this.itemBar.removeChildren();
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
			this.addItem(this.avatar.heldItems[i].item);
		}
	}
}

InventoryWindow.prototype.addItem = function(item)
{
	var itemCopy = this.controller.itemFactory.makeItem(item.params.itemCode);

	var currEl = this.controller.itemFactory.makeSimpleViewItem(itemCopy);
	var elHolder = new SVGElement("g");
	elHolder.appendChild(currEl);

    var itemAppearanceLabel = new RectLabel(0, 0, null, {fill:"white", stroke:"none", width:40, height:40}, 2);	
    itemAppearanceLabel.setContents(elHolder);
    itemCopy.addActionListener(currEl);

	this.itemBar.appendChild(itemAppearanceLabel);
}

InventoryWindow.prototype.doAction = function(src, evt)
{
    InventoryWindow.superClass.doAction.call(this, src, evt);

	if (evt.type == "inventoryUpdated")
	{
		this.syncInventory();
	}
}

