// Height action requires a block item and the target height
function HeightActionEditor(controller, action, colour1, colour2)
{
    HeightActionEditor.baseConstructor.call(this, controller, action, colour1, colour2);
    this.myTag = "HeightChangeBlock";
    
	// Create editable contents
    var editableContents = new FlowLayout(0, 0, {minSpacing:3});

	// action type icon
    var currIcon = new SVGElement();
    currIcon.cloneElement(this.controller.artwork.getElementById("iconActionRaiseLower"));
    var actionButton = new RectLabel(0, 0, currIcon, {fill:colour1, stroke:"none", rx:2, width:30, height:30}, 2);
    editableContents.appendChild(actionButton);

	// Item that has its height changed
    this.heightItemButton = new ItemViewSelector(controller, colour1, "heightItem", "topBlock");
	editableContents.appendChild(this.heightItemButton);
	this.heightItemButton.addActionListener(this); // We get an "itemViewUpdated" action event when the item is updated

	// Right arrow - hidden until a block item has been selected
    var rightArrow = new SVGElement();

    rightArrow.cloneElement(this.controller.artwork.getElementById("iconRightArrow"));
    this.rightArrowLabelEdit = new RectLabel(0, 0, rightArrow, {fill:"none", stroke:"none", width:30, height:40});	
	editableContents.appendChild(this.rightArrowLabelEdit);

	// Resulting item appearance - hidden until a block item has been selected
    this.finalItemAppearanceEdit = new RectLabel(0, 0, null, {fill:"white", stroke:"none", width:40, height:40}, 2);	
	editableContents.appendChild(this.finalItemAppearanceEdit);

	// Up and down buttons - hidden until a block item has been selected
    this.heightButtons = new FlowLayout(0, 0, {direction:"down", minSpacing:5});

    var upArrow = new SVGElement();
    upArrow.cloneElement(this.controller.artwork.getElementById("iconUpArrow"));
    this.upArrowButton = new RectButton("upArrowButton", 0, 0, upArrow, {fill:"white", stroke:colour1, rx:2, width:30, height:13}, {fill:"yellow"}, {fill:"orange"}, 2, false);
	this.heightButtons.appendChild(this.upArrowButton);
	this.upArrowButton.addActionListener(this);

    var downArrow = new SVGElement();
    downArrow.cloneElement(this.controller.artwork.getElementById("iconDownArrow"));
    this.downArrowButton = new RectButton("downArrowButton", 0, 0, downArrow, {fill:"white", stroke:colour1, rx:2, width:30, height:13}, {fill:"yellow"}, {fill:"orange"}, 2, false);	
	this.heightButtons.appendChild(this.downArrowButton);
	this.downArrowButton.addActionListener(this);

	editableContents.appendChild(this.heightButtons);

	this.contents.prependChild(editableContents);

    this.initFromAction();
}

KevLinDev.extend(HeightActionEditor, ActionEditor);

HeightActionEditor.prototype.initFromAction = function()
{
 	this.heightItemButton.setSelectedItem(this.myAction.heightItem.item);
	this.updateHeightEditAppearance(this.heightItemButton.selectedItem);
    this.setNewHeight(this.myAction.newHeight);
	this.refreshLayout();
}

HeightActionEditor.prototype.doAction = function(src, evt)
{
	if (evt.type == "click")
	{
		switch (src.src)
		{
		case "upArrowButton":
		    this.setNewHeight(this.newHeight + 5);
			break;

		case "downArrowButton":
		    this.setNewHeight(this.newHeight - 5);
			break;

		case "updateAction":
			// Commit the updates into the action

			// Update the action
			this.myAction.heightItem.setItem(this.heightItemButton.selectedItem);
			this.myAction.setHeight(this.newHeight);

			// Update the appearance
			this.setNewHeight(this.newHeight);
			break;
		}
	}
	else if (evt.type == "itemViewUpdated")
	{
		this.updateHeightEditAppearance(this.heightItemButton.selectedItem);
	}
    
	HeightActionEditor.superClass.doAction.call(this, src, evt);
}

HeightActionEditor.prototype.setNewHeight = function(height)
{
    this.newHeight = height;

    // Update the final item appearance 
    if (this.finalItemAppearanceEditEl != null)
    {
        this.finalItemAppearanceEditEl.setHeight(height);
        this.finalItemAppearanceEdit.refreshLayout();
    }
}

HeightActionEditor.prototype.updateHeightEditAppearance = function(item)
{
	if (item != null)
	{
	    this.newHeight = item.params.ht;

		// Show the final item appearance and arrow
        this.rightArrowLabelEdit.show();
        this.heightButtons.show();
		this.finalItemAppearanceEdit.show();

		this.finalItemAppearanceEditEl = this.controller.model.itemFactory.makeSimpleViewItem(item);
		this.finalItemAppearanceEdit.setContents(this.finalItemAppearanceEditEl);
	}
	else
	{
		// Hide the final item appearance and arrow
        this.rightArrowLabelEdit.hide();
        this.heightButtons.hide();

		this.finalItemAppearanceEdit.setContents(null);
		this.finalItemAppearanceEdit.hide();
	}
}

