function RectGridModel(ambientLight, itemProperties)
{
    RectGridModel.baseConstructor.call(this, ambientLight, itemProperties);
}

KevLinDev.extend(RectGridModel, GridModel);

function RectGridView(gridModel, idMap, itemIdMap, numCols, numRows, startCol, startRow, width, height)
{
    RectGridView.baseConstructor.call(this, gridModel, idMap, itemIdMap, numCols, numRows, startCol, startRow, width, height);
}

KevLinDev.extend(RectGridView, GridView);

