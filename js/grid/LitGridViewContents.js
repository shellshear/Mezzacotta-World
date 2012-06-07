// LitGridViewContents handles lighting changes by telling all the items in the contents
// about it.
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

