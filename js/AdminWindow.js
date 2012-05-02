// AdminWindow is used for editing functions
// Allows the user to logout, to change worlds to ones they've visited, and to edit worlds.
function AdminWindow(controller, logoutButton)
{
    AdminWindow.baseConstructor.call(this, "Admin", 5, {fill:"lightGreen", stroke:"green", rx:4}, {width:183, height:104, storePrefix:"MW_AdminWindow", contentsSpacing:3});

	this.controller = controller;
	this.contents.appendChild(logoutButton);
	
	this.worldLabelGroup = new FlowLayout(0, 0, {minSpacing:5});
	this.worldLabelGroup.appendChild(new SVGElement("text", {y:12, "font-size":12, fill:"black"}, "Current world:"));
	this.worldLabel = new TextLabel("foobarworld", {"font-size":12, fill:"black"});
	this.worldLabelGroup.appendChild(this.worldLabel);
	this.contents.appendChild(this.worldLabelGroup);
	
	this.editMapButtonEditText = new SVGElement("text", {y:12, "font-size":12}, "Edit");
	this.editMapButtonPlayText = new SVGElement("text", {y:12, "font-size":12}, "Play");
    this.editMapButton = new RectButton("editmap", 0, 0, this.editMapButtonEditText, {fill:"lightblue", stroke:"black", rx:2}, {fill:"orange"}, {fill:"red"}, 2, false);
    this.editMapButton.addActionListener(this);
	this.worldLabelGroup.appendChild(this.editMapButton);

    this.renameWorldButton = new RectButton("renameworld", 0, 0, new SVGElement("text", {y:12, "font-size":12}, "Rename World"), {fill:"lightblue", stroke:"black", rx:2}, {fill:"orange"}, {fill:"red"}, 2, false);
    this.renameWorldButton.addActionListener(this);    
	this.contents.appendChild(this.renameWorldButton);

    this.newWorldButton = new RectButton("newworld", 0, 0, new SVGElement("text", {y:12, "font-size":12}, "Change World"), {fill:"lightblue", stroke:"black", rx:2}, {fill:"orange"}, {fill:"red"}, 2, false);
    this.newWorldButton.addActionListener(this);    
	this.contents.appendChild(this.newWorldButton);
}

KevLinDev.extend(AdminWindow, SVGWindow);

AdminWindow.prototype.doAction = function(src, evt)
{
    AdminWindow.superClass.doAction.call(this, src, evt);

    if (evt.type == "closeWindow")
    {
        src.hide();
    }
    else if (evt.type == "click")
	{
    	if (src.src == "newworld")
    	{
    	    this.controller.worldChooserWindow.show();
	    }
    	else if (src.src == "renameworld")
    	{
		    var renameWorldWindow = new TextEditWindow(this.controller, "Rename World", this.worldLabel.textValue);
			renameWorldWindow.addActionListener(this);

			// Show the rename world editor
			this.setAble(false);
			this.appendChild(renameWorldWindow);
			renameWorldWindow.setFocus();
	    }
	    else if (src.src == "editmap")
	    {
	        if (this.controller.editMode)
	        {
                this.controller.setEditMode(false);
	        }
	        else
	        {
                this.controller.setEditMode(true);
	        }
	    }
		evt.stopPropagation();
	}
	else if (evt.type == "renameWorld")
	{
		// World renamer has returned a new name
		//this.controller.renameWorld(evt.newWorldName);
		alert(evt.newWorldName);
		
		this.setAble(true);
		this.removeChild(src);
	}
	else if (evt.type == "cancelRenameWorld")
	{
		this.setAble(true);
		this.removeChild(src);
 	}
}

