 // Height action requires a block item and the target height
function HeightActionSummary(controller, action, colour1, colour2)
{
    HeightActionSummary.baseConstructor.call(this, controller, action, colour1, colour2);
    
	// Create presentation contents
    var presentationContents = new FlowLayout(0, 0, {minSpacing:3});

	// action type icon
    var currIcon = new SVGElement();
    currIcon.cloneElement(this.controller.artwork.getElementById("iconActionRaiseLower"));
    var actionButton = new RectLabel(0, 0, currIcon, {fill:colour1, stroke:"none", rx:2, width:30, height:30}, 2);
    presentationContents.appendChild(actionButton);

	// block item
    this.itemPresentationLabel = new SummaryItemDisplay(this.controller, {fill:"white", stroke:"none", rx:2, width:30, height:30}, 2);
	presentationContents.appendChild(this.itemPresentationLabel);

	// Right arrow 
    rightArrow = new SVGElement();
    rightArrow.cloneElement(this.controller.artwork.getElementById("iconRightArrow"));
    this.rightArrowLabelPres = new RectLabel(0, 0, rightArrow, {fill:"none", stroke:"none", width:30, height:30});	
	presentationContents.appendChild(this.rightArrowLabelPres);

	// Resulting item appearance
    this.finalItemAppearancePres = new RectLabel(0, 0, null, {fill:"white", stroke:"none", rx:2, width:30, height:30}, 2);	
	presentationContents.appendChild(this.finalItemAppearancePres);

	this.presentationLayout.prependChild(presentationContents);

    this.initFromAction();
}

KevLinDev.extend(HeightActionSummary, ActionSummary);

HeightActionSummary.prototype.initFromAction = function()
{
 	this.setSelectedItem(this.myAction.heightItem.item);
    this.setNewHeight(this.myAction.newHeight);

	HeightActionSummary.superClass.initFromAction.call(this);    
}

HeightActionSummary.prototype.setNewHeight = function(height)
{
    this.newHeight = height;

    // Update the final item appearance 
    if (this.finalItemAppearancePresEl != null)
    {
        this.finalItemAppearancePresEl.setHeight(height);
        this.finalItemAppearancePres.refreshLayout();
    }
}

HeightActionSummary.prototype.setSelectedItem = function(item)
{
    if (this.selectedItem == item)
        return;

	this.itemPresentationLabel.setSelectedItem(item);

	if (item != null)
	{
	    this.newHeight = item.params.ht;

		// Show the final item appearance and arrow
        this.rightArrowLabelPres.show();
		this.finalItemAppearancePres.show();

		this.finalItemAppearancePresEl = this.controller.model.itemFactory.makeSimpleViewItem(item);
		this.finalItemAppearancePres.setContents(this.finalItemAppearancePresEl);
	}
	else
	{
		// Hide the final item appearance and arrow
        this.rightArrowLabelPres.hide();

		this.finalItemAppearancePres.setContents(null);
		this.finalItemAppearancePres.hide();
	}
}

