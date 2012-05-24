// A generic selector for items 
// ActionEditor and ConditionEditor classes call this when they want the user to select
// an item, either from the item menu or from the play area.
// itemChoiceSet is "topItem" or "topBlock"
function ItemViewSelector(controller, colour1, tag, itemChoiceSet)
{
    ItemViewSelector.baseConstructor.call(this, "itemButton", 0, 0, null, {fill:"white", stroke:colour1, rx:2, width:40, height:40}, {fill:"yellow"}, {fill:"orange"}, 2, false);

    this.controller = controller;
    this.selectedItem = null;
	this.tag = tag;
	this.itemChoiceSet = itemChoiceSet;
}

KevLinDev.extend(ItemViewSelector, RectButton);

ItemViewSelector.prototype.doAction = function(src, evt)
{
	if (evt.type == "click" && src == this)
	{
     	// Update the item using the item selector window
    	this.controller.editWindow.itemSelectorWindow.setClient(this, this.selectedItem, this.itemChoiceSet, this.tag);
		this.controller.editWindow.itemSelectorWindow.show();
	}
	else if (evt.type == "itemUpdated")
	{
		// The item has been updated by something, so update the appearance
		this.setSelectedItem(evt.item);
	}	

    ItemViewSelector.superClass.doAction.call(this, src, evt);
}

ItemViewSelector.prototype.userHasSelectedItem = function(item, tag)
{
	if (tag == this.tag)
    	this.setSelectedItem(item);
}

ItemViewSelector.prototype.setSelectedItem = function(item)
{
    if (this.selectedItem == item)
        return;
        
	this.selectedItem = item;
	
	if (item != null)
	{
		var itemEditElement = this.controller.model.itemFactory.makeSimpleViewItem(item);
		this.setContents(itemEditElement);
	}
	else
	{
		var itemEditElement = new SVGElement();
		itemEditElement.cloneElement(this.controller.artwork.getElementById("clickToChooseItem"));
		this.setContents(itemEditElement);
	}
	this.tellActionListeners(this, {type:"itemViewUpdated"});
}

