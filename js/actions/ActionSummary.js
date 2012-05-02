// The action area allows the user to view and edit a single action.
function ActionSummary(controller, action, colour1, colour2)
{
    this.controller = controller;
	this.myAction = action;
	this.colour1 = colour1;
	this.colour2 = colour2;

	this.myAction.addActionListener(this);

	// Create the presentation layout

    // Layout of conditions
	// TODO: Where to attach conditionList?
	this.conditionSummaries = new FlowLayout(0, 0, {direction:"down", minSpacing:3});

    this.presentationLayout = new FlowLayout(0, 0, {minSpacing:3});

    this.editButton = new RectButton("editAction", 0, 0, new SVGElement("text", {"font-size":12, fill:"black", x:5, y:12}, "Edit"), {fill:"white", stroke:"green", rx:2}, {fill:"green"}, {fill:"blue"}, 2, false);    
    this.editButton.addActionListener(this);
    this.presentationLayout.appendChild(this.editButton);

	// Add existing conditions
	this.updateConditionSummaries(this.myAction.conditions);

    ActionSummary.baseConstructor.call(this, 0, 0, this.presentationLayout, {fill:this.colour2,stroke:this.colour1,rx:4}, 3);
}

KevLinDev.extend(ActionSummary, RectLabel);

ActionSummary.prototype.updateConditionSummaries = function(conditionList)
{
    this.clearConditionSummaries();

    for (var i in conditionList)
    {
        var newConditionView = makeConditionSummary(this.controller, conditionList[i]);
        this.conditionSummaries.appendChild(newConditionView);
		newConditionView.addActionListener(this);
    }
}

ActionSummary.prototype.clearConditionSummaries = function()
{
    this.conditionSummaries.removeChildren();
}

ActionSummary.prototype.doAction = function(src, evt)
{
    ActionSummary.superClass.doAction.call(this, src, evt);

	if (evt.type == "click" && src.src == "editAction")
	{
 		// User wishes to edit this action
		this.tellActionListeners(this.myAction, {type:"actionEditRequested"});
	}
	else if (evt.type == "actionUpdated")
	{
		this.initFromAction();
	}
	else if (evt.type == "actionDeleted")
	{
		// The action has been deleted, so we should remove ourselves too
		this.tellActionListeners(this, {type:"actionSummaryDeleted"});
	}
}

// Default initialisation of the action summary from the action data
// Used at init, and whenever the action data has changed
ActionSummary.prototype.initFromAction = function()
{
	this.refreshLayout();
}
