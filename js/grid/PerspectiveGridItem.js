// PerspectiveGridItem 
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

