// Contents of a perspective grid
function PerspectiveGridViewContents(view, x, y, x_index, y_index, modelContents, doSeparateCoverLayer)
{
    PerspectiveGridViewContents.baseConstructor.call
       (this, view, x, y, x_index, y_index, modelContents, doSeparateCoverLayer);
}

KevLinDev.extend(PerspectiveGridViewContents, LitGridViewContents);

