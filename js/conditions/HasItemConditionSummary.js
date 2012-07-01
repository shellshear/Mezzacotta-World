function HasItemConditionSummary(controller, condition)
{
    HasItemConditionSummary.baseConstructor.call(this, controller, condition);

    this.selectedItem = null;
    this.selectedContainer = null;

	// Create presentation contents
	// Consists of [icon] [container] has [this|any] [item]
    var presentationContents = new FlowLayout(0, 0, {minSpacing:3});

    // icon
    var currIcon = new SVGElement();
    currIcon.cloneElement(this.controller.artwork.getElementById("iconConditionHasItem"));
    conditionTypeLabel = new RectLabel(0, 0, currIcon, {fill:"orange", stroke:"none", rx:2, width:20, height:20}, 2);
    presentationContents.appendChild(conditionTypeLabel);

    // container
    this.containerLabel = new SummaryItemDisplay(this.controller, {fill:"white", stroke:"none", rx:2, width:30, height:30}, 2);
	presentationContents.appendChild(this.containerLabel);

    // contains
    var hasElement = new SVGElement("text", {"font-size":12, fill:"black", x:5, y:14}, "contains");
    presentationContents.appendChild(hasElement);

    // this/any/a
    this.thisOrAnyElement = new SVGElement("text", {"font-size":12, fill:"black", x:5, y:14}, "this");
    presentationContents.appendChild(this.thisOrAnyElement);
    
    // item
    this.heldLabel = new SummaryItemDisplay(this.controller, {fill:"white", stroke:"none", rx:2, width:30, height:30}, 2);
	presentationContents.appendChild(this.heldLabel);

	this.presentationLayout.prependChild(presentationContents);

    this.initFromCondition();
}

KevLinDev.extend(HasItemConditionSummary, ConditionSummary);

HasItemConditionSummary.prototype.initFromCondition = function()
{
	this.heldLabel.setSelectedItem(this.myCondition.heldItem.item);
    this.containerLabel.setSelectedItem(this.myCondition.containerItem.item);

	if (this.myCondition.heldItem.matchCriterion == "code")
	{
		this.thisOrAnyElement.setValue("any");
	}
	else if (this.myCondition.heldItem.matchCriterion == "id")
	{
		this.thisOrAnyElement.setValue("this");
	}
	else
	{
		this.thisOrAnyElement.setValue("a");
	}

	HasItemConditionSummary.superClass.initFromCondition.call(this);    
}
