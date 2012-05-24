// A global item counter, used to give unique ids to items.
gItemCount = 0;

// Item container holds items
function ItemContainer()
{
    ItemContainer.baseConstructor.call(this);

    this.myItems = [];
    this.owner = null; // no owner by default
}

KevLinDev.extend(ItemContainer, ActionObject);

// Move the item from its current parent to the target
ItemContainer.prototype.moveItem = function(target)
{
    if (this.owner)
    {
        this.owner.removeItem(this);
    }
    target.appendItem(this);
}

ItemContainer.prototype.removeItem = function(item)
{
    for (var i in this.myItems)
    {
        if (this.myItems[i] == item)
        {
            this.removeItemByIndex(i);
            break;
        }    
    }
}

// Get a flat list of all the items in the tree
ItemContainer.prototype.getFlattenedTree = function()
{
    var result = [this];
    for (var i in this.myItems)
    {
        result = result.concat(this.myItems[i].getFlattenedTree());
    }
    return result;
}

// Find the first item that has the name value pair in the params
ItemContainer.prototype.find = function(name, value)
{
    if (this.params != null && this.params[name] === value)
        return this;
        
    for (var i in this.myItems)
    {
        var result = this.myItems[i].find(name, value);
        if (result != null)
            return result;
    }
}

ItemContainer.prototype.removeItemByIndex = function(itemIndex)
{
    if (itemIndex < 0 || itemIndex >= this.myItems.length)
        return;
    
    this.myItems[itemIndex].cleanup();
    
    this.myItems.splice(itemIndex, 1);

    this.tellActionListeners(this, {type:"removeItem", itemIndex:itemIndex});
    
    gItemCount--;
}

// Clean up, because we're about to be removed from our parent
ItemContainer.prototype.cleanup = function()
{
    this.owner = null;
    for (var i in this.myItems)
    {
        this.myItems[i].cleanup();
    }
}

ItemContainer.prototype.setOwner = function(owner)
{
    this.owner = owner;
}

ItemContainer.prototype.appendItem = function(item)
{
    this.myItems.push(item);
    item.setOwner(this);

    var evt = new Object();
    evt.type = "appendItem";
    evt.itemIndex = this.myItems.length - 1;
    this.tellActionListeners(this, evt);
    
    gItemCount++;
}


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

    if (evt.type == "appendItem")
    {
        this.appendViewItem(this.modelItem.myItems[evt.itemIndex]);
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
    for (var i in this.modelItem.myItems)
    {
        var viewItem = this.appendViewItem(this.modelItem.myItems[i]);
        if (viewItem != null)    
            viewItem.updateChildrenFromModel();
    }
}

ViewItemContainer.prototype.appendViewItem = function(item)
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
    for (var i in this.containedItems.childNodes)
    {
        this.containedItems.childNodes[i].removeActionListeners();
    }
    this.modelItem.removeActionListener(this);
}