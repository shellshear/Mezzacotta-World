
// True if the container has the itemId or itemCode as a descendant
function HasItemCondition(model, controller, heldItem, matchCriterion, container, itemTag)
{
    HasItemCondition.baseConstructor.call(this, model, controller);
    this.type = "HasItem";

    this.heldItem = new ACItemHandler(this.model, heldItem, "held");
	this.heldItem.setItemMatchCriterion(matchCriterion, itemTag);
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

HasItemCondition.prototype.onDelete = function()
{
	this.heldItem.onDelete();
	this.containerItem.onDelete();
}

