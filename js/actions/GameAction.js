function MyActionFactory(model, controller)
{
    this.model = model;
    this.controller = controller;
}

MyActionFactory.prototype.fromXML = function(xml)
{
    var result = null;
    
    switch (xml.getAttribute("type"))
    {
    case 'Speech':
        result = new SpeechAction(this.model, this.controller, null, null);
        break;

    case 'Height':
        result = new HeightAction(this.model, this.controller, null, 0);
        break;

    case 'Teleport':
        result = new TeleportAction(this.model, this.controller, 0);
        break;

    default:
        break;
    }
    
    if (result == null)
        return null;

	result.fromXML(xml);

    return result;
}

function GameAction(model, controller)
{
    GameAction.baseConstructor.call(this);
	
    this.type = "Default";
    this.model = model; 
    this.occuranceCount = 0;
    this.conditions = [];
    this.controller = controller; 
}

// Note: The "Action" in ActionObject actually has nothing to do with item actions.
KevLinDev.extend(GameAction, ActionObject);

GameAction.prototype.addCondition = function(condition)
{
    this.conditions.push(condition);
	this.tellActionListeners(this, {type:"actionUpdated"});
}

GameAction.prototype.attemptAction = function()
{
    var result = true;

    // Ensure all our conditions are met
    for (var i = 0; i < this.conditions.length; ++i)
    {
        if (!this.conditions[i].isMet())
        {
            result = false;
            break;
        }
    }
    
    if (result)
        this.occuranceCount++;
            
    return this.performAction(result);
}

// Default
GameAction.prototype.performAction = function(areConditionsMet)
{
    return true; // Return false to stop further actions.
}

// Clean up the action on delete.
// Default
GameAction.prototype.onDelete = function()
{
}

GameAction.prototype.toXML = function()
{
    var xmlAction = this.model.xmlDoc.createElement("action");

	xmlAction.setAttribute("type", this.type);
    
    for (var i = 0; i < this.conditions.length; ++i)
    {
        var xmlCondRef = this.model.xmlDoc.createElement("condRef");
        xmlCondRef.setAttribute("condId", this.conditions[i].id);
        xmlAction.appendChild(xmlCondRef);
    }
    
    return xmlAction;
}

GameAction.prototype.fromXML = function(xml)
{
    // Update all the conditions references attached to this action as well
    if (this.controller == null)
        alert("Oops! Trying to get item action from XML, but item action doesn't have a controller.");
        
    for (var i = 0; i < xml.childNodes.length; i++)
    {
        var xmlConditionRef = xml.childNodes.item(i);
        var cond = this.controller.getConditionById(
            xmlConditionRef.getAttribute("condId"));
        if (cond != null)
            this.conditions.push(cond);        
    }
}

GameAction.prototype.doAction = function(src, evt)
{
	if (evt.type == "itemUpdated")
	{
		// An ACItemHandler has let us know it's been updated, so pass on the update request.
		this.tellActionListeners(this, {type:"actionUpdated"});
	}		
}

function SpeechAction(model, controller, item, speechArray)
{
	this.setSpeechArray(speechArray);
	
    this.currentIndex = 0;
    SpeechAction.baseConstructor.call(this, model, controller);
    this.type = "Speech";

    this.speechItem = new ACItemHandler(this.model, item, this.type);
	this.speechItem.addActionListener(this);
}

KevLinDev.extend(SpeechAction, GameAction);

SpeechAction.prototype.setSpeechArray = function(speechArray)
{
    this.speechArray = speechArray;
	if (this.speechArray == null)
		this.speechArray = [];
	this.tellActionListeners(this, {type:"actionUpdated"});
}

SpeechAction.prototype.performAction = function(areConditionsMet)
{
	if (this.speechItem.item == null)
		return;
		
    var text = null;
    if (areConditionsMet && this.currentIndex < this.speechArray.length)
    {
        text = this.speechArray[this.currentIndex];
        this.currentIndex++;
        this.controller.setItemSpeech(this.speechItem.item, text);
    }

    return true; 
}

SpeechAction.prototype.toXML = function()
{
    var result = SpeechAction.superClass.toXML.call(this);      
    result.setAttribute("speech", htmlspecialchars(this.speechArray.join("|")));
	this.speechItem.addToXML(result);
    return result;
}

SpeechAction.prototype.fromXML = function(xml)
{
    SpeechAction.superClass.fromXML.call(this, xml);      

	this.speechItem.fromXML(xml);
    var speechText = htmlspecialchars_decode(xml.getAttribute('speech'));
    this.setSpeechArray(speechText.split('|'));
}

SpeechAction.prototype.onDelete = function()
{
	this.speechItem.onDelete();
	this.speechItem.removeActionListener(this);
}

function HeightAction(model, controller, item, newHeight)
{
    this.setHeight(newHeight);
    
    SpeechAction.baseConstructor.call(this, model, controller);
    this.type = "Height";

    this.heightItem = new ACItemHandler(this.model, item, this.type);
	this.heightItem.addActionListener(this);
}

KevLinDev.extend(HeightAction, GameAction);

HeightAction.prototype.doAction = function(src, evt)
{
	if (evt.type == "itemUpdated")
	{
		// The item has been updated, so it needs an oldHeight for
		// when the height changes, so we can change it back later.
		if (src.item != null)
		{
			this.oldHeight = src.item.params.ht;
		}
	}		
    HeightAction.superClass.doAction.call(this, src, evt);
}

HeightAction.prototype.setHeight = function(height)
{
	this.newHeight = height;
	this.tellActionListeners(this, {type:"actionUpdated"});
}

HeightAction.prototype.performAction = function(areConditionsMet)
{
	if (this.heightItem.item == null)
		return;
		
    if (areConditionsMet)
    {
        if (this.heightItem.item.params.ht != this.newHeight)
        {
            this.oldHeight = this.heightItem.item.params.ht;
            this.heightItem.item.setHeight(this.newHeight, false);
        }
    }
    else
    {
        if (this.heightItem.item.params.ht != this.oldHeight)
        {
            this.heightItem.item.setHeight(this.oldHeight, false);
        }
    }
    return true;
}

HeightAction.prototype.toXML = function()
{
    var result = HeightAction.superClass.toXML.call(this);      
    result.setAttribute("ht", this.newHeight);
	this.heightItem.addToXML(result);
    return result;
}

HeightAction.prototype.fromXML = function(xml)
{
    HeightAction.superClass.fromXML.call(this, xml);

	this.heightItem.fromXML(xml);
    
	var ht = parseInt(xml.getAttribute("ht"));
	this.setHeight(ht);
}

HeightAction.prototype.onDelete = function()
{
	this.heightItem.onDelete();
	this.heightItem.removeActionListener(this);
}

function TeleportAction(model, controller, destination)
{
    this.setDestination(destination);
    TeleportAction.baseConstructor.call(this, model, controller);
    this.type = "Teleport";
}

KevLinDev.extend(TeleportAction, GameAction);

TeleportAction.prototype.setDestination = function(destination)
{
	this.destination = destination;
	this.tellActionListeners(this, {type:"actionUpdated"});
}

TeleportAction.prototype.performAction = function(areConditionsMet)
{
    if (areConditionsMet && this.controller.turnClock.currentTime != 0)
    {
        // We don't allow teleport at time 0 - this stops shennanigans with
        // multiple teleports.
        this.controller.parentController.gameServerInterface.submitSaveItemsAndTeleport(this.destination);
        return false; // Stop further actions
    }
    return true;
}

TeleportAction.prototype.toXML = function()
{
    var result = TeleportAction.superClass.toXML.call(this);      
    result.setAttribute("dest", this.destination);
    return result;
}

TeleportAction.prototype.fromXML = function(xml)
{
    TeleportAction.superClass.fromXML.call(this, xml);
    
	var dest = parseInt(xml.getAttribute("dest"));
	this.setDestination(dest);
}

// Move the specified item to the specified destination.
// Destination is an ItemContainer, so could be an item or grid contents.
function MoveAction(model, controller, targetItem, destItem)
{
    MoveAction.baseConstructor.call(this, model, controller);
    this.type = "Move";

    this.targetItem = new ACItemHandler(this.model, targetItem, "src");
	this.targetItem.addActionListener(this);

    this.destItem = new ACItemHandler(this.model, destItem, "dest");
	this.destItem.addActionListener(this);
}

KevLinDev.extend(MoveAction, GameAction);

MoveAction.prototype.performAction = function(areConditionsMet)
{
    if (areConditionsMet)
    {
        if (this.targetItem.item != null)
        {
            if (this.destItem.item != null)
            {
                this.targetItem.item.moveItem(this.destItem.item);
            }
            else
            {
                // Delete the item
                // TODO
            }
        }
    }
    return true;
}

MoveAction.prototype.toXML = function()
{
    var result = MoveAction.superClass.toXML.call(this);
    this.targetItem.addToXML(result);
	this.destItem.addToXML(result);
    return result;
}

MoveAction.prototype.fromXML = function(xml)
{
    MoveAction.superClass.fromXML.call(this, xml);
    this.targetItem.fromXML(xml);
	this.destItem.fromXML(xml);
}

MoveAction.prototype.onDelete = function()
{
	this.targetItem.onDelete();
	this.destItem.onDelete();
	this.targetItem.removeActionListener(this);
	this.destItem.removeActionListener(this);
}


