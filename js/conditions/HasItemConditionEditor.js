function HasItemConditionEditor(controller, condition)
{
    HasItemConditionEditor.baseConstructor.call(this, controller, condition, 218, 149);
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

	this.heldItemTypeRadioGroup = new RadioButtonGroup();

    var secondRow = new FlowLayout(0, 0, {minSpacing:3});
    editableContents.appendChild(secondRow);
	var checkboxParams = makeSimpleCheckboxParamButtonIdSet();
	checkboxParams.width = 10;
	checkboxParams.height = 10;
	this.matchHeldByCodeCheckbox = new ParamButton2("matchHeldByCodeCheckbox", checkboxParams);
	this.matchHeldByCodeCheckbox.setToggle(true);
	this.heldItemTypeRadioGroup.addButton(this.matchHeldByCodeCheckbox);
	secondRow.appendChild(this.matchHeldByCodeCheckbox);
	secondRow.appendChild(new SVGElement("text", {"font-size":12, fill:"black", x:5, y:12}, "Match any held item that looks the same"));
	this.matchHeldByCodeCheckbox.addActionListener(this);

    var thirdRow = new FlowLayout(0, 0, {minSpacing:3});
    editableContents.appendChild(thirdRow);
	var checkboxParams2 = makeSimpleCheckboxParamButtonIdSet();
	checkboxParams2.width = 10;
	checkboxParams2.height = 10;
	this.matchHeldByIdCheckbox = new ParamButton2("matchHeldByIdCheckbox", checkboxParams2);
	this.matchHeldByIdCheckbox.setToggle(true);
	this.heldItemTypeRadioGroup.addButton(this.matchHeldByIdCheckbox);
	thirdRow.appendChild(this.matchHeldByIdCheckbox);
	thirdRow.appendChild(new SVGElement("text", {"font-size":12, fill:"black", x:5, y:12}, "Match only this held item"));
	this.matchHeldByIdCheckbox.addActionListener(this);

    var forthRow = new FlowLayout(0, 0, {minSpacing:3});
    editableContents.appendChild(forthRow);
	var checkboxParams3 = makeSimpleCheckboxParamButtonIdSet();
	checkboxParams3.width = 10;
	checkboxParams3.height = 10;
	this.matchHeldByTagCheckbox = new ParamButton2("matchHeldByTagCheckbox", checkboxParams3);
	this.matchHeldByTagCheckbox.setToggle(true);
	this.heldItemTypeRadioGroup.addButton(this.matchHeldByTagCheckbox);
	forthRow.appendChild(this.matchHeldByTagCheckbox);
	forthRow.appendChild(new SVGElement("text", {"font-size":12, fill:"black", x:5, y:12}, "Match any held item with the tag \"avatar\""));
	this.matchHeldByTagCheckbox.addActionListener(this);

	this.contents.prependChild(editableContents);

    this.initFromCondition();
}

KevLinDev.extend(HasItemConditionEditor, ConditionEditor);

HasItemConditionEditor.prototype.initFromCondition = function()
{
	this.containerEditButton.setSelectedItem(this.myCondition.containerItem.item);
    this.itemEditButton.setSelectedItem(this.myCondition.heldItem.item);

	this.matchHeldByCodeCheckbox.setSelected(this.myCondition.heldItem.matchCriterion == "code");
	this.matchHeldByIdCheckbox.setSelected(this.myCondition.heldItem.matchCriterion == "id");
	this.matchHeldByTagCheckbox.setSelected(this.myCondition.heldItem.matchCriterion == "tag");
}

HasItemConditionEditor.prototype.doAction = function(src, evt)
{
	if (evt.type == "click")
	{
		if (src.src == "updateCondition")
		{
			// Commit the updates into the condition
			// TODO: Deal with different tags
			var matchCriterion = 
				this.matchHeldByCodeCheckbox.isSelected ? "code" : 
				(this.matchHeldByIdCheckbox.isSelected ? "id" : "tag");
			var itemTag = (matchCriterion == "tag") ? "avatar" : null;
			
			this.myCondition.heldItem.setItem(this.itemEditButton.selectedItem);
			this.myCondition.heldItem.setItemMatchCriterion(matchCriterion, itemTag);

			this.myCondition.containerItem.setItem(this.containerEditButton.selectedItem);
		}
		else if (src.src == "matchHeldByCodeCheckbox" || src.src == "matchHeldByIdCheckbox")
		{
			// If held item is currently a tag, replace with default
			if (this.itemEditButton.selectedItem != null && this.itemEditButton.selectedItem.params.itemCode == "t")
				this.itemEditButton.setSelectedItem(null);
		}
		else if (src.src == "matchHeldByTagCheckbox")
		{
			// Replace held item with "tag"
			this.itemEditButton.setSelectedItem(this.controller.model.itemFactory.makeItem("t"));
		}
	}
	
    HasItemConditionEditor.superClass.doAction.call(this, src, evt);
}
