// InventorySlot holds a single inventory item
function InventorySlot(inventoryWindow, x, y)
{
    InventorySlot.baseConstructor.call(this);

	this.inventoryWindow = inventoryWindow;
	this.x = x;
	this.y = y;
	this.viewItem = null;
}

KevLinDev.extend(InventorySlot, ActionObject);

InventorySlot.prototype.isEmpty = function()
{
	return (this.viewItem == null);
}

InventorySlot.prototype.setViewItem = function(viewItem)
{
	this.viewItem = viewItem;
}

InventorySlot.prototype.getDistance = function(x, y)
{
	return Math.sqrt((this.x - x) * (this.x - x) + (this.y - y) * (this.y - y));
}
