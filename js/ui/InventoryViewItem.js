// InventoryViewItem holds a single item that is in the inventory
function InventoryViewItem(inventoryWindow, gridItem)
{
	this.gridItem = gridItem;
	this.inventoryWindow = inventoryWindow;
	this.inventorySlot = null;
	
	var itemCopy = this.inventoryWindow.controller.itemFactory.makeItem(this.gridItem.params.itemCode);
	var currEl = this.inventoryWindow.controller.itemFactory.makeSimpleViewItem(itemCopy);

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

InventoryViewItem.prototype.setSlot = function(slot)
{
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