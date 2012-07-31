// True if the nominated item is part of a group with the same tag, of size groupSize or greater
// To be part of a group, the items with itemTag must be in adjacent cells or 
// the same cell.
function TagGroupCondition(model, controller, seedItem, itemTag, minGroupSize)
{
    TagGroupCondition.baseConstructor.call(this, model, controller);
    this.type = "TagGroup";

    this.seedItem = new ACItemHandler(this.model, seedItem, "seedItem");
	this.seedItem.addActionListener(this);
	
	this.itemTag = itemTag;
	this.minGroupSize = minGroupSize;
}

KevLinDev.extend(TagGroupCondition, GameCondition);

// Return the tag count for this and adjacent cells, and update the cellList.
function countNearbyTags(currCell, itemTag, cellParams)
{
	// Ensure this cell hasn't already been counted
	if (cellParams.visitedCells[currCell.getLocationString()] != null)
		return cellParams;
		
	// Get the count for the current cell
    var tree = currCell.getFlattenedTree();
    for (var i = 0; i < tree.length; ++i)
    {
        if (tree[i].params != null && tree[i].params.itemTags.indexOf(itemTag) >= 0)
            cellParams.tagCount++;
    }

	// Set the current cell as being visited
	cellParams.visitedCells[currCell.getLocationString()] = 1;
	
	// Get the count for adjacent cells
	for (var i = 0; i < currCell.model.adjList.length; ++i)
	{
		var adjParams = currCell.model.adjList[i];
		cellParams = countNearbyTags(currCell.model.getContents(currCell.x + adjParams.x, currCell.y + adjParams.y), itemTag, cellParams);
	}
	
	return cellParams;
}

// Search for the tag
TagGroupCondition.prototype.isMet = function()
{
    if (this.seedItem.item == null)
        return false;
	
	// Check that the seed item actually has the tag
	if (this.seedItem.item.params.itemTags.indexOf(this.itemTag) < 0)
		return false;

	// Count the tags in adjacent cells
	var cellParams = {visitedCells:{}, tagCount:0};
	cellParams = countNearbyTags(this.seedItem.item.cellContents, this.itemTag, cellParams);
	if (cellParams.tagCount >= minGroupSize)
		return true;

    return false;
}

TagGroupCondition.prototype.toXML = function()
{
    var result = TagGroupCondition.superClass.toXML.call(this);   

    this.seedItem.addToXML(result);
	this.seedItem.addActionListener(this);

    result.setAttribute("itemTag", this.itemTag);
    result.setAttribute("minGroupSize", this.minGroupSize);

    return result;
}

TagGroupCondition.prototype.fromXML = function(xml)
{
    TagGroupCondition.superClass.fromXML.call(this, xml);    

    this.seedItem.fromXML(xml);

	this.itemTag = xml.getAttribute('itemTag');
	this.minGroupSize = parseInt(xml.getAttribute('minGroupSize'));
}

TagGroupCondition.prototype.onDelete = function()
{
	this.seedItem.onDelete();
}

