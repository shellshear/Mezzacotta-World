// This is a window holding a list of action summaries. 
// It also has buttons to create new actions.
function ActionViewWindow(controller)
{
	this.controller = controller;
	
    ActionViewWindow.baseConstructor.call(this, "Actions", 5, {fill:"lightGreen", stroke:"green", rx:4}, {width:217, height:309, storePrefix:"MW_ActionViewWindow", contentsSpacing:3});

    // The actions view window allows the user to create and edit actions.
    this.newActionButtons = new FlowLayout(0, 0, {minSpacing:3});

    var actionButtonParams = ["iconActionSpeech", "iconActionRaiseLower", "iconActionTeleport", "iconActionMove"];

	// New action buttons
    for (var i in actionButtonParams)
    {
        var currIcon = new SVGElement();
        currIcon.cloneElement(
            this.controller.artwork.getElementById(actionButtonParams[i]));

        var actionButton = new RectButton(actionButtonParams[i], 0, 0, currIcon, {fill:"white", stroke:"green", rx:2, width:40, height:40}, {fill:"yellow"}, {fill:"orange"}, 5, false);
        actionButton.addActionListener(this);
        this.newActionButtons.appendChild(actionButton);
    }
    this.contents.appendChild(this.newActionButtons);
    
    // List of action summaries
    this.actionSummaries = new FlowLayout(0, 0, {direction:"down", minSpacing:3});
	this.actionScrollbarRegion = new ScrollbarRegion({width:240, height:200, scrollbarWidth:20}, this.actionSummaries);
    this.actionSummaries.addResizeListener(this.actionScrollbarRegion);
	this.contents.appendChild(this.actionScrollbarRegion);

	// Update our action summary list from the action controller
    for (var i in this.controller.actionController.itemActionList)
    {
        this.addActionSummary(this.controller.actionController.itemActionList[i]);
    }

	// We wish to get updates from the action controller about actions being added or deleted
	// so we can update our corresponding action summaries.
	this.controller.actionController.addActionListener(this);
}

KevLinDev.extend(ActionViewWindow, SVGWindow);

// Add an action summary widget for this action
ActionViewWindow.prototype.addActionSummary = function(action)
{
    var newActionSummary = makeActionSummary(this.controller, action);
    this.actionSummaries.appendChild(newActionSummary);
	newActionSummary.addActionListener(this);
}

ActionViewWindow.prototype.deleteActionSummary = function(actionSummary)
{
    this.actionSummaries.removeChild(actionSummary);
}

ActionViewWindow.prototype.doAction = function(src, evt)
{
    ActionViewWindow.superClass.doAction.call(this, src, evt);

	if (evt.type == "click")
	{
		var action = null;
		
    	switch (src.src)
 		{
		case "iconActionSpeech":
			// Create an empty speech action
			action = new SpeechAction(this.controller.model, this.controller, null, null);
			break;

		case "iconActionRaiseLower":
			// Create an empty height action
			action = new HeightAction(this.controller.model, this.controller, null, 0);
			break;

		case "iconActionTeleport":
			// Create an empty teleport action
			action = new TeleportAction(this.controller.model, this.controller, null);
			break;

    	case "iconActionMove":
    		// Create an empty teleport action
    		action = new MoveAction(this.controller.model, this.controller, null, null);
    		break;
		}
		
		if (action != null)
		{
			this.controller.actionController.appendAction(action); // add the action
			this.appendActionEditor(action); // create an editor widget
	        this.addActionSummary(action); // also create a summary widget
			
			this.controller.setMapSavedStatus(false);
		}
	}
	else if (evt.type == "deleteAction")
	{
		// ActionEditor has told us the user deleted an action
		this.controller.actionController.removeAction(src.myAction);
        this.controller.setMapSavedStatus(false);

		this.setAble(true);
		this.removeChild(src);
	}
	else if (evt.type == "cancelAction")
	{
		// ActionEditor has told us the user cancelled what they were doing to an action
		// We don't need to do anything except close the ActionEditor window.
		this.setAble(true);
		this.removeChild(src);
	}
	else if (evt.type == "updateAction")
	{
		// ActionEditor has told us the user updated an action
		// We don't need to do anything except close the ActionEditor window.
		this.setAble(true);
		this.removeChild(src);
	}
	else if (evt.type == "actionSummaryDeleted")
	{
		// An ActionSummary in our list told us it wants to get deleted
		// (Probably because an action told the ActionSummary it was getting deleted)
		this.deleteActionSummary(src);
	}
	else if (evt.type == "actionEditRequested")
	{
		// An ActionSummary in our list wants its action to get edited
		this.appendActionEditor(src);
	}
	else if (evt.type == "allActionsAndConditionsDeleted")
	{
		// ActionController has told us it has cleared all the actions.
	    this.actionSummaries.removeChildren();
	}
	else if (evt.type == "ActionAdded")
	{
		// ActionController has told us an action has been added
		this.addActionSummary(src);
	}
}

ActionViewWindow.prototype.appendActionEditor = function(action)
{
    var newActionEditor = makeActionEditor(this.controller, action);
	newActionEditor.addActionListener(this);
	
	// Show the action editor
	this.setAble(false);
	this.appendChild(newActionEditor);
}

function makeActionSummary(controller, action)
{
	var result = null;
	
	switch (action.type)
	{
	case "Speech":
		result = new SpeechActionSummary(controller, action, "blue", "lightBlue");
		break;
		
	case "Height":
		result = new HeightActionSummary(controller, action, "purple", "plum");
		break;
		
	case "Teleport":
		result = new TeleportActionSummary(controller, action, "darkGreen", "green");
		break;

    case "Move":
    	result = new MoveActionSummary(controller, action, "khaki", "darkkhaki");
    	break;
	}
	return result;
}

function makeActionEditor(controller, action)
{
	var result = null;
	
	switch (action.type)
	{
	case "Speech":
		result = new SpeechActionEditor(controller, action, "blue", "lightBlue");
		break;
		
	case "Height":
		result = new HeightActionEditor(controller, action, "purple", "plum");
		break;
		
	case "Teleport":
		result = new TeleportActionEditor(controller, action, "darkGreen", "green");
		break;

    case "Move":
    	result = new MoveActionEditor(controller, action, "khaki", "darkkhaki");
    	break;
	}
	return result;
}

