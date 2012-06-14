// TurnClock keeps track of the time in the game. It starts at zero
// at the beginning of each level and increments by 1 for each turn.
function TurnClock()
{
    this.currentTime = 0;
}

function GameController(background, itemFactory, model, view, idMap)
{
    GameController.baseConstructor.call(this);
	
    this.current_map_id = -1; // Current map is not set
    
    this.background = background;
    this.background.addActionListener(this);

    // The overlayer is for user interface elements - the user preferences,
    // inventory, world name, etc.
    this.overLayer = wrapElementById("overLayer");
    this.overLayer.childConstraints = {x:0, y:0, width:1000, height:1000};
    this.overLayer.show();

    // Start the login controller.
    var loginArea = document.getElementById("loginArea");

    this.loginController = new LoginController(background, this.overLayer);
    this.loginController.loginTextbox.setFocus(true);
    
    // We wish to be notified when there is a "loggedIn" or "loggedOut" action
    this.loginController.addActionListener(this);
    
    this.adminWindow = new AdminWindow(this, this.loginController.logoutGroup);
    this.overLayer.appendChild(this.adminWindow);
    this.adminWindow.hide();
    this.adminWindow.addActionListener(this);

    // Visited world notifier is for notifying about any changes to 
    // the list of visited worlds.
    this.visitedWorldNotifier = new ActionObject();
    
    this.worldChooserWindow = new WorldChooserWindow(this, {windowName:"World Chooser"});
    this.overLayer.appendChild(this.worldChooserWindow);
    this.worldChooserWindow.hide();
    this.worldChooserWindow.addActionListener(this); 
    this.visitedWorldNotifier.addActionListener(this.worldChooserWindow);
    
    this.editLayer = wrapElementById("editLayer"); 
    this.editLayer.childConstraints = {x:0, y:0, width:1000, height:1000};
    this.editLayer.hide();

    this.itemFactory = itemFactory;
    this.model = model;
    this.view = view;
    this.view.addActionListener(this);
    this.idMap = idMap;
   
    this.currentChar = null;
    
    // The game is not initially active (ie. listening for events)
    this.isActive = false;

    this.canEdit = false; // Whether editing is allowed or not for this level.
	this.editMode = false;
    
    // TurnClock keeps a track of how many turns have passed since
    // the player entered the current map.
    this.turnClock = new TurnClock();
    
    // Action controller is responsible for the game actions and conditions that
    // trigger them
    this.actionController = new ActionController(this.model, this, this.turnClock);
    
    // add the avatar
    this.currentChar = this.itemFactory.makeItem("b");
    this.currentChar.params.isTemporary = true;
    this.currentChar.id = "avatar";
    this.currentChar.povHeight = 25;
    this.model.registerItem(this.currentChar);
    
    this.clearPlayerData();
}

KevLinDev.extend(GameController, ActionObject);

GameController.prototype.clearPlayerData = function()
{
    // The xml for the map is stored here.
    this.currentMap = null;
    this.isMapSaved = true;

	// The xml for any unsaved map is stored here.
	this.unsavedMap = null;
    
    // part of the map that is currently selected
    this.mapSelect = null;    
    
	// Keep track of the highlighted items
	this.highlightedItems = [];	
	
	// Keep track of the saved items
	this.savedItems = [];
	this.newItems = [];	
	
	// Keep track of the visited worlds
	this.visitedWorlds = [];
    this.hasLoadedVisitedWorlds = false;
    this.visitedWorldNotifier.tellActionListeners(this, {type:"clear"})
}

GameController.prototype.clearHighlightedItems = function()
{
	for (var i = 0; i < this.highlightedItems.length; ++i)
	{
		this.highlightedItems[i].setItemParam("isHighlighted", false, false);
	}
	this.highlightedItems = [];
}

GameController.prototype.addVisitedWorld = function(visitedWorld)
{
    if (!this.visitedWorlds[visitedWorld.map_id])
    {
	    this.visitedWorlds[visitedWorld.map_id] = visitedWorld;
        this.visitedWorldNotifier.tellActionListeners(this, {type:"add", value:visitedWorld})
    }
}

GameController.prototype.setMapName = function(mapName)
{
    // Show the map name for the first two turns
    this.adminWindow.worldLabel.setValue(mapName);
}

GameController.prototype.highlightItem = function(item)
{
	this.highlightedItems.push(item);
	item.setItemParam("isHighlighted", true, false);
}

GameController.prototype.setupEditArea = function()
{    
    // Show the contract/expand icon for the AdminWindow
	var coverEl1 = cloneElementById(this.artwork, "iconCircleCover");
	var contractEl = cloneElementById(this.artwork, "iconContract");
	var contractOverEl = cloneElementById(this.artwork, "iconContractMouseover");

	var coverEl2 = cloneElementById(this.artwork, "iconCircleCover");
	var expandEl = cloneElementById(this.artwork, "iconExpand");
	var expandOverEl = cloneElementById(this.artwork, "iconExpandMouseover");
	
	this.expandButton = new ParamButton2("adminExpand", {x:10, y:10, width:20, height:20, normalElements:{normal:expandEl, mouseover:expandOverEl, cover:coverEl1}, selectedElements:{normal:contractEl, mouseover:contractOverEl, cover:coverEl2}});
	this.expandButton.setToggle(true);
	this.overLayer.appendChild(this.expandButton);
	this.expandButton.addActionListener(this);

    this.contentLayoutView = new ContentLayoutView(this.view);
    this.view.coverLayer2.appendChild(this.contentLayoutView);    

	this.editWindow = new EditWindow(this, this.editLayer);
	this.editLayer.appendChild(this.editWindow);
}

GameController.prototype.renameWorld = function(newWorldName)
{
    var http_string = "update.php";
    var params = "changemapname=" + escape(newWorldName) + "&login=" + escape(this.loginController.login) + "&password=" + escape(this.loginController.password) + "&map_id=" + this.current_map_id;
    
	if (g_config.showServerTransactions)
	{
		this.addInfo(params + '\n');
	}

    var me = this;
    ajax_post(
            http_string, 
            function(xml) 
            {
                me.receiveRenameWorldResultFromServer(xml);
            }, 
            params
        );
}

GameController.prototype.receiveRenameWorldResultFromServer = function(xml)
{
    if (xml.nodeName == "result" && xml.getAttribute("status") == "1")
    {
		var map_id = xml.getAttribute("map_id");
		var map_name = xml.getAttribute("map_name");
        this.tellActionListeners(this, {type:"serverWorldRenamed", map_id:map_id, map_name:map_name});
    }
    else
    {
        alert(xml.textContent);
    }
}

GameController.prototype.saveMap = function()
{
    if (this.loginController.loggedIn)
    {
        var xml = this.model.toXML();
    
        // Also append the actions and conditions
        this.actionController.toXML(xml);
    
        var xmlString = (new XMLSerializer()).serializeToString(xml);
        this.submitSaveMap(xmlString);
    }
}

GameController.prototype.setInfo = function(info)
{
    this.editWindow.infoWindowContents.setValue(info);
}

GameController.prototype.addInfo = function(info)
{
    this.editWindow.infoWindowContents.setValue(this.editWindow.infoWindowContents.getValue() + info);
}

GameController.prototype.submitLoadArtworkAndMap = function(artFile)
{    
    var me = this;
    ajax_post(
            artFile, 
            function(xml, xmlDoc) 
            {
                me.receiveArtworkFromServer(xmlDoc);
            }, 
            null
        );
}

GameController.prototype.receiveArtworkFromServer = function(xmlDoc)
{
    this.artwork = xmlDoc;
    
    // Copy all the definitions from the xmlDoc to the current doc
    // TODO: currently require everything to be put in "defs_external" element.
    // Is this necessary/useful?
    var defs = this.artwork.getElementsByTagName("defs");
    var dest = document.getElementById("defs_external");
    for (var i = 0; i < defs.length; i++)
    {
        for (var j = 0; j < defs[i].children.length; j++)
        {
            dest.appendChild(defs[i].children[j].cloneNode(true));
        }
    }
    this.itemFactory.artwork = xmlDoc;

    // We can now use the artwork to setup the edit area
    this.setupEditArea();
    updateLayout();
    
    // Finally, load the starting map, also loading any saved items
    this.submitLoadMap(this.loginController.curr_map, true);
}

// Save items, and optionally teleport to a new map. Set teleportDestination to null
// if you don't wish to teleport.
GameController.prototype.submitSaveItemsAndTeleport = function(teleportDestination)
{    
    var http_string = "update.php";
    var params = "saveitems=1&login=" + escape(this.loginController.login) + "&password=" + escape(this.loginController.password);
    
    if (this.newItems.length == 0)
    {
        // Don't bother saving anything; there isn't anything to save.
        this.submitLoadMap(teleportDestination);
        return;
    }
    
    var i = 0;
    for (var currIndex in this.newItems)
    {
        if (this.newItems[currIndex].id != null && this.newItems[currIndex].params.itemName != null && this.newItems[currIndex].params.isSaveable)
        {
            params += "&itemId_" + i + "=" + this.newItems[currIndex].id + "&itemName_" + i + "=" + this.newItems[currIndex].params.itemName;
            i++;
            this.updateSavedItems(this.current_map_id, this.newItems[currIndex].id, this.newItems[currIndex].params.itemName);
        }
    }

	if (g_config.showServerTransactions)
	{
		this.addInfo(params + '\n');
	}
	
    var me = this;
    ajax_post(
            http_string, 
            function(xml) 
            {
                me.receiveSaveItemsResultFromServer(xml, teleportDestination);
            }, 
            params
        );
}

GameController.prototype.receiveSaveItemsResultFromServer = function(xml, teleportDestination)
{
    if (xml.nodeName == "result" && xml.getAttribute("status") == "1")
    {
        alert('save items successful: added ' + xml.getAttribute('added') + ' deleted ' + xml.getAttribute('deleted') + ' updated ' + xml.getAttribute('updated'));

        this.submitLoadMap(teleportDestination, false);
    }
    else
    {
        alert(xml.textContent);
    }
}

GameController.prototype.updateSavedItems = function(map_id, item_id, item_name)
{
    this.savedItems.push({map_id:map_id, item_id:item_id, item_name:item_name});        
}

// Update the saved items list from XML
GameController.prototype.getSavedItemsFromXML = function(xml)
{
    var xmlContentsList = xml.getElementsByTagName("item");
    
    for (var i = 0; i < xmlContentsList.length; i++)
    {
        var xmlContents = xmlContentsList.item(i);
        this.updateSavedItems(xmlContents.getAttribute("map_id"), xmlContents.getAttribute("item_id"), xmlContents.getAttribute("item_name"));
    }   
}

GameController.prototype.removeSavedItemsFromMap = function()
{
    for (var i = 0; i < this.savedItems.length; ++i)
    {
        if (this.savedItems[i].map_id == this.current_map_id)
        {
            var item = this.model.getItemById(this.savedItems[i].item_id);

            if (item != null && item.owner != null)
            {
                item.owner.removeItem(item);
            }
        }
    }
}

GameController.prototype.submitLoadMap = function(map_id, doGetItems)
{
    if (map_id == null)
        return;

    // We don't teleport if there's unsaved data.
    // Instead, return to edit mode.
    if (!this.isMapSaved)
    {
        this.editLevel();
        return;
    }
        
    document.getElementById("loadingNotification").setAttribute("display", "inline");
    this.setActive(false);

    var http_string = "update.php";
    var params = "load=" + escape(map_id) + "&save_level=1&login=" + escape(this.loginController.login) + "&password=" + escape(this.loginController.password);
    
    if (!this.hasLoadedVisitedWorlds)
    {
        params += "&get_visit=1";
        this.hasLoadedVisitedWorlds = true;
    }
    
    if (doGetItems)
        params += "&get_items=1";
    
	if (g_config.showServerTransactions)
	{
		this.addInfo(params + '\n');
	}

    var me = this;
    ajax_post(
            http_string, 
            function(xml) 
            {
                me.receiveMapFromServer(xml);
            }, 
            params
        );
}

GameController.prototype.receiveMapFromServer = function(xml)
{
    document.getElementById("persMapArea").setAttribute("display", "inline");
    document.getElementById("loadingNotification").setAttribute("display", "none");

    if (xml.nodeName == "result" && xml.getAttribute("status") == "1")
    {
        this.currentMap = xml.firstChild;
        this.setMapSavedStatus(true);

        this.getVisitedWorldsFromXML(xml);
        
		// Get map info
	    if (xml.hasAttribute("map_id"))
	    {
	        this.current_map_id = xml.getAttribute("map_id");
	    }

	    if (xml.hasAttribute("map_name"))
	    {
	        this.setMapName(xml.getAttribute("map_name"));
	    }

		// Set whether the level is editable
		this.enableEditMode(xml.hasAttribute("editable") && xml.getAttribute("editable") == "1");

		// List of items that the user has saved
	    this.getSavedItemsFromXML(xml);	
		
		// Load the map
		this.unsavedMap = null;
		this.initialiseModelFromXML();
		
		this.playLevel();
	}
    else
    {
        alert(xml.textContent);
    }

    this.setActive(true);
}

GameController.prototype.getVisitedWorldsFromXML = function(xml)
{
    if (xml == null)
        return;
        
    var xmlVisitedList = xml.getElementsByTagName("visit");
    
    for (var i = 0; i < xmlVisitedList.length; i++)
    {
        var xmlVisit = xmlVisitedList.item(i);
        this.addVisitedWorld({
            map_id:xmlVisit.getAttribute("map_id"), 
            map_name:xmlVisit.getAttribute("map_name"),
            owner_id:xmlVisit.getAttribute("owner_id"),
            access:xmlVisit.getAttribute("access")
            });
    }    
}

// Reset the game from the XML 
GameController.prototype.initialiseModelFromXML = function()
{
	var xml = this.unsavedMap;
	if (xml == null)
	{
		xml = this.currentMap;
    }

	this.newItems = [];
    this.model.clear();
	this.view.clear();
    this.actionController.clear();
    this.model.registerItem(this.currentChar);
    
    this.gameState = "normal";
    this.turnClock.currentTime = 0;
    this.model.fromXML(xml);
    this.actionController.fromXML(xml);
}

GameController.prototype.submitSaveMap = function(map)
{
    var http_string = "update.php";
    var params = "save=" + escape(this.current_map_id) + "&map=" + escape(map) + "&login=" + escape(this.loginController.login) + "&password=" + escape(this.loginController.password);

	if (g_config.showServerTransactions)
	{
		this.addInfo(params + '\n');
	}
	    
    var me = this;
    ajax_post(
            http_string, 
            function(xml) 
            {
                me.sendMapToServer(xml);
            }, 
            params
        );
}

GameController.prototype.setMapSavedStatus = function(isMapSaved)
{
    this.isMapSaved = isMapSaved;
    this.editWindow.saveMapButton.setAble(!this.isMapSaved);
}

GameController.prototype.sendMapToServer = function(xml)
{
    if (xml.nodeName == "result" && xml.getAttribute("status") == "1")
    {
        this.setMapSavedStatus(true);
		this.unsavedMap = null;
        alert('sent map OK');
        if (xml.hasAttribute("map_id"))
        {
            this.current_map_id = xml.getAttribute("map_id");
        }
    }
    else
    {
        alert(xml.textContent);
    }
}

GameController.prototype.doAction = function(src, evt)
{
    if (evt.type == "keypress")
        evt.preventDefault();
    
    if (evt.type == "closeWindow")
    {
        src.hide();
        if (src.windowName == "Admin")
        {
            this.expandButton.isSelected = false;
            this.expandButton.updateAppearance();
        }
    }
    else if (evt.type == "loggedIn")
    {
        // User has successfully logged in, so load the artwork and 
        // map from the server
        this.submitLoadArtworkAndMap("images/gameGraphics.svg");
        this.setActive(true);
    }
    else if (evt.type == "loggedOut")
    {
        // User has logged out
        this.setActive(false);
        this.enableEditMode(false);
        this.worldChooserWindow.hide();
        this.worldChooserWindow.clear();
        this.adminWindow.hide();
        document.getElementById("persMapArea").setAttribute("display", "none");
        this.model.clear();
		this.view.clear();
        this.actionController.clear();
        this.clearPlayerData();
    }
    else if (evt.type == "worldSelected")
    {
        this.submitLoadMap(evt.value, false);
    }
    else if (src.src == "adminExpand" && evt.type == "click")
    {
        if (src.isSelected)
            this.adminWindow.show();
        else
            this.adminWindow.hide();
    }
    else if (!this.isActive)
    {
        // If the game is inactive, we don't care about any user input events.
        return;
    }
    else if (!this.editMode)
    {
        this.parseGameAction(src, evt);
    }
    else 
    {
        this.parseEditAction(src, evt);
    }
}

function parseKeycodesAndCharcodes(keyCode, charCode)
{
    var result = null;
    switch (charCode)
    {
    case 0:
        break;
        
    case 119:
        // w
        result = "up";     
        break;

    case 97:
        // a
        result = "left";       
        break;

    case 115:
        // s
        result = "down";        
        break;

    case 100:
        // d
        result = "right"     
        break;

    case 32:
        // space
        result = "wait";        
        break;

    case 43:
        // -
        result = "zoom_out";        
        break;

    case 45:
        // +
        result = "zoom_in";        
        break;
    }    
    
    switch (keyCode)
    {
    case 0:
        break;
        
    case 37:
        // left
        result = "left";
        break;
   
    case 38:
        // up
        result = "up";
        break;
   
    case 39:
        // right
        result = "right";
        break;

    case 40:
        // down
        result = "down";
        break;
    }
    
    return result;
}

GameController.prototype.parseGameAction = function(src, evt)
{
    if (this.gameState == "dead")
    {
        if (evt.type == "keypress" && parseKeycodesAndCharcodes(evt.keyCode, evt.charCode) == "wait")
        {
            // The user has been notified that they are dead, so
            // restart the map.
            this.initialiseModelFromXML();
			this.playLevel();
        }
        return;
    }
    
    if (evt.type == "keypress" && this.background.focus == null)
    {
        switch (parseKeycodesAndCharcodes(evt.keyCode, evt.charCode))
        {
        case "up":
             this.attemptMoveCurrentChar(0, -1);
            this.currentChar.setItemParam("direction", "b");
            this.stepTime();        
            break;

        case "left":
            this.attemptMoveCurrentChar(-1, 0);
            this.currentChar.setItemParam("direction", "r");
            this.stepTime();        
            break;

        case "down":
            this.attemptMoveCurrentChar(0, 1);
            this.currentChar.setItemParam("direction", "f");
            this.stepTime();        
            break;
            
        case "right":
            this.attemptMoveCurrentChar(1, 0);
            this.currentChar.setItemParam("direction", "l");
            this.stepTime();        
            break;

        case "wait":
            this.stepTime();        
            break;
        }    
    }
    else if (evt.type == "click")
    {
        if (src.src == "editmap")
        {
            if (src.isSelected)
				this.editLevel();
			else
				this.playLevel();
        }
    }
}

GameController.prototype.parseEditAction = function(src, evt)
{
    if (src.src == this.idMap.buttonName && evt.type == "mouseover")
    {
        // Make sure the contents are visible
        this.setVisibleToUser(src.modelContents, 5);
    
        if (this.editWindow.infoWindow.showing)
        {
            // Update the info about this square
            var infoXML = src.modelContents.toXML(this.model.xmlDoc, true);
            if (infoXML != null)
            {
                // Use E4X to prettyprint the XML
                var infoString = XML((new XMLSerializer()).serializeToString(infoXML)).toXMLString();
                this.setInfo(infoString);
            }
            else
            {
                this.setInfo("null");
            }
        }
    }
    else if (evt.type == "click")
    {
        if (src.src == "editmap")
        {
            if (src.isSelected)
				this.editLevel();
			else
				this.playLevel();
        }
        else if (src.src == "persView")
        {
            this.contentSelected(src, evt);
        }
    }
    else if (evt.type == "keypress" && this.background.focus == null)
    {
        switch (parseKeycodesAndCharcodes(evt.keyCode, evt.charCode))
        {
        case "left":
            this.view.setCellCentre(this.view.cellCentreX - 1, this.view.cellCentreY);
		    this.view.updateView();
		    this.view.removeOutsideView();
            break;
       
        case "up":
            this.view.setCellCentre(this.view.cellCentreX, this.view.cellCentreY - 1);
		    this.view.updateView();
		    this.view.removeOutsideView();
            break;
       
        case "right":
            this.view.setCellCentre(this.view.cellCentreX + 1, this.view.cellCentreY);
		    this.view.updateView();
		    this.view.removeOutsideView();
            break;

        case "down":
            this.view.setCellCentre(this.view.cellCentreX, this.view.cellCentreY + 1);
		    this.view.updateView();
		    this.view.removeOutsideView();
            break;

        case "zoom_out":
            break;

        case "zoom_in":
            break;
        }
    }
}

GameController.prototype.setVisibleToUser = function(contents, offset)
{
    // Make sure the contents are visible
    var ht = offset;
    
    var topBlock = getTopBlockItem(contents);
    if (topBlock != null)
    {
        ht = topBlock.params.elev + topBlock.params.ht + offset;
    }
    
    this.model.clearInTheWay();
    contents.setVisibleToUser(ht);
    this.model.getContents(contents.x, contents.y - 1).setVisibleToUser(ht);
    this.model.getContents(contents.x + 1, contents.y).setVisibleToUser(ht);
}

GameController.prototype.contentSelected = function(src, evt)
{
    if (this.editMode && evt.shiftKey)
    {
        var currData = this.model.getContents(src.x_index, src.y_index);
        this.contentLayoutView.setContents(currData);
        
        /*
        if (this.editWindow.radioButtonGroup.currentSelection.src == "select")
        {
            // Unselect existing map selection
            if (this.mapSelect != null)
            {
                this.mapSelect.setToggle(false);
                this.mapSelect.setSelected(false);
            }
            
            // Set the state of the button as selected
            this.mapSelect = src;
            src.setToggle(true);
            src.setSelected(true);
            
            // Update the content view
            this.contentLayoutView.setContents(currData);
        }
        */
    }
    else if (this.editMode)
    {
        var currData = this.model.getContents(src.x_index, src.y_index);
        
        if (this.editWindow.itemSelectorWindow.isShowing())
        {
 			this.editWindow.itemSelectorWindow.setGridContents(currData);
        }
        else if (this.editWindow.radioButtonGroup.currentSelection == null || this.editWindow.radioButtonGroup.currentSelection.isSelected == false)
        {
            // Nothing selected
        }
        else if (this.editWindow.radioButtonGroup.currentSelection.src == "deleteButton")
        {
            // Delete the last thing
            var topData = currData.getTopItem();
			topData.markedForDeath = true; // We need to mark this so that actions and conditions know this is an actual delete rather than just moving the item
            
            // First remove from moveable item list (if present)
            this.model.removeFromMoveableItems(topData);
            
            if (topData.owner != null)
            {
                topData.owner.removeItemByIndex(0);
            }
            //this.updateItemsRemainingText();
            this.setMapSavedStatus(false);
        }
        else if (this.editWindow.radioButtonGroup.currentSelection.src == "upArrowButton")
        {
            // Raise the top block item
            var topBlock = getTopBlockItem(currData);

            if (topBlock != null)
            {
                var targetHeight = topBlock.params.ht + 5;
                if (targetHeight > 60)
                    targetHeight = 60;
                    
                topBlock.setHeight(targetHeight, true);
            }
            this.setMapSavedStatus(false);
        }
        else if (this.editWindow.radioButtonGroup.currentSelection.src == "downArrowButton")
        {
            // Lower the top block item
            var topBlock = getTopBlockItem(currData);

            if (topBlock != null)
            {
                var targetHeight = topBlock.params.ht - 5;
                if (targetHeight < 0)
                    targetHeight = 0;
                    
                topBlock.setHeight(targetHeight, true);
            }
            this.setMapSavedStatus(false);
        }
        else if (this.editWindow.radioButtonGroup.currentSelection.src == "rotateLeftArrowButton")
        {
            // Rotate the top item left
            var topItem = currData.getTopItem();

            if (topItem != null)
            {
				// Rotate the item to the left
				topItem.rotateItem(-1);
            }
            this.setMapSavedStatus(false);
        }
        else if (this.editWindow.radioButtonGroup.currentSelection.src == "rotateRightArrowButton")
        {
            // Rotate the top item right
            var topItem = currData.getTopItem();

            if (topItem != null)
            {
				// Rotate the item to the left
				topItem.rotateItem(1);
            }
            this.setMapSavedStatus(false);
        }
        else if (this.editWindow.radioButtonGroup.currentSelection.src == "lightButton")
        {
            currData.setAmbientLight(this.editWindow.lightLevelWindow.lightLevel);
            this.setMapSavedStatus(false);
        }
        else if (this.editWindow.radioButtonGroup.currentSelection.src == "blockItemButton")
        {
            // Set the ambient light default if this is the first item
            // to be added
            if (currData.myItems.length == 0)
                currData.setAmbientLight(this.editWindow.lightLevelWindow.lightLevel);

            var item = this.editWindow.blockItemWindow.item;
            
            this.appendItem(currData.getTopItem(), item);
        }
        else if (this.editWindow.radioButtonGroup.currentSelection.src == "itemButton")
        {
            // Need a block item to go first
            if (currData.myItems.length == 0)
                return;
                
            var item = this.editWindow.itemWindow.item;
            
            if (item.params.itemCode == "S")
            {
                // Remove any existing start items
                var existingStartItem = this.model.findItemByCode("S");
                while (existingStartItem != null)
                {
                    existingStartItem.owner.removeItem(existingStartItem);
                    existingStartItem = this.model.findItemByCode("S");
                }
            }
            
            this.appendItem(currData.getTopItem(), item);

            if (item.params.doTeleport)
            {
                // Create a corresponding action and condition
                var teleportAction = new TeleportAction(this.model, this, item.params.doTeleport);
				this.actionController.appendAction(teleportAction);
				
				var teleportCondition = new HasItemCondition(this.model, this, this.currentChar, false, item);
		        this.actionController.registerCondition(teleportCondition);
	    		teleportAction.addCondition(teleportCondition);
			}
        }
    }
}

GameController.prototype.appendItem = function(topData, item)
{
    var params = {};
    for (var i in item.params)
        params[i] = item.params[i];
    
    var itemCopy = new PerspectiveGridItem(params);

    // add the foreground object
    topData.appendItem(itemCopy);
    if (itemCopy.params.isSaveable)
    {
        // Takeable items must have ids
        this.model.registerItem(itemCopy);
    }

    // If the item is moveable, add it to the moveable list.
    if (itemCopy.params.moveTowards != null)
    {
        this.model.addToMoveableItems(itemCopy);
    }

    this.setMapSavedStatus(false);
}

GameController.prototype.placeAvatar = function()
{
	// Reset the start direction
	this.currentChar.setItemParam("direction", "f");
	
	// Find the start position
	var startX = 0;
	var startY = 0;

	// If there is a start marker, use that
	var startItem = this.model.findItemByCode("S");
	if (startItem != null)
	{
	    startX = startItem.contents.x;
	    startY = startItem.contents.y;
	}
  
	// Add the avatar to the world
	var currData = this.model.getContents(startX, startY);
	var topData = currData.getTopItem();
	topData.appendItem(this.currentChar);
}

// Remove the avatar from the board.
GameController.prototype.removeAvatar = function()
{
    if (this.currentChar.owner != null)
        this.currentChar.owner.removeItem(this.currentChar);
}

GameController.prototype.endGame = function(endMessage)
{
    this.currentChar.setItemParam('speech', endMessage, false);
    this.gameState = "dead";

    // Oh dear. They've lost all their loot since their last save.
    this.newItems = [];
}

GameController.prototype.attemptMoveCurrentChar = function(deltaX, deltaY)
{
    if (this.currentChar.contents == null)
        return;
    
    var destContents = this.model.getContents(this.currentChar.contents.x + deltaX, this.currentChar.contents.y + deltaY);
    var topData = destContents.getTopItem();

	if (topData.src == "GridContents")
		return;

    var climbHeight = 0; // Can't climb at all, by default
    if (this.currentChar.params.climbHeight != null)
        climbHeight = this.currentChar.params.climbHeight;
    
    var dropHeight = null; // Can drop any distance, by default
    if (this.currentChar.params.dropHeight != null)
        dropHeight = this.currentChar.params.dropHeight;
        
    if (this.currentChar.canMoveTo(topData, climbHeight, dropHeight))
    { 
        this.moveChar(topData);
    }
    else if (topData.params.isPushable)
    {
        // A pushable item can be pushed if:
        // - the user would be able to move into its contents
        //   if the pushable item wasn't there
        // - the contents that the pushable item would move into
        //   is the same level or lower than the contents it is
        //   currently in, and can be stood on.
        var deltaHeight = topData.params.elev - this.currentChar.params.elev;
        if (deltaHeight < 20)
        {
            // User would be able to move into this contents
            var pushedDestContents = this.model.getContents(this.currentChar.contents.x + deltaX * 2, this.currentChar.contents.y + deltaY * 2);            
            while (pushedDestContents.myItems.length > 0)
            {
                pushedDestContents = pushedDestContents.myItems[0];
            }
            
            var deltaPushedHeight = pushedDestContents.params.ht + pushedDestContents.params.elev - topData.params.elev;
            
            if (deltaPushedHeight <= 0)
            {
                topData.moveItem(pushedDestContents);
                topData = destContents.getTopItem();
                if (topData.params.canStandOn)
                {
                    this.moveChar(topData);
                }
            }
        }
    }        
}

GameController.prototype.moveChar = function(destItem)
{
    // Check if character is in the model
    if (this.currentChar.contents == null)
        return;

    // If there are any takeable items, take them first
    while (destItem.params.isTakeable)
    {
        var owner = destItem.owner;
        if (owner)
        {
            // Add to list
            this.newItems.push(destItem);
            
            // Remove item
            owner.removeItem(destItem);
        }
        destItem = owner;
    }

    this.currentChar.moveItem(destItem);    
}

GameController.prototype.stepTime = function()
{
    // Anything that was speaking from last turn gets turned off.
    this.actionController.clearSpeakingItems();
    
    // When the avatar has completed their action for the turn, 
    // check the block the avatar is standing on for triggered actions
    // and check whether any items want to change.
    this.changeItems();    
    
    this.actionController.attemptActions();
    this.turnClock.currentTime++;

	// Finally update the view
    this.view.setCellCentre(this.currentChar.contents.x, this.currentChar.contents.y);
    this.view.updateView();
    this.view.removeOutsideView();
    this.view.updatePOV([this.currentChar]);
    this.setVisibleToUser(this.currentChar.contents, 15);
}

GameController.prototype.changeItems = function()
{
    // Make a list of the items that want to change (including movement), sorted by where they want to move to.
    var destinationList = {};
    for (var i = 0; i < this.model.moveableItems.length; ++i)
    {
        var currRequest = this.model.moveableItems[i].requestChange();
        
        if (currRequest == null)
            continue;
        
        if (destinationList[currRequest.contents.getLocationString()] == null)
        {
            destinationList[currRequest.contents.getLocationString()] = [];
        }
        
        destinationList[currRequest.contents.getLocationString()].push({item:this.model.moveableItems[i], dest:currRequest});
    }
    
    for (var i in destinationList)
    {
        if (i == this.currentChar.contents.getLocationString())
        {
            // The item wishes to move into the current character's contents
            this.endGame("Death by " + destinationList[i][0].item.params.fullname + "! Press space to restart.");
        }
        else if (destinationList[i].length == 1)
        {
            // Move the item as per its request.
            var topData = destinationList[i][0].dest.contents.getTopItem();
            destinationList[i][0].item.moveItem(topData);
            destinationList[i][0].item.setItemParam("direction", destinationList[i][0].dest.params.direction);
        }
        else 
        {
            // More than one thing wanted to move here.
            // For the moment, none of them move.
            
            // However, they all at least turn in the direction they
            // want to move.
            destinationList[i][0].item.setItemParam("direction", destinationList[i][0].dest.params.direction);
        }
    }    
}

GameController.prototype.enableEditMode = function(doEnable)
{
	this.canEdit = doEnable;
	
	// Also clear the buttons if necessary.
    if (doEnable)
        this.adminWindow.editMapButton.show();
    else
        this.adminWindow.editMapButton.hide();
}

GameController.prototype.setActive = function(isActive)
{
    this.isActive = isActive;
}

GameController.prototype.setZoom = function(zoomLevel)
{
	// Set zoom level of window
	if (zoomLevel < 0.2)
		this.view.setFixedCellCount(4);
	else if (zoomLevel < 0.4)
		this.view.setFixedCellCount(8);
	else if (zoomLevel < 0.6)
		this.view.setFixedCellCount(12);
	else if (zoomLevel < 0.8)
		this.view.setFixedCellCount(20);
	else
		this.view.setFixedCellCount(30);
	
	this.view.updateView();
}

// Go into debug mode - it's like edit mode, except it doesn't load or save the level
// or remove the avatar
GameController.prototype.setDebugMode = function(debugMode)
{
    // Clear any "in the way" squares that might be left over
    this.model.clearInTheWay();

    this.editMode = debugMode; // Emulate editMode for the purposes of handling move events

    if (debugMode)
    {        
        this.model.showInvisible = true;

        var bgrect = document.getElementById("baseBG");
        bgrect.setAttribute("fill", "white");

        gOpacityScaleFactor = 0.6;

		this.view.updatePOV(null);
        this.view.setLighting();
        this.editLayer.show();
		this.setZoom(this.editWindow.zoomSlider.sliderPosition);
    }
    else
    {
		this.playLevel();
    }
}

// Initialise and start editing the level, if permitted.
GameController.prototype.editLevel = function(debugMode)
{
	if (this.canEdit == false)
	{
		this.playLevel();
		return;
	}
	
    this.editMode = true;

    // Clear any "in the way" squares that might be left over
    this.model.clearInTheWay();

	this.adminWindow.editMapButton.setContents(this.adminWindow.editMapButtonPlayText);

	this.model.showInvisible = true;

	var bgrect = document.getElementById("baseBG");
	bgrect.setAttribute("fill", "white");

	gOpacityScaleFactor = 0.6;

	if (!debugMode)
	{
		// Remove the avatar
		this.removeAvatar();

		// Initialise the level from the xml, so that all the actions are reset
		this.initialiseModelFromXML();
	}
	
	this.view.updatePOV(null);
	this.view.setLighting();
	this.editLayer.show();
	this.setZoom(this.editWindow.zoomSlider.sliderPosition);
}

// Initialise and play the level.
GameController.prototype.playLevel = function()
{
    this.editMode = false;

    // Clear any "in the way" squares that might be left over
    this.model.clearInTheWay();

	// Hide the editor
    this.adminWindow.editMapButton.setContents(this.adminWindow.editMapButtonEditText);
    this.editLayer.hide();

	// Save any unsaved map data
	if (!this.isMapSaved)
   		this.unsavedMap = this.model.toXML();
    
	this.clearHighlightedItems();
    this.model.showInvisible = false;
    
	// reset the lighting
    gOpacityScaleFactor = 1.0;
    this.view.setLighting();
    
    // reset the turn clock
    this.turnClock.currentTime = 0;

	// Remove held items from the map.
    this.removeSavedItemsFromMap();

    // Add the avatar into the scene
    this.placeAvatar();

	// Setup the board
    this.view.setFixedCellCount(8);
    this.view.setCellCentre(this.currentChar.contents.x, this.currentChar.contents.y);
    this.view.updateView();
    this.view.updatePOV([this.currentChar]);
    this.view.removeOutsideView();
    
	// Set the background appearance to black.
    var bgrect = document.getElementById("baseBG");
    bgrect.setAttribute("fill", "black");

	// Clear any existing speech bubbles.
    this.currentChar.setItemParam('speech', null, false);

	// Start the first turn.
    this.stepTime();	
}

