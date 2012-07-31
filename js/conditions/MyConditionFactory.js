// Factory for creating conditions

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

