// Teleport action requires an item and the teleport destination
function TeleportActionSummary(controller, action, colour1, colour2)
{
    TeleportActionSummary.baseConstructor.call(this, controller, action, colour1, colour2);

	// Create presentation contents
    var presentationContents = new FlowLayout(0, 0, {minSpacing:3});

    var currIcon = new SVGElement();
    currIcon.cloneElement(this.controller.artwork.getElementById("iconActionTeleport"));
    var actionButton = new RectLabel(0, 0, currIcon, {fill:colour1, stroke:"none", rx:2, width:30, height:30}, 2);
    presentationContents.appendChild(actionButton);

    this.destinationPresentationElement = new SVGElement("text", {"font-size":12, fill:"black", x:5, y:14}, null);
    presentationContents.appendChild(this.destinationPresentationElement);
	
	this.presentationLayout.prependChild(presentationContents);

    this.initFromAction();
}

KevLinDev.extend(TeleportActionSummary, ActionSummary);

TeleportActionSummary.prototype.initFromAction = function()
{
	this.setDestination(this.myAction.destination);
	TeleportActionSummary.superClass.initFromAction.call(this);    
}

TeleportActionSummary.prototype.setDestination = function(destinationId)
{
	var destination = "";
    if (destinationId != null && this.controller.visitedWorlds[destinationId] != null)
	{
		destination = this.controller.visitedWorlds[destinationId].map_name;
	}
	this.destinationPresentationElement.setValue(destination);
	this.presentationLayout.refreshLayout();
}

