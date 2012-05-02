// This class applies lighting effects to the GridModel base class.
// It allows ambient light levels to be set for each contents, and
// for point sources to be defined in GridItems, which radiate light
// except where they are blocked.
// GridContents understand about blocking light.

function LitGridModel(itemFactory)
{
    LitGridModel.baseConstructor.call(this, itemFactory);
}

KevLinDev.extend(LitGridModel, GridModel);

// Get the light level the specified distance from the light source
LitGridModel.prototype.calcLightLevel = function(distance, srcLevel)
{
    // Default max is four
    if (distance >= 4)
        return 0;
    else if (distance <= 0)
        return srcLevel;
    else
        return (1.0 - distance / 4) * srcLevel;
}

function LitGridContents(model, x, y, ambientLight)
{
    LitGridContents.baseConstructor.call(this, model, x, y);
   
    this.ambientLight = ambientLight;
}

KevLinDev.extend(LitGridContents, GridContents);

LitGridContents.prototype.setAmbientLight = function(level)
{
    this.ambientLight = level;

    this.tellActionListeners(null, {type:"lightChanged"});
}

LitGridContents.prototype.removeSeenBy = function(item)
{
    LitGridContents.superClass.removeSeenBy.call(this, item);
    
    this.tellActionListeners(null, {type:"lightChanged"});
}

// string is of form ambient_light:item_list
LitGridContents.prototype.fromString = function(str)
{
    var split = str.split(":");
    this.ambientLight = parseInt(split[0]);
    
    LitGridContents.superClass.fromString.call(this, split[1]);   
}

LitGridContents.prototype.toString = function()
{
    var result = LitGridContents.superClass.toString.call(this);

    if (result != null)
        result = String(this.ambientLight) + ":" + result;
    
    return result;
}

LitGridContents.prototype.toXML = function(xmlDoc, showAll)
{
    var result = LitGridContents.superClass.toXML.call(this, xmlDoc, showAll);
    
    if (result != null)
        result.setAttribute("l", this.ambientLight);

    return result;
}

LitGridContents.prototype.fromXML = function(xml)
{
    this.ambientLight = parseFloat(xml.getAttribute("l"));
    
    LitGridContents.superClass.fromXML.call(this, xml);
}

// Extra params relevant to LitGrid items are:
//      lightStrength - how strong the light being emitted by this item is.
//      lightRadius - how far the light spreads.
function LitGridItem(params)
{
    LitGridItem.baseConstructor.call(this, params);
}

KevLinDev.extend(LitGridItem, GridItem);

LitGridItem.prototype.updatePOV = function()
{
    LitGridItem.superClass.updatePOV.call(this);   

    // update what we can see
    if (this.params.lightStrength > 0)
    {
        this.updateVisibleWithinRadius(this.params.lightRadius, "light");
        for (var i in this.canSee.light)
        {
            for (var j in this.canSee.light[i])
            {
                var evt = new Object();
                evt.type = "lightChanged";
                this.canSee.light[i][j].contents.tellActionListeners(this, evt);
            }
        }
    }
}

function LitGridViewItem(modelItem, viewItemFactory, itemGraphics)
{
    LitGridViewItem.baseConstructor.call(this, modelItem, viewItemFactory, itemGraphics);

    this.setLighting();
}

KevLinDev.extend(LitGridViewItem, GridViewItem);

LitGridViewItem.prototype.setLighting = function()
{
    var contents = this.modelItem.contents;
    if (contents == null)
        return;

    if (this.itemGraphics != null)
    {
        // Set the shadow according to ambient light and light sources
        // this item is seen by.
        var lightLevel = contents.ambientLight;
        
        for (var j in contents.seenBy)
        {
            if (contents.seenBy[j].item.params.lightStrength == null || contents.seenBy[j].item.params.lightStrength == 0)
                continue;
            
            if (contents.seenBy[j].viewType != "light")
                continue;
            
            // Not visible if the top isn't visible
            var elev = contents.seenBy[j].viewElev;
            if (contents.seenBy[j].viewElev > this.modelItem.params.elev + this.modelItem.params.ht)
                continue;
            
            var sourceLevel = contents.model.calcLightLevel(contents.seenBy[j].distance, contents.seenBy[j].item.params.lightStrength);
            if (sourceLevel > lightLevel)
            {
                lightLevel = sourceLevel;
            }
        }
    
        this.itemGraphics.setShadow(1.0 - lightLevel);
    }
        
    for (var i in this.containedItems.childNodes)
    {
        this.containedItems.childNodes[i].setLighting();
    }
}

LitGridViewItem.prototype.doAction = function(src, evt)
{
    LitGridViewItem.superClass.doAction.call(this, src, evt);   

    if (evt.type == "paramChanged" && evt.name == "ht")
    {
        this.setLighting();
    }
}

function LitGridViewContents(view, x, y, x_index, y_index, modelContents, doSeparateCoverLayer)
{
    LitGridViewContents.baseConstructor.call(this, view, x, y, x_index, y_index, modelContents, doSeparateCoverLayer);
}

KevLinDev.extend(LitGridViewContents, GridViewContents);

LitGridViewContents.prototype.doAction = function(src, evt)
{
    LitGridViewContents.superClass.doAction.call(this, src, evt);   

    if (evt.type == "lightChanged")
    {
        this.setLighting();
    }
}

LitGridViewContents.prototype.setLighting = function()
{
    for (var i in this.viewItems.containedItems.childNodes)
    {
        this.viewItems.containedItems.childNodes[i].setLighting();
    }
}

function LitGridView(gridModel, idMap, itemFactory, numCols, numRows, startCol, startRow, width, height)
{
    LitGridView.baseConstructor.call(this, gridModel, idMap, itemFactory, numCols, numRows, startCol, startRow, width, height);   
}

KevLinDev.extend(LitGridView, GridView);

// Redo the lighting for the entire scene
// This needs to be done if we change gOpacityScaleFactor, for example.
LitGridView.prototype.setLighting = function()
{
    for (var i in this.view)
    {
        for (var j in this.view[i])
        {
            this.view[i][j].setLighting();
        }
    }
}

// Default content factory
function LitContentFactory(ambientLight)
{
    LitContentFactory.baseConstructor.call(this);
       
    this.ambientLight = ambientLight;
}

KevLinDev.extend(LitContentFactory, ContentFactory);

LitContentFactory.prototype.makeContents = function(model, x, y, baseHeight)
{
    return new LitGridContents(model, x, y, baseHeight, this.ambientLight);
}

LitContentFactory.prototype.makeItem = function(itemCode)
{
    return null;
}

LitContentFactory.prototype.makeViewContents = function(view, x, y, x_index, y_index, modelContents)
{
    return new LitGridViewContents(view, x, y, x_index, y_index, modelContents);
}

LitContentFactory.prototype.makeViewItem = function(itemCode)
{
    return null;
}

var gOpacityScaleFactor = 1.0;

// Holds the element and its shadow
// Note that this is distinct from an item: an item may contain many
// shadowElements (eg. the perspective base element has two verticals, 
// each with their own shadow)
// The showInvisible parameter determines whether the element is hidden
// or merely darkened when it is not visible due to lighting conditions.
function ShadowElement(base, shadow, showInvisible)
{
    ShadowElement.baseConstructor.call(this, "g");

    this.setBaseElement(base);
    this.setShadowElement(shadow);
    this.showInvisible = showInvisible;
    if (!this.showInvisible)
        this.hide();
    
    this.isVisible = true;     
}

KevLinDev.extend(ShadowElement, SVGElement);

ShadowElement.prototype.setBaseElement = function(base)
{
    if (this.base != null)
        this.removeChild(this.base);

    this.base = base;
    if (this.base != null)
        this.prependChild(this.base);
}

ShadowElement.prototype.setShadowElement = function(shadow)
{
    if (this.shadow != null)
        this.shadow.detach();

    this.shadow = shadow;
    if (this.shadow != null)
    {
        this.appendChild(this.shadow);
    }
}

ShadowElement.prototype.setShadow = function(opacity)
{
    this.opacity = opacity;

    if (this.isVisible)
    {
        this.setOpacity(this.opacity);
    }
}

// If the shadow element isn't visible, either hide it or
// show it as dark no matter what the light level
ShadowElement.prototype.setVisible = function(isVisible)
{
    this.isVisible = isVisible;
    
    if (this.isVisible)
    {
        this.show();
        this.setOpacity(this.opacity);
    }
    else if (this.showInvisible)
    {
        this.show();
        this.setOpacity(1.0);
    }
    else
        this.hide();
}

ShadowElement.prototype.setOpacity = function(opacity)
{
    opacity *= gOpacityScaleFactor;
    
    if (this.shadow != null)
    {
        this.shadow.setAttribute("opacity", opacity);
    }
    if (this.base != null)
    {
        if (opacity == 1.0)
        {
            // We can hide the base because the shadow is fully covering it anyway.
            // If there's no shadow element, we hide it anyway 'cause otherwise
            // it'll show up as fully lit even though it can't be seen.
            this.base.hide();
        }
        else
        {
            this.base.show();
        }
    }
}