// Default Content factory for lit items
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

