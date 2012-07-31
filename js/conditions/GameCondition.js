// Parent class for conditions.
function GameCondition(model, controller)
{
    GameCondition.baseConstructor.call(this);

    this.model = model;
    this.controller = controller;
    this.type = "Default";
}

KevLinDev.extend(GameCondition, ActionObject);

// Default
GameCondition.prototype.isMet = function()
{
    return false;
}

// Default
GameCondition.prototype.onDelete = function()
{
}

GameCondition.prototype.toXML = function()
{
    var xmlCond = this.model.xmlDoc.createElement("cond");
    xmlCond.setAttribute("id", this.id);
    xmlCond.setAttribute("type", this.type);
    
    return xmlCond;
}

GameCondition.prototype.fromXML = function(xml)
{
	this.id = xml.getAttribute("id");
	
	// Don't need to get type, as the factory determines which
	// subclass to create based on the type. So it's updated already.
}

GameCondition.prototype.doAction = function(src, evt)
{
	if (evt.type == "itemUpdated")
	{
		// An ACItemHandler has let us know it's been updated, so pass on the update request.
		this.tellActionListeners(this, {type:"conditionUpdated"});
	}		
}
