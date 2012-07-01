// Interface between the game and the server, using ajax to get xml.

function GameServerInterface(controller)
{
	this.controller = controller;
}

GameServerInterface.prototype.renameWorld = function(newWorldName)
{
    var http_string = "update.php";
    var params = "changemapname=" + escape(newWorldName) + "&" + this.controller.loginController.getHTTPLoginString() + "&map_id=" + this.controller.current_map_id;
    
	if (g_config.showServerTransactions)
	{
		this.controller.addInfo(params + '\n');
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

GameServerInterface.prototype.receiveRenameWorldResultFromServer = function(xml)
{
    if (xml.nodeName == "result" && xml.getAttribute("status") == "1")
    {
		var map_id = xml.getAttribute("map_id");
		var map_name = xml.getAttribute("map_name");
        this.controller.tellActionListeners(this.controller, {type:"serverWorldRenamed", map_id:map_id, map_name:map_name});
    }
    else
    {
        alert(xml.textContent);
    }
}

GameServerInterface.prototype.submitLoadArtworkAndMap = function(artFile)
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

GameServerInterface.prototype.receiveArtworkFromServer = function(xmlDoc)
{
    this.controller.artwork = xmlDoc;
    
    // Copy all the definitions from the xmlDoc to the current doc
    // TODO: currently require everything to be put in "defs_external" element.
    // Is this necessary/useful?
    var defs = this.controller.artwork.getElementsByTagName("defs");
    var dest = document.getElementById("defs_external");
    for (var i = 0; i < defs.length; i++)
    {
        for (var j = 0; j < defs[i].children.length; j++)
        {
            dest.appendChild(defs[i].children[j].cloneNode(true));
        }
    }
    this.controller.itemFactory.artwork = xmlDoc;

    // We can now use the artwork to setup the edit area
    this.controller.setupEditArea();
    updateLayout();
    
    // Finally, load the starting map, also loading any saved items
    this.submitLoadMap(this.controller.loginController.curr_map, true);
}

// Save items, and optionally teleport to a new map. Set teleportDestination to null
// if you don't wish to teleport.
GameServerInterface.prototype.submitSaveItemsAndTeleport = function(teleportDestination)
{    
    var http_string = "update.php";
    var params = "saveitems=1&" + this.controller.loginController.getHTTPLoginString();
    
	var saveItemParams = this.controller.avatarGroupController.getUnsavedItemsHTTPString();
    if (saveItemParams.length == 0)
    {
        // Don't bother saving anything; there isn't anything to save.
        this.submitLoadMap(teleportDestination);
        return;
    }
    
    params += saveItemParams;

	if (g_config.showServerTransactions)
	{
		this.controller.addInfo(params + '\n');
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

GameServerInterface.prototype.receiveSaveItemsResultFromServer = function(xml, teleportDestination)
{
    if (xml.nodeName == "result" && xml.getAttribute("status") == "1")
    {
        console.log('save items successful: added ' + xml.getAttribute('added') + ' deleted ' + xml.getAttribute('deleted') + ' updated ' + xml.getAttribute('updated'));
		
		this.controller.avatarGroupController.updateFromXML(xml);
		
        this.submitLoadMap(teleportDestination, false);
    }
    else
    {
        alert(xml.textContent);
    }
}

GameServerInterface.prototype.submitLoadMap = function(map_id, doGetItems)
{
    if (map_id == null)
        return;

    // We don't teleport if there's unsaved data.
    // Instead, return to edit mode.
    if (!this.controller.isMapSaved)
    {
		alert("Can't teleport - there is unsaved data.");
        this.controller.editLevel();
        return;
    }
        
    document.getElementById("loadingNotification").setAttribute("display", "inline");
    this.controller.setActive(false);

    var http_string = "update.php";
    var params = "load=" + escape(map_id) + "&save_level=1&" + this.controller.loginController.getHTTPLoginString();
    
    if (!this.controller.hasLoadedVisitedWorlds)
    {
        params += "&get_visit=1";
        this.controller.hasLoadedVisitedWorlds = true;
    }
    
    if (doGetItems)
        params += "&get_items=1";
    
	if (g_config.showServerTransactions)
	{
		this.controller.addInfo(params + '\n');
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

GameServerInterface.prototype.receiveMapFromServer = function(xml)
{
    document.getElementById("persMapArea").setAttribute("display", "inline");
    document.getElementById("loadingNotification").setAttribute("display", "none");

    if (xml.nodeName == "result" && xml.getAttribute("status") == "1")
    {
		// Clear the map and inventory
		this.controller.currentMap = null;
		this.controller.avatarGroupController.setInventoryXML(null);

		// Load map and inventory from xml
		for (var i = 0; i < xml.children.length; ++i)
		{
			switch (xml.children[i].nodeName)
			{
			case "m":
        		this.controller.currentMap = xml.children[i];
				break;
				
			case "items":
				this.controller.avatarGroupController.setInventoryXML(xml.children[i]);
				break;
			}
		}

		this.controller.setMapSavedStatus(true);

        this.controller.getVisitedWorldsFromXML(xml);
        
		// Get map info
	    if (xml.hasAttribute("map_id"))
	    {
	        this.controller.current_map_id = xml.getAttribute("map_id");
	    }

	    if (xml.hasAttribute("map_name"))
	    {
	        this.controller.setMapName(xml.getAttribute("map_name"));
	    }

		// Set whether the level is editable
		this.controller.enableEditMode(xml.hasAttribute("editable") && xml.getAttribute("editable") == "1");

		// Load the map
		this.controller.unsavedMap = null;
		this.controller.initialiseModelFromXML();
		
		this.controller.playLevel();
	}
    else
    {
        alert(xml.textContent);
    }

    this.controller.setActive(true);
}

GameServerInterface.prototype.submitSaveMap = function(map)
{
    var http_string = "update.php";
    var params = "save=" + escape(this.controller.current_map_id) + "&map=" + escape(map) + "&" + this.controller.loginController.getHTTPLoginString();

	if (g_config.showServerTransactions)
	{
		this.controller.addInfo(params + '\n');
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

GameServerInterface.prototype.sendMapToServer = function(xml)
{
    if (xml.nodeName == "result" && xml.getAttribute("status") == "1")
    {
        this.controller.setMapSavedStatus(true);
		this.controller.unsavedMap = null;
        alert('sent map OK');
        if (xml.hasAttribute("map_id"))
        {
            this.controller.current_map_id = xml.getAttribute("map_id");
        }
    }
    else
    {
        alert(xml.textContent);
    }
}


