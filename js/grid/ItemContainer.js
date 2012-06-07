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
    for (var i = 0; i < this.myItems.length; ++i)
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
    for (var i = 0; i < this.myItems.length; ++i)
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
        
    for (var i = 0; i < this.myItems.length; ++i)
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
    for (var i = 0; i < this.myItems.length; ++i)
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

