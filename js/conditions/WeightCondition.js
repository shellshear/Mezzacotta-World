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
        if (items[i] != this.weightItem.item && items[i].params.wt != null)
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

WeightCondition.prototype.onDelete = function()
{
	this.weightItem.onDelete();
}

