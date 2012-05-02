function WeightConditionEditor(controller, condition)
{
    WeightConditionEditor.baseConstructor.call(this, controller, condition, 168, 90);
    this.myTag = "holdingItem";

	// Create editable contents
    var editableContents = new FlowLayout(0, 0, {minSpacing:3});

    var currIcon = new SVGElement();
    currIcon.cloneElement(this.controller.artwork.getElementById("iconConditionWeight"));
    var conditionTypeLabel = new RectLabel(0, 0, currIcon, {fill:"orange", stroke:"none", rx:2, width:20, height:20}, 2);
    editableContents.appendChild(conditionTypeLabel);

    // The item on which we wish to measure the weight
    this.weightItemButton = new ItemViewSelector(controller, "orange", "weightItem", "topBlock");
	editableContents.appendChild(this.weightItemButton);

	this.weightEditTextbox = new TextArea("weightText", controller.background, {width:40, height:20, fill:"white", "stroke":"orange", rx:5}, {"font-size":14, fill:"black", x:3, y:14}, 0, 0, {normal:{stroke:"orange"}, focus:{stroke:"red"}});
   	editableContents.appendChild(this.weightEditTextbox);

	this.contents.prependChild(editableContents);

    this.initFromCondition();
}

KevLinDev.extend(WeightConditionEditor, ConditionEditor);

WeightConditionEditor.prototype.initFromCondition = function()
{
    this.weightItemButton.setSelectedItem(this.myCondition.weightItem.item);
	this.setWeight(this.myCondition.minWeight);
	this.refreshLayout();
}

WeightConditionEditor.prototype.doAction = function(src, evt)
{
	if (evt.type == "click")
	{
		switch (src.src)
		{
		case "updateCondition":
			// Commit the updates into the condition
			var weight = parseInt(this.weightEditTextbox.textVal);
			this.myCondition.setMinWeight(weight);
		
			// Update the appearance
			this.setWeight(weight);
			this.myCondition.weightItem.setItem(this.weightItemButton.selectedItem);

			break;
		}
	}		

    WeightConditionEditor.superClass.doAction.call(this, src, evt);
}

WeightConditionEditor.prototype.setWeight = function(weight)
{
	this.weightEditTextbox.setValue(weight);
}
