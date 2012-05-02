function WeightConditionSummary(controller, condition)
{
    WeightConditionSummary.baseConstructor.call(this, controller, condition);

	// Create presentation contents
    var presentationContents = new FlowLayout(0, 0, {minSpacing:3});

    var currIcon = new SVGElement();
    currIcon.cloneElement(this.controller.artwork.getElementById("iconConditionWeight"));
    conditionTypeLabel = new RectLabel(0, 0, currIcon, {fill:"orange", stroke:"none", rx:2, width:20, height:20}, 2);
    presentationContents.appendChild(conditionTypeLabel);

    this.itemPresentationLabel = new SummaryItemDisplay(this.controller, {fill:"white", stroke:"none", rx:2, width:30, height:30}, 2);
	presentationContents.appendChild(this.itemPresentationLabel);

    this.weightPresentationElement = new SVGElement("text", {"font-size":12, fill:"black", x:5, y:14}, "weight: 0");
    presentationContents.appendChild(this.weightPresentationElement);
	
	this.presentationLayout.prependChild(presentationContents);

    this.initFromCondition();
}

KevLinDev.extend(WeightConditionSummary, ConditionSummary);

WeightConditionSummary.prototype.initFromCondition = function()
{
    this.itemPresentationLabel.setSelectedItem(this.myCondition.weightItem.item);
	this.setWeight(this.myCondition.minWeight);

	WeightConditionSummary.superClass.initFromCondition.call(this);    
}

WeightConditionSummary.prototype.setWeight = function(weight)
{
	this.weightPresentationElement.setValue("weight: " + weight);	
	//this.presentationLayout.refreshLayout(); // TODO: Do we need to refresh here?
}
