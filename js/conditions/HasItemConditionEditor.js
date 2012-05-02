function HasItemConditionEditor(controller, condition)
{
    HasItemConditionEditor.baseConstructor.call(this, controller, condition, 170, 109);
    this.itemTag = "HeldItem";
    this.containerTag = "ContainerItem";

	// Create editable contents
	// Consists of [icon] [container] contains [item] 
    var editableContents = new FlowLayout(0, 0, {direction:"down", minSpacing:3});
    
    var topRow = new FlowLayout(0, 0, {minSpacing:3});
    editableContents.appendChild(topRow);

    var currIcon = new SVGElement();
    currIcon.cloneElement(this.controller.artwork.getElementById("iconConditionHasItem"));
    var conditionTypeLabel = new RectLabel(0, 0, currIcon, {fill:"orange", stroke:"none", rx:2, width:20, height:20}, 2);
    topRow.appendChild(conditionTypeLabel);

    // The container we wish to test
    this.containerEditButton = new ItemViewSelector(controller, "orange", "containerItem", "topItem");
	topRow.appendChild(this.containerEditButton);

    // contains
    var hasElement = new SVGElement("text", {"font-size":12, fill:"black", x:5, y:14}, "contains");
    topRow.appendChild(hasElement);

    // The item whose presence we want to detect
    this.itemEditButton = new ItemViewSelector(controller, "orange", "heldItem", "topItem");
	topRow.appendChild(this.itemEditButton);

    var secondRow = new FlowLayout(0, 0, {minSpacing:3});
    editableContents.appendChild(secondRow);

	var checkboxParams = makeSimpleCheckboxParamButtonIdSet();
	checkboxParams.width = 10;
	checkboxParams.height = 10;
	this.matchHeldByTypeCheckbox = new ParamButton2("matchHeldByTypeCheckbox", checkboxParams);
	this.matchHeldByTypeCheckbox.setToggle(true);
	secondRow.appendChild(this.matchHeldByTypeCheckbox);
	secondRow.appendChild(new SVGElement("text", {"font-size":12, fill:"black", x:5, y:12}, "Match held item by type"));

	this.contents.prependChild(editableContents);

    this.initFromCondition();
}

KevLinDev.extend(HasItemConditionEditor, ConditionEditor);

HasItemConditionEditor.prototype.initFromCondition = function()
{
	this.containerEditButton.setSelectedItem(this.myCondition.containerItem.item);
    this.itemEditButton.setSelectedItem(this.myCondition.heldItem.item);

	this.matchHeldByTypeCheckbox.setSelected(this.myCondition.heldItem.isItemByType);
}

HasItemConditionEditor.prototype.doAction = function(src, evt)
{
	if (evt.type == "click" && src.src == "updateCondition")
	{
		// Commit the updates into the condition
		this.myCondition.heldItem.setItem(this.itemEditButton.selectedItem);		
		this.myCondition.heldItem.setItemByType(this.matchHeldByTypeCheckbox.isSelected);

		this.myCondition.containerItem.setItem(this.containerEditButton.selectedItem);
	}		

    HasItemConditionEditor.superClass.doAction.call(this, src, evt);
}
