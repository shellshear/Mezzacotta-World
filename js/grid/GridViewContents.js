// Draw the grid button and contents

function GridViewContents(view, x, y, x_index, y_index, modelContents, doSeparateCoverLayer)
{
    var bg = new SVGElement("use", {"xlink:href": view.idMap.buttonOutline});
    
    // mouseover is an SVGComponent because we may wish to move the mouseover
    // graphic according to the contents of the button
    var mouseover = new SVGComponent(0, 0);
    var mouseoverContents = new SVGElement("use", {"xlink:href": view.idMap.buttonMouseover});
    mouseover.appendChild(mouseoverContents);

    var select = new SVGElement("use", {"xlink:href": view.idMap.buttonSelect});
    var cover = new SVGElement("use", {"xlink:href": view.idMap.buttonCover});
   
    // These indexes are so that user input events know which grid point
    // they're on.
    this.x_index = x_index;
    this.y_index = y_index;
   
    this.view = view;
    this.modelContents = modelContents;
      
    GridViewContents.baseConstructor.call
       (this, view.idMap.buttonName, x, y, 
        bg, mouseover, select, cover, doSeparateCoverLayer
       );   
    this.viewItems = new ViewItemContainer(0, 0, modelContents, this.view.itemFactory);
    this.viewItems.rootContainer = this;
    this.setContents(this.viewItems);
    
    if (doSeparateCoverLayer)
    {
        var newGroup = new SVGComponent(x, y);
        newGroup.appendChild(this.viewItems.auxGroup);
        this.addAuxiliaryComponent(newGroup);
    }
    
    // Fill out according to model
    this.viewItems.updateChildrenFromModel();
    
    // viewItems listens for updates to items
    this.modelContents.addActionListener(this.viewItems);
    
    // this listens for other updates from the contents
    this.modelContents.addActionListener(this);
}

KevLinDev.extend(GridViewContents, ParamButton);

GridViewContents.prototype.setAble = function(isAble)
{
    GridViewContents.superClass.setAble.call(this, isAble);   
    if (isAble)
    {
        this.svg_bg.show();
    }
    else
    {
        this.svg_bg.hide();
    }
}

GridViewContents.prototype.remove = function()
{
    this.modelContents.removeActionListener(this);
    this.viewItems.removeActionListeners();
    this.detach();
}

GridViewContents.prototype.updateView = function(povList)
{
    for (var i in this.viewItems.containedItems.childNodes)
    {
        this.viewItems.containedItems.childNodes[i].updateView(povList);
    }
}

