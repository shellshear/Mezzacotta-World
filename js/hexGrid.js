// A grid model where the layout is hexagonal.
function HexGridModel(ambientLight, itemProperties)
{
    HexGridModel.baseConstructor.call(this, ambientLight, itemProperties);
}

KevLinDev.extend(HexGridModel, GridModel);

function HexGridView(gridModel, idMap, itemIdMap, numCols, numRows, startCol, startRow, width, height)
{
    HexGridView.baseConstructor.call(this, gridModel, idMap, itemIdMap, numCols, numRows, startCol, startRow, width, height);
}

KevLinDev.extend(HexGridView, GridView);

HexGridView.prototype.getLayoutX = function(i, j)
{
    return i;
}

HexGridView.prototype.getLayoutY = function(i, j)
{
    return (i % 2 == 0 ? j : j + 0.5);
}

