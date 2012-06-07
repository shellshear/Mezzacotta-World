// Default content factory
function ContentFactory()
{
}

ContentFactory.prototype.makeContents = function(model, x, y, baseHeight)
{
    return new GridContents(model, x, y, baseHeight);
}

ContentFactory.prototype.makeItem = function(itemCode)
{
    return null;
}

ContentFactory.prototype.makeViewContents = function(view, x, y, x_index, y_index, modelContents)
{
    return new GridViewContents(view, x, y, x_index, y_index, modelContents);
}

ContentFactory.prototype.makeSimpleViewItem = function(item)
{
    return null;
}

ContentFactory.prototype.makeViewItem = function(item)
{
    return null;
}
