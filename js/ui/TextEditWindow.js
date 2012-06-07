// TextEditWindow is a window with an editable text field in it, and an OK and Cancel button.
function TextEditWindow(controller, windowName, initialText)
{
    TextEditWindow.baseConstructor.call(this, windowName, 5, {fill:"white", stroke:"green", rx:4}, {width:205, height:86, storePrefix:"MW_TextEditWindow", contentsSpacing:3});

	this.controller = controller;

    this.textbox = new TextArea(
		"myText", // Identifier
		this.controller.background, // background object, so that the textArea gets keystrokes
		{width:200, height:30, fill:"white", "stroke-width":3}, // parameters for bounding rect
		{"font-size":20, fill:"black", x:5, y:20}, // parameters for text
		0, // x
		0,  // y
		{normal:{stroke:"black"}, focus:{stroke:"red"}} // bounding rect states
		);
    this.contents.appendChild(this.textbox);
	this.textbox.setValue(initialText);

	var buttonArea = new FlowLayout(0, 0, {minSpacing:20});	

    this.okButton = new RectButton("OK", 0, 0, new SVGElement("text", {y:12, "font-size":12}, "OK"), {fill:"lightblue", stroke:"black", rx:2}, {fill:"orange"}, {fill:"red"}, 2, false);
    this.okButton.addActionListener(this);    
	buttonArea.appendChild(this.okButton);

    this.cancelButton = new RectButton("Cancel", 0, 0, new SVGElement("text", {y:12, "font-size":12}, "Cancel"), {fill:"lightblue", stroke:"black", rx:2}, {fill:"orange"}, {fill:"red"}, 2, false);
    this.cancelButton.addActionListener(this);    
	buttonArea.appendChild(this.cancelButton);

	this.contents.appendChild(buttonArea);
}

KevLinDev.extend(TextEditWindow, SVGWindow);

TextEditWindow.prototype.doAction = function(src, evt)
{
    TextEditWindow.superClass.doAction.call(this, src, evt);

    if (evt.type == "closeWindow")
    {
		this.tellActionListeners(this, {type:"cancelRenameWorld"});
    }
    else if (evt.type == "click")
	{
    	if (src.src == "OK")
    	{
			this.tellActionListeners(this, {type:"renameWorld", newWorldName:this.textbox.textVal});
	    }
	    else if (src.src == "Cancel")
	    {
			this.tellActionListeners(this, {type:"cancelRenameWorld"});
	    }
	}
}

// When we get focus, give it to the text box right away
TextEditWindow.prototype.setFocus = function()
{
    TextEditWindow.superClass.setFocus.call(this);    
	this.textbox.setFocus();
};


