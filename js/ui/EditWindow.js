// EditWindow has a set of all editing buttons, many of which call subwindows.
function EditWindow(controller, editRoot)
{
    EditWindow.baseConstructor.call(this, "Edit Map", 5, {fill:"lightGreen", stroke:"green", rx:4}, {width:71, height:246, storePrefix:"MW_EditWindow", contentsSpacing:3});

	this.controller = controller;
	this.editRoot = editRoot;
	
    this.actionsBar = new FlowLayout(0, 0, {minSpacing:5});
    this.contents.appendChild(this.actionsBar);

    var actionEl = new SVGElement();
    actionEl.cloneElement(this.controller.artwork.getElementById("iconHammer"));
    this.actionsButton = new RectButton("actionsWindow", 0, 0, actionEl, {fill:"white", stroke:"black", rx:2, width:30, height:30}, {fill:"yellow"}, {fill:"orange"}, 4, false);
    this.actionsButton.addActionListener(this);
    this.actionsBar.appendChild(this.actionsButton);
    
    var infoEl = new SVGElement();
    infoEl.cloneElement(this.controller.artwork.getElementById("iconInformation"));
    this.infoButton = new RectButton("infoWindow", 0, 0, infoEl, {fill:"white", stroke:"black", rx:2, width:30, height:30}, {fill:"yellow"}, {fill:"orange"}, 4, false);
    this.infoButton.addActionListener(this);
    this.actionsBar.appendChild(this.infoButton);

    this.actionViewWindow = new ActionViewWindow(this.controller);
	if (this.actionViewWindow.x == 0 && this.actionViewWindow.y == 0)
        this.actionViewWindow.setPosition(920, 35);
    this.actionViewWindow.hide();
    this.actionViewWindow.addActionListener(this);
    this.editRoot.appendChild(this.actionViewWindow);
    
    // Item selector window is for selecting an existing item on the map or an
    // avatar, used by actions and conditions.
    this.itemSelectorWindow = new ItemSelectorWindow(this.controller);
	if (this.itemSelectorWindow.x == 0 && this.itemSelectorWindow.y == 0)
        this.itemSelectorWindow.setPosition(170, 100);
	this.itemSelectorWindow.hide();
    this.editRoot.appendChild(this.itemSelectorWindow);

    this.infoWindow = new SVGWindow("info", 3, {fill:"white", stroke:"black", rx:4}, {storePrefix:"MW_InfoWindow"});
    this.infoWindow.hide();
	if (this.infoWindow.x == 0 && this.infoWindow.y == 0)
        this.infoWindow.setPosition(50, 350);
    this.infoWindowContents = new TextLabel(null, {"font-size":10, fill:"black", "space":"preserve"}, {minSpacing:0, maxWidth:200});
    this.infoWindow.contents.appendChild(this.infoWindowContents);
    this.infoWindow.addActionListener(this);
    this.editRoot.appendChild(this.infoWindow);

    // Edit/create actions
    this.radioButtonGroup = new RadioButtonGroup();

    // Delete
    var deleteEl = new SVGElement();
    deleteEl.cloneElement(this.controller.artwork.getElementById("iconDelete"));
    this.deleteButton = new RectButton("deleteButton", 0, 0, deleteEl, {fill:"white", stroke:"black", rx:2, width:30, height:30}, {fill:"yellow"}, {fill:"orange"}, 4, false);
	this.deleteButton.addActionListener(this);
    this.deleteButton.setToggle(true);
    this.radioButtonGroup.addButton(this.deleteButton);

    // Raise/lower top block
    var upArrow = new SVGElement();
    upArrow.cloneElement(this.controller.artwork.getElementById("iconUpArrow"));
    this.upArrowButton = new RectButton("upArrowButton", 0, 0, upArrow, {fill:"white", stroke:"black", rx:2, width:30, height:30}, {fill:"yellow"}, {fill:"orange"}, 4, false);
	this.upArrowButton.addActionListener(this);
    this.upArrowButton.setToggle(true);
    this.radioButtonGroup.addButton(this.upArrowButton);

    var downArrow = new SVGElement();
    downArrow.cloneElement(this.controller.artwork.getElementById("iconDownArrow"));
    this.downArrowButton = new RectButton("downArrowButton", 0, 0, downArrow, {fill:"white", stroke:"black", rx:2, width:30, height:30}, {fill:"yellow"}, {fill:"orange"}, 4, false);	
	this.downArrowButton.addActionListener(this);
    this.downArrowButton.setToggle(true);
    this.radioButtonGroup.addButton(this.downArrowButton);
    
    // Rotate right/left top item
    var rotateRightArrow = new SVGElement();
    rotateRightArrow.cloneElement(this.controller.artwork.getElementById("iconRotateRight"));
    this.rotateRightArrowButton = new RectButton("rotateRightArrowButton", 0, 0, rotateRightArrow, {fill:"white", stroke:"black", rx:2, width:30, height:30}, {fill:"yellow"}, {fill:"orange"}, 4, false);
	this.rotateRightArrowButton.addActionListener(this);
    this.rotateRightArrowButton.setToggle(true);
    this.radioButtonGroup.addButton(this.rotateRightArrowButton);

    var rotateLeftArrow = new SVGElement();
    rotateLeftArrow.cloneElement(this.controller.artwork.getElementById("iconRotateLeft"));
    this.rotateLeftArrowButton = new RectButton("rotateLeftArrowButton", 0, 0, rotateLeftArrow, {fill:"white", stroke:"black", rx:2, width:30, height:30}, {fill:"yellow"}, {fill:"orange"}, 4, false);
	this.rotateLeftArrowButton.addActionListener(this);
    this.rotateLeftArrowButton.setToggle(true);
    this.radioButtonGroup.addButton(this.rotateLeftArrowButton);

    // Set light level (also sets default light level)
    this.lightLevelWindow = new LightLevelWindow(this.controller);
    this.lightLevelWindow.hide();
	if (this.lightLevelWindow.x == 0 && this.lightLevelWindow.y == 0)
        this.lightLevelWindow.setPosition(0, 260);
    this.editRoot.appendChild(this.lightLevelWindow);
    this.lightLevelWindow.addActionListener(this);

    // The light apperance button is for us
    this.lightLevelWindow.lightAppearanceButton.addActionListener(this);
    this.lightLevelWindow.lightAppearanceButton.setToggle(true);
    this.radioButtonGroup.addButton(this.lightLevelWindow.lightAppearanceButton);    
    
    // Block Item window allows user to add block items to the scene
    this.blockItemWindow = new BlockItemWindow(this.controller);
    this.blockItemWindow.hide();
	if (this.blockItemWindow.x == 0 && this.blockItemWindow.y == 0)
        this.blockItemWindow.setPosition(175, 330);
    this.editRoot.appendChild(this.blockItemWindow);
    this.blockItemWindow.addActionListener(this);

    // The item appearance button is for us
    this.blockItemWindow.itemAppearanceButton.addActionListener(this);
    this.blockItemWindow.itemAppearanceButton.setToggle(true);
    this.radioButtonGroup.addButton(this.blockItemWindow.itemAppearanceButton);    
    
    // Item window allows user to add items to the scene
    this.itemWindow = new ItemWindow(this.controller);
    this.itemWindow.hide();
	if (this.itemWindow.x == 0 && this.itemWindow.y == 0)
        this.itemWindow.setPosition(0, 330);
    this.editRoot.appendChild(this.itemWindow);
    this.itemWindow.addActionListener(this);
    this.editRoot.appendChild(this.itemWindow.teleportWindow);

    // The item appearance button is for us
    this.itemWindow.itemAppearanceButton.addActionListener(this);
    this.itemWindow.itemAppearanceButton.setToggle(true);
    this.radioButtonGroup.addButton(this.itemWindow.itemAppearanceButton);    

    // Arrange the buttons
    this.editBar = [];
    for (var i = 0; i < 4; i++)
    {
        var newFlow = new FlowLayout(0, 0, {minSpacing:5});
        this.editBar.push(newFlow);
        this.contents.appendChild(newFlow);
    }

	this.editBar[0].appendChild(this.deleteButton);
	this.editBar[0].appendChild(this.upArrowButton);
    
    this.editBar[1].appendChild(this.lightLevelWindow.lightAppearanceButton);
	this.editBar[1].appendChild(this.downArrowButton);

    this.editBar[2].appendChild(this.blockItemWindow.itemAppearanceButton);
    this.editBar[2].appendChild(this.itemWindow.itemAppearanceButton);

    this.editBar[3].appendChild(this.rotateLeftArrowButton);
    this.editBar[3].appendChild(this.rotateRightArrowButton);

    this.finalButtonsBar = new FlowLayout(0, 0, {minSpacing:3});
    this.contents.appendChild(this.finalButtonsBar);

    this.saveMapButton = new SimpleButton("savemap", "rect", {width:40, height:20, rx:3, fill:"lightgreen", stroke:"black", "stroke-width":2}, 0, 0, {normal:{stroke:"black", fill:"lightgreen"}, over:{stroke:"red"}, focus:{stroke:"red"}, select:{fill:"green"}, disable:{fill:"gray"}});
    this.saveMapButton.addSVG("text", {"font-size":15, fill:"black", x:5, y:15}, "Save");
    this.saveMapButton.addActionListener(this);
    this.finalButtonsBar.appendChild(this.saveMapButton);

    this.playButton = new RectButton("play", 0, 0, new SVGElement("text", {"font-size":12}, "Play"), {fill:"lightblue", stroke:"black", rx:2}, {fill:"orange"}, {fill:"red"}, 2, false);
    this.playButton.addActionListener(this);
    this.finalButtonsBar.appendChild(this.playButton);

	// Slider for zooming
	this.zoomSlider = new Slider({orientation:"h", sliderLength:65, startPosition:0.5});
	this.zoomSlider.addActionListener(this);
	this.contents.appendChild(this.zoomSlider);
}

KevLinDev.extend(EditWindow, SVGWindow);

EditWindow.prototype.doAction = function(src, evt)
{
    EditWindow.superClass.doAction.call(this, src, evt);

    if (evt.type == "closeWindow")
    {
        src.hide();
    }
	else if (evt.type == "click")
	{
    	if (src.src == "lightButton")
    	{
    	    this.lightLevelWindow.show();
	    }
        else if (src.src == "savemap")
        {
            this.controller.saveMap();
        }
        else if (src.src == "actionsWindow")
        {
            this.actionViewWindow.show();
        }
        else if (src.src == "infoWindow")
        {
            this.infoWindow.show();
        }
        else if (src.src == "blockItemButton")
        {
            this.blockItemWindow.show();
        }
        else if (src.src == "itemButton")
        {
            this.itemWindow.show();
        }
        else if (src.src == "play")
        {
            this.controller.playLevel();
        }
	}
	else if (evt.type == "selected")
	{
	    this.radioButtonGroup.setSelected(src);
	}
	else if (evt.type == "dragSlider" && src == this.zoomSlider)
	{
		this.controller.setZoom(evt.position);
	}
}

