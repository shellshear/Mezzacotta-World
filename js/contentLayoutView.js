// Content layout view shows a tree of the items at a given contents,
// and allows the user to click on them.
function ContentLayoutView(view)
{
    ContentLayoutView.baseConstructor.call(this, 0, 0);
    this.bgRect = new SVGElement("rect", {x:-5, y: -5, width:0, height:0, fill:"white", stroke:"black"});
    this.tree = new FlowLayout(0, 0);
    this.appendChild(this.bgRect);
    this.appendChild(this.tree);
    this.hide();
    this.view = view;
}

KevLinDev.extend(ContentLayoutView, SVGComponent);

ContentLayoutView.prototype.setContents = function(contents)
{
    var x_posn = this.view.getLayoutX(contents.x, contents.y) * this.view.width;
    var y_posn = this.view.getLayoutY(contents.x, contents.y) * this.view.height;

    this.setPosition(x_posn, y_posn);
    this.show();
    
    if (this.contents == contents)
        return;
        
    this.contents = contents;
    this.tree.removeChildren();
        
    //this.contents.addActionListener(this);
    
    // Add the contents
    for (var i in this.contents.myItems)
    {
        var currItemView = makeItemLayout(this.view, this.contents.myItems[i]);
        this.tree.appendChild(currItemView);
    }
    
    var bbox = this.tree.getBBox();
    this.bgRect.setAttribute("x", bbox.x - 5);
    this.bgRect.setAttribute("y", bbox.y - 5);
    this.bgRect.setAttribute("width", bbox.width + 10);
    this.bgRect.setAttribute("height", bbox.height + 10);
}


function makeItemLayout(view, item)
{
    var result = null;
    
    //var currItemView = view.itemFactory.makeViewItem(item);
    var currItemView = new SelectableViewItem(view, item);   
    
    if (item.myItems.length > 1)
    {
        // Need a new vertical layout for us + children
        result = new FlowLayout(0, 0, {direction:"up"});
        result.appendChild(currItemView);
        
        // Need a new horizontal layout for children
        var hBox = new FlowLayout(0, 0);
        result.appendChild(hBox);
        
        for (var i in item.myItems)
        {
            var childItemLayout = makeItemLayout(view, item.myItems[i]);
            hBox.appendChild(childItemLayout);
        }
    }
    else if (item.myItems.length == 1)
    {
        result = makeItemLayout(view, item.myItems[0]);

        // add ourselves to the top of the vertical layout
        result.prependChild(currItemView);
    }
    else
    {
        // create a new vertical layout and put our item into it.
        result = new FlowLayout(0, 0, {direction:"up"});
        result.appendChild(currItemView);
    }
    
    return result;
}