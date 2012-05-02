// Speech action requires an item and the speech text
function SpeechActionSummary(controller, action, colour1, colour2)
{
    SpeechActionSummary.baseConstructor.call(this, controller, action, colour1, colour2);

	// Create presentation contents
    var presentationContents = new FlowLayout(0, 0, {minSpacing:3});

    var currIcon = new SVGElement();
    currIcon.cloneElement(this.controller.artwork.getElementById("iconActionSpeech"));
    var actionButton = new RectLabel(0, 0, currIcon, {fill:colour1, stroke:"none", rx:2, width:30, height:30}, 2);
    presentationContents.appendChild(actionButton);

    this.itemPresentationLabel = new SummaryItemDisplay(this.controller, {fill:"white", stroke:"none", rx:2, width:30, height:30}, 2);
	presentationContents.appendChild(this.itemPresentationLabel);

    this.speechPresentationElement = new SVGElement("text", {"font-size":12, fill:"black", x:5, y:14}, null);
    presentationContents.appendChild(this.speechPresentationElement);
	
	this.presentationLayout.prependChild(presentationContents);

    this.initFromAction();
}

KevLinDev.extend(SpeechActionSummary, ActionSummary);

SpeechActionSummary.prototype.initFromAction = function()
{
	this.itemPresentationLabel.setSelectedItem(this.myAction.speechItem.item);
	this.setSpeechArray(this.myAction.speechArray);
	
	SpeechActionSummary.superClass.initFromAction.call(this);    
}

SpeechActionSummary.prototype.setSpeechArray = function(speechArray)
{
    var speech = speechArray.join("|");

	// Presentation requires summary
    if (speech.length > 20)
        speech = speech.substr(0, 17) + "...";
	this.speechPresentationElement.setValue(speech);
	this.presentationLayout.refreshLayout();
}
