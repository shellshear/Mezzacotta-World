function MyConditionFactory(model, controller, clock)
{
    this.model = model;
    this.controller = controller;
    this.turnClock = clock;
}

MyConditionFactory.prototype.fromXML = function(xml)
{
    var result = null;
    
    switch (xml.getAttribute("type"))
    {
    case 'Timestamp':
        result = new TimestampCondition(this.model, this.controller, this.turnClock, 0);
        break;

    case 'Weight':
        result = new WeightCondition(this.model, this.controller, null, 0);
        break;

    case 'HasItem':
        result = new HasItemCondition(this.model, this.controller, null, false, null);
        break;

    default:
        break;
    }

    if (result == null)
        return null;

	result.fromXML(xml);

    return result;
}

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

function TimestampCondition(model, controller, turnClock, timestamp)
{    
    this.turnClock = turnClock;
    this.timestamp = timestamp;
    TimestampCondition.baseConstructor.call(this, model, controller);
    this.type = "Timestamp";
}

KevLinDev.extend(TimestampCondition, GameCondition);

TimestampCondition.prototype.isMet = function()
{
    return (this.turnClock.currentTime == this.timestamp);
}

TimestampCondition.prototype.setTimestamp = function(timestamp)
{
	this.timestamp = timestamp;
	this.tellActionListeners(this, {type:"conditionUpdated"});
}

TimestampCondition.prototype.toXML = function()
{
    var result = TimestampCondition.superClass.toXML.call(this);      
    result.setAttribute("timestamp", this.timestamp);
    return result;
}

TimestampCondition.prototype.fromXML = function(xml)
{
    TimestampCondition.superClass.fromXML.call(this, xml);      
	this.setTimestamp(parseInt(xml.getAttribute('timestamp')));
}

function WeightCondition(model, controller, item, minWeight)
{
    WeightCondition.baseConstructor.call(this, model, controller);
    this.type = "Weight";

    this.weightItem = new ACItemHandler(this.model, item, this.type);
	this.weightItem.addActionListener(this);
	
    this.setMinWeight(minWeight);
}

KevLinDev.extend(WeightCondition, GameCondition);

WeightCondition.prototype.isMet = function()
{
	if (this.weightItem.item == null)
		return false;
		
    // Get the weight of items on top of this item
    var items = this.weightItem.item.getFlattenedTree();
    var weight = 0;
    for (var i in items)
    {
        if (items[i] != this.item && items[i].params.wt != null)
        {
            weight += items[i].params.wt;
        }
    }
    return (weight >= this.minWeight);
}

WeightCondition.prototype.setMinWeight = function(minWeight)
{
	this.minWeight = minWeight;
	this.tellActionListeners(this, {type:"conditionUpdated"});
}

WeightCondition.prototype.toXML = function()
{
    var result = WeightCondition.superClass.toXML.call(this);      
    result.setAttribute("minWt", this.minWeight);
	this.weightItem.addToXML(result);

    return result;
}

WeightCondition.prototype.fromXML = function(xml)
{
    WeightCondition.superClass.fromXML.call(this, xml);    
  
    this.weightItem.fromXML(xml);
	this.setMinWeight(parseInt(xml.getAttribute('minWt')));
}


// True if the container has the itemId or itemCode as a descendant
function HasItemCondition(model, controller, heldItem, isItemByType, container)
{
    HasItemCondition.baseConstructor.call(this, model, controller);
    this.type = "HasItem";

    this.heldItem = new ACItemHandler(this.model, heldItem, "held");
	this.heldItem.setItemByType(isItemByType);
	this.heldItem.addActionListener(this);
	
    this.containerItem = new ACItemHandler(this.model, container, "container");
	this.containerItem.addActionListener(this);
}

KevLinDev.extend(HasItemCondition, GameCondition);

HasItemCondition.prototype.isMet = function()
{
    if (this.containerItem.item == null)
        return false;
    
    var tree = this.containerItem.item.getFlattenedTree();
    for (var i in tree)
    {
        if (this.heldItem.matchesItem(tree[i]))
            return true;
    }
    
    return false;
}

HasItemCondition.prototype.toXML = function()
{
    var result = HasItemCondition.superClass.toXML.call(this);   

    this.heldItem.addToXML(result);
	this.heldItem.addActionListener(this);

    this.containerItem.addToXML(result);
	this.containerItem.addActionListener(this);

    return result;
}

HasItemCondition.prototype.fromXML = function(xml)
{
    HasItemCondition.superClass.fromXML.call(this, xml);    
  
    this.heldItem.fromXML(xml);
	this.containerItem.fromXML(xml);
}

