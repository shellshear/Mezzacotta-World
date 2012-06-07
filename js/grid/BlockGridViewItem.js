// A block view item.
// Handles the top and two visible vertical elements.
function BlockGridViewItem(modelItem, viewItemFactory, elements)
{
    BlockGridViewItem.baseConstructor.call
       (this, modelItem, viewItemFactory, elements);   
}

KevLinDev.extend(BlockGridViewItem, PerspectiveGridViewItem);

// Update our height when we get added to the view. At this point,
// we can find the heights of any adjacent contents.
BlockGridViewItem.prototype.onBeingAdded = function()
{    
    this.updateHeight();
}

BlockGridViewItem.prototype.updateHeight = function()
{
    var y = -this.modelItem.params.elev - this.modelItem.params.ht;
    this.rootContainer.svg_mouseover.setPosition(0, y);

    var translateHeight = -this.modelItem.params.ht;
    this.setPosition(0, translateHeight); 

    var contents = this.modelItem.contents;

    var leftContents = contents.model.getContents(contents.x - 1, contents.y);
    var topLeftItem = getTopBlockItem(leftContents);
    
    var leftHeight = this.modelItem.params.ht;
    if (topLeftItem != null)
    {
        leftHeight = this.modelItem.params.ht + this.modelItem.params.elev - topLeftItem.params.elev - topLeftItem.params.ht;
        if (leftHeight > this.modelItem.params.ht)
            leftHeight = this.modelItem.params.ht;
    }
    
    if (leftHeight > 0)
    {
        var path = this.viewItemFactory.getVerticalPath(leftHeight, 0);
        this.elements["left"].base.setAttribute("d", path);
        this.elements["left"].shadow.setAttribute("d", path);
        this.elements["left"].show();
    }
    else
    {
        this.elements["left"].base.removeAttribute("d");
        this.elements["left"].shadow.removeAttribute("d");
        this.elements["left"].hide();
    }

    var frontContents = contents.model.getContents(contents.x, contents.y + 1);
    var topFrontItem = getTopBlockItem(frontContents);
    
    var frontHeight = this.modelItem.params.ht;
    if (topFrontItem != null)
    {
        frontHeight = this.modelItem.params.ht + this.modelItem.params.elev - topFrontItem.params.elev - topFrontItem.params.ht;
        if (frontHeight > this.modelItem.params.ht)
            frontHeight = this.modelItem.params.ht;
    }

    if (frontHeight > 0)
    {            
        var path = this.viewItemFactory.getVerticalPath(frontHeight, 1);
        this.elements["front"].base.setAttribute("d", path);
        this.elements["front"].shadow.setAttribute("d", path);
        this.elements["front"].show();
    }
    else
    {
        this.elements["front"].base.removeAttribute("d");
        this.elements["front"].shadow.removeAttribute("d");
        this.elements["front"].hide();
    }
}

BlockGridViewItem.prototype.updateItemHeightsAtContents = function(view, x, y)
{
    if (view.view[x] != null)
    {
        var viewContents = this.rootContainer.view.view[x][y];
        if (viewContents != null)
        {
            viewContents.tellActionListeners(viewContents, {type:"otherItemHeight"});
        }
    }
}

BlockGridViewItem.prototype.doAction = function(src, evt)
{
    BlockGridViewItem.superClass.doAction.call(this, src, evt);   

    if (evt.type == "paramChanged" && evt.name == "ht")
    {
        this.updateHeight();
        
        // Also need to update all the items behind and to the right
        // because some wall heights might need to change
        if (this.rootContainer.view != null)
        {
            var x = this.rootContainer.x_index;
            var y = this.rootContainer.y_index;
            this.updateItemHeightsAtContents(this.rootContainer.view, x + 1, y);
            this.updateItemHeightsAtContents(this.rootContainer.view, x, y - 1);
        }
    }
    else if (evt.type == "otherItemHeight")
    {
        // The height of another item changed, so we might have to change 
        // our wall heights
        this.updateHeight();
    }
    else if (evt.type == "InTheWay")
    {
        this.setAttribute("opacity", evt.opacity);
    }
    else if (evt.type == "paramChanged")
    {
		if (evt.name == "isHighlighted")
		{
			this.setHighlight(evt.value);
		}
	}
}

BlockGridViewItem.prototype.setHighlight = function(doHighlight)
{
	if (this.elements["highlight"] == null)
		return;
	
	if (doHighlight)	
		this.elements["highlight"].show();
	else
		this.elements["highlight"].hide();		
}

BlockGridViewItem.prototype.updateView = function(povList)
{
    var contents = this.modelItem.contents;
    if (contents == null)
        return;

    if (povList == null)
    {
        this.elements["top"].setVisible(true);
        this.elements["left"].setVisible(true);
        this.elements["front"].setVisible(true);
    }
    else if (this.itemGraphics != null)
    {
        var modelElev = this.modelItem.params.elev + this.modelItem.params.ht;

        var povTop = false;
        var povBottom = false;
        var povLeft = false;
        var povRight = false;
        var povFront = false;
        var povBack = false;
        for (var j in contents.seenBy)
        {
            if (contents.seenBy[j].viewType == "pov")
            {
                // Check whether this pov is one in the list
                for (var k in povList)
                {
                    if (povList[k] == contents.seenBy[j].item)
                    {
                        if (contents.seenBy[j].viewElev <= this.modelItem.params.elev)
                        {
                            // Pov can see base of item
                            povBottom = true;
                        }                            

                        var srcElev = contents.seenBy[j].item.params.elev + contents.seenBy[j].item.params.ht;

                        if (contents.seenBy[j].viewElev <= modelElev) 
                        {
                            if (srcElev >= modelElev) 
                                povTop = true;

                            if (contents.seenBy[j].x < contents.x)
                            {
                                povLeft = true;
                            }
                            
                            if (contents.seenBy[j].y > contents.y)
                            {
                                povFront = true;
                            }
                        }
                        
                        // Found the povList item we were looking for
                        break;
                    }
                }
            }
        }
        
        if (!povLeft)
        {
            // Can't see the left side, but perhaps we can see the contents
            // to the left, in which case let's say we can see it anyway.
            var leftContents = contents.model.getContents(contents.x - 1, contents.y);
            for (var j in leftContents.seenBy)
            {
                if (leftContents.seenBy[j].viewType == "pov")
                {
                    // Check whether this pov is one in the list
                    for (var k in povList)
                    {
                        if (povList[k] == leftContents.seenBy[j].item)
                        {
                            if (leftContents.seenBy[j].viewElev <= modelElev)
                            {
                                // NOTE: we still have to be standing to the
                                // left of the item to see its left side
                                if (leftContents.seenBy[j].x < contents.x)
                                {
                                    povLeft = true;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        if (!povFront)
        {
            // Can't see the front side, but perhaps we can see the contents
            // to the front, in which case let's say we can see it anyway.
            var frontContents = contents.model.getContents(contents.x, contents.y + 1);
            for (var j in frontContents.seenBy)
            {
                if (frontContents.seenBy[j].viewType == "pov")
                {
                    // Check whether this pov is one in the list
                    for (var k in povList)
                    {
                        if (povList[k] == frontContents.seenBy[j].item)
                        {
                            if (frontContents.seenBy[j].viewElev <= modelElev)
                            {
                                // NOTE: we still have to be standing to the
                                // front of the item to see its front side
                                if (frontContents.seenBy[j].y > contents.y)
                                {
                                    povFront = true;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        this.elements["top"].setVisible(povTop);
        this.elements["left"].setVisible(povLeft);
        this.elements["front"].setVisible(povFront);
    }
    
    for (var i in this.containedItems.childNodes)
    {
        this.containedItems.childNodes[i].updateView(povList);
    }
}

