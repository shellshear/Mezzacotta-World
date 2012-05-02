// Teleport action requires an item and the teleport destination
function TeleportActionEditor(controller, action, colour1, colour2)
{
    TeleportActionEditor.baseConstructor.call(this, controller, action, colour1, colour2);

	this.destinationId = null;

	// Create editable contents
    var editableContents = new FlowLayout(0, 0, {minSpacing:3});

    var currIcon = new SVGElement();
    currIcon.cloneElement(this.controller.artwork.getElementById("iconActionTeleport"));
    var actionButton = new RectLabel(0, 0, currIcon, {fill:colour1, stroke:"none", rx:2, width:30, height:30}, 2);
    editableContents.appendChild(actionButton);

    var reminderText = new SVGElement("text", {"font-size":12, y:12, fill:"black"}, "Destination:");
	editableContents.appendChild(reminderText);
	
    // Select teleport button
    this.teleportToText = new SVGElement("text", {"font-size":12, y:12, fill:"black"}, "Select Destination");
    this.selectTeleportButton = new RectButton("selectTeleportButton", 0, 0, this.teleportToText, {fill:"white", stroke:"none"}, {fill:"yellow"}, {fill:"orange"}, 2, false);	
    this.selectTeleportButton.addActionListener(this);
	editableContents.appendChild(this.selectTeleportButton);	

	// Teleport destination subwindow
	this.teleportWindow = new WorldChooserWindow(this.controller, {windowName:"Teleport Destination", showAccessOnly:true, closeOnSelect:true});
	this.teleportWindow.addActionListener(this);
	this.teleportWindow.hide();
	this.appendChild(this.teleportWindow);
    this.controller.visitedWorldNotifier.addActionListener(this.teleportWindow);

	this.contents.prependChild(editableContents);

    this.initFromAction();
}

KevLinDev.extend(TeleportActionEditor, ActionEditor);

TeleportActionEditor.prototype.initFromAction = function()
{
	this.setDestination(this.myAction.destination);
	this.refreshLayout();
}

TeleportActionEditor.prototype.doAction = function(src, evt)
{
	if (evt.type == "click")
	{
		switch (src.src)
		{
		case "updateAction":
			// Update the action
			this.myAction.setDestination(this.destinationId);
			break;
			
		case "selectTeleportButton":
			this.teleportWindow.show();
			break;
		}
	}		
    else if (evt.type == "worldSelected")
    {
		this.setDestination(evt.value);
    }

    TeleportActionEditor.superClass.doAction.call(this, src, evt);
}

TeleportActionEditor.prototype.setDestination = function(destinationId)
{
    this.destinationId = destinationId;

	var destination = "";
    if (destinationId != null && this.controller.visitedWorlds[destinationId] != null)
	{
    	this.teleportToText.setValue(this.controller.visitedWorlds[destinationId].map_name);
    	this.selectTeleportButton.refreshLayout();
	}
}

