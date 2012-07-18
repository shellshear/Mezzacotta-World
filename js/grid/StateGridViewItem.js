// Handle the view of an item that has multiple states
// NOTE: This is not yet a PerspectiveGridViewItem, but probably should be at some point.
function StateGridViewItem(modelItem, viewItemFactory, stateItem)
{
    this.stateItem = stateItem;
    
    StateGridViewItem.baseConstructor.call
        (this, modelItem, viewItemFactory, this.stateItem);   

	this.updateElevation();
	
	if (this.modelItem.owner != null && this.modelItem.owner.params != null && this.modelItem.owner.params.itemTags != null)
		this.stateItem.setStateBasedOnParentTag(this.modelItem.owner.params.itemTags);
}

KevLinDev.extend(StateGridViewItem, LitGridViewItem);

StateGridViewItem.prototype.updateElevation = function()
{
    // We set the base position to be the height of the object
    // so that items that go on top of it are correctly placed
    var translateHeight = -this.modelItem.params.elev;    
    this.itemGraphics.setAttribute("transform", "translate(0, " + translateHeight + ")");
}

StateGridViewItem.prototype.doAction = function(src, evt)
{
    StateGridViewItem.superClass.doAction.call(this, src, evt);   

    if (evt.type == "paramChanged")
    {
        if (evt.name == "state")
        {
            this.stateItem.setState(evt.value);
        }
        else if (evt.name == "direction")
        {
            this.stateItem.setDirection(evt.value);
        }
		else if (evt.name == "elev")
		{
			this.updateElevation();
		}
    }
}

