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

    // The light on these contents has changed, so we need to 
    // update the shadows on the verticals for this and adjacent
    // contents.
    var contents = this.modelItem.contents;
    if (contents == null)
        return;
        
    for (var i in this.elements)
    {
        if (this.elements[i] == null || i == "bottom" || i == "highlight")
            continue;
            
        // See what light sources affect this vertical
        var lightLevel = contents.ambientLight;
        
        for (var j in contents.seenBy)
        {
			var p = contents.seenBy[j].item.params;
			
            if (p.lightStrength == null || p.lightStrength == 0)
                continue;
           
            // It's unlit unless the light reaching it is low enough
            if (contents.seenBy[j].viewElev > this.modelItem.params.elev + this.modelItem.params.ht)
                continue;

            if (i == "top")
            {
				// Don't light the top of this item with the light source if the light source is below it
                if (p.elev + p.ht < this.modelItem.params.elev + this.modelItem.params.ht)
                    continue;
                
				// The top of the item must be higher than the lowest height of light on this contents
                //if (contents.seenBy[j].viewElev <= this.modelItem.params.elev + this.modelItem.params.ht)
                //{
                    var sourceLevel = contents.model.calcLightLevel(contents.seenBy[j].distance, p.lightStrength);
                    if (sourceLevel > lightLevel)
                        lightLevel = sourceLevel;
                //}
            }
            else
            {
                // Distance 0 means the current square
                // which doesn't contribute to the light on the
                // verticals
                if (contents.seenBy[j].distance == 0)
                    continue;
            
                // For the verticals, we need to calculate the distances again
                var dist = 0;
                if (i == "left")
                {
                    // This side is unlit unless its x value is less
                    if (contents.seenBy[j].x >= contents.x)
                        continue;
                        
                    dist = contents.model.getDistance(contents.seenBy[j].x, contents.seenBy[j].y, contents.x - 1, contents.y);            
                }
                else if (i == "front")
                {
                    // This side is unlit unless its y value is greater
                    if (contents.seenBy[j].y <= contents.y)
                        continue;
                    dist = contents.model.getDistance(contents.seenBy[j].x, contents.seenBy[j].y, contents.x, contents.y + 1);
                }
                
                var sourceLevel = contents.model.calcLightLevel(dist, contents.seenBy[j].item.params.lightStrength);
                if (sourceLevel > lightLevel)
                {
                    lightLevel = sourceLevel;
                }
            }
        }
        this.elements[i].setShadow(1.0 - lightLevel);
    }
}

