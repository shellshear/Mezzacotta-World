
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

