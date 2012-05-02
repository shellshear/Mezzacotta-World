// The action area allows the user to view and edit a single action.
function ActionEditor(controller, action, colour1, colour2)
{
    this.controller = controller;
	this.myAction = action;
	this.colour1 = colour1;
	this.colour2 = colour2;

    ActionEditor.baseConstructor.call(this, "Action Editor", 5, {fill:this.colour2, stroke:this.colour1, rx:4}, {width:250, height:300, storePrefix:"MW_ActionEditor", contentsSpacing:3});

	// Create the editable layout
	var buttonArea = new FlowLayout(0, 0, {minSpacing:20});	

	// New condition buttons
    this.newConditionButtons = new FlowLayout(0, 0, {minSpacing:3});
    this.conditionButtonParams = ["iconConditionTime", "iconConditionWeight", "iconConditionHasItem"];

    for (var i in this.conditionButtonParams)
    {
        var currIcon = new SVGElement();
        currIcon.cloneElement(
            this.controller.artwork.getElementById(this.conditionButtonParams[i]));

        var conditionButton = new RectButton(this.conditionButtonParams[i], 0, 0, currIcon, {fill:"white", stroke:"orange", rx:2, width:30, height:30}, {fill:"yellow"}, {fill:"orange"}, 5, false);
        conditionButton.addActionListener(this);
        this.newConditionButtons.appendChild(conditionButton);
    }
    this.contents.appendChild(this.newConditionButtons);

    // Layout of conditions
	this.conditionSummaries = new FlowLayout(0, 0, {direction:"down", minSpacing:3});
	this.conditionScrollbarRegion = new ScrollbarRegion({width:240, height:200, scrollbarWidth:20}, this.conditionSummaries);
    this.conditionSummaries.addResizeListener(this.conditionScrollbarRegion);
	this.contents.appendChild(this.conditionScrollbarRegion);

	this.updateConditionSummaries(this.myAction.conditions);
	
	// Fill out with existing conditions
	
	this.contents.appendChild(this.conditionSummaries);

	// Update, cancel and delete buttons
    this.updateButton = new RectButton("updateAction", 0, 0, new SVGElement("text", {"font-size":12, fill:"black", x:5, y:12}, "Update"), {fill:"white", stroke:"green", rx:2}, {fill:"green"}, {fill:"blue"}, 2, false);    
    this.updateButton.addActionListener(this);
    buttonArea.appendChild(this.updateButton);

    this.deleteButton = new RectButton("deleteAction", 0, 0, new SVGElement("text", {"font-size":12, fill:"black", x:5, y:12}, "Delete"), {fill:"white", stroke:"red", rx:2}, {fill:"orange"}, {fill:"red"}, 2, false);    
    this.deleteButton.addActionListener(this);
	buttonArea.appendChild(this.deleteButton);
	
    this.cancelButton = new RectButton("cancelAction", 0, 0, new SVGElement("text", {"font-size":12, fill:"black", x:5, y:12}, "Cancel"), {fill:"white", stroke:"red", rx:2}, {fill:"orange"}, {fill:"red"}, 2, false);    
    this.cancelButton.addActionListener(this);
	buttonArea.appendChild(this.cancelButton);
	
	this.contents.appendChild(buttonArea);
	this.addResizeListener(this);
	
}

KevLinDev.extend(ActionEditor, SVGWindow);

ActionEditor.prototype.updateConditionSummaries = function(conditionList)
{
    this.clearConditionSummaries();

    for (var i in conditionList)
    {
        this.addConditionSummary(conditionList[i]);
    }
}

ActionEditor.prototype.clearConditionSummaries = function()
{
    this.conditionSummaries.removeChildren();
}

ActionEditor.prototype.addConditionSummary = function(condition)
{
    var newConditionSummary = makeConditionSummary(this.controller, condition, false);
    this.conditionSummaries.appendChild(newConditionSummary);
	newConditionSummary.addActionListener(this);
}

ActionEditor.prototype.deleteConditionSummary = function(conditionSummary)
{
    this.conditionSummaries.removeChild(conditionSummary);
}

ActionEditor.prototype.doAction = function(src, evt)
{
    ActionEditor.superClass.doAction.call(this, src, evt);

	if (evt.type == "click")
	{
		var condition = null;
		
		switch (src.src)
		{
    	case "cancelAction":
 		    this.initFromAction(); // Reset to match actual action
			this.tellActionListeners(this, {type:"cancelAction"});
			break;
        
    	case "updateAction":
 			// Change to presentation mode
			this.tellActionListeners(this, {type:"updateAction"});
            this.controller.setMapSavedStatus(false);
			break;

		case "deleteAction":
	 		// Remove this action
			this.tellActionListeners(this, {type:"deleteAction"});
            this.controller.setMapSavedStatus(false);
			break;

		case "iconConditionTime":
			// Create a new timer condition
			condition = new TimestampCondition(this.controller.model, this.controller, this.controller.turnClock, 0);
			break;		

		case "iconConditionWeight":
			// Create a new weight condition
			condition = new WeightCondition(this.controller.model, this.controller, null, 1);
			break;		

    	case "iconConditionHasItem":
    		// Create a new hasItem condition
    		condition = new HasItemCondition(this.controller.model, this.controller, null, false, null);
    		break;		
		}
		
		if (condition != null)
		{
            if (condition.id == null)
            {
		        this.controller.actionController.registerCondition(condition);
			}
			this.myAction.addCondition(condition); // add the condition
			this.appendConditionEditor(condition); // create an editor widget
			this.addConditionSummary(condition); // also create a summary widget

            this.controller.setMapSavedStatus(false);
		}
	}
	else if (evt.type == "deleteCondition")
	{
		this.controller.actionController.removeCondition(src.myCondition);
        this.controller.setMapSavedStatus(false);

		this.setAble(true);
		this.removeChild(src);
	}
	else if (evt.type == "cancelCondition")
	{
		this.setAble(true);
		this.removeChild(src);
	}
	else if (evt.type == "updateCondition")
	{
		this.setAble(true);
		this.removeChild(src);
	}
	else if (evt.type == "conditionSummaryDeleted")
	{
		this.deleteConditionSummary(src);
	}
	else if (evt.type == "conditionEditRequested")
	{
		this.appendConditionEditor(src); // create an editor widget for the requested condition
	}
}

ActionEditor.prototype.appendConditionEditor = function(condition)
{
    var newConditionEditor = makeConditionEditor(this.controller, condition);
	if (newConditionEditor != null)
	{
		newConditionEditor.addActionListener(this);
	
		// Show the condition editor
		this.setAble(false);
		this.appendChild(newConditionEditor);
	}
}

// Default initialisation of the action area from the action data
// Used at init, and whenever we want to edit the action
ActionEditor.prototype.initFromAction = function()
{
}

function makeConditionSummary(controller, condition)
{
	var result = null;
	
	switch (condition.type)
	{
	case "Timestamp":
    	result = new TimestampConditionSummary(controller, condition);
		break;
		
	case "Weight":
		result = new WeightConditionSummary(controller, condition);
		break;
		
	case "HasItem":
		result = new HasItemConditionSummary(controller, condition);
		break;
	}
	return result;
}

function makeConditionEditor(controller, condition)
{
	var result = null;
	
	switch (condition.type)
	{
	case "Timestamp":
    	result = new TimestampConditionEditor(controller, condition);
		break;
		
	case "Weight":
		result = new WeightConditionEditor(controller, condition);
		break;
		
	case "HasItem":
		result = new HasItemConditionEditor(controller, condition);
		break;
	}
	return result;
}