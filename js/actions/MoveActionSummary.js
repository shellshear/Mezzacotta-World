// Move action requires an item and the destination
function MoveActionSummary(controller, action, colour1, colour2)
{
    MoveActionSummary.baseConstructor.call(this, controller, action, colour1, colour2);

	// Create presentation contents
    var presentationContents = new FlowLayout(0, 0, {minSpacing:3, orthogonalAlignment:"centre"});

    var currIcon = new SVGElement();
    currIcon.cloneElement(this.controller.artwork.getElementById("iconActionMove"));
    var actionButton = new RectLabel(0, 0, currIcon, {fill:colour1, stroke:"none", rx:2, width:30, height:30}, 2);
    presentationContents.appendChild(actionButton);

	var moveText = new SVGElement("text", {y:12, "font-size":12}, "Move");
	presentationContents.appendChild(moveText);

    this.targetLabel = new SummaryItemDisplay(this.controller, {fill:"white", stroke:"none", rx:2, width:30, height:30}, 2);
	presentationContents.appendChild(this.targetLabel);

	var toText = new SVGElement("text", {y:12, "font-size":12}, "to");
	presentationContents.appendChild(toText);

    this.destinationLabel = new SummaryItemDisplay(this.controller, {fill:"white", stroke:"none", rx:2, width:30, height:30}, 2);
	presentationContents.appendChild(this.destinationLabel);

	this.presentationLayout.prependChild(presentationContents);

    this.initFromAction();
}

KevLinDev.extend(MoveActionSummary, ActionSummary);

MoveActionSummary.prototype.initFromAction = function()
{
	this.targetLabel.setSelectedItem(this.myAction.targetItem.item);
	this.destinationLabel.setSelectedItem(this.myAction.destItem.item);

	MoveActionSummary.superClass.initFromAction.call(this);    
}
