function TimestampConditionEditor(controller, condition)
{
    TimestampConditionEditor.baseConstructor.call(this, controller, condition, 173, 86);

	// Create editable contents
    var editableContents = new FlowLayout(0, 0, {minSpacing:3});

    var currIcon = new SVGElement();
    currIcon.cloneElement(this.controller.artwork.getElementById("iconConditionTime"));
    var conditionTypeLabel = new RectLabel(0, 0, currIcon, {fill:"orange", stroke:"none", rx:2, width:20, height:20}, 2);
    editableContents.appendChild(conditionTypeLabel);

	this.timestampEditTextbox = new TextArea("timestampText", controller.background, {width:40, height:20, fill:"white", "stroke":"orange", rx:5}, {"font-size":14, fill:"black", x:3, y:14}, 0, 0, {normal:{stroke:"orange"}, focus:{stroke:"red"}});
   	editableContents.appendChild(this.timestampEditTextbox);

	this.contents.prependChild(editableContents);

    this.initFromCondition();
}

KevLinDev.extend(TimestampConditionEditor, ConditionEditor);

TimestampConditionEditor.prototype.initFromCondition = function()
{
	this.setTimestamp(this.myCondition.timestamp);
	this.refreshLayout();
}

TimestampConditionEditor.prototype.doAction = function(src, evt)
{
	if (evt.type == "click")
	{
		switch (src.src)
		{
		case "updateCondition":
			// Commit the updates into the condition
			var timestamp = parseInt(this.timestampEditTextbox.textVal);
			this.myCondition.setTimestamp(timestamp);
		
			// Update the appearance
			this.setTimestamp(timestamp);
			break;
		}
	}		

    TimestampConditionEditor.superClass.doAction.call(this, src, evt);
}

TimestampConditionEditor.prototype.setTimestamp = function(timestamp)
{
	this.timestampEditTextbox.setValue(timestamp);
}

