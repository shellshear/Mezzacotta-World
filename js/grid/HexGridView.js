// View of a hex grid - only real difference between hex and rect grids from our point of view is that
// the y position is offset by 1/2 for alternating grid points:
//     __    __
//    / 0\__/ 2\__
//    \__/ 1\__/ 3\
//       \__/  \__/
function HexGridView(gridModel, itemFactory, numCols, numRows, startCol, startRow, width, height)
{
    HexGridView.baseConstructor.call(this, gridModel, itemFactory, numCols, numRows, startCol, startRow, width, height);
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

