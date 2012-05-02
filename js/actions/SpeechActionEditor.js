// Speech action requires an item and the speech text
function SpeechActionEditor(controller, action, colour1, colour2)
{
    SpeechActionEditor.baseConstructor.call(this, controller, action, colour1, colour2);
    this.myTag = "SpeakingItem";

	this.selectedItem = null;

	// Create editable contents
    var editableContents = new FlowLayout(0, 0, {minSpacing:3});

    var currIcon = new SVGElement();
    currIcon.cloneElement(this.controller.artwork.getElementById("iconActionSpeech"));
    var actionButton = new RectLabel(0, 0, currIcon, {fill:colour1, stroke:"none", rx:2, width:30, height:30}, 2);
    editableContents.appendChild(actionButton);

    this.speechItemButton = new ItemViewSelector(this.controller, colour1, "speechItem", "topItem");
	editableContents.appendChild(this.speechItemButton);

	this.speechEditTextbox = new TextArea("speechText", controller.background, {width:100, height:40, fill:"white", "stroke":colour1, rx:5}, {"font-size":14, fill:"black", x:3, y:14}, 0, 0, {normal:{stroke:"blue"}, focus:{stroke:"red"}});
   	editableContents.appendChild(this.speechEditTextbox);

	this.contents.prependChild(editableContents);

    this.initFromAction();
}

KevLinDev.extend(SpeechActionEditor, ActionEditor);

SpeechActionEditor.prototype.initFromAction = function()
{
	this.speechItemButton.setSelectedItem(this.myAction.speechItem.item);
	this.setSpeechArray(this.myAction.speechArray);
	this.refreshLayout();
}

SpeechActionEditor.prototype.doAction = function(src, evt)
{
	if (evt.type == "click")
	{
		switch (src.src)
		{
		case "updateAction":
			// Commit the updates into the action
			var speechArray = this.speechEditTextbox.textVal.split('|');
		
			// Update the action
			this.myAction.speechItem.setItem(this.speechItemButton.selectedItem);
			this.myAction.setSpeechArray(speechArray);
		
			// Update the appearance
			this.setSpeechArray(speechArray);
			break;
		}
	}		

    SpeechActionEditor.superClass.doAction.call(this, src, evt);
}

SpeechActionEditor.prototype.setSpeechArray = function(speechArray)
{
    var speech = speechArray.join("|");
	this.speechEditTextbox.setValue(speech);
}
