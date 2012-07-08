// View of rectangular grid
function RectGridView(gridModel, itemFactory, numCols, numRows, startCol, startRow, width, height)
{
    RectGridView.baseConstructor.call(this, gridModel, itemFactory, numCols, numRows, startCol, startRow, width, height);
}

KevLinDev.extend(RectGridView, GridView);

