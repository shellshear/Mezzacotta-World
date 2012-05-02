// The Item Selector is responsible for letting the user choose an item,
// either from the grid, or from the item selector window itself (in the
// case of items that are not on the grid, eg. the avatar.)
function ItemSelectorWindow(controller)
{
    this.selectedItem = null;
	this.itemType = null; // Which types of items are valid for selection
	this.client = null;
    this.controller = controller;
    
    ItemSelectorWindow.baseConstructor.call(this, "Item Selection", 5, {fill:"lightGreen",stroke:"green",rx:4}, {storePrefix:"MW_ItemSelectorWindow"});

    // Show what is currently selected
    var emptyText = new MultilineText(0, 0, "Nothing selected yet", {"font-size":15, fill:"black"}, {maxWidth:70, lineSpacing:0});

    this.defaultSelection = new RectLabel(0, 0, emptyText, {fill:"white", stroke:"green", rx:2}, 2);
    
    this.selectionArea = new SVGElement("g");
    this.selectionArea.appendChild(this.defaultSelection);
    
    this.contents.appendChild(this.selectionArea);
    
    // Allow the avatar to be selected
    var avatarElement = this.controller.model.itemFactory.makeSimpleViewItem(this.controller.currentChar);

    this.avatarButton = new RectButton("avatarButton", 0, 0, avatarElement, {fill:"white", stroke:"green", rx:2, width:40, height:40}, {fill:"yellow"}, {fill:"orange"}, 5, false);

    this.contents.appendChild(this.avatarButton);
    this.avatarButton.addActionListener(this);

    var okCancelButtons = new FlowLayout(0, 0, {minSpacing:3});
    this.contents.appendChild(okCancelButtons);

    this.okButton = new RectButton("ItemSelectionOK", 0, 0, new SVGElement("text", {"font-size":15, fill:"black", x:0, y:15}, "OK"), {fill:"white", stroke:"green", rx:2}, {fill:"yellow"}, {fill:"orange"}, 2, false);
    okCancelButtons.appendChild(this.okButton);
    this.okButton.addActionListener(this);

    this.cancelButton = new RectButton("ItemSelectionCancel", 0, 0, new SVGElement("text", {"font-size":15, fill:"black", x:30, y:15}, "Cancel"), {fill:"white", stroke:"green", rx:2}, {fill:"yellow"}, {fill:"orange"}, 2, false);
    okCancelButtons.appendChild(this.cancelButton);
    this.cancelButton.addActionListener(this);
}

KevLinDev.extend(ItemSelectorWindow, SVGWindow);

ItemSelectorWindow.prototype.doAction = function(src, evt)
{
    ItemSelectorWindow.superClass.doAction.call(this, src, evt);

	// Don't do anything unless we're showing
	if (!this.showing)
		return;
		
    if (evt.type == "click")
    {
        if (src.src == "avatarButton")
        {
            this.setItem(this.controller.currentChar);
        }
        else if (src.src == "ItemSelectionCancel")
        {
			this.hide();            
        }
        else if (src.src == "ItemSelectionOK")
        {
			this.hide();
            if (this.client != null)
				this.client.userHasSelectedItem(this.selectedItem, this.itemTag);
        }
    }
}

// User has selected a gridContents, so we choose the top relevent item out of it
ItemSelectorWindow.prototype.setGridContents = function(contents)
{
	var item = null;
	switch (this.itemType)
	{
	case "topBlock":
		item = getTopBlockItem(contents);
		break;
		
	case "topItem":
	case null:
	default:
		item = contents.getTopItem();
		break;
	}
	
 	this.setItem(item);
}

ItemSelectorWindow.prototype.setItem = function(item)
{
	this.controller.clearHighlightedItems();
    this.selectedItem = item;
    
    if (item != null)
    {
        // show the item 
        this.selectionArea.removeChildren();
        
        var itemElement = this.controller.model.itemFactory.makeSimpleViewItem(item);

        this.itemButton = new RectButton("itemButton", 0, 0, itemElement, {fill:"white", stroke:"green", rx:2, width:40, height:40}, {fill:"yellow"}, {fill:"orange"}, 5, false);

        this.selectionArea.appendChild(this.itemButton);

		// Also tell the controller to highlight the item
		this.controller.highlightItem(item);
    }
    else
    {
        // Show the default
        this.selectionArea.removeChildren();
        this.selectionArea.appendChild(this.defaultSelection);
    }
}

// Set the client of the item selection - this is who we tell what item was 
// selected when we are closed. The client must have a method setSelectedItem()
ItemSelectorWindow.prototype.setClient = function(client, item, itemType, itemTag)
{
	this.client = client;
	this.itemType = itemType;
	this.itemTag = itemTag;
	this.setItem(item);
	
	if (this.itemType == "topBlock")
	{
		// Hide the extra items
		this.avatarButton.hide();
	}
	else
	{
		// Show the extra items
		this.avatarButton.show();
	}
}
