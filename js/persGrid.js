// Find the top block item, or null if there are no block items.
// This is like GridContents.getTopItem but with the additional restriction
// that the item is a block.
function getTopBlockItem(currContents)
{
    var result = null;
    
    var topData = currContents;
    while (topData.myItems.length > 0)
    {
        for (var i in topData.myItems)
        {
            if (topData.myItems[i].params.isBlock)
            {
                break;
            }
        }
        if (topData.myItems[i].params.isBlock)
        {
            topData = topData.myItems[i];
        }
        else
            break;
    }
    if (topData.params != null && topData.params.isBlock)
        result = topData;
        
    return result;
}

function PerspectiveGridModel(itemFactory)
{
    PerspectiveGridModel.baseConstructor.call(this, itemFactory);
    
    this.itemsInTheWay = [];
}

KevLinDev.extend(PerspectiveGridModel, LitGridModel);

PerspectiveGridModel.prototype.clearInTheWay = function()
{
    for (var i in this.itemsInTheWay)
    {
        this.itemsInTheWay[i].tellActionListeners(this.itemsInTheWay[i], {type:"InTheWay", opacity:1});
    }
    
    this.itemsInTheWay = [];
}


function PerspectiveGridContents(model, x, y, ambientLight)
{
    PerspectiveGridContents.baseConstructor.call(this, model, x, y, ambientLight);
}

KevLinDev.extend(PerspectiveGridContents, LitGridContents);

// Ensure this grid contents at the specified height is visible
// by making the contents "in front" of it from the perspective of the user
// semi-opaque
PerspectiveGridContents.prototype.setVisibleToUser = function(elevation)
{
    for (var i = 1; i < 4; i++)
    {
        var contents = this.model.getContents(this.x - i, this.y + i);
        var topData = contents;
        while (topData.myItems.length > 0)
        {
            topData = topData.myItems[0];
            if (topData.params.elev + topData.params.ht > 30 * (i - 1) + elevation)
            {
                // This item is in the way!
                topData.setInTheWay(0.5);
            }
        }
    }
}

function PerspectiveGridItem(params)
{
    PerspectiveGridItem.baseConstructor.call(this, params);
}

KevLinDev.extend(PerspectiveGridItem, LitGridItem);

PerspectiveGridItem.prototype.setInTheWay = function(opacity)
{
    if (this.contents != null)
    {
        this.contents.model.itemsInTheWay.push(this);
        this.tellActionListeners(this, {type:"InTheWay", opacity:opacity});
    }
}

function PerspectiveGridView(gridModel, idMap, itemIdMap, numCols, numRows, startCol, startRow, width, height)
{
    PerspectiveGridView.baseConstructor.call(this, gridModel, idMap, itemIdMap, numCols, numRows, startCol, startRow, width, height);
}

KevLinDev.extend(PerspectiveGridView, LitGridView);

PerspectiveGridView.prototype.getLayoutX = function(x, y)
{
    return x + y;
}

PerspectiveGridView.prototype.getLayoutY = function(x, y)
{
    return y - x;
}

// In this case, we want to draw a diamond
PerspectiveGridView.prototype.drawView = function()
{
    for (var i = 0; i < this.numCols; i++)
    {
        for (var j = 0; j < this.numRows; j++)
        {
            var real_i = i - j;
            var real_j = i + j;
            this.drawCell(real_i + this.startCol, real_j + this.startRow);
            this.drawCell(real_i + this.startCol, real_j + this.startRow + 1);            
        }
    }
}

PerspectiveGridView.prototype.inView = function(x, y)
{
    
    var i = (x - this.startCol) + (y - this.startRow);
    var j = (y - this.startRow) - (x - this.startCol);

    return (i >= 0 && 
            i < this.numCols &&
            j >= 0 &&
            j < this.numRows);
}

function PerspectiveGridViewContents(view, x, y, x_index, y_index, modelContents, doSeparateCoverLayer)
{
    PerspectiveGridViewContents.baseConstructor.call
       (this, view, x, y, x_index, y_index, modelContents, doSeparateCoverLayer);
}

KevLinDev.extend(PerspectiveGridViewContents, LitGridViewContents);

// This is an item with a left, front, and top that are viewable in a 
// perspective scene.
function PerspectiveGridViewItem(modelItem, viewItemFactory, elements)
{
    this.elements = elements;

    PerspectiveGridViewItem.baseConstructor.call
       (this, modelItem, viewItemFactory, this.elements["bottom"]);   

    this.appendItemContents(this.elements["left"]);
    this.appendItemContents(this.elements["front"]);
    this.appendItemContents(this.elements["top"]);
	
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

function SimpleBlockGridViewItem(itemViewFactory, itemCode, height)
{
    SimpleBlockGridViewItem.baseConstructor.call(this, 0, 0);
	this.itemViewFactory = itemViewFactory;

    this.topRect = new SVGElement("path", {d:this.itemViewFactory.baseRect, fill:this.itemViewFactory.baseSummary[itemCode][1], stroke:"none"});
	this.appendChild(this.topRect);

    this.leftRect = new SVGElement("path", {fill:this.itemViewFactory.baseSummary[itemCode][2], stroke:"none"});
    this.appendChild(this.leftRect);

    this.frontRect = new SVGElement("path", {fill:this.itemViewFactory.baseSummary[itemCode][3], stroke:"none"});
	this.appendChild(this.frontRect);
	
	this.setHeight(height);
}

KevLinDev.extend(SimpleBlockGridViewItem, SVGComponent);

SimpleBlockGridViewItem.prototype.doAction = function(src, evt)
{
    SimpleBlockGridViewItem.superClass.doAction.call(this, src, evt);
    
    if (evt.type == "paramChanged" && evt.name == "ht")
    {
        this.setHeight(evt.value);
    }
}

SimpleBlockGridViewItem.prototype.setHeight = function(height)
{
	var leftPath = this.itemViewFactory.getVerticalPath(height, 0);
    this.leftRect.setAttribute("d", leftPath);

	var frontPath = this.itemViewFactory.getVerticalPath(height, 1);
    this.frontRect.setAttribute("d", frontPath);
}

// StateGridViewItem handles svg from a graphics file that has the following layout:
// <g id="itemId">
//     <g id="itemId_def" state="def">
//         <g id="itemId_def_def" [direction="dirn"]>
//             [graphics describing default state, with default direction]
//             <path id="itemId_def_def_shadow" d="" type="shadow"/>
//         </g>
//         <g id="itemId_def_back" direction="back"/>
//     </g>
//     <g id="itemId_state2" state="state2"/>
// </g>
// 
// The only compulsary item is the id="itemId_def_def", which is 
// the default graphic used if no other information is provided about
// direction or state.
// If a state X is provided, the subset of items under the id "itemId_X"
// are used. If not, the default state is "def".
// If a direction D is provided, the item with the id "itemId_X_D" is used.
function StateDirectionShadowElement(base, state, direction, showInvisible)
{
    StateDirectionShadowElement.baseConstructor.call
        (this, base, null, showInvisible);   

    this.setState(state);
    this.setDirection(direction);
}

KevLinDev.extend(StateDirectionShadowElement, ShadowElement);

// Show the graphics corresponding to the state, and hide the others.
StateDirectionShadowElement.prototype.setState = function(state)
{
    this.state = state;
    this.stateSVG = null;
    
    for (var i in this.base.childNodes)
    {
        var currState = this.base.childNodes[i];
        if (currState.hasAttribute("state") && currState.getAttribute("state") == state)
        {
        	currState.show();
        	currState.removeAttribute("style"); // Hack - Inkscape will include "display=none" in the style attribute, so we need to remove it.
            this.stateSVG = currState;
        }
        else
        {
            currState.hide();
        }
    }
}

// Show the graphics corresponding to the direction, and hide the others.
// Show the first direction that is contained in the direction string.
// The intention is that if the direction requested is "f" for forward, 
// a graphic with direction "fb" (eg. a door) would match.
StateDirectionShadowElement.prototype.setDirection = function(direction)
{
    this.direction = direction;
    this.directionSVG = null;
    
    if (this.stateSVG != null)
    {
        for (var i in this.stateSVG.childNodes)
        {
            var currDirn = this.stateSVG.childNodes[i];
            if (currDirn.hasAttribute("direction") && currDirn.getAttribute("direction").indexOf(direction) >= 0)
            {
            	currDirn.show();
            	currDirn.removeAttribute("style"); // Hack - Inkscape will include "display=none" in the style attribute, so we need to remove it.
                this.directionSVG = currDirn;
            }
            else
            {
                currDirn.hide();
            }
        }
    }
    
    if (this.directionSVG != null)
    {
        // Good, we've found a valid graphic. Look for a shadow.
        for (var i in this.directionSVG.childNodes)
        {
            var currGraphic = this.directionSVG.childNodes[i];
            if (currGraphic.hasAttribute("type") && currGraphic.getAttribute("type") == "shadow")
            {
                currGraphic.show();
                currGraphic.removeAttribute("style"); // Hack - Inkscape will include "display=none" in the style attribute, so we need to remove it.
                this.setShadowElement(currGraphic);
                break;
            }
        }
    }
}

StateDirectionShadowElement.prototype.setShadowElement = function(shadow)
{
    StateDirectionShadowElement.superClass.setShadowElement.call(this, shadow);   

    // If the direction element has any transforms, apply them to the shadow element
    // as well, because it's been moved from the direction group.
    // (It got separated because we sometimes want to show the shadow but not the element.)
    if (this.shadow != null && this.directionSVG != null)
    {
        // There may be some transforms on the base
        // that need to be applied to the shadow
        if (this.directionSVG.hasAttribute("transform"))
        {
            this.shadow.setAttribute("transform", this.directionSVG.getAttribute("transform"));
        }
    }
}


function StateGridViewItem(modelItem, viewItemFactory, stateItem)
{
    this.stateItem = stateItem;
    
    StateGridViewItem.baseConstructor.call
        (this, modelItem, viewItemFactory, this.stateItem);   

    // We set the base position to be the height of the object
    // so that items that go on top of it are correctly placed
    var translateHeight = -this.modelItem.params.ht;
    this.setPosition(0, translateHeight); 
    
    this.itemGraphics.setAttribute("transform", "translate(0, " + this.modelItem.params.ht + ")");
}

KevLinDev.extend(StateGridViewItem, LitGridViewItem);

StateGridViewItem.prototype.doAction = function(src, evt)
{
    StateGridViewItem.superClass.doAction.call(this, src, evt);   

    if (evt.type == "paramChanged")
    {
        if (evt.name == "state")
        {
            this.stateItem.setState(evt.value);
        }
        else if (evt.name == "direction")
        {
            this.stateItem.setDirection(evt.value);
        }
    }
}

// A view item that can be clicked on (used in the content layout view)
function SelectableViewItem(view, item)
{
    this.view = view;
    this.item = item;
    
    var bgElement = null;
    var mouseoverElement = null;
    var selectElement = null;
    var coverElement = null;    

    var t = view.itemFactory.itemTemplates[item.params.itemCode];
    if (t != null)
    {
        bgElement = new SVGElement();
    	bgElement.cloneElement(view.itemFactory.artwork.getElementById(t.itemName + "_def_def"));
    	bgElement.removeAttribute("style");
    	bgElement.removeAttribute("display");

        // Get the shadow path
        var path = "M0,0 L10,0 10,10 0,10z";
        var shadow = view.itemFactory.artwork.getElementById(t.itemName + "_def_def_shadow");
        if (shadow != null)
            path = shadow.getAttribute("d");
            
        mouseoverElement = new SVGElement("path", {d: path, fill:"red", stroke:"black", opacity:0.5});
        selectElement = new SVGElement("path", {d: path, fill:"red", stroke:"black"});
        coverElement = new SVGElement("path", {d: path, fill:"white", opacity:0});    
    }
    else
    {
        b = view.itemFactory.baseSummary[item.params.itemCode];
    
        bgElement = new SVGElement("path", {"d":view.itemFactory.baseRect,stroke:"none",fill:b[1]});
        mouseoverElement = new SVGElement("path", {"d":view.itemFactory.baseRect,stroke:"red",fill:"red",opacity:0.5});
        selectElement = new SVGElement("path", {"d":view.itemFactory.baseRect,stroke:"red", fill:"red"});
        coverElement = new SVGElement("path", {"d":view.itemFactory.baseRect,stroke:"none",fill:"white",opacity:"0"});    
    }    

    SelectableViewItem.baseConstructor.call
       (this,
        item,
        0,
        0,
        bgElement,
        mouseoverElement,
        selectElement,
        coverElement,
        null
        );
}

KevLinDev.extend(SelectableViewItem, ParamButton);

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
    this.x = x;
    this.y = y;

    this.baseRectTemplate = "M -x,0 L 0,-y x,0 0,y -x,0 z";
    
    // The vertical templates for the perspective model are
    //               0,-y
    //          -x,0 /\ x,0
    //              |\/|0,y
    //          -x,d| ||x,d  
    //               \|/ 
    //               0,f
    // where d is the block height and f=d+y
    this.verticalTemplate = ["M -x,0 0,y 0,f -x,d z", "M x,0 x,d 0,f 0,y z", "M -x,0 L-x,-d 0,-f 0,-y z", "M x,0 0,-y 0,-f x,-d z"];

    this.baseRect = this.baseRectTemplate.replace(/x/gi, x + 0.5).replace(/y/gi, y + 0.5);

    this.baseSummary = baseSummary;
    
    this.itemTemplates = itemTemplates;
}

KevLinDev.extend(PerspectiveItemFactory, LitContentFactory);

PerspectiveItemFactory.prototype.makeContents = function(model, x, y, baseHeight)
{
    return new PerspectiveGridContents(model, x, y, baseHeight, this.ambientLight);
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
    var b = this.baseSummary[modelItem.params.itemCode];
    if (b != null)
    {
		return new SimpleBlockGridViewItem(this, modelItem.params.itemCode, modelItem.params.ht);
    }
    
    var t = this.itemTemplates[modelItem.params.itemCode];
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
            new SVGElement("path", {d:this.baseRect, fill:"black", stroke:"none", opacity:"0"}),
            true
            );

        // Only bother with the left and front vertical sides
        
        // path for the verticals gets filled out later by setHeight
        var left = new ShadowElement(
            new SVGElement("path", {fill:this.baseSummary[modelItem.params.itemCode][2], stroke:"none"}),
            new SVGElement("path", {fill:"black", stroke:"none", opacity:"0"}),
            true
            );        
        var front = new ShadowElement(
            new SVGElement("path", {fill:this.baseSummary[modelItem.params.itemCode][3], stroke:"none"}),
            new SVGElement("path", {fill:"black", stroke:"none", opacity:"0"}),
            true
            );
        left.hide();
        front.hide();
        
        var bottom = new ShadowElement(null, null, true);
        
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
    	    var stateItem = new StateDirectionShadowElement(currItem, state, dirn, showInvisible);
    	    
            return new StateGridViewItem(modelItem, this, stateItem);
        }
    }
           
    return null;
}

PerspectiveItemFactory.prototype.getVerticalPath = function(deltaY, side)
{
    return this.verticalTemplate[side].replace(/x/gi, this.x + 0.5).replace(/y/gi, this.y + 0.5).replace(/d/gi, deltaY).replace(/f/gi, this.y + deltaY + 0.5);
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

