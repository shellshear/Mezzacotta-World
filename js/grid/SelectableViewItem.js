// A view item that can be clicked on (used in the content layout view)
function SelectableViewItem(view, item)
{
    this.view = view;
    this.item = item;
    
    var bgElement = null;
    var mouseoverElement = null;
    var selectElement = null;
    var coverElement = null;    

    var t = view.itemFactory.itemTemplates[item.params.itemCode];
    if (t != null)
    {
        bgElement = new SVGElement();
    	bgElement.cloneElement(view.itemFactory.artwork.getElementById(t.itemName + "_def_def"));
    	bgElement.removeAttribute("style");
    	bgElement.removeAttribute("display");

        // Get the shadow path
        var path = "M0,0 L10,0 10,10 0,10z";
            
        mouseoverElement = new SVGElement("path", {d: path, fill:"red", stroke:"black", opacity:0.5});
        selectElement = new SVGElement("path", {d: path, fill:"red", stroke:"black"});
        coverElement = new SVGElement("path", {d: path, fill:"white", opacity:0});    
    }
    else
    {
        b = view.itemFactory.baseSummary[item.params.itemCode];
    
        bgElement = new SVGElement("path", {"d":view.itemFactory.baseRect,stroke:"none",fill:b[1]});
        mouseoverElement = new SVGElement("path", {"d":view.itemFactory.baseRect,stroke:"red",fill:"red",opacity:0.5});
        selectElement = new SVGElement("path", {"d":view.itemFactory.baseRect,stroke:"red", fill:"red"});
        coverElement = new SVGElement("path", {"d":view.itemFactory.baseRect,stroke:"none",fill:"white",opacity:"0"});    
    }    

    SelectableViewItem.baseConstructor.call
       (this,
        item,
        0,
        0,
        bgElement,
        mouseoverElement,
        selectElement,
        coverElement,
        null
        );
}

KevLinDev.extend(SelectableViewItem, ParamButton);

