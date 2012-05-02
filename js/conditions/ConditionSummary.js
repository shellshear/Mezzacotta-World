// The condition summary allows the user to view a single condition
function ConditionSummary(controller, condition)
{
    this.controller = controller;
	this.myCondition = condition;

	this.myCondition.addActionListener(this);

	// Create the presentation layout
    this.presentationLayout = new FlowLayout(0, 0, {minSpacing:3});

    this.editButton = new RectButton("editCondition", 0, 0, new SVGElement("text", {"font-size":12, fill:"black", x:5, y:12}, "Edit"), {fill:"white", stroke:"green", rx:2}, {fill:"green"}, {fill:"blue"}, 2, false);    
    this.editButton.addActionListener(this);
    this.presentationLayout.appendChild(this.editButton);

    ConditionSummary.baseConstructor.call(this, 0, 0, this.presentationLayout, {fill:"lightyellow",stroke:"orange",rx:4}, 3);
}

KevLinDev.extend(ConditionSummary, RectLabel);

ConditionSummary.prototype.doAction = function(src, evt)
{
    ConditionSummary.superClass.doAction.call(this, src, evt);

	if (evt.type == "click")
	{
		switch (src.src)
		{
		case "editCondition":
			// User wishes to edit the condition
			this.tellActionListeners(this.myCondition, {type:"conditionEditRequested"});
			break;
		}
	}
	else if (evt.type == "conditionUpdated")
	{
		this.initFromCondition();
	}
	else if (evt.type == "conditionDeleted")
	{
		// The condition has been deleted, so we should remove ourselves too
		this.tellActionListeners(this, {type:"conditionSummaryDeleted"});
	}
}

// Default init from condition, used in init and when starting to edit
ConditionSummary.prototype.initFromCondition = function()
{
	this.refreshLayout();
}

