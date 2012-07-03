// ItemWindow is used for setting item appearance and params when editing
function ItemWindow(controller)
{
    ItemWindow.baseConstructor.call(this, "Create Item", 5, {fill:"lightGreen", stroke:"green", rx:4}, {width:170, height:170, storePrefix:"MW_ItemWindow", contentsSpacing:3});

	this.controller = controller;
	
    this.itemBar = new FlowLayout(0, 0, {minSpacing:5});
    this.contents.appendChild(this.itemBar);

    // Select teleport button
    this.teleportToText = new SVGElement("text", {"font-size":12, y:12, fill:"black"}, "Select Destination");
    this.selectTeleportButton = new RectButton("selectTeleportButton", 0, 0, this.teleportToText, {fill:"white", stroke:"none"}, {fill:"yellow"}, {fill:"orange"}, 2, false);	
    this.selectTeleportButton.addActionListener(this);
    this.teleportWindow = new WorldChooserWindow(this.controller,{windowName:"Teleport Destination", showAccessOnly:true, closeOnSelect:true});
    this.teleportWindow.addActionListener(this);
    this.teleportWindow.hide();
    this.controller.visitedWorldNotifier.addActionListener(this.teleportWindow);

	// Create a default item for us to display
    this.itemAppearanceLabel = new RectLabel(0, 0, null, {fill:"white", stroke:"none", width:40, height:40}, 2);	
    this.itemAppearanceButton = new RectButton("itemButton", 0, 0, null, {fill:"white", stroke:"none", width:30, height:30}, {fill:"yellow"}, {fill:"orange"}, 2, false);	

    this.itemBar.appendChild(this.itemAppearanceLabel);
    
    this.extrasArea = new FlowLayout(0, 0, {minSpacing:3});
    this.itemBar.appendChild(this.extrasArea);

    this.setItem("x"); // Create a default item
    
    this.itemButtons = [];
    var currIndex = 0;
    var numCols = 5;
    for (var i in this.controller.itemFactory.itemTemplates)
    {
        var currRow = Math.floor(currIndex / numCols);
        
        // Make sure we've got a FlowLayout row to put the item in.
        if (this.itemButtons[currRow] == null)
        {
            this.itemButtons[currRow] = new FlowLayout(0, 0, {minSpacing:3});
            this.contents.appendChild(this.itemButtons[currRow]);
        }

        // Get the graphics to put in the button
        var template = this.controller.itemFactory.itemTemplates[i];
        if (template == null || template.noEdit)
            continue;

        var el = this.controller.itemFactory.artwork.getElementById(template.itemName + "_def_def");
        if (el == null)
            continue;

        var itemElement = new SVGElement();
    	itemElement.cloneElement(el);
    	itemElement.removeAttribute("style");
    	itemElement.removeAttribute("display");
    	if (itemElement.hasAttribute("transform"))
    	{
    	    // There's a transform on this element, so encase it in another group
    	    // so that we can freely put our own transforms on it.
    	    var parentElement = new SVGElement("g");
    	    parentElement.appendChild(itemElement);
    	    itemElement = parentElement;
    	}
            
        // Draw the button
        var currButton = new RectButton("i_" + i, 0, 0, itemElement, {stroke:"black", fill:"white", rx:2, width:30, height:30}, {stroke:"red"}, {stroke:"red"}, 3, false);
        this.itemButtons[currRow].appendChild(currButton);
        currButton.addActionListener(this);
        currIndex++;
    }
}

KevLinDev.extend(ItemWindow, SVGWindow);

ItemWindow.prototype.setItem = function(itemCode)
{
    if (this.item && this.item.params && this.item.params.itemCode == itemCode)
        return;
    
    this.extrasArea.removeChildren();
        
	this.item = this.controller.itemFactory.makeItem(itemCode);
	
	var currEl = this.controller.itemFactory.makeViewItem(this.item);
    currEl.itemGraphics.setLightLevel(1.0);
	var elHolder = new SVGElement("g");
	elHolder.appendChild(currEl);
    this.itemAppearanceLabel.setContents(elHolder);
    this.item.addActionListener(currEl);

	var currEl2 = this.controller.itemFactory.makeViewItem(this.item);
    currEl2.itemGraphics.setLightLevel(1.0);
	var elHolder2 = new SVGElement("g");
	elHolder2.appendChild(currEl2);
    this.itemAppearanceButton.setContents(elHolder2);
    this.item.addActionListener(currEl2);
    
    // There may be extras to show depending on what the item is
    if (this.item.params.doesTeleport)
    {
        this.extrasArea.appendChild(this.selectTeleportButton);
    }
    
    if (this.item.params.lightStrength)
    {
        
    }
}

ItemWindow.prototype.doAction = function(src, evt)
{
    ItemWindow.superClass.doAction.call(this, src, evt);

	if (evt.type == "click")
	{
	    
	    if (src.src.substring(0, 2) == "i_")
	    {
    	    this.setItem(src.src.substring(2));

            // Also make sure the item is selected in the edit menu
	        this.tellActionListeners(this.itemAppearanceButton, {type:"selected"});
	    }
	    else if (src.src == "selectTeleportButton")
	    {
	        this.teleportWindow.show();
	    }
    }
    else if (evt.type == "worldSelected")
    {
        this.item.params.doTeleport = evt.value;
        var destName = this.controller.visitedWorlds[evt.value].map_name;
        this.teleportToText.setValue(destName);
        this.selectTeleportButton.refreshLayout();
    }
}

