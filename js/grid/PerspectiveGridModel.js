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

