// LitGridItem keeps track of lighting for an item, using the POV model of GridItem
//
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

