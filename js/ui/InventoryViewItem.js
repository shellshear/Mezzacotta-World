// InventoryViewItem holds a single item that is in the inventory
function InventoryViewItem(inventoryWindow, gridItem)
{
	this.gridItem = gridItem;
	this.gridItem.addActionListener(this);
	
	this.inventoryWindow = inventoryWindow;
	this.inventorySlot = null;
	
	this.itemCopy = this.inventoryWindow.controller.itemFactory.makeItem(this.gridItem.params.itemCode);
	var currEl = this.inventoryWindow.controller.itemFactory.makeViewItem(this.itemCopy);
	this.itemCopy.addActionListener(currEl);

    InventoryViewItem.baseConstructor.call(this, "dragItem", 0, 0, currEl, {fill:"none", stroke:"none", rx:2, width:40, height:40});

	this.addActionListener(this.inventoryWindow);
}

KevLinDev.extend(InventoryViewItem, RectButton);

InventoryViewItem.prototype.setDragPosition = function(x, y)
{
	this.tellActionListeners(this, {type:"viewItemDragMove", x:x, y:y});
}

InventoryViewItem.prototype.setDragEnd = function()
{
	this.tellActionListeners(this, {type:"viewItemDragEnd"});
}

// Put this item into the specified slot.
InventoryViewItem.prototype.setSlot = function(slot)
{
	// If this item already has a slot, tell that slot it's now empty.
	if (this.inventorySlot != null)
		this.inventorySlot.setViewItem(null);
		
	this.inventorySlot = slot;
	this.inventorySlot.setViewItem(this);
	this.resetSlotPosition();
}

InventoryViewItem.prototype.resetSlotPosition = function()
{
	if (this.inventorySlot != null)
	{
		this.setPosition(this.inventorySlot.x, this.inventorySlot.y);
	}
}

InventoryViewItem.prototype.doAction = function(src, evt)
{
    InventoryViewItem.superClass.doAction.call(this, src, evt);   

    if (evt.type == "tagAdded")
    {
		this.itemCopy.setItemTag(evt.value);
	}
}
