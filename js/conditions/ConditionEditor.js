// The action area allows the user to view and edit a single action.
function ConditionEditor(controller, condition, width, height)
{
    this.controller = controller;
	this.myCondition = condition;

    ConditionEditor.baseConstructor.call(this, "Condition Editor", 5, {fill:"yellow", stroke:"black", rx:4}, {width:width, height:height, storePrefix:"MW_ConditionEditor", contentsSpacing:3});

	// Create the editable layout
	var buttonArea = new FlowLayout(0, 0, {minSpacing:20});	

    this.updateButton = new RectButton("updateCondition", 0, 0, new SVGElement("text", {"font-size":12, fill:"black", x:5, y:12}, "Update"), {fill:"white", stroke:"green", rx:2}, {fill:"green"}, {fill:"blue"}, 2, false);    
    this.updateButton.addActionListener(this);
    buttonArea.appendChild(this.updateButton);

    this.deleteButton = new RectButton("deleteCondition", 0, 0, new SVGElement("text", {"font-size":12, fill:"black", x:5, y:12}, "Delete"), {fill:"white", stroke:"red", rx:2}, {fill:"orange"}, {fill:"red"}, 2, false);    
    this.deleteButton.addActionListener(this);
	buttonArea.appendChild(this.deleteButton);
	
    this.cancelButton = new RectButton("cancelCondition", 0, 0, new SVGElement("text", {"font-size":12, fill:"black", x:5, y:12}, "Cancel"), {fill:"white", stroke:"red", rx:2}, {fill:"orange"}, {fill:"red"}, 2, false);    
    this.cancelButton.addActionListener(this);
	buttonArea.appendChild(this.cancelButton);
	
	this.contents.appendChild(buttonArea);
}

KevLinDev.extend(ConditionEditor, SVGWindow);

ConditionEditor.prototype.doAction = function(src, evt)
{
    ConditionEditor.superClass.doAction.call(this, src, evt);

	if (evt.type == "click")
	{
		switch (src.src)
		{
		case "cancelCondition":
		    this.initFromCondition();
			this.tellActionListeners(this, {type:"cancelCondition"});
			break;

		case "updateCondition":
			// Change to presentation mode
			this.tellActionListeners(this, {type:"updateCondition"});
            this.controller.setMapSavedStatus(false);
			break;

		case "deleteCondition":
			// Remove the condition
			this.tellActionListeners(this, {type:"deleteCondition"});
            this.controller.setMapSavedStatus(false);
			break;
		}
	}
}

// Default init from condition, used in init and when starting to edit
ConditionEditor.prototype.initFromCondition = function()
{
}

