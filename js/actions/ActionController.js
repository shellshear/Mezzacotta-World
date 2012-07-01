function ActionController(model, parentController, turnClock)
{
    ActionController.baseConstructor.call(this);

    this.model = model;
    this.parentController = parentController;
    this.turnClock = turnClock;
    
    // Actions and conditions
    this.actionFactory = new MyActionFactory(this.model, this);
    this.conditionFactory = new MyConditionFactory(this.model, this, this.turnClock);
    
    // List of actions that can happen to items under specified conditions.
    // These actions are carried out in order.
    this.itemActionList = [];

    // Keep a list of conditions by id.    
    // Not all items have ids.
    // Conditions need ids so actions and other conditions can refer 
    // to them for serialisation purposes.
    this.conditionIdIndex = 0;
    this.condIdList = {};
    
    // Some items speak. We keep track of these here.
    this.speakingItems = [];
}

KevLinDev.extend(ActionController, ActionObject);

ActionController.prototype.clear = function()
{
	for (var i = 0; i < this.itemActionList.length; ++i)
	{
		this.itemActionList[i].onDelete();
	}
	this.itemActionList = [];

	for (var i in this.condIdList)
	{
		this.condIdList[i].onDelete();
	}
	this.conditionIdIndex = 0;
	this.condIdList = {};
	this.clearSpeakingItems();
	this.tellActionListeners(this, {type:"allActionsAndConditionsDeleted"});
}

ActionController.prototype.clearSpeakingItems = function()
{
    for (var i = 0; i < this.speakingItems.length; ++i)
    {
        this.speakingItems[i].setItemParam('speech', null, false);
    }
    this.speakingItems = [];
}

ActionController.prototype.setItemSpeech = function(item, text)
{
    item.setItemParam('speech', text, false);
    this.speakingItems.push(item);
}

ActionController.prototype.teleportTo = function(destination)
{
    this.parentController.gameServerInterface.submitLoadMap(destination);
}

// Export the actions and conditions into the specified parent XML
ActionController.prototype.toXML = function(parentXML)
{
    // Export conditions
    for (var i in this.condIdList)
    {
		var conditionUsed = false;
		for (var j = 0; j < this.itemActionList.length; ++j)
		{
			for (var k = 0; k < this.itemActionList[j].conditions.length; ++k)
			{
				if (this.itemActionList[j].conditions[k] == this.condIdList[i])
				{
					conditionUsed = true;
					break;
				}
			}
			
			if (conditionUsed)
				break;
		}
		
		if (conditionUsed)
		{
        	var condXML = this.condIdList[i].toXML();
        	parentXML.appendChild(condXML);
		}
    }
            
    // Export actions
    for (var i = 0; i < this.itemActionList.length; ++i)
    {
        var actionXML = this.itemActionList[i].toXML();
        parentXML.appendChild(actionXML);
    }
}

ActionController.prototype.fromXML = function(xml)
{
    if (xml == null)
        return;
        
    // Import conditions
    var xmlCondList = xml.getElementsByTagName("cond");
    for (var i = 0; i < xmlCondList.length; i++)
    {
        var cond = this.conditionFactory.fromXML(xmlCondList.item(i));
        this.importCondition(cond); // register the condition in the condition list
    }
    
    // Import actions
    var xmlActionList = xml.getElementsByTagName("action");
    for (var i = 0; i < xmlActionList.length; i++)
    {
        var action = this.actionFactory.fromXML(xmlActionList.item(i));
        this.appendAction(action);
    }
}

ActionController.prototype.registerCondition = function(condition)
{
    if (condition.id == null)
        condition.id = "c_" + this.conditionIdIndex++;
    
    this.condIdList[condition.id] = condition;
}

ActionController.prototype.importCondition = function(condition)
{
    // We only care about conditions with ids.
    if (condition.id == null)
        return;
        
    // As per importItemId
    var idIndex = parseInt(condition.id.slice(2)); // remove the prefix "c_"
    if (idIndex >= this.conditionIdIndex)
        this.conditionIdIndex = idIndex + 1;

    this.condIdList[condition.id] = condition;
}

ActionController.prototype.getConditionById = function(conditionId)
{
    return this.condIdList[conditionId];
}

ActionController.prototype.appendAction = function(action)
{
    action.controller = this;
    this.itemActionList.push(action);
	this.tellActionListeners(action, {type:"ActionAdded"});
}

ActionController.prototype.removeAction = function(action)
{
	// Remove the action
    for (var i = 0; i < this.itemActionList.length; ++i)
    {
     	if (this.itemActionList[i] == action)
     	{
			action.onDelete();
			action.tellActionListeners(this, {type:"actionDeleted"});
     	    action.controller = null;
         	this.itemActionList.splice(i, 1);
         	break;
     	}
    }

	// remove all conditions that refer only to this action
	for (var i = 0; i < action.conditions.length; ++i)
	{
		var isUsed = false;
		for (var j = 0; j < this.itemActionList.length; ++j)
		{
			for (var k = 0; k < this.itemActionList[j].conditions.length; ++k)
			{
				if (this.itemActionList[j].conditions[k] == action.conditions[i])
				{
					isUsed = true;
					break;
				}
			}
		}
		
		if (!isUsed)
			this.removeCondition(action.conditions[i]);
	}
}

ActionController.prototype.removeCondition = function(condition)
{
	for (var j = 0; j < this.itemActionList.length; ++j)
	{
		for (var k = 0; k < this.itemActionList[j].conditions.length; ++k)
		{
			var currCondition = this.itemActionList[j].conditions[k];
			if (currCondition == condition)
			{
				condition.tellActionListeners(this, {type:"conditionDeleted"});
	         	this.itemActionList[j].conditions.splice(k, 1);
				break;
			}
		}
	}
}

// Go through all the actions in order and attempt to execute them.
ActionController.prototype.attemptActions = function()
{
    for (var i = 0; i < this.itemActionList.length; ++i)
    {
        var result = this.itemActionList[i].attemptAction();
        if (!result)
            return;
    }
}
