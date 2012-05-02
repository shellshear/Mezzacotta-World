// LightLevelWindow is used for setting light levels and the default light level for 
// the scene.
function LightLevelWindow(controller)
{
    LightLevelWindow.baseConstructor.call(this, "Ambient Light Level", 5, {fill:"lightGreen", stroke:"green", rx:4}, {width:260, height:60, storePrefix:"MW_LightLevelWindow"});

	this.controller = controller;
	
    this.lightBar = new FlowLayout(0, 0, {minSpacing:5});
    this.contents.appendChild(this.lightBar);

	// Create a default item for us to display

    this.labelIcon = new SVGElement();
    this.labelIcon.cloneElement(this.controller.artwork.getElementById("iconLightbulb"));
    this.lightAppearanceLabel = new RectLabel(0, 0, this.labelIcon, {fill:"white", stroke:"none", width:40, height:40}, 2);	

    this.buttonIcon = new SVGElement();
    this.buttonIcon.cloneElement(this.controller.artwork.getElementById("iconLightbulb"));
    this.lightAppearanceButton = new RectButton("lightButton", 0, 0, this.buttonIcon, {fill:"white", stroke:"none", width:30, height:30}, {fill:"yellow"}, {fill:"orange"}, 2, false);	

    this.setLightLevel(0); // Set the default light level
    
    this.lightBar.appendChild(this.lightAppearanceLabel);

    for (var i = 0; i <= 5; i++)
    {
        var currButtonIcon = new SVGElement();
        currButtonIcon.cloneElement(this.controller.artwork.getElementById("iconLightbulb"));
        currButtonIcon.firstChild.setAttribute("style", "fill:'black';opacity:" + (i * 0.2));
            
        var currButton = new RectButton("l_" + i, 0, 0, currButtonIcon, {stroke:"black", fill:"white", rx:2, width:30, height:30}, {stroke:"red"}, {stroke:"red"}, 2, false);
        this.lightBar.appendChild(currButton);
        currButton.addActionListener(this);
    }
}

KevLinDev.extend(LightLevelWindow, SVGWindow);

LightLevelWindow.prototype.setLightLevel = function(lightLevel)
{
    this.lightLevel = lightLevel;
    this.labelIcon.firstChild.setAttribute("style", "fill:'black';opacity:" + (1 - lightLevel));
    this.buttonIcon.firstChild.setAttribute("style", "fill:'black';opacity:" + (1 - lightLevel));
}

LightLevelWindow.prototype.doAction = function(src, evt)
{
    LightLevelWindow.superClass.doAction.call(this, src, evt);

	if (evt.type == "click" && src.src.substring(0, 2) == "l_")
	{
    	this.setLightLevel(1.0 - parseInt(src.src.substring(2)) * 0.2);

        // Also make sure the item is selected in the edit menu
	    this.tellActionListeners(this.lightAppearanceButton, {type:"selected"});
	}
}

