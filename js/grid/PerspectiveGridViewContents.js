// Contents of a perspective grid
function PerspectiveGridViewContents(view, x, y, x_index, y_index, modelContents, doSeparateCoverLayer)
{
    this.button_bg = new SVGElement("path", {d:"M -25,0 0,-15 25,0 0,15 -25,0 z", fill:"none", stroke:"black"});
    
    // mouseover is an SVGComponent because we may wish to move the mouseover
    // graphic according to the contents of the button
    this.button_mouseover = new SVGComponent(0, 0);
    var mouseoverContents = new SVGElement("path", {d:"m 16.424175,0 a 16.424175,9.4351654 0 1 1 -32.84835,0 16.424175,9.4351654 0 1 1 32.84835,0 z", opacity:"0.6", fill:"#ff2a2a", stroke:"none"});
    this.button_mouseover.appendChild(mouseoverContents);

    this.button_select = new SVGElement("path", {d:"M -25,0 0,-15 25,0 0,15 -25,0 z", fill:"#ff2a2a", "fill-opacity":"0.56", stroke:"black"});

    this.button_cover = new SVGElement("path", {d:"M -25,0 0,-15 25,0 0,15 -25,0 z", fill:"white", opacity:"0", stroke:"none"});

    PerspectiveGridViewContents.baseConstructor.call
       (this, view, x, y, x_index, y_index, modelContents, doSeparateCoverLayer);
}

KevLinDev.extend(PerspectiveGridViewContents, LitGridViewContents);

