// LitGridViewItem handles the lighting effects on this item.
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

