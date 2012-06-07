// BlockItemWindow is used for setting block appearance and params
function BlockItemWindow(controller)
{
    BlockItemWindow.baseConstructor.call(this, "Create Block", 5, {fill:"lightGreen", stroke:"green", rx:4}, {width:88, height:160, storePrefix:"MW_BlockItemWindow", contentsSpacing:3});

	this.controller = controller;
	
    this.itemBar = new FlowLayout(0, 0, {minSpacing:5});
    this.contents.appendChild(this.itemBar);

	// Create a default item for us to display
    this.itemAppearanceLabel = new RectLabel(0, 0, null, {fill:"white", stroke:"none", width:30, height:40}, 2);	
    this.itemAppearanceButton = new RectButton("blockItemButton", 0, 0, null, {fill:"white", stroke:"none", width:30, height:30}, {fill:"yellow"}, {fill:"orange"}, 2, false);	

    this.setItem("d"); // Create a default item
    
    this.itemBar.appendChild(this.itemAppearanceLabel);

    this.heightButtons = new FlowLayout(0, 0, {direction:"down", minSpacing:5});

    var upArrow = new SVGElement();
    upArrow.cloneElement(this.controller.artwork.getElementById("iconUpArrow"));
    this.upArrowButton = new RectButton("upArrowButton", 0, 0, upArrow, {fill:"white", stroke:"blue", rx:2, width:30, height:16}, {fill:"yellow"}, {fill:"orange"}, 2, false);
	this.heightButtons.appendChild(this.upArrowButton);
	this.upArrowButton.addActionListener(this);

    var downArrow = new SVGElement();
    downArrow.cloneElement(this.controller.artwork.getElementById("iconDownArrow"));
    this.downArrowButton = new RectButton("downArrowButton", 0, 0, downArrow, {fill:"white", stroke:"blue", rx:2, width:30, height:16}, {fill:"yellow"}, {fill:"orange"}, 2, false);	
	this.heightButtons.appendChild(this.downArrowButton);
	this.downArrowButton.addActionListener(this);
	
	this.itemBar.appendChild(this.heightButtons);

    this.colourButtons = [];
    var currIndex = 0;
    var numCols = 3;
    for (var i in this.controller.itemFactory.baseSummary)
    {
        var currRow = Math.floor(currIndex / numCols);        
        if (this.colourButtons[currRow] == null)
        {
            this.colourButtons[currRow] = new FlowLayout(0, 0, {minSpacing:3});
            this.contents.appendChild(this.colourButtons[currRow]);
        }

        var b = this.controller.itemFactory.baseSummary[i];
        var currButton = new RectButton("i_" + i, 0, 0, new SVGElement("rect", {width:"5", height:"5", fill:b[1]}), {stroke:"black", fill:b[1]}, {stroke:"red"}, {stroke:"red"}, 7, false);
        this.colourButtons[currRow].appendChild(currButton);
        currButton.addActionListener(this);
        currIndex++;
    }
}

KevLinDev.extend(BlockItemWindow, SVGWindow);

BlockItemWindow.prototype.setItem = function(itemCode)
{
    var ht = 0;
    if (this.item != null && this.item.params != null && this.item.params.ht != null)
        ht = this.item.params.ht;
        
	this.item = this.controller.itemFactory.makeItem(itemCode);
	this.item.setItemParam("ht", ht);

	this.itemAppearance = this.controller.model.itemFactory.makeSimpleViewItem(this.item);
    this.itemAppearanceLabel.setContents(this.itemAppearance);
	this.item.addActionListener(this.itemAppearance);

	this.itemAppearance2 = this.controller.model.itemFactory.makeSimpleViewItem(this.item);
    this.itemAppearanceButton.setContents(this.itemAppearance2);
	this.item.addActionListener(this.itemAppearance2);
}

BlockItemWindow.prototype.doAction = function(src, evt)
{
    BlockItemWindow.superClass.doAction.call(this, src, evt);

	if (evt.type == "click")
	{
    	if (src.src == "upArrowButton")
    	{
		    this.item.setHeight(this.item.params.ht + 5);
		    this.itemAppearanceLabel.refreshLayout();
		    this.itemAppearanceButton.bgElement.refreshLayout();
		}
		else if (src.src == "downArrowButton")
		{
		    if (this.item.params.ht >= 5)
		    {
		        this.item.setHeight(this.item.params.ht - 5);
    		    this.itemAppearanceLabel.refreshLayout();
    		    this.itemAppearanceButton.bgElement.refreshLayout();
			}
        }
        else if (src.src.substring(0, 2) == "i_")
        {
            // Colour
            this.setItem(src.src.substring(2));
        }
        else
        {
            return;
        }
                
        // Also make sure the item is selected in the edit menu
	    this.tellActionListeners(this.itemAppearanceButton, {type:"selected"});
	}
}

