// This is an item with a left, front, and top that are viewable in a 
// perspective scene.
function PerspectiveGridViewItem(modelItem, viewItemFactory, elements)
{
    this.elements = elements;

    PerspectiveGridViewItem.baseConstructor.call
       (this, modelItem, viewItemFactory, this.elements["bottom"]);   

    this.appendItemContents(this.elements["top"]);
    this.appendItemContents(this.elements["left"]);
    this.appendItemContents(this.elements["front"]);
	
	if (this.elements["highlight"])
	{	
		this.elements["highlight"].hide();
    	this.appendItemContents(this.elements["highlight"]);
	}
}

KevLinDev.extend(PerspectiveGridViewItem, LitGridViewItem);

PerspectiveGridViewItem.prototype.setLighting = function()
{
    PerspectiveGridViewItem.superClass.setLighting.call(this);   

    // The light on these cellContents has changed, so we need to 
    // update the shadows on the verticals for this and adjacent
    // cellContents.
    var cellContents = this.modelItem.cellContents;
    if (cellContents == null)
        return;
        
    for (var i in this.elements)
    {
        if (this.elements[i] == null || i == "bottom" || i == "highlight")
            continue;
            
        // See what light sources affect this vertical
        var lightLevel = cellContents.ambientLight;
        
        for (var j in cellContents.seenBy)
        {
			var p = cellContents.seenBy[j].item.params;
			
            if (p.lightStrength == null || p.lightStrength == 0)
                continue;
           
            // It's unlit unless the light reaching it is low enough
            if (cellContents.seenBy[j].viewElev > this.modelItem.params.elev + this.modelItem.params.ht)
                continue;

            if (i == "top")
            {
				// Don't light the top of this item with the light source if the light source is below it
                if (p.elev + p.ht < this.modelItem.params.elev + this.modelItem.params.ht)
                    continue;
                
				// The top of the item must be higher than the lowest height of light on this cellContents
                //if (cellContents.seenBy[j].viewElev <= this.modelItem.params.elev + this.modelItem.params.ht)
                //{
                    var sourceLevel = cellContents.model.calcLightLevel(cellContents.seenBy[j].distance, p.lightStrength);
                    if (sourceLevel > lightLevel)
                        lightLevel = sourceLevel;
                //}
            }
            else
            {
                // Distance 0 means the current square
                // which doesn't contribute to the light on the
                // verticals
                if (cellContents.seenBy[j].distance == 0)
                    continue;
            
                // For the verticals, we need to calculate the distances again
                var dist = 0;
                if (i == "left")
                {
                    // This side is unlit unless its x value is less
                    if (cellContents.seenBy[j].x >= cellContents.x)
                        continue;
                        
                    dist = cellContents.model.getDistance(cellContents.seenBy[j].x, cellContents.seenBy[j].y, cellContents.x - 1, cellContents.y);            
                }
                else if (i == "front")
                {
                    // This side is unlit unless its y value is greater
                    if (cellContents.seenBy[j].y <= cellContents.y)
                        continue;
                    dist = cellContents.model.getDistance(cellContents.seenBy[j].x, cellContents.seenBy[j].y, cellContents.x, cellContents.y + 1);
                }
                
                var sourceLevel = cellContents.model.calcLightLevel(dist, cellContents.seenBy[j].item.params.lightStrength);
                if (sourceLevel > lightLevel)
                {
                    lightLevel = sourceLevel;
                }
            }
        }
        this.elements[i].setShadow(1.0 - lightLevel);
    }
}

