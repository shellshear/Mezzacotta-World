// Factory for creating rectangular perspective items
function PerspectiveItemFactory(ambientLight, x, y, itemTemplates, baseSummary)
{
    PerspectiveItemFactory.baseConstructor.call(this, ambientLight);

    // The base rect for the perspective model is
    //       0,-y
    //  -x,0  /\   x,0
    //        \/
    //       0,y
    //
    // The rectangles may also have visible sides, depending on the
    // height of adjacent squares.
    // 
	// There is a small delta-sized extra "bottom" on the rectangle, to get around
	// anti-aliasing issues
	this.delta = 0.5;
	this.slope = y / x;
    this.x = x;
    this.y = y;

    this.baseRectTemplate = "M -x,0 L 0,-y x,0 x,f 0,g -x,f -x,0 z";
    
    // The vertical templates for the perspective model are
    //               0,-y
    //          -x,0 /\ x,0
    //              |\/|0,y
    //          -x,d| ||x,d  
    //               \|/ 
    //               0,f
    // where d is the block height and f=d+y
    //
	// The points f, g, h, p, q, r are present to allow a tick-shaped delta-sized overlap of the two vertical panels,
	// to get around the anti-aliasing issues of drawing adjacent rectangles.
    this.verticalTemplate = ["M -x,0 0,y g,h g,j 0,f -x,d z", "M x,0 x,d 0,f p,q p,r 0,y z", "M -x,0 L-x,-d 0,-f 0,-y z", "M x,0 0,-y 0,-f x,-d z"];

    this.baseRect = this.baseRectTemplate.replace(/x/gi, x).replace(/y/gi, y).replace(/f/gi, this.delta).replace(/g/gi, this.delta + y);

    this.baseSummary = baseSummary;
    
    this.itemTemplates = itemTemplates;
}

KevLinDev.extend(PerspectiveItemFactory, LitContentFactory);

PerspectiveItemFactory.prototype.makeContents = function(model, x, y, baseHeight)
{
    return new PerspectiveGridContents(model, x, y, baseHeight, this.ambientLight);
}

// Construct the item given the xml.
// We also provide the model so that it can register moving items and items with ids.
PerspectiveItemFactory.prototype.makeItemFromXML = function(xml, model)
{
    var itemCode = xml.getAttribute("c");
    var result = this.makeItem(itemCode);

    if (xml.hasAttribute("id"))
    {
        result.id = xml.getAttribute("id");
        model.importItem(result);
    }

    result.setHeight(parseInt(xml.getAttribute("h")), true);

	if (xml.hasAttribute("d"))
	{
		result.setDirection(xml.getAttribute("d"), true);
	}

    // Update all the child items of this item as well
    for (var i = 0; i < xml.childNodes.length; i++)
    {
        var xmlItem = xml.childNodes.item(i);

        var currItem = this.makeItemFromXML(xmlItem, model);
        result.appendItem(currItem);

        // If the item is moveable, add it to the moveable list.
        if (currItem.params.moveTowards != null)
        {
            model.addToMoveableItems(currItem);
        }
    }

	return result;
}

PerspectiveItemFactory.prototype.makeItem = function(itemCode)
{
    if (itemCode == null)
        return null;
    
    var b = this.baseSummary[itemCode];
    if (b != null)
    {
        return new PerspectiveGridItem({itemName:b[0], itemCode:itemCode, canStandOn:b[4], blockView:true, isBlock:true, wtPerHt:b[5]});
    }
    else
    {
        var t = this.itemTemplates[itemCode];
        if (t != null)
        {
            // Copy param values
            var params = {};
            for (var j in t)
                params[j] = t[j];

            return new PerspectiveGridItem(params);
        }
    }    
       
    return null;
}

PerspectiveItemFactory.prototype.makeViewContents = function(view, x, y, x_index, y_index, modelContents, doSeparateCoverLayer)
{
    return new PerspectiveGridViewContents(view, x, y, x_index, y_index, modelContents, doSeparateCoverLayer);
}

PerspectiveItemFactory.prototype.makeSimpleViewItem = function(modelItem)
{
    if (this.baseSummary[modelItem.params.itemCode] != null)
    {
		return new SimpleBlockGridViewItem(this, modelItem.params.itemCode, modelItem.params.ht);
    }
    else
	{
		return this.makeSimpleViewItemFromCode(modelItem.params.itemCode);
	}
}

PerspectiveItemFactory.prototype.makeSimpleViewItemFromCode = function(itemCode)
{
    var t = this.itemTemplates[itemCode];
    if (t != null)
    {
	    var currItem = new SVGElement();
	    var artSVG = this.artwork.getElementById(t.itemName + "_def_def");
	    currItem.cloneElement(artSVG);
        currItem.removeAttribute("display");
        currItem.removeAttribute("style");
        
        return currItem; 
    }

    return null;
}

PerspectiveItemFactory.prototype.makeViewItem = function(modelItem)
{
    if (modelItem == null)
       return null;
       
    var b = this.baseSummary[modelItem.params.itemCode];
    if (b != null)
    {
        // top of the block
        var top = new ShadowElement(
            new SVGElement("path", {d:this.baseRect, fill:this.baseSummary[modelItem.params.itemCode][1], stroke:"none"}),
            true, 
			true
            );

        // Only bother with the left and front vertical sides
        
        // path for the verticals gets filled out later by setHeight
        var left = new ShadowElement(
            new SVGElement("path", {fill:this.baseSummary[modelItem.params.itemCode][2], stroke:"none"}),
            true,
			true
            );        
        var front = new ShadowElement(
            new SVGElement("path", {fill:this.baseSummary[modelItem.params.itemCode][3], stroke:"none"}),
            true,
			true
            );
		
        left.hide();
        front.hide();
        
        var bottom = new ShadowElement(null, true, true);
        
        var highlight = new SVGElement("path", {d:this.baseRect, fill:"red", stroke:"black", opacity:0.5});

        var elements = {bottom:bottom, front:front, left:left, top:top, highlight:highlight};
        return new BlockGridViewItem(modelItem, this, elements);
    }
    else
    {
        var t = this.itemTemplates[modelItem.params.itemCode];
        if (t != null)
        {
            var state = "def";
            if (modelItem.params.state != null)
                state = modelItem.params.state;

            var dirn = "f";
            if (modelItem.params.direction != null)
                dirn = modelItem.params.direction;
                
            var currItem = new SVGElement();
    	    currItem.cloneElement(this.artwork.getElementById(t.itemName));
    	    
    	    var showInvisible = true;
    	    if (modelItem.params.isInvisible)
    	        showInvisible = false;
    	    
    	    // Set a default state and direction
    	    var stateItem = new StateDirectionShadowElement(currItem, state, dirn, showInvisible, false);
    	    
            return new StateGridViewItem(modelItem, this, stateItem);
        }
    }
           
    return null;
}

PerspectiveItemFactory.prototype.getVerticalPath = function(deltaY, side)
{
    return this.verticalTemplate[side]
		.replace(/x/gi, this.x)
		.replace(/y/gi, this.y)
		.replace(/d/gi, deltaY)
		.replace(/f/gi, this.y + deltaY)
		.replace(/g/gi, this.delta)
		.replace(/h/gi, this.y - this.slope * this.delta)
		.replace(/j/gi, this.y + deltaY - this.slope * this.delta)
		.replace(/p/gi, -this.delta)
		.replace(/q/gi, this.y + deltaY - this.slope * this.delta)
		.replace(/r/gi, this.y - this.slope * this.delta);
}

PerspectiveItemFactory.prototype.createSpeechBubble = function(textVal)
{
    if (this.artwork == null)
        return null;

    var bubbleTemplate = this.artwork.getElementById("speechBubble");
    if (bubbleTemplate == null)
        return null;
    
    // Get the centre of the speech bubble
    var bubbleX = parseInt(bubbleTemplate.getAttribute("bubbleX"));
    var bubbleY = parseInt(bubbleTemplate.getAttribute("bubbleY"));
    
    var result = new SVGElement("g");
    var bubble = bubbleTemplate.cloneNode(true);
    result.svg.appendChild(bubble);

    var textSVG = new MultilineText(bubbleX, bubbleY + 3, textVal, {"font-size":14, fill:"white"}, {maxWidth:120, lineSpacing:0.3});
    result.appendChild(textSVG);
    
    return result;
}

