// Draw the grid button and contents

function GridViewContents(view, x, y, x_index, y_index, modelContents, doSeparateCoverLayer)
{
    this.view = view;
    this.modelContents = modelContents;
      
    // These indexes are so that user input events know which grid point
    // they're on.
    this.x_index = x_index;
    this.y_index = y_index;
   
	// this.button_* are all defined by subclasses

    GridViewContents.baseConstructor.call
       (this, "gridCell", x, y, 
        this.button_bg, this.button_mouseover, this.button_select, this.button_cover, doSeparateCoverLayer
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

GridViewContents.prototype.setMouseoverPosition = function(x, y)
{
	this.svg_mouseover.setPosition(x, y);
}

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

GridViewContents.prototype.updatePOV = function(povList)
{
    for (var i in this.viewItems.containedItems.childNodes)
    {
        this.viewItems.containedItems.childNodes[i].updatePOV(povList);
    }
}

// Clear this grid view contents and reset the mouseover position.
GridViewContents.prototype.clear = function()
{
	this.setMouseoverPosition(0, 0);
}
