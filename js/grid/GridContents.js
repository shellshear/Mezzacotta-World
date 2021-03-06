// The contents of a particular element in the grid
function GridContents(model, x, y)
{
    GridContents.baseConstructor.call(this);
    this.src = "GridContents";

    this.model = model;
    this.x = x;
    this.y = y;

    this.seenBy = []; // List of [item, elevation, distance] that can see this contents
	this.tempParams = {};
}

KevLinDev.extend(GridContents, ItemContainer);

GridContents.prototype.clear = function()
{
	this.tempParams = {};
    this.removeAllItems();
}

GridContents.prototype.toString = function()
{
    var result = "";
    var isFirst = true;
    for (var i = 0; i < this.myItems.length; ++i)
    {
        if (this.myItems[i] != null)
        {
            if (!isFirst)
                result += ";";
            else
                isFirst = false;
                   
            result += this.myItems[i].toString();
        }
    }
   
    if (result.length == 0)
        return null;
       
    return result;
}

GridContents.prototype.getLocationString = function()
{
	return this.x + "," + this.y;
}

// String is of the form a;b;c;...
// The item contents get parsed into this.myItems
GridContents.prototype.fromString = function(str)
{
    this.myItems = [];
    if (str != null)
    {
        var itemCodes = str.split(";");
        for (var i in itemCodes)
        {
            var currItem = this.model.itemFactory.makeItem(itemCodes[i]);
            this.appendItem(currItem);
        }
    }
}

GridContents.prototype.toXML = function(xmlDoc, showAll)
{
    // Only add a contents if there's actually something in it.
    if (this.myItems.length == 0)
        return null;
    
    var xmlContents = xmlDoc.createElement("c");
    xmlContents.setAttribute("x", this.x);
    xmlContents.setAttribute("y", this.y);
    
    for (var i = 0; i < this.myItems.length; ++i)
    {
        var xmlItem = this.myItems[i].toXML(xmlDoc, showAll);
        if (xmlItem != null)
            xmlContents.appendChild(xmlItem);
    }

    if (showAll)
    {
        for (var i = 0; i < this.seenBy.length; ++i)
        {
            var xmlSeen = xmlDoc.createElement("seen");
            xmlSeen.setAttribute("item", this.seenBy[i].item);
            xmlSeen.setAttribute("elev", this.seenBy[i].viewElev);
            xmlSeen.setAttribute("dist", this.seenBy[i].distance);
            xmlSeen.setAttribute("x", this.seenBy[i].x);
            xmlSeen.setAttribute("y", this.seenBy[i].y);
            xmlSeen.setAttribute("type", this.seenBy[i].viewType);
            xmlContents.appendChild(xmlSeen);
        }
    }
    return xmlContents;
}

GridContents.prototype.fromXML = function(xml)
{
    for (var i = 0; i < xml.childNodes.length; i++)
    {
        var xmlItem = xml.childNodes.item(i);        
		var currItem = this.model.itemFactory.makeItemFromXML(xmlItem, this.model);
        this.appendItem(currItem);
    }
}

GridContents.prototype.addSeenBy = function(item, viewElev, distance, x, y, viewType)
{
    this.seenBy.push({
         item:item, 
         viewElev:viewElev, 
         distance:distance,
         x:x,
         y:y,
         viewType:viewType
         });
}

GridContents.prototype.removeSeenBy = function(item)
{
    for (var i = 0; i < this.seenBy.length; ++i)
    {
        if (this.seenBy[i].item == item)
        {
            this.seenBy.splice(i, 1);
            return;
        }
    }
}

// Find the highest elevation of any item that blocks
GridContents.prototype.getBlockingHeight = function()
{
    var result = 0;
    for (var i = 0; i < this.myItems.length; ++i)
    {
        var currHt = this.myItems[i].getBlockingHeight();
        if (currHt > result)
            result = currHt;
    }
    return result;
}

// Bit of a hack, because this really only gets the first child at each
// layer
GridContents.prototype.getTopItem = function()
{
    var topData = this;
    while (topData.myItems.length > 0)
    {
        topData = topData.myItems[0];
    }
    return topData;
}

// Find the first item with the specified item code
GridContents.prototype.findItemByCode = function(itemCode)
{
    return this.find("itemCode", itemCode);
}

