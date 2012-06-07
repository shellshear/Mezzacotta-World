// Handles lighting changes for the grid
function LitGridView(gridModel, idMap, itemFactory, numCols, numRows, startCol, startRow, width, height)
{
    LitGridView.baseConstructor.call(this, gridModel, idMap, itemFactory, numCols, numRows, startCol, startRow, width, height);   
}

KevLinDev.extend(LitGridView, GridView);

// Redo the lighting for the entire scene
// This needs to be done if we change gOpacityScaleFactor, for example.
LitGridView.prototype.setLighting = function()
{
    for (var i in this.view)
    {
        for (var j in this.view[i])
        {
            this.view[i][j].setLighting();
        }
    }
}

