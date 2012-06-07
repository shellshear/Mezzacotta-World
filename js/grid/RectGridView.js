// View of rectangular grid
function RectGridView(gridModel, idMap, itemIdMap, numCols, numRows, startCol, startRow, width, height)
{
    RectGridView.baseConstructor.call(this, gridModel, idMap, itemIdMap, numCols, numRows, startCol, startRow, width, height);
}

KevLinDev.extend(RectGridView, GridView);

