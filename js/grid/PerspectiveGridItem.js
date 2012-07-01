// PerspectiveGridItem 
// Helps handle "in the way" items (i.e. items that, due to perspective, block the
// user's view of something they should be able to see, and should therefore be made
// partially opaque)
function PerspectiveGridItem(params)
{
    PerspectiveGridItem.baseConstructor.call(this, params);
}

KevLinDev.extend(PerspectiveGridItem, LitGridItem);

PerspectiveGridItem.prototype.setInTheWay = function(opacity)
{
    if (this.cellContents != null)
    {
        this.cellContents.model.itemsInTheWay.push(this);
        this.tellActionListeners(this, {type:"InTheWay", opacity:opacity});
    }
}

