// Contents of a perspective grid. Handles opacity issues (e.g. if the user
// can't see an item because there's another "in front", this will reduce the opacity
// of the in-front item).
function PerspectiveGridContents(model, x, y, ambientLight)
{
    PerspectiveGridContents.baseConstructor.call(this, model, x, y, ambientLight);
}

KevLinDev.extend(PerspectiveGridContents, LitGridContents);

// Ensure this grid cellContents at the specified height is visible
// by making the cellContents "in front" of it from the perspective of the user
// semi-opaque
PerspectiveGridContents.prototype.setVisibleToUser = function(elevation)
{
    for (var i = 1; i < 3; i++)
    {
        var cellContents = this.model.getContents(this.x - i, this.y + i);
		if (cellContents.tempParams.neverInWay)
			continue;
			
        var topData = cellContents;
        while (topData.myItems.length > 0)
        {
            topData = topData.myItems[0];
            if (topData.params.elev + topData.params.ht > 30 * (i - 1) + elevation)
            {
                // This item is in the way!
				var itemOpacity = 0;
				if (this.model.getContents(this.x - i - 1, this.y + i + 1).tempParams.avatarSees)
                	itemOpacity = 0.8;
            	
				topData.setInTheWay(itemOpacity);
            }
        }
    }
}

