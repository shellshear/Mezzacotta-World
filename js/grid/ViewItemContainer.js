
// ViewItemContainer is the view of the ItemContainer.
// It updates whenever the ItemContainer updates.
function ViewItemContainer(x, y, modelItem, viewItemFactory)
{
    ViewItemContainer.baseConstructor.call(this, x, y);
    this.rootContainer = this;
    this.parentContainer = null;

    this.modelItem = modelItem;
    this.viewItemFactory = viewItemFactory;
    
    // Put contained items into a separate group
    this.containedItems = new SVGElement("g");
    this.appendChild(this.containedItems);
    
    // Create a separate group for things you wish to display in
    // a separate layer
    this.auxGroup = new SVGElement("g");
}

KevLinDev.extend(ViewItemContainer, SVGComponent);

ViewItemContainer.prototype.doAction = function(src, evt)
{
    ViewItemContainer.superClass.doAction.call(this, src, evt);   

    if (evt.type == "appendedItem")
    {
        this.appendViewItemAndChildren(evt.item);
    }
    else if (evt.type == "removeItem")
    {
        // Abandon the view of this item
        
        // First remove the viewItem from the item's action listeners
        var viewItem = this.containedItems.childNodes[evt.itemIndex];
        viewItem.modelItem.removeActionListener(viewItem);
        
        // Remove the viewItem
        this.containedItems.removeChildByIndex(evt.itemIndex);
        this.auxGroup.removeChildByIndex(evt.itemIndex);
    }
}

ViewItemContainer.prototype.updateChildrenFromModel = function()
{
    for (var i = 0; i < this.modelItem.myItems.length; ++i)
    {
        this.appendViewItemAndChildren(this.modelItem.myItems[i]);
    }
}

ViewItemContainer.prototype.appendViewItemAndChildren = function(item)
{
    var viewItem = this.viewItemFactory.makeViewItem(item);
    if (viewItem != null)
    {
        viewItem.rootContainer = this.rootContainer;
        viewItem.parentContainer = this;
        item.addActionListener(viewItem); // Listen for changes to the item
        viewItem.rootContainer.addActionListener(viewItem); // Listen for changes from our root
        this.containedItems.appendChild(viewItem);
        
        this.auxGroup.appendChild(viewItem.auxGroup);
        viewItem.onBeingAdded();
    }
    
	// If the item has children, also append those.
	if (item.myItems != null)
	{
		for (var i = 0; i < item.myItems.length; ++i)
		{
			viewItem.appendViewItemAndChildren(item.myItems[i]);
		}
	}
	return viewItem;
}

// Default method called when a ViewItemContainer is itself contained
// in another item. Useful when this item wants to change its appearance
// based on what it's on.
ViewItemContainer.prototype.onBeingAdded = function()
{
}

ViewItemContainer.prototype.removeActionListeners = function()
{
    for (var i = 0; i < this.containedItems.childNodes.length; ++i)
    {
        this.containedItems.childNodes[i].removeActionListeners();
    }
    this.modelItem.removeActionListener(this);
}
