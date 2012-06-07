// A simple block
function SimpleBlockGridViewItem(itemViewFactory, itemCode, height)
{
    SimpleBlockGridViewItem.baseConstructor.call(this, 0, 0);
	this.itemViewFactory = itemViewFactory;

    this.topRect = new SVGElement("path", {d:this.itemViewFactory.baseRect, fill:this.itemViewFactory.baseSummary[itemCode][1], stroke:"none"});
	this.appendChild(this.topRect);

    this.leftRect = new SVGElement("path", {fill:this.itemViewFactory.baseSummary[itemCode][2], stroke:"none"});
    this.appendChild(this.leftRect);

    this.frontRect = new SVGElement("path", {fill:this.itemViewFactory.baseSummary[itemCode][3], stroke:"none"});
	this.appendChild(this.frontRect);
	
	this.setHeight(height);
}

KevLinDev.extend(SimpleBlockGridViewItem, SVGComponent);

SimpleBlockGridViewItem.prototype.doAction = function(src, evt)
{
    SimpleBlockGridViewItem.superClass.doAction.call(this, src, evt);
    
    if (evt.type == "paramChanged" && evt.name == "ht")
    {
        this.setHeight(evt.value);
    }
}

SimpleBlockGridViewItem.prototype.setHeight = function(height)
{
	var leftPath = this.itemViewFactory.getVerticalPath(height, 0);
    this.leftRect.setAttribute("d", leftPath);

	var frontPath = this.itemViewFactory.getVerticalPath(height, 1);
    this.frontRect.setAttribute("d", frontPath);
}

