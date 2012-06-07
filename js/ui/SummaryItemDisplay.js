// A generic selector for items 
function SummaryItemDisplay(controller, rectAttributes, borderWidth)
{
    this.controller = controller;
    this.selectedItem = null;

    SummaryItemDisplay.baseConstructor.call(this, 0, 0, null, rectAttributes, borderWidth);
}

KevLinDev.extend(SummaryItemDisplay, RectLabel);

SummaryItemDisplay.prototype.setSelectedItem = function(item)
{
    if (this.selectedItem == item)
        return;
        
	this.selectedItem = item;
	
	if (item != null)
	{
		var itemPresentationElement = this.controller.model.itemFactory.makeSimpleViewItem(item);
		this.setContents(itemPresentationElement);
	}
	else
	{
		var itemPresentationElement = new SVGElement();
		itemPresentationElement.cloneElement(this.controller.artwork.getElementById("noChosenItem"));
		this.setContents(itemPresentationElement);
	}
}

