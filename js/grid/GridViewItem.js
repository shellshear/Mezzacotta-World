function GridViewItem(modelItem, viewItemFactory, itemGraphics)
{
    GridViewItem.baseConstructor.call(this, 0, 0, modelItem, viewItemFactory);
    
    this.itemGraphics = new SVGElement("g"); // The item graphics, as distinct from the item's children
    this.insertBefore(this.itemGraphics, this.containedItems); 
    
    this.appendItemContents(itemGraphics);
    
    if (modelItem.params.speech != null)
        this.doSpeech(modelItem.params.speech);
}
     
KevLinDev.extend(GridViewItem, ViewItemContainer);

// Append components of the item
GridViewItem.prototype.appendItemContents = function(newItemGraphics)
{
    this.itemGraphics.appendChild(newItemGraphics);
}

GridViewItem.prototype.doAction = function(src, evt)
{
    GridViewItem.superClass.doAction.call(this, src, evt);   

    if (evt.type == "paramChanged")
    {
        if (evt.name == 'speech')
        {
            // This item says something
            this.doSpeech(evt.value);
        }
		else if (evt.name == 'isInvisible')
		{
			this.setVisibilityTop(!evt.value);
		}
    }
}

GridViewItem.prototype.doSpeech = function(text)
{
    // Show what the character says

    // Clear out any existing speech bubbles
    if (this.speechBubble != null)
    {
        this.auxGroup.removeChild(this.speechBubble);
        this.speechBubble = null;
    }
    
    if (text != null)
    {
        this.speechBubble = this.viewItemFactory.createSpeechBubble(text);

        // Update the height
        var ht = -this.modelItem.params.elev;
        this.auxGroup.setAttribute("transform", "translate(0, " + ht + ")");
        this.auxGroup.appendChild(this.speechBubble);
    }
}

// Update how this item is viewed based on the povList.
// The povList is an array of items whose point of view inform what is seen.
// This item can only be seen if it can be seen by one of the items in the
// list.
// If the povList is null, show the item anyway.
GridViewItem.prototype.updatePOV = function(povList)
{
    var cellContents = this.modelItem.cellContents;
    if (cellContents == null)
        return;

    if (povList == null)
    {
        this.setVisibilityTop(true);
    }
    else if (this.itemGraphics != null)
    {
        var povTop = false;
        for (var j = 0; j < cellContents.seenBy.length; ++j)
        {
            if (cellContents.seenBy[j].viewType == "pov")
            {
                // Check whether this pov is one in the list
                for (var k = 0; k < povList.length; ++k)
                {
                    if (povList[k] == cellContents.seenBy[j].item)
                    {
                        if (cellContents.seenBy[j].viewElev <= this.modelItem.params.elev + this.modelItem.params.ht)
                        {
                            povTop = true;
                        }
                        
                        // Found the povList item we were looking for
                        break;
                    }
                }
            }
        }
        
        this.setVisibilityTop(povTop);
    }
    
    for (var i = 0; i < this.containedItems.childNodes.length; ++i)
    {
        this.containedItems.childNodes[i].updatePOV(povList);
    }
}

GridViewItem.prototype.setVisibilityTop = function(isVisible)
{
    // Always override if parameter says it's invisible.
    if (this.modelItem.params.isInvisible && (!this.modelItem.cellContents || !this.modelItem.cellContents.model.showInvisible))
        isVisible = false;
    
    this.itemGraphics.firstChild.setVisible(isVisible);
}

