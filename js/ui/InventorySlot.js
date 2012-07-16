// InventorySlot holds a single inventory item
function InventorySlot(inventoryWindow, x, y, slotIndex)
{
    InventorySlot.baseConstructor.call(this);

	this.inventoryWindow = inventoryWindow;
	this.x = x;
	this.y = y;
	this.viewItem = null;
	this.slotIndex = slotIndex;
}

KevLinDev.extend(InventorySlot, ActionObject);

InventorySlot.prototype.isEmpty = function()
{
	return (this.viewItem == null);
}

InventorySlot.prototype.canAcceptItem = function(viewItem)
{
	// If this is the "weild item" slot, refuse items that can't be weilded.
	if (this.slotIndex == 1 && !viewItem.gridItem.params.canWeild)
		return false;
		
	// Otherwise, we can accept an item as long as there isn't an item already here.
	return this.isEmpty();
}

InventorySlot.prototype.setViewItem = function(viewItem)
{
	this.viewItem = viewItem;

	if (this.slotIndex == 1)
	{
		// This is the "weild slot"
		// Tell the avatar it is now weilding the item
		this.inventoryWindow.setWeilding((this.viewItem == null) ? null : this.viewItem.gridItem);
	}
}

InventorySlot.prototype.getDistance = function(x, y)
{
	return Math.sqrt((this.x - x) * (this.x - x) + (this.y - y) * (this.y - y));
}
