function TimestampConditionSummary(controller, condition)
{
    TimestampConditionSummary.baseConstructor.call(this, controller, condition);

	// Create presentation contents
    var presentationContents = new FlowLayout(0, 0, {minSpacing:3});

    var currIcon = new SVGElement();
    currIcon.cloneElement(this.controller.artwork.getElementById("iconConditionTime"));
    conditionTypeLabel = new RectLabel(0, 0, currIcon, {fill:"orange", stroke:"none", rx:2, width:20, height:20}, 2);
    presentationContents.appendChild(conditionTypeLabel);

    this.timestampPresentationElement = new SVGElement("text", {"font-size":12, fill:"black", x:5, y:14}, "time: 0");
    presentationContents.appendChild(this.timestampPresentationElement);
	
	this.presentationLayout.prependChild(presentationContents);

    this.initFromCondition();
}

KevLinDev.extend(TimestampConditionSummary, ConditionSummary);

TimestampConditionSummary.prototype.initFromCondition = function()
{
	this.setTimestamp(this.myCondition.timestamp);

	TimestampConditionSummary.superClass.initFromCondition.call(this);    
}

TimestampConditionSummary.prototype.setTimestamp = function(timestamp)
{
	this.timestampPresentationElement.setValue("time: " + timestamp);	
	this.presentationLayout.refreshLayout();
}

