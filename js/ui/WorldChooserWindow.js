// WorldChooserWindow gives a list of worlds to teleport to.
function WorldChooserWindow(controller, params)
{
    this.params = params;
    if (this.params == null)
        this.params = [];
    if (!this.params.windowName)
        this.params.windowName = "Window Chooser";
        
    WorldChooserWindow.baseConstructor.call(this, this.params.windowName, 5, {fill:"lightGreen", stroke:"green", rx:4}, {width:150, storePrefix:"MW_WorldChooserWindow", contentsSpacing:3});

	this.controller = controller;
	this.controller.addActionListener(this); // Listen to the server for changes to world names
	
	for (var i in this.controller.visitedWorlds)
	{
		this.addWorld(this.controller.visitedWorlds[i]);
	}
}

KevLinDev.extend(WorldChooserWindow, SVGWindow);

WorldChooserWindow.prototype.doAction = function(src, evt)
{
    WorldChooserWindow.superClass.doAction.call(this, src, evt);

    if (evt.type == "click")
	{
    	if (src.src.indexOf("world_") == 0)
    	{
     	    var world_id = src.src.slice(6);
    	    this.tellActionListeners(this, {type:"worldSelected", value:world_id});
    	    if (this.params.closeOnSelect)
    	        this.hide();
	    }
	}
	else if (evt.type == "add")
	{
        this.addWorld(evt.value);   
	}
	else if (evt.type == "clear")
	{
	    this.clear();
	}
	else if (evt.type == "serverWorldRenamed")
	{
		// The server has renamed one of the worlds. Find the appropriate one
		// if it is in our list, and rename it.
		for (var i in this.contents.childNodes)
		{
			var currButton = this.contents.childNodes[i].firstChild;
			if (currButton.src == "world_" + evt.map_id)
			{
				currButton.bgElement.setContents(new SVGElement("text", {y:12, "font-size":12}, evt.map_name));
			}
		}
	}
}

WorldChooserWindow.prototype.addWorld = function(world)
{
    // Access is for showing valid teleport destinations
    if (this.params.showAccessOnly && !world.access)
        return;
        
    var worldButton = new RectButton("world_" + world.map_id, 0, 0, new SVGElement("text", {y:12, "font-size":12}, world.map_name), {fill:"lightblue", stroke:"black", rx:2, width:80, height:16}, {fill:"orange"}, {fill:"red"}, 2, false);
    worldButton.addActionListener(this);
    this.contents.appendChild(worldButton);
    this.scrollbarRegion.refreshLayout();
}

WorldChooserWindow.prototype.clear = function()
{
    this.contents.removeChildren();
    this.refreshLayout();
}
