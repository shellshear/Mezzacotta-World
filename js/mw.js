// Version of Mezzacotta World
g_mwVersion = "0.4";// Global configuration parameters
var g_config = new MW_Config();

function MW_Config()
{
    this.showServerTransations = true;
}
// Ajax functions.
function ajax_get(myurl, myCallback) 
{
    var xmlRequest = null;
    
    if (window.XMLHttpRequest) 
    {
        xmlRequest = new XMLHttpRequest();
    }
    else
    {
        xmlRequest = new ActiveXObject("Microsoft.XMLHTTP");
    }
    
    if (xmlRequest != null)
    {
        function XMLHttpRequestCallback() 
        {
            if (xmlRequest.readyState == 4) 
            {
                if (xmlRequest.status == 200) 
                {
                    myCallback(xmlRequest.responseXML.documentElement, xmlRequest.responseXML);
                }
            }
        }
        
        xmlRequest.open("GET", myurl, true);
        xmlRequest.onreadystatechange = XMLHttpRequestCallback;
        xmlRequest.send(null);

    }
}


function ajax_post(myurl, myCallback, params) 
{ 
    if (window.XMLHttpRequest) 
    {
        var xmlRequest = new XMLHttpRequest();

        function XMLHttpRequestCallback() 
        {
            if (xmlRequest.readyState == 4) 
            {
                if (xmlRequest.status == 200) 
                {
                    myCallback(xmlRequest.responseXML.documentElement, xmlRequest.responseXML);
                }
            }
        }        

        xmlRequest.open("POST", myurl, true);

        //Send the proper header information along with the request
        xmlRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        
        if (params != null)
            xmlRequest.setRequestHeader("Content-length", params.length);
        xmlRequest.setRequestHeader("Connection", "close");

        xmlRequest.onreadystatechange = XMLHttpRequestCallback;
        xmlRequest.send(params);

    }
}
var svgns = "http://www.w3.org/2000/svg";
var xmlns = "http://www.w3.org/XML/1998/namespace";
var xlinkns = "http://www.w3.org/1999/xlink";

// Inheritance handler
KevLinDev = {};

KevLinDev.extend = function(subclass, baseclass)
{
    function inheritance() {};
    inheritance.prototype = baseclass.prototype;

    subclass.prototype = new inheritance();
    subclass.prototype.constructor = subclass;
    subclass.baseConstructor = baseclass;
    subclass.superClass = baseclass.prototype;
};

function htmlspecialchars(string)
{
    var result = "";
    for (i = 0; i < string.length; i++)
    {
        switch (string[i])
        {
        case '<':
            result += "&lt;";
            break;

        case '>':
            result += "&gt;";
            break;
        
        case '\"':
            result += "&quot;";
            break;
            
        case "\'":
            result += "&#039;";
            break;
            
        case "&":
            result += "&amp;";
            break;
        
        default:
            result += string[i];
            break;
        }
    }
    
    return result;
}

function htmlspecialchars_decode(string)
{
    return string.toString().replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#0*39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');    
}

function createXMLDoc(elementName)
{
	var result = null;
	if (document.implementation && document.implementation.createDocument) 
	{
	    result = document.implementation.createDocument(null, elementName, null);
	}
	else
	{
	    result = new ActiveXObject("MSXML2.DOMDocument"); 
	    result.loadXML("<" + elementName + "/>");
	}
	return result;
}

// Action Listeners respond to any SVG events via the handleEvent
// method.  They can also be passed on by tellActionListeners.
function ActionObject()
{
    this.src = "ActionObject";
    this.actionListeners = [];
	this.resizeListeners = [];
}

ActionObject.prototype.addActionListener = function(actionListener)
{
    this.actionListeners.push(actionListener);
};

ActionObject.prototype.removeActionListener = function(actionListener)
{
    for (var i = 0; i < this.actionListeners.length; ++i)
    {
     	if (this.actionListeners[i] == actionListener)
     	{
         	this.actionListeners.splice(i, 1);
         	break;
     	}
    }
};

ActionObject.prototype.clearActionListeners = function()
{
    this.actionListeners = [];
};

ActionObject.prototype.handleEvent = function(evt)
{
    this.tellActionListeners(this, evt);
};

ActionObject.prototype.tellActionListeners = function(src, evt)
{
    // Tell the action listeners
    for (var i = 0; i < this.actionListeners.length; ++i)
    {
     	this.actionListeners[i].doAction(src, evt);
    }
};

ActionObject.prototype.addResizeListener = function(resizeListener)
{
    this.resizeListeners.push(resizeListener);
};

ActionObject.prototype.removeResizeListener = function(resizeListener)
{
    for (var i = 0; i < this.resizeListeners.length; ++i)
    {
     	if (this.resizeListeners[i] == resizeListener)
     	{
         	this.resizeListeners.splice(i, 1);
         	break;
     	}
    }
};

ActionObject.prototype.clearResizeListeners = function()
{
    this.resizeListeners = [];
};

ActionObject.prototype.tellResizeListeners = function(src)
{
    // Tell the action listeners
    for (var i = 0; i < this.resizeListeners.length; ++i)
    {
     	this.resizeListeners[i].notifyResize(src);
    }
};

// SVGElement functionality is a modified version of
// Node_Builder.js
//
// @author Kevin Lindsey
// @version 1.3
// @copyright 2000-2002, Kevin Lindsey
// @license http://www.kevlindev.com/license.txt

function SVGElement(type, attributes, text)
{
    SVGElement.baseConstructor.call(this);
    
    this.src = type;
    
    if (type != null)
        this.svg = document.createElementNS(svgns, type);
    
    this.showing = true;
    this.childNodes = [];
    this.firstChild = null;
    this.lastChild = null;
    this.parentNode = null;
    this.tnode = null;

    this.addAttributes(attributes);

    if (text)
    {
        this.tnode = document.createTextNode(text);
        this.svg.appendChild(this.tnode);
    }
}

KevLinDev.extend(SVGElement, ActionObject);

// Wrap an existing SVG element. Note that we do not
// attempt to adapt existing children of the element.
SVGElement.prototype.wrapElement = function(existingElement)
{
    if (existingElement == null)
        return;
        
    this.src = existingElement.nodeName;
    this.svg = existingElement;
    
    this.showing = true;
    if (existingElement.hasAttribute("display") && existingElement.getAttribute("display") == "none")
        this.showing = false;
    
    // Also wrap all the children
    for (var i = 0; i < existingElement.children.length; i++)
    {
        var child = new SVGElement();
        child.wrapElement(existingElement.children[i]);

        // We wish to append the child, but the svg structure already
        // exists, so we don't mess with that.
        // Instead, we just add the child to the SVGElement list of childNodes
        this.childNodes.push(child);
        if (this.childNodes.length == 1)
        {
            this.firstChild = child;
        }
        this.lastChild = child;
    }
}

function wrapElementById(elementId)
{
    result = null;
    var el = document.getElementById(elementId);
    if (el != null)
    {
        result = new SVGElement();
        result.wrapElement(el);
    }
    return result;
}

function cloneElementById(doc, elementId)
{
    result = null;
    var el = doc.getElementById(elementId);
    if (el != null)
    {
        result = new SVGElement();
        result.cloneElement(el);
    }
    return result;
}

// Clone an existing svg node into our class heirarchy
SVGElement.prototype.cloneElement = function(existingElement)
{
    this.wrapElement(existingElement.cloneNode(true));
}

SVGElement.prototype.addAttributes = function(attributes)
{
    if (!attributes)
        return;
     
    for (var a in attributes)
    {
        var currNs = null;
     
        // WARNING: this test for the xlink namespace is a hack.
        if ( a.match(/^xlink:/) )
            currNs = "http://www.w3.org/1999/xlink";

        this.svg.setAttributeNS(currNs, a, attributes[a]);
    }
};

SVGElement.prototype.show = function()
{
    this.svg.setAttribute("display", "inline");
    this.showing = true;
};

SVGElement.prototype.hide = function()
{
    this.svg.setAttribute("display", "none");
    this.showing = false;
};

SVGElement.prototype.isShowing = function()
{
    return this.showing;
};

SVGElement.prototype.hasParent = function()
{
    return (this.parentNode != null);
}

SVGElement.prototype.detach = function()
{
    if (this.parentNode != null)
    {
        this.parentNode.removeChild(this);
    }
};

SVGElement.prototype.doAction = function(src, evt)
{
};

SVGElement.prototype.notifyResize = function(src)
{
};

// Shims for Node methods
SVGElement.prototype.hasAttribute = function(attr)
{
    return this.svg.hasAttribute(attr);
}

SVGElement.prototype.getAttribute = function(attr)
{
    return this.svg.getAttribute(attr);
}

SVGElement.prototype.setAttribute = function(attr, val)
{
    this.svg.setAttribute(attr, val);
};

SVGElement.prototype.setAttributeNS = function(ns, attr, val)
{
    this.svg.setAttributeNS(ns, attr, val);
};

SVGElement.prototype.removeAttribute = function(attr)
{
    this.svg.removeAttribute(attr);
};

SVGElement.prototype.setValue = function(val)
{
    if (this.tnode == null)
    {
     this.tnode = document.createTextNode(val);
     this.svg.appendChild(this.tnode);
    }
    else
    {
     this.tnode.nodeValue = val;
    }
};

// Prepend the child to the list of children
SVGElement.prototype.prependChild = function(mychild)
{
    if (this.svg.firstChild != null)
       this.svg.insertBefore(mychild.svg, this.svg.firstChild);
    else
       this.svg.appendChild(mychild.svg);
    
    this.childNodes.unshift(mychild);
    this.firstChild = this.childNodes[0];
    
    if (mychild)
        mychild.parentNode = this;
};

SVGElement.prototype.appendChild = function(mychild)
{
    this.svg.appendChild(mychild.svg);

    this.childNodes.push(mychild);
    if (this.childNodes.length == 1)
    {
     this.firstChild = mychild;
    }
    this.lastChild = mychild;
    
    if (mychild)
        mychild.parentNode = this;
};

SVGElement.prototype.insertBefore = function(newnode, existingnode)
{
    this.svg.insertBefore(newnode.svg, existingnode.svg);
    
    // Need to find the element in our childNodes list too
    var index = 0;
    for (var i = 0; i < this.childNodes.length; ++i)
    {
        if (this.childNodes[i] == existingnode)
        {
            this.childNodes.splice(i, 0, newnode);
            break;
        }
    }
    this.firstChild = this.childNodes[0];
    
    if (newnode)
        newnode.parentNode = this;
};

SVGElement.prototype.insertAfter = function(newnode, existingnode)
{
    if (existingnode != null && existingnode.svg.nextSibling != null)
       this.svg.insertBefore(newnode.svg, existingnode.svg.nextSibling);
    else
       this.svg.appendChild(newnode.svg);

    this.lastChild = this.childNodes[this.childNodes.length - 1];
};

SVGElement.prototype.removeChild = function(child)
{
    if (child == null)
        return;
        
    this.svg.removeChild(child.svg);

    for (var i = 0; i < this.childNodes.length; ++i)
    {
     	if (this.childNodes[i] == child)
     	{
         	this.childNodes.splice(i, 1);

         	this.firstChild = this.childNodes[0];
         	this.lastChild = this.childNodes[this.childNodes.length - 1];
            child.parentNode = null;

         	break;
     	}
    }
};

SVGElement.prototype.removeChildByIndex = function(childIndex)
{
    if (childIndex < 0 || childIndex >= this.childNodes.length)
        return;
        
    this.childNodes[childIndex].parentNode = null;
    
    this.svg.removeChild(this.childNodes[childIndex].svg);
    this.childNodes.splice(childIndex, 1);
    
    this.firstChild = this.childNodes[0];
    this.lastChild = this.childNodes[this.childNodes.length - 1];
};

SVGElement.prototype.removeChildren = function()
{
    while (this.svg.firstChild)
    {
     	this.svg.removeChild(this.svg.firstChild);
    }
    this.childNodes = [];
    this.firstChild = null;
    this.lastChild = null;
};

SVGElement.prototype.addEventListener = function(eventListener, target, useCapture)
{
    this.svg.addEventListener(eventListener, target, useCapture);
};

function replaceClipPaths(el)
{
	if (el.nodeType != 1)
		return;
	
	// Handle children first
	for (var i = 0; i < el.children.length; i++)
	{
		var testEl = el.children[i];
		var newChild = replaceClipPaths(testEl);
		if (newChild != testEl)
		{
			// Replace child
			el.insertBefore(newChild, testEl);
			el.removeChild(testEl);
		}
	}
	
	// Replace any clipping node and its children with a single rectangle
	if (el.nodeName == "svg" && el.width != null && el.height != null)
	{
		var replacementEl = document.createElementNS(svgns, "rect");
		replacementEl.setAttribute("x", el.getAttribute("x"));
		replacementEl.setAttribute("y", el.getAttribute("y"));
		replacementEl.setAttribute("width", el.getAttribute("width"));
		replacementEl.setAttribute("height", el.getAttribute("height"));
		replacementEl.setAttribute("stroke", "none");
		return replacementEl;		
	}
	
	return el;
}

// Get the bounding box, taking into account svg bounding windows 
SVGElement.prototype.getVisualBBox = function()
{
	var cloneEl = this.svg.cloneNode(true);
	cloneEl = replaceClipPaths(cloneEl);
	
	cloneEl.setAttribute("visibility", "hidden");
    document.documentElement.appendChild(cloneEl);
	var bbox = cloneEl.getBBox();
    document.documentElement.removeChild(cloneEl);
	return bbox;
}

// getBBox, fixing some firefox weirdness
SVGElement.prototype.getBBox = function()
{
    // Firefox won't calculate bounding box unless the node is
    // a part of the rendering tree.  Herein lies a hack to fix that.

    // Is the node connected to the document?
    var rootNode = this.svg;
    while (rootNode.parentNode != null)
       rootNode = rootNode.parentNode;
   
    if (rootNode == document.documentElement)
    {
       // We have a document root, so getBBox will work.
       try
       {
           bbox = this.svg.getBBox();
       }
       catch (err)
       {
           // The bbox couldn't be obtained (possibly because
           // the element had display="none")
           bbox = null;
       }
    }
    else
    {
       // Save its current position
       var nextSibling = this.svg.nextSibling;
       var parent = this.svg.parentNode;
   
       // attach directly to the document.
       document.documentElement.appendChild(this.svg);

       try
       {
           bbox = this.svg.getBBox();
       }
       catch (err)
       {
           // The bbox couldn't be obtained (possibly because
           // the element had display="none")
           bbox = null;
       }
   
       // Return to its proper place
       if (parent)
       {   
           if (nextSibling)
               parent.insertBefore(this.svg, nextSibling);
           else
               parent.appendChild(this.svg);
       }
       else
       {
           document.documentElement.removeChild(this.svg);
       }
    }
   
    return bbox;
};

// A root SVG element that has a clipping bounding box
function SVGRoot(clipBox)
{
	this.clipBox = clipBox;
	
	if (this.clipBox == null)
	{
		this.clipBox = {};
	}
	
	if (this.clipBox.x == null)
	{
		this.clipBox.x = 0;
	}
    
	if (this.clipBox.y == null)
	{
		this.clipBox.y = 0;
	}

	if (this.clipBox.width == null)
	{
		this.clipBox.width = 0;
	}

	if (this.clipBox.height == null)
	{
		this.clipBox.height = 0;
	}
	
	SVGComponent.baseConstructor.call(this, "svg", this.clipBox);
}

KevLinDev.extend(SVGRoot, SVGElement);

SVGRoot.prototype.setPosition = function(x, y)
{
    if (x != null)
	{
       	this.clipBox.x = x;
    	this.setAttribute("x", x);
	}
    
	if (y != null)
    {
   		this.clipBox.y = y;
	    this.setAttribute("y", y);
	}
}

SVGRoot.prototype.setClipRect = function(bbox)
{
	this.clipBox = bbox;
	this.setAttribute("x", this.clipBox.x);
	this.setAttribute("y", this.clipBox.y);
	this.setAttribute("width", this.clipBox.width);
	this.setAttribute("height", this.clipBox.height);
}
// An SVG container (actually a group element). Has focus handling.
function SVGComponent(x, y)
{
    SVGComponent.baseConstructor.call(this, "g");

    this.src = "SVGComponent";
    this.hasFocus = false;
    this.background = null; // background is used for receiving text events

    this.focusListeners = [];
    this.focusManager = null;

    // Component can have several extra sub-components, which are synchronised.
    // The sub-components are *not* attached to the svg group.
    // This allows (for example) a button where the cover is on a 
    // completely different svg group from the rest of the button.
    // This is useful when you need covers not to be covered by other
    // elements, for example.
    this.auxiliaryComponents = []; 
    
    this.scale = 1;
    this.setPosition(x, y);
}

KevLinDev.extend(SVGComponent, SVGElement);

SVGComponent.prototype.addAuxiliaryComponent = function(component)
{
    this.auxiliaryComponents.push(component);
}

SVGComponent.prototype.setPosition = function(x, y)
{
    if (x == null)
        x = 0;

    if (y == null)
        y = 0;

    if (this.parentNode != null && this.parentNode.childConstraints)
    {
        // We are constrained in where we can place this item
        // Find the current width and height, so we can be sure 
        var bbox = this.getBBox();
        if (bbox)
        {
            if (x < this.parentNode.childConstraints.x)
                x = this.parentNode.childConstraints.x;
            else if (x > this.parentNode.childConstraints.x + this.parentNode.childConstraints.width - bbox.width)
                x = this.parentNode.childConstraints.x + this.parentNode.childConstraints.width - bbox.width;
        
            if (y < this.parentNode.childConstraints.y)
                y = this.parentNode.childConstraints.y;
            else if (y > this.parentNode.childConstraints.y + this.parentNode.childConstraints.height - bbox.height)
                y = this.parentNode.childConstraints.y + this.parentNode.childConstraints.height - bbox.height;
        }
    }
    
    this.x = x;
    this.y = y;

    var scaleString = "";
    if (this.scale != 1)
        scaleString = "scale(" + this.scale + ") ";

    this.svg.setAttribute("transform", scaleString + "translate(" + this.x + "," + this.y + ") ");
    
    for (var i = 0; i < this.auxiliaryComponents.length; ++i)
    {
        this.auxiliaryComponents[i].setPosition(x, y);
    }
};

SVGComponent.prototype.setScale = function(scale)
{
    if (scale == null)
        this.scale = 1;
    else
        this.scale = scale;
        
    var scaleString = "";
    if (this.scale != 1)
        scaleString = "scale(" + this.scale + ") ";

    this.svg.setAttribute("transform", scaleString + "translate(" + this.x + "," + this.y + ") ");
    
    for (var i = 0; i < this.auxiliaryComponents.length; ++i)
    {
        this.auxiliaryComponents[i].setScale(scale);
    }
}

// Set the background element that allows us to receive text events
SVGComponent.prototype.setBackground = function(background)
{
    this.background = background;
};

// Let the component know that the focus of its children are
// being managed by a focus manager
SVGComponent.prototype.setFocusManager = function(focusManager)
{
    this.focusManager = focusManager;
};

SVGComponent.prototype.doAction = function(src, evt)
{
    SVGComponent.superClass.doAction.call(this, src, evt);

    if (evt.type == "keypress")
    {
     var charCode = evt.keyCode;
     if (evt.charCode)
     {
         charCode = evt.charCode;
     }
     
     if (charCode == 9 && evt.shiftKey)
     {
         // Go to previous focus in ring
         this.previousFocus();
         evt.preventDefault(); // Don't want browser to do default tab
     }
     else if (charCode == 9)
     {
         // Go to next focus in ring
         this.nextFocus();
         evt.preventDefault(); // Don't want browser to do default tab
     }
    }   
};

// Focus listeners respond to focus change events.  These have
// to be manually triggered by calling tellFocusListeners.

SVGComponent.prototype.setFocus = function()
{
    if (!this.hasFocus)
    {
        if (this.focusManager)
        {
            this.focusManager.setFocus();
        }
     
        if (this.background)
        {
            // We have focus, so listen for text events
            // from the background
            this.background.addActionListener(this);
            this.background.setFocus(this);
        }
     
        this.hasFocus = true;
        this.tellFocusListeners(this);
    }
};

SVGComponent.prototype.loseFocus = function()
{
    if (this.hasFocus)
    {
        if (this.focusManager)
        {
            this.focusManager.loseFocus();
        }
     
        if (this.background)
        {
            // We lost focus, so stop listening for text events
            // from the background
            this.background.removeActionListener(this);
            if (this.background.focus == this)
                this.background.setFocus(null);
        }
     
        this.hasFocus = false;
    }
};

SVGComponent.prototype.setNextFocus = function(nextFocus)
{
    this.nextFocusComponent = nextFocus;
}

SVGComponent.prototype.setPreviousFocus = function(previousFocus)
{
    this.previousFocusComponent = previousFocus;
}

SVGComponent.prototype.nextFocus = function()
{
    this.loseFocus();
    if (this.nextFocusComponent)
    {
     this.nextFocusComponent.setFocus();
    }
}

SVGComponent.prototype.previousFocus = function()
{
    this.loseFocus();
    if (this.previousFocusComponent)
    {
     this.previousFocusComponent.setFocus();
    }
}

SVGComponent.prototype.addFocusListener = function(focusListener)
{
    this.focusListeners.push(focusListener);
};

SVGComponent.prototype.removeFocusListener = function(focusListener)
{
    for (var i = 0; i < this.focusListeners.length; ++i)
    {
     if (this.focusListeners[i] == focusListener)
     {
         this.focusListeners.splice(i, 1);
         break;
     }
    }
};

SVGComponent.prototype.clearFocusListeners = function()
{
    this.focusListeners = new Array();
};

SVGComponent.prototype.tellFocusListeners = function(src)
{
    // Tell the focus listeners
    for (var i = 0; i < this.focusListeners.length; ++i)
    {
     this.focusListeners[i].focusChangeRequest(src);
    }
};

SVGComponent.prototype.focusChangeRequest = function(src)
{
    // There has been a focus request from another component
    if (src != this)
    {
     this.loseFocus();
    }
};

SVGComponent.prototype.toXML = function()
{
    var str = "<base src='" + this.src + "'>";
    for (var i = 0; i < this.actionListeners.length; ++i)
    {
     str += "<listener src='" + this.actionListeners[i].src + "'/>";
    }
    str += "</base>";

    return str;
};

// Convert between named colors and rgb values
var gNamedColorList = {
	aliceblue: [240, 248, 255],
	antiquewhite: [250, 235, 215],
	aqua: [0, 255, 255],
	aquamarine: [127, 255, 212],
	azure: [240, 255, 255],
	beige: [245, 245, 220],
	bisque: [255, 228, 196],
	black: [0, 0, 0],
	blanchedalmond: [255, 235, 205],
	blue: [0, 0, 255],
	blueviolet: [138, 43, 226],
	brown: [165, 42, 42],
	burlywood: [222, 184, 135],
	cadetblue: [95, 158, 160],
	chartreuse: [127, 255, 0],
	chocolate: [210, 105, 30],
	coral: [255, 127, 80],
	cornflowerblue: [100, 149, 237],
	cornsilk: [255, 248, 220],
	crimson: [220, 20, 60],
	cyan: [0, 255, 255],
	darkblue: [0, 0, 139],
	darkcyan: [0, 139, 139],
	darkgoldenrod: [184, 134, 11],
	darkgray: [169, 169, 169],
	darkgreen: [0, 100, 0],
	darkgrey: [169, 169, 169],
	darkkhaki: [189, 183, 107],
	darkmagenta: [139, 0, 139],
	darkolivegreen: [85, 107, 47],
	darkorange: [255, 140, 0],
	darkorchid: [153, 50, 204],
	darkred: [139, 0, 0],
	darksalmon: [233, 150, 122],
	darkseagreen: [143, 188, 143],
	darkslateblue: [72, 61, 139],
	darkslategray: [47, 79, 79],
	darkslategrey: [47, 79, 79],
	darkturquoise: [0, 206, 209],
	darkviolet: [148, 0, 211],
	deeppink: [255, 20, 147],
	deepskyblue: [0, 191, 255],
	dimgray: [105, 105, 105],
	dimgrey: [105, 105, 105],
	dodgerblue: [30, 144, 255],
	firebrick: [178, 34, 34],
	floralwhite: [255, 250, 240],
	forestgreen: [34, 139, 34],
	fuchsia: [255, 0, 255],
	gainsboro: [220, 220, 220],
	ghostwhite: [248, 248, 255],
	gold: [255, 215, 0],
	goldenrod: [218, 165, 32],
	gray: [128, 128, 128],
	grey: [128, 128, 128],
	green: [0, 128, 0],
	greenyellow: [173, 255, 47],
	honeydew: [240, 255, 240],
	hotpink: [255, 105, 180],
	indianred: [205, 92, 92],
	indigo: [75, 0, 130],
	ivory: [255, 255, 240],
	khaki: [240, 230, 140],
	lavender: [230, 230, 250],
	lavenderblush: [255, 240, 245],
	lawngreen: [124, 252, 0],
	lemonchiffon: [255, 250, 205],
	lightblue: [173, 216, 230],
	lightcoral: [240, 128, 128],
	lightcyan: [224, 255, 255],
	lightgoldenrodyellow: [250, 250, 210],
	lightgray: [211, 211, 211],
	lightgreen: [144, 238, 144],
	lightgrey: [211, 211, 211],
	lightpink: [255, 182, 193],
	lightsalmon: [255, 160, 122],
	lightseagreen: [32, 178, 170],
	lightskyblue: [135, 206, 250],
	lightslategray: [119, 136, 153],
	lightslategrey: [119, 136, 153],
	lightsteelblue: [176, 196, 222],
	lightyellow: [255, 255, 224],
	lime: [0, 255, 0],
	limegreen: [50, 205, 50],
	linen: [250, 240, 230],
	magenta: [255, 0, 255],
	maroon: [128, 0, 0],
	mediumaquamarine: [102, 205, 170],
	mediumblue: [0, 0, 205],
	mediumorchid: [186, 85, 211],
	mediumpurple: [147, 112, 219],
	mediumseagreen: [60, 179, 113],
	mediumslateblue: [123, 104, 238],
	mediumspringgreen: [0, 250, 154],
	mediumturquoise: [72, 209, 204],
	mediumvioletred: [199, 21, 133],
	midnightblue: [25, 25, 112],
	mintcream: [245, 255, 250],
	mistyrose: [255, 228, 225],
	moccasin: [255, 228, 181],
	navajowhite: [255, 222, 173],
	navy: [0, 0, 128],
	oldlace: [253, 245, 230],
	olive: [128, 128, 0],
	olivedrab: [107, 142, 35],
	orange: [255, 165, 0],
	orangered: [255, 69, 0],
	orchid: [218, 112, 214],
	palegoldenrod: [238, 232, 170],
	palegreen: [152, 251, 152],
	paleturquoise: [175, 238, 238],
	palevioletred: [219, 112, 147],
	papayawhip: [255, 239, 213],
	peachpuff: [255, 218, 185],
	peru: [205, 133, 63],
	pink: [255, 192, 203],
	plum: [221, 160, 221],
	powderblue: [176, 224, 230],
	purple: [128, 0, 128],
	red: [255, 0, 0],
	rosybrown: [188, 143, 143],
	royalblue: [65, 105, 225],
	saddlebrown: [139, 69, 19],
	salmon: [250, 128, 114],
	sandybrown: [244, 164, 96],
	seagreen: [46, 139, 87],
	seashell: [255, 245, 238],
	sienna: [160, 82, 45],
	silver: [192, 192, 192],
	skyblue: [135, 206, 235],
	slateblue: [106, 90, 205],
	slategray: [112, 128, 144],
	slategrey: [112, 128, 144],
	snow: [255, 250, 250],
	springgreen: [0, 255, 127],
	steelblue: [70, 130, 180],
	tan: [210, 180, 140],
	teal: [0, 128, 128],
	thistle: [216, 191, 216],
	tomato: [255, 99, 71],
	turquoise: [64, 224, 208],
	violet: [238, 130, 238],
	wheat: [245, 222, 179],
	white: [255, 255, 255],
	whitesmoke: [245, 245, 245],
	yellow: [255, 255, 0],
	yellowgreen: [154, 205, 50]
	};

// Search through the specified node and its children, and multiply fill and/or stroke by level.
// svgNode - the root node from which to change the levels
// level   - light level to set, consisting of {r:red_level, g:green_level, b:blue_level}
//           Each level should be a number between 0 and 2, where 0 is all black, 2 is all white, and 1 is normal.
// groupId - Set this when you're setting multiple different light levels in the same doc. 
//           Each separate lit group should be given a different groupId. This is so that
//           gradients and patterns get cloned properly.
function setLightLevel(svgNode, level, groupId)
{
	adjustAttribute("fill", svgNode, level, groupId);
	adjustAttribute("stroke", svgNode, level, groupId);
	adjustAttribute("stop-color", svgNode, level, groupId);
	
	if (svgNode.nodeName == "linearGradient" || svgNode.nodeName == "radialGradient")
	{
		// linearGradient and radialGradient can have links to the stops they use.
		var refId = svgNode.getAttributeNS(xlinkns, "href");
		if (refId != null && refId != "")
		{
			var nextInChain = null;
			
			var origRefId = svgNode.getAttribute(groupId + "orig_href");
			if (origRefId == null)
			{
				// Okay, there's no saved ref. 
				// We need to clone it, give it a new id, update this ref, and modify the clone.
				svgNode.setAttributeNS(xlinkns, groupId + "orig_href", refId);

				var currId = refId.substring(1); // knock off the "#"
				var refEl = document.getElementById(currId);

				if (refEl != null)
				{
					// No copy of the referenced element - create one.
					cloneEl = refEl.cloneNode(true);
					
					var newId = groupId + "copy_" + currId;

					// Update the id of the clone and the reference to it.
					cloneEl.setAttribute("id", newId);
					svgNode.setAttributeNS(xlinkns, "href", "#" + newId);

					nextInChain = cloneEl;

					// Put into DOM just before the referencing element.
					refEl.parentElement.insertBefore(cloneEl, refEl);
				}
			}
			else
			{
				nextInChain = document.getElementById(refId.substring(1));
			}
			
			// Repeat this process until we get to actual stop-colors
			setLightLevel(nextInChain, level, groupId);
		}
	}
	
	var currStyle = svgNode.getAttribute("style");
	if (currStyle != null)
	{
		var origStyle = svgNode.getAttribute(groupId + "orig_style");
		if (origStyle != null)
		{
			currStyle = origStyle;
		}

		var styleArr = currStyle.split(";");
		
		// find any stroke or fill
		var isModified = false;
		for (var i = 0; i < styleArr.length; ++i)
		{
			var currStyleEl = styleArr[i].split(":");
			var currStyleElName = currStyleEl[0].replace(/\s+/g, "").toLowerCase();
			if (currStyleElName == "fill" || currStyleElName == "stroke" || currStyleElName == "stop-color")
			{
				currStyleElValue = adjustLightLevel(currStyleEl[1], level, groupId);
				styleArr[i] = currStyleElName + ":" + currStyleElValue;
				isModified = true;
			}
		}

		if (isModified)
		{
			svgNode.setAttribute(groupId + "orig_style", currStyle);

			var newStyle = "";
			for (var i = 0; i < styleArr.length; ++i)
			{
				newStyle += styleArr[i] + ";"
			}
			svgNode.setAttribute("style", newStyle);
		}
		
	}

	for (var i = 0; i < svgNode.children.length; ++i)
	{
		setLightLevel(svgNode.children[i], level, groupId);
	}
}

function adjustAttribute(attr, svgNode, level, groupId)
{
	var currAttr = svgNode.getAttribute(attr);
	if (currAttr != null && currAttr != "none")
	{
		var origAttr = svgNode.getAttribute(groupId + "orig_" + attr);
		if (origAttr == null)
		{
			svgNode.setAttribute(groupId + "orig_" + attr, currAttr);
		}
		else
		{
			currAttr = origAttr;
		}
		currAttr = adjustLightLevel(currAttr, level, groupId);
		svgNode.setAttribute(attr, currAttr);
	}
}

function adjustLightLevel(currColor, level, groupId)
{
	// remove whitespace
	currColor = currColor.replace(/\s+/g, "");
	
	if (currColor == "none")
		return currColor;
	
	// There are three valid forms: named colour, #hex, and rgb(r,g,b)
	var red = 0;
	var green = 0;
	var blue = 0;

	if (currColor[0] == '#')
	{
		if (currColor.length == 4)
		{
			// #rgb - each hex digit h needs to be converted into hh
			red = parseInt(currColor[1], 16) * 17;
			green = parseInt(currColor[2], 16) * 17;
			blue = parseInt(currColor[3], 16) * 17;
		}
		else if (currColor.length == 7)
		{
			red = parseInt(currColor.substr(1, 2), 16);
			green = parseInt(currColor.substr(3, 2), 16);
			blue = parseInt(currColor.substr(5, 2), 16);
		}
	}
	else if (currColor.toLowerCase().indexOf("rgb(") == 0)
	{
		var split = currColor.split(",");
		red = parseInt(split[0].substr(4));
		green = parseInt(split[1]);
		blue = parseInt(split[2]);
	}
	else if (currColor.toLowerCase().indexOf("url(#") == 0)
	{
		// Ah. A gradient or pattern. 
		// We need to clone it, give it a new id, update this ref, and modify the clone.
		var currId = currColor.substring(5, currColor.length - 1);
		var refEl = document.getElementById(currId);
		
		// See if there's already a copy of this referenced element
		var newId = groupId + "copy_" + currId;
		var cloneEl = document.getElementById(newId);
		if (cloneEl == null)
		{
			// No copy of the referenced element - create one.
			cloneEl = refEl.cloneNode(true);
			
			// Update the id of the clone
			cloneEl.setAttribute("id", newId);
			
			// Put into DOM just before the referencing element.
			refEl.parentElement.insertBefore(cloneEl, refEl);
		}
		
		setLightLevel(cloneEl, level, groupId);
		
		return "url(#" + newId + ")";
	}
	else
	{
		// See if it's a named color
		result = gNamedColorList[currColor.toLowerCase()];
		if (result != null)
		{
			red = result[0];
			green = result[1];
			blue = result[2];
		}
	}
	
	if (level.r != null && level.r >= 0.0 && level.r <= 2.0)
	{
		if (level.r <= 1.0)
			red = Math.floor(red * level.r);
		else 
			red = Math.floor(red + (255 - red) * (level.r - 1.0));
	}
	
	if (level.g != null && level.g >= 0.0 && level.g <= 2.0)
	{
		if (level.g <= 1.0)
			green = Math.floor(green * level.g);
		else 
			green = Math.floor(green + (255 - green) * (level.g - 1.0));
	}
	
	if (level.b != null && level.b >= 0.0 && level.b <= 2.0)
	{
		if (level.b <= 1.0)
			blue = Math.floor(blue * level.b);
		else 
			blue = Math.floor(blue + (255 - blue) * (level.b - 1.0));
	}
	
	return "rgb(" + red + "," + green + "," + blue + ")";
}

// SimpleButton.js
// Defines a (fairly) simple button
// states is a list of attributes to be applied to the cover whenever the
// appropriate state is reached.
// states are:
// normal
// focus (default value is normal)
// over (default value is normal)
// select (default value is normal)
// disable (default value is normal)
// eg. states = {normal:{stroke:"white"}, focus:{stroke:"red"}}

function SimpleButton(src, coverType, coverAttributes, x, y, states)
{
    SimpleButton.baseConstructor.call(this, x, y);

    // Button ID passed to the doAction when event happens
    this.src = src;

    // Set up the button states
    this.states = states;
    if (this.states == null)
     this.states = {};
     
    if (this.states.focus == null)
     this.states.focus = this.states.normal;
     
    if (this.states.over == null)
     this.states.over = this.states.normal;

    if (this.states.select == null)
     this.states.select = this.states.normal;

    if (this.states.disable == null)
     this.states.disable = this.states.normal;

    // visible part of cover
    this.svg_border = new SVGElement(coverType, coverAttributes);
    this.svg_border.addAttributes(this.states.normal);
    this.appendChild(this.svg_border);

    // Cover
    this.svg_buttonCover = new SVGElement(coverType, coverAttributes);
    this.svg_buttonCover.addAttributes({fill:"white", "fill-opacity":0, stroke:"none"});
    this.svg_buttonCover.addEventListener("click", this, false);
    this.svg_buttonCover.addEventListener("mouseover", this, false);
    this.svg_buttonCover.addEventListener("mouseout", this, false);
    this.svg_buttonCover.addEventListener("mouseup", this, false);
    this.svg_buttonCover.addEventListener("mousedown", this, false);
    this.appendChild(this.svg_buttonCover);

    this.isAble = true; // The button is active
    this.doToggle = false; // Doesn't toggle by default
    this.toggleState = false;

    // Set up action listener so the mouseover and mouseout are shown.
    this.addActionListener(this);
}

KevLinDev.extend(SimpleButton, SVGComponent);

SimpleButton.prototype.addSVG = function(type, attributes, text)
{
    var newNode = new SVGElement(type, attributes, text);
    this.appendChild(newNode);

    this.liftButtonCover();

    return newNode;
};

// Make sure the cover is on top.
SimpleButton.prototype.liftButtonCover = function()
{
    this.appendChild(this.svg_buttonCover);
};

SimpleButton.prototype.doAction = function(src, evt)
{
    SimpleButton.superClass.doAction.call(this, this, evt);

    if (this.isAble)
    {
     if (!this.hasFocus)
     {
         if (evt.type == "mouseover")
         {
             this.svg_border.addAttributes(this.states.over);
         }
         else if (evt.type == "mouseout")
         {
             if (this.doToggle && this.toggleState == true)
             {
                 this.svg_border.addAttributes(this.states.select);
             }
             else
             {
                 this.svg_border.addAttributes(this.states.normal);
             }
         }
         else if (evt.type == "mousedown")
         {
             if (this.doToggle)
             {
                 // Toggle means that it stays in "select"
                 // state until clicked again
                 this.toggleState = !this.toggleState;

                 if (this.toggleState == true)
                 {                        
                     this.svg_border.addAttributes(this.states.select);
                 }
                 else
                 {
                     this.svg_border.addAttributes(this.states.normal);
                 }
                 
             }
             else
             {
                 this.svg_border.addAttributes(this.states.select);
             }
         }
         else if (evt.type == "mouseup" && !this.doToggle)
         {
             this.svg_border.addAttributes(this.states.normal);
         }
     }
     else if (evt.type == "keypress")
     {
         var charCode = evt.keyCode;
         if (evt.charCode)
         {
             charCode = evt.charCode;
         }
         if (charCode == 10 || charCode == 13)
         {
             // Enter key
             this.loseFocus();
             this.tellActionListeners(this, evt);
         }
     }
    }
};

SimpleButton.prototype.setAble = function(isAble)
{
    // Set whether this button is active or not
    if (isAble)
    {
     this.isAble = true;
     this.svg_border.addAttributes(this.states.normal);
     this.svg_buttonCover.show();
    }
    else
    {
     this.isAble = false;
     this.svg_buttonCover.hide();
     this.svg_border.addAttributes(this.states.disable);
    }
};

SimpleButton.prototype.setFocus = function()
{
    if (!this.hasFocus)
    {   
     this.svg_border.addAttributes(this.states.focus);
    }

    SimpleButton.superClass.setFocus.call(this);    
};

SimpleButton.prototype.loseFocus = function()
{
    if (this.hasFocus)
    {
     this.svg_border.addAttributes(this.states.normal);
    }

    SimpleButton.superClass.loseFocus.call(this);    
};

SimpleButton.prototype.setToggle = function(doToggle)
{
    this.doToggle = doToggle;
}

SimpleButton.prototype.setSelected = function(isSelected)
{
    // Set whether this button is selected or not
    if (isSelected)
    {
        this.svg_border.addAttributes(this.states.select);
        if (this.doToggle)
            this.toggleState = true;
    }
    else
    {
        this.svg_border.addAttributes(this.states.normal);
        if (this.doToggle)
            this.toggleState = false;
    }
}

// ParamButton.js
// Defines a (fairly) simple paramaterisable button

function ParamButton(src, x, y, bgElement, mouseoverElement, selectElement, coverElement, doSeparateCoverLayer)
{
    ParamButton.baseConstructor.call(this, x, y);

    // Button ID passed to the doAction when event happens
    this.src = src;

    this.svg_bg = bgElement;
    this.appendChild(this.svg_bg);

    this.svg_contents = null;
   
    this.svg_mouseover = mouseoverElement;
    this.svg_mouseover.hide();
    this.appendChild(this.svg_mouseover);

    this.svg_select = selectElement;
    this.svg_select.hide();
    this.appendChild(this.svg_select);

    this.doSeparateCoverLayer = doSeparateCoverLayer;
        
    this.svg_cover = coverElement;
    this.svg_cover.addEventListener("click", this, false);
    this.svg_cover.addEventListener("mouseover", this, false);
    this.svg_cover.addEventListener("mouseout", this, false);
    this.svg_cover.addEventListener("mouseup", this, false);
    this.svg_cover.addEventListener("mousedown", this, false);
    
    if (this.doSeparateCoverLayer)
    {
        var newGroup = new SVGComponent(x, y);
        newGroup.appendChild(this.svg_cover);
        this.addAuxiliaryComponent(newGroup);
    }
    else
    {
        this.appendChild(this.svg_cover);
    }
        
    this.isAble = true; // The button is active
    this.doToggle = false; // Doesn't toggle by default
    this.toggleState = false;

    // Set up action listener so the mouseover and mouseout are shown.
    this.addActionListener(this);
}

KevLinDev.extend(ParamButton, SVGComponent);

ParamButton.prototype.doAction = function(src, evt)
{
    ParamButton.superClass.doAction.call(this, this, evt);

    if (this.isAble)
    {
     if (evt.type == "mouseover")
     {
         this.svg_mouseover.show();
     }
     else if (evt.type == "mouseout")
     {
         this.svg_mouseover.hide();

         if (this.toggleState == false)
         {                        
             this.svg_select.hide();
         }
     }
     else if (evt.type == "mousedown")
     {
         if (this.doToggle)
         {
             // Toggle means that it stays in "select"
             // state until clicked again
             this.toggleState = !this.toggleState;

             if (this.toggleState == true)
             {                        
                 this.svg_select.show();
             }
             else
             {
                 this.svg_select.hide();
             }
             
         }
         else
         {
             this.svg_select.show();
         }
     }
     else if (evt.type == "mouseup" && !this.doToggle)
     {
         this.svg_select.hide();
     }
    }
};

ParamButton.prototype.setAble = function(isAble)
{
    // Set whether this button is active or not
    if (isAble)
    {
     this.isAble = true;
     this.svg_cover.show();
    }
    else
    {
     this.isAble = false;
     this.svg_cover.hide();
    }
};

ParamButton.prototype.setSelected = function(isSelected)
{
    // Set whether this button is selected or not
    if (isSelected)
    {
       this.svg_select.show();
       if (this.doToggle)
           this.toggleState = true;
    }
    else
    {
       this.svg_select.hide();
       if (this.doToggle)
           this.toggleState = false;
    }
}

ParamButton.prototype.setToggle = function(doToggle)
{
    this.doToggle = doToggle;
}

ParamButton.prototype.setContents = function(contents)
{
    // Remove the existing contents
    if (this.svg_contents != null)
       this.removeChild(this.svg_contents);
   
    // Put the contents underneath all the visual modifier elements    
    if (contents != null)
       this.insertBefore(contents, this.svg_mouseover);
   
    this.svg_contents = contents;
}

// ParamButton2.js
// Defines a parameterisable button
// params can have the following members:
// 	x - x-position (default: 0)
// 	y - y-position (default: 0)
//  width - width of this button. 
//  height - height of this button.
//          If width or height are not defined, the width and height are adjusted to the contents size. 
//          If either is defined, the contents are scaled to fit instead.
//  normalElements - button appearance in non-selected state, as a set of buttonElements
//  selectedElements - button appearance in selected state, as a set of buttonElements
//  doSeparateCoverLayer - true/false (puts the cover into a separate layer)
//
// where:
// buttonElements: {normal, mouseover, disabled, cover} - they all share the cover
function ParamButton2(src, params)
{
    this.params = params;
    var x = 0;
    var y = 0;
    if (params.x)
        x = params.x;
    if (params.y)
        y = params.y;
    ParamButton.baseConstructor.call(this, x, y);
    
	// Default normal apperance
	if (this.params.normalElements == null)
	{
		this.params.normalElements = {};
		this.params.normalElements.normal = new SVGElement("rect", {width:10, height:10, rx:2, stroke:"black", fill:"none"});
	}

	if (this.params.selectedElements == null)
	{
		this.params.selectedElements = {};
	}
	
    if (params.width != null || params.height != null)
    {
        // Need to scale all the components
        for (var i in this.params.normalElements)
        {
            if (this.params.normalElements[i] != null)
                this.params.normalElements[i] = new ScaledComponent(0, 0, this.params.normalElements[i], this.params.width, this.params.height);
        }

        for (var i in this.params.selectedElements)
        {
            if (this.params.selectedElements[i] != null)
                this.params.selectedElements[i] = new ScaledComponent(0, 0, this.params.selectedElements[i], this.params.width, this.params.height);
        }
    }

    // Button ID passed to the doAction when event happens
    this.src = src;
    
    // things that affect appearance of the button
    this.isSelected = false;
    this.isDisabled = false;
    this.doToggle = false;

    // At any given time, button has two parts - appearance and cover.
    this.appearance = null;
    this.updateAppearance();

    this.cover = null;
    this.updateCover();
            
    this.addActionListener(this);
    
    if (this.params.normalElements && this.params.normalElements.cover)
    {
        this.params.normalElements.cover.svg.addEventListener("click", this, false);
        this.params.normalElements.cover.svg.addEventListener("mouseover", this, false);
        this.params.normalElements.cover.svg.addEventListener("mouseout", this, false);
        this.params.normalElements.cover.svg.addEventListener("mouseup", this, false);
        this.params.normalElements.cover.svg.addEventListener("mousedown", this, false);
    }

    if (this.params.selectedElements && this.params.selectedElements.cover)
    {
        this.params.selectedElements.cover.svg.addEventListener("click", this, false);
        this.params.selectedElements.cover.svg.addEventListener("mouseover", this, false);
        this.params.selectedElements.cover.svg.addEventListener("mouseout", this, false);
        this.params.selectedElements.cover.svg.addEventListener("mouseup", this, false);
        this.params.selectedElements.cover.svg.addEventListener("mousedown", this, false);
    }    
}

KevLinDev.extend(ParamButton2, SVGComponent);

ParamButton2.prototype.updateCover = function()
{
    var newCover = this.isSelected ? this.params.selectedElements.cover : this.params.normalElements.cover;
    
    if (newCover == this.cover)
        return;
    
    // Remove the old cover
    if (this.cover)
        this.cover.detach();

    if (!newCover)
        return;
        
    if (this.doSeparateCoverLayer)
    {
        this.cover = new SVGComponent(x, y);
        this.cover.appendChild(newCover);
        this.addAuxiliaryComponent(this.cover);
    }
    else
    {
        this.cover = newCover;
        this.appendChild(this.cover);
    }
}


ParamButton2.prototype.updateAppearance = function()
{
    var params = this.isSelected ? this.params.selectedElements : this.params.normalElements;
    
    if (!params)
        return;

    var state = this.isDisabled ? "disabled" : (this.isMouseover ? "mouseover" : "normal");
        
    var newAppearance = null;
    if (params[state])
        newAppearance = params[state];
    
    // If there's no appearance for the state, default to normal
    if (!newAppearance && params.normal)
        newAppearance = params.normal;
        
    if (newAppearance == this.appearance)
        return;
    
    // Remove the old appearance
    if (newAppearance != null)
	{
        if (this.appearance != null)
			this.appearance.detach();
    	
		this.appearance = newAppearance;
    	this.prependChild(this.appearance);
	}
}

ParamButton2.prototype.doAction = function(src, evt)
{
    ParamButton2.superClass.doAction.call(this, this, evt);

    if (!this.isDisabled)
    {
        if (evt.type == "mouseover")
        {
            this.isMouseover = true;
        }
        else if (evt.type == "mouseout")
        {
            this.isMouseover = false;
        }
        else if (evt.type == "mousedown")
        {
            if (this.doToggle)
            {
                this.isSelected = !this.isSelected;
            }
            else
            {
                this.isSelected = true;
            }
        }
        else if (evt.type == "mouseup")
        {
            //this.isSelected = false;
        }

        this.updateAppearance();
    }
};

ParamButton2.prototype.setAble = function(isAble)
{
    // Set whether this button is active or not
    this.isDisabled = !isAble;
    this.updateAppearance();
};

ParamButton2.prototype.setSelected = function(isSelected)
{
    // Set whether this button is selected or not
    this.isSelected = isSelected;
    this.updateAppearance();
};

ParamButton2.prototype.setToggle = function(doToggle)
{
    this.doToggle = doToggle;
}

function getParamButtonIdSet(idGroupName)
{
    return {x:0, y:0, 
		normalElements: {
			normal:cloneElementById(document, idGroupName + "Normal"), 
			mouseover:cloneElementById(document, idGroupName + "NormalOver"),
			cover:cloneElementById(document, idGroupName + "Cover")}, 
		selectedElements: {
			normal:cloneElementById(document, idGroupName + "Selected"), 
			mouseover:cloneElementById(document, idGroupName + "SelectedOver"),
			cover:cloneElementById(document, idGroupName + "Cover")
			}
		};
}

function makeSimpleCheckboxParamButtonIdSet()
{
	var normalButton = new SVGElement("rect", {width:10, height:10, rx:2, stroke:"black", fill:"none"});
	var normalMouseoverButton = new SVGElement("rect", {width:10, height:10, rx:2, stroke:"red", fill:"none"});
	var normalCoverButton = new SVGElement("rect", {width:10, height:10, rx:2, stroke:"none", fill:"white", opacity:0});

	var selectedButton = new SVGElement("g");
	selectedButton.appendChild(new SVGElement("rect", {width:10, height:10, rx:2, stroke:"black", fill:"none"}));
	selectedButton.appendChild(new SVGElement("path", {d:"M2,2L8,8M8,2L2,8", stroke:"black", fill:"black"}));
	var selectedMouseoverButton = new SVGElement("g");
	selectedMouseoverButton.appendChild(new SVGElement("rect", {width:10, height:10, rx:2, stroke:"red", fill:"none"}));
	selectedMouseoverButton.appendChild(new SVGElement("path", {d:"M2,2L8,8M8,2L2,8", stroke:"red", fill:"none"}));
	var selectedCoverButton = new SVGElement("rect", {width:10, height:10, rx:2, stroke:"none", fill:"white", opacity:0});
	
    return {x:0, y:0, 
		normalElements: {
			normal:normalButton, 
			mouseover:normalMouseoverButton,
			cover:normalCoverButton},
		selectedElements: {
			normal:selectedButton, 
			mouseover:selectedMouseoverButton,
			cover:selectedCoverButton
			}
		};
}

// Radio button group ensures only one button can be in "selected" state.
function RadioButtonGroup()
{
    this.buttons = [];
    this.currentSelection = null;
}

RadioButtonGroup.prototype.addButton = function(button)
{
    this.buttons.push(button);
    button.addActionListener(this);
}

RadioButtonGroup.prototype.doAction = function(src, evt)
{
    if (evt.type == "mousedown")
    {
        this.setSelected(src);
    }
}

RadioButtonGroup.prototype.setSelected = function(src)
{
    this.currentSelection = src;
    src.setSelected(true);
    
    // Unselect all the other buttons
    for (var i in this.buttons)
    {
        if (this.buttons[i] != src)
        {
            this.buttons[i].setSelected(false);
        }
    }
}

// Scales the component to fit into the specified width and height.
function ScaledComponent(x, y, contents, width, height)
{
    ScaledComponent.baseConstructor.call(this, x, y);
    this.width = width;
    this.height = height;
    
    this.contentElement = new SVGComponent(0, 0);
    this.appendChild(this.contentElement);
    this.setContents(contents);
}

KevLinDev.extend(ScaledComponent, SVGComponent);

ScaledComponent.prototype.setContents = function(contents)
{
	this.contents = contents;
 	this.contentElement.removeChildren();

	if (this.contents != null)
	{
		this.contentElement.appendChild(contents);
	}
	
	this.refreshLayout();
}

ScaledComponent.prototype.notifyResize = function(src)
{
    ScaledComponent.superClass.notifyResize.call(this, src);
	this.refreshLayout();
}

ScaledComponent.prototype.refreshLayout = function()
{
	if (this.contents == null)
		return;
		
    var bbox = this.contents.getBBox();
    this.contentElement.setPosition(-bbox.x, -bbox.y);
    
    // Fit the contents into the rectangle
    if (this.width == null && this.height == null)
    {
        // Nothing to do.
    }
    else if (this.width == null)
    {
        // User specified the height only        
        var scale = 1;
        if (bbox.height > 0)
            scale = this.height / bbox.height;
        
        this.contentElement.setScale(scale);
    }
    else if (this.height == null)
    {
        // User specified the width only
        var scale = 1;
        if (bbox.width > 0)
            scale = this.width / bbox.width;
        
        this.contentElement.setScale(scale);
    }
    else
    {
        // User specified both height and width
        var scale = 1;
        if (bbox.width > 0 && bbox.height > 0)
            scale = Math.min(this.width / bbox.width, this.height / bbox.height);
        
        this.contentElement.setScale(scale);
    }

	this.tellResizeListeners(this);
}

// A container that automatically fits a rectangle with the required border width
// and attributes around the contents.
function RectLabel(x, y, contents, rectAttributes, borderWidth)
{
    RectLabel.baseConstructor.call(this, x, y);
	this.rectAttributes = rectAttributes;
	this.borderWidth = borderWidth;
	if (this.borderWidth == null)
		this.borderWidth = 0;

	this.contentElement = new SVGComponent(0, 0);
    this.contentHolder = new SVGComponent(borderWidth, borderWidth);
    this.contentHolder.appendChild(this.contentElement);
    
   	this.isWidthSpecified = (this.rectAttributes.width != null);
   	this.isHeightSpecified = (this.rectAttributes.height != null);

    // Create the background rectangle
    this.bgRect = new SVGElement("rect", this.rectAttributes);
    
    this.appendChild(this.bgRect);
    this.appendChild(this.contentHolder);

	this.setContents(contents);
}

KevLinDev.extend(RectLabel, SVGComponent);

RectLabel.prototype.setContents = function(contents)
{
	this.contents = contents;
 	this.contentElement.removeChildren();

	if (this.contents != null)
	{
		this.contentElement.appendChild(contents);
	}
	
	this.refreshLayout();
}

RectLabel.prototype.notifyResize = function(src)
{
    RectLabel.superClass.notifyResize.call(this, src);
	this.refreshLayout();
}

RectLabel.prototype.refreshLayout = function()
{
    var bbox = null;
    
    if (this.bgRect == null)
        return;
   
    if (this.contents == null)
    {
       // Just refresh according to the specified width and height
       this.bgRect.setAttribute("width", this.rectAttributes.width);
       this.bgRect.setAttribute("height", this.rectAttributes.height);
       return;
    }

    bbox = this.contents.getBBox();
    this.contentElement.setPosition(-bbox.x, -bbox.y);
    
    // Fit the contents into the rectangle
    if (!this.isWidthSpecified && !this.isHeightSpecified)
    {
        this.rectAttributes.width = bbox.width + this.borderWidth * 2;
        this.rectAttributes.height = bbox.height + this.borderWidth * 2;

		this.bgRect.setAttribute("width", this.rectAttributes.width);
		this.bgRect.setAttribute("height", this.rectAttributes.height);
    }
    else if (!this.isWidthSpecified)
    {
        // User specified the height only
        
        var contentsHeight = this.rectAttributes.height - this.borderWidth * 2;
        if (contentsHeight <= this.borderWidth)
            contentsHeight = this.borderWidth;
        
        var scale = 1;
        if (bbox.height > 0)
            scale = contentsHeight / bbox.height;
        
        this.contentElement.setScale(scale);
        this.rectAttributes.width = bbox.width * scale + this.borderWidth * 2;
		this.bgRect.setAttribute("width", this.rectAttributes.width);

        // Set height anyway, in case it's been manually changed
		this.bgRect.setAttribute("height", this.rectAttributes.height);
    }
    else if (!this.isHeightSpecified)
    {
        // User specified the width only

        var contentsWidth = this.rectAttributes.width - this.borderWidth * 2;
        if (contentsWidth <= this.borderWidth)
            contentsWidth = this.borderWidth;
        
        var scale = 1;
        if (bbox.width > 0)
            scale = contentsWidth / bbox.width;
        
        this.contentElement.setScale(scale);
        this.rectAttributes.height = bbox.height * scale + this.borderWidth * 2;
		this.bgRect.setAttribute("height", this.rectAttributes.height);
		
		// Set width anyway, in case it's been manually changed
		this.bgRect.setAttribute("width", this.rectAttributes.width);
    }
    else
    {
        // User specified both height and width

        var contentsHeight = this.rectAttributes.height - this.borderWidth * 2;
        if (contentsHeight <= this.borderWidth)
            contentsHeight = this.borderWidth;
        
        var contentsWidth = this.rectAttributes.width - this.borderWidth * 2;
        if (contentsWidth <= this.borderWidth)
            contentsWidth = this.borderWidth;

        var scale = 1;
        if (bbox.height > 0 && bbox.width > 0)
            scale = Math.min(contentsHeight / bbox.height, contentsWidth / bbox.width);

        var xAdjust = (contentsWidth - scale * bbox.width) / 2;
        var yAdjust = (contentsHeight - scale * bbox.height) / 2;

        this.contentElement.setScale(scale);
        this.contentHolder.setPosition(this.borderWidth + xAdjust, this.borderWidth + yAdjust);

		// Set height and width anyway, in case they've been manually changed
		this.bgRect.setAttribute("width", this.rectAttributes.width);
		this.bgRect.setAttribute("height", this.rectAttributes.height);
    }

	this.tellResizeListeners(this);
}

// RectButton puts a rect with rectAttrs around the bgElement's
// bounding box, with borderWidth clearance on each side.
// If width and/or height are specified in rectAttributes, it will
// scale the contents to fit into the specified rectangle.
function RectButton(src, x, y, contents, rectAttributes, mouseoverAttributes, selectAttributes, borderWidth, doSeparateCoverLayer)
{
	this.mouseoverAttributes = mouseoverAttributes;
	this.selectAttributes = selectAttributes;
	
    this.bgElement = new RectLabel(0, 0, contents, rectAttributes, borderWidth);
 
    this.mouseoverElement = new SVGElement("rect");
    this.selectElement = new SVGElement("rect");
    this.coverElement = new SVGElement("rect");

	this.setContents(contents);

    RectButton.baseConstructor.call(this, src, x, y, this.bgElement, this.mouseoverElement, this.selectElement, this.coverElement, doSeparateCoverLayer);
}

KevLinDev.extend(RectButton, ParamButton);

RectButton.prototype.setContents = function(contents)
{
    this.bgElement.setContents(contents);
    this.refreshLayout();
}

RectButton.prototype.refreshLayout = function()
{
    this.bgElement.refreshLayout();

    this.mouseoverElement.setAttribute("width", this.bgElement.rectAttributes.width);
    this.mouseoverElement.setAttribute("height", this.bgElement.rectAttributes.height);
    this.mouseoverElement.setAttribute("opacity", 0.3);
    for (var i in this.mouseoverAttributes)
    {
        this.mouseoverElement.setAttribute(i, this.mouseoverAttributes[i]);
    }
    
    this.selectElement.setAttribute("width", this.bgElement.rectAttributes.width);
    this.selectElement.setAttribute("height", this.bgElement.rectAttributes.height);
    this.selectElement.setAttribute("opacity", 0.3);
    for (var i in this.selectAttributes)
    {
        this.selectElement.setAttribute(i, this.selectAttributes[i]);
    }
    
    this.coverElement.setAttribute("width", this.bgElement.rectAttributes.width);
    this.coverElement.setAttribute("height", this.bgElement.rectAttributes.height);
    this.coverElement.setAttribute("opacity", 0);
}

function Background()
{
    Background.baseConstructor.call(this);
    this.src = "Background";
    this.focus = null;
}

KevLinDev.extend(Background, ActionObject);

Background.prototype.setFocus = function(item)
{
    this.focus = item;
}

Background.prototype.addActionListener = function(actionListener)
{
    if (this.actionListeners.length == 0)
    {
       // Only do this listening if it's absolutely required - it's
       // on the root node, so it catches everything.
       document.documentElement.addEventListener("keypress", this, false);
       document.documentElement.addEventListener("click", this, false);
    }

    Background.superClass.addActionListener.call(this, actionListener);   
};

Background.prototype.removeActionListener = function(actionListener)
{
    Background.superClass.removeActionListener.call(this, actionListener);   

    if (this.actionListeners.length == 0)
    {
       document.documentElement.removeEventListener("keypress", this, false);
       document.documentElement.removeEventListener("click", this, false);
    }
};

Background.prototype.clearActionListeners = function()
{
    Background.superClass.clearActionListeners.call(this);   

    document.documentElement.removeEventListener("keypress", this, false);
    document.documentElement.removeEventListener("click", this, false);
};

Background.prototype.doAction = function(src, evt)
{
    evt.focus = this.focus;
    this.tellActionListeners(src, evt);
};

// TODO: Use TextLabel for layout
function TextArea(src, background, rectParams, textParams, x, y, states)
{
    TextArea.baseConstructor.call(this, src, "rect", rectParams, x, y, states);

    // Button ID passed to the doAction when event happens
    this.src = src;
    
    this.setBackground(background);
    this.textVal = "";
    this.secretVal = "";
    
    var params = {x:0, y:0};    
    if (rectParams.width != null)
    {
        params.width = rectParams.width;
        this.textBoxWidth = params.width;
    }
    if (rectParams.height != null)
    {
        params.height = rectParams.height;
    }
    
    // The textBox clips the text
    this.textBox = new SVGElement("svg", params);
    this.appendChild(this.textBox);
    this.textNodeHolder = new SVGElement("g");
    this.textBox.appendChild(this.textNodeHolder);
    this.textNode = new SVGElement("text", textParams, " ");
    this.textNode.setAttributeNS(xmlns, "space", "preserve");
    this.textNodeHolder.appendChild(this.textNode);
    
    // Also draw a cursor
    this.cursor = new SVGElement("rect", {x:5, y:3, width:2, height:20, stroke:"none", fill:"red"});
    
    var cursorAnimator = new SVGElement("set", {id:"textCursorBlink2", attributeName:"visibility", attributeType:"CSS", to:"hidden", begin:"0.5s;textCursorBlink2.end + 0.5s", dur:"0.5s"});
    this.cursor.appendChild(cursorAnimator);
    this.cursor.hide();
    this.textNodeHolder.appendChild(this.cursor);
}

KevLinDev.extend(TextArea, SimpleButton);

TextArea.prototype.doAction = function(src, evt) 
{
    TextArea.superClass.doAction.call(this, src, evt);

    if (evt.type == "keypress")
    {
        var charCode = evt.keyCode;
        if (evt.charCode)
        {
            charCode = evt.charCode;
        }
        
        if (charCode > 31 && charCode != 127 && charCode < 65535) 
        {
            if (this.isSecret)
            {
                this.textVal += "*";
                this.secretVal += String.fromCharCode(charCode);
            }
            else
            {
                this.textVal += String.fromCharCode(charCode);
            }
        }
        else if (charCode == 8)
        {
            // backspace
            if (this.isSecret)
            {
                this.textVal = this.textVal.substring(0, this.textVal.length - 1);
                this.secretVal = this.secretVal.substring(0, this.secretVal.length - 1);
            }
            else
            {
                this.textVal = this.textVal.substring(0, this.textVal.length - 1);
            }
        }
        else if (charCode == 10 || charCode == 13)
        {
            // Enter key
            this.nextFocus();
        }

        this.textNode.tnode.nodeValue = this.textVal;
        this.updateWidth();
    }
    else if (evt.type == "click")
    {
        if (src.src == "Background")
        {
            this.loseFocus();
        }
        else if (src.src = this.src)
        {
            this.setFocus();
            evt.stopPropagation();
        }
    }
};

TextArea.prototype.setSecret = function()
{
    this.isSecret = true;
};

TextArea.prototype.setValue = function(value)
{
    if (this.isSecret)
    {
        this.secretVal = value.toString();
        this.textVal = "";
        for (var i = 0; i < this.secretVal.length; i++)
            this.textVal += "*";
    }
    else
    {
        this.textVal = value.toString();
    }
    this.textNode.tnode.nodeValue = this.textVal;
    this.updateWidth();
};

TextArea.prototype.updateWidth = function()
{
    var bbox = this.textNode.getBBox();
    this.cursor.setAttribute("x", bbox.width + 5);

    if (bbox.width > this.textBoxWidth - 10)
    {
        this.textNodeHolder.setAttribute("transform", "translate(" + (this.textBoxWidth - bbox.width - 10) + ",0)");
    }
    else
    {
        this.textNodeHolder.setAttribute("transform", "translate(0,0)");
    }
};

TextArea.prototype.setFocus = function()
{
    this.cursor.show();
    TextArea.superClass.setFocus.call(this);    
};

TextArea.prototype.loseFocus = function()
{
    this.cursor.hide();
    TextArea.superClass.loseFocus.call(this);    
};

// TODO: Remove in favour of TextLabel
// An area of text.
// textInstructions should be a list {}, with the following members:
//     - maxWidth: the maximum width of any line
//     - lineSpacing: a float greater than 0 indicating the proportion of the
//                    font-size that should separate lines.
// Currently only caters for horizontally and vertically centred. 
function MultilineText(x, y, textVal, textAttributes, textInstructions)
{
    MultilineText.baseConstructor.call(this, x, y);
    
    var wordTokens = textVal.split(" ");

    if (textInstructions == null || textInstructions.maxWidth == null)
        return null;
        
    var textLines = [];
    
    // Use greedy algorithm to get array of text strings
    var i = 0;
    while (i < wordTokens.length)
    {
        var currText = wordTokens[i];
        var tempText = currText;
        var nextLine = new SVGElement("text", textAttributes, tempText);
        textLines.push(nextLine);

        while (nextLine.getBBox().width <= textInstructions.maxWidth)
        {
            currText = tempText; // The test line worked
            i++;
            if (i >= wordTokens.length)
                break;
            
            tempText = currText + " " + wordTokens[i];
            nextLine.setValue(tempText);
        }
        
        if (i < wordTokens.length)
        {
            // Broke out of the loop because the line was too long.
            // Reset to the last good value
            nextLine.setValue(currText);

            // If the single word was enough to overrun the length,
            // we need to skip ahead to the next word anyway.
            if (currText == tempText)
                i++;
        }
    }

    // Work out how to place lines vertically
    var fontSize = parseInt(textAttributes["font-size"]);
    var totalHeight = textLines.length * fontSize + (textLines.length - 1) * fontSize * textInstructions.lineSpacing;

    for (var i = 0; i < textLines.length; i++)
    {
        var width = textLines[i].getBBox().width;
        textLines[i].setAttribute("x", -width / 2);
        textLines[i].setAttribute("y", -totalHeight / 2 + i * (fontSize + fontSize * textInstructions.lineSpacing) + fontSize / 2);
        this.appendChild(textLines[i]);
    }
}

KevLinDev.extend(MultilineText, SVGComponent);

// FlowLayout automatically lays out contained children in a horizontal
// or vertical line.
// It does not respect the x and y position of the contained children, 
// modifying them as required to fit into the area.
// 
// Parameters are:
//     direction: "up", "down", "left" or "right". Default is "right".
//     minSpacing: Minimum spacing between layout elements. Default is 0.
//     minWidth: Minimum width of layout. Default is 0.
//     flowAlignment: "left", "right", "centre", "justify". Applied only if
//                  minWidth > 0. Default is "left".
//     orthogonalAlignment: "top", "bottom", "centre". Default is "top".
function FlowLayout(x, y, params)
{
    this.layoutParams = params;
    if (this.layoutParams == null)
        this.layoutParams = {};
    
    if (this.layoutParams.direction == null)
        this.layoutParams.direction = "right";
    
    if (this.layoutParams.minSpacing == null)
        this.layoutParams.minSpacing = 0;
    
    this.layoutParams.spacing = this.layoutParams.minSpacing;

    if (this.layoutParams.minWidth == null)
        this.layoutParams.minWidth = 0;

    if (this.layoutParams.flowAlignment == null)
        this.layoutParams.flowAlignment = "left";

    if (this.layoutParams.orthogonalAlignment == null)
        this.layoutParams.orthogonalAlignment = "top";

    FlowLayout.baseConstructor.call(this, x, y);
    this.currentX = 0;
    this.currentY = 0;
    this.childLengthSum = 0;
    this.maxOrthogonal = 0;
}

KevLinDev.extend(FlowLayout, SVGComponent);

// override appendChild method
// We're actually encapsulating mychild in an SVGComponent which we
// can then safely manipulate into position.
// It is the responsibility of the child for its x and y positions 
// to be the same as all the other child elements (ie. usually 0, 0)
// otherwise the item will not be in place.
FlowLayout.prototype.appendChild = function(mychild)
{
    // Place the child
   
    var el = new SVGComponent(this.currentX, this.currentY);    
    el.appendChild(mychild);
    this.placeAppendedChild(el);
    
    FlowLayout.superClass.appendChild.call(this, el);

	if (this.layoutParams.minWidth <= 0 && this.layoutParams.orthogonalAlignment == "top")
	{
	    // We don't need to resize ourselves, as we've placed the
	    // appended child at the end anyway. So we just tell any
	    // resize listeners directly.
	    this.tellResizeListeners(this);
    }
    else
    {
        // We might need to reposition ourselves
        this.refreshLayout();
    }

	mychild.addResizeListener(this);	
}

FlowLayout.prototype.prependChild = function(mychild)
{
    var el = new SVGComponent(0, 0);
    el.appendChild(mychild);
    FlowLayout.superClass.prependChild.call(this, el);
    this.refreshLayout();

	mychild.addResizeListener(this);
}

FlowLayout.prototype.removeChild = function(mychild)
{
	// Look through the encapsulating components for mychild
	for (var i in this.childNodes)
	{
		if (this.childNodes[i].firstChild == mychild)
		{
			FlowLayout.superClass.removeChild.call(this, this.childNodes[i]);
			mychild.removeResizeListener(this);
			this.refreshLayout();
		    break;
		}
	}
}

FlowLayout.prototype.removeChildren = function()
{
	FlowLayout.superClass.removeChildren.call(this);
	this.refreshLayout();	
}

FlowLayout.prototype.placeAppendedChild = function(child)
{
    var bbox = child.getBBox();
    var orthogonalLength = 0;
    switch (this.layoutParams.direction)
    {
    case "left":
    case "right":
        orthogonalLength = bbox.height;
        break;
    case "up":
    case "down":
        orthogonalLength = bbox.width;
        break;
    }
    
    var orthogonalPos = 0;
	switch (this.layoutParams.orthogonalAlignment)
    {
    case "bottom":
        orthogonalPos = this.maxOrthogonal - orthogonalLength;
        break;
        
    case "centre":
        orthogonalPos = (this.maxOrthogonal - orthogonalLength) / 2;
        break;
        
    case "top":
    default:
        orthgonalPos = 0;
        break;
    }
    
    switch (this.layoutParams.direction)
    {
    case "left":
        this.currentX -= (bbox.width + this.layoutParams.spacing);
        // Fall through
    case "right":
        this.currentY = orthogonalPos;
        break;

    case "up":
        this.currentY -= (bbox.height + this.layoutParams.spacing);
        // Fall through
    case "down":
        this.currentX = orthogonalPos;
        break;
    }

    child.setPosition(this.currentX, this.currentY);

    switch (this.layoutParams.direction)
    {
    case "right":
        this.currentX += (bbox.width + this.layoutParams.spacing);
        break;
    default:
    case "down":
        this.currentY += (bbox.height + this.layoutParams.spacing);
        break;
    }
}

FlowLayout.prototype.refreshLayout = function()
{
    this.currentX = 0;
    this.currentY = 0;

	if (this.layoutParams.orthogonalAlignment != "top")
	{
        // Need to calculate maxOrthogonal
        this.maxOrthogonal = 0;
        for (var i in this.childNodes)
        {
			var bbox = this.childNodes[i].getBBox();
			
            switch (this.layoutParams.direction)
            {
            case "left":
            case "right":
                this.maxOrthogonal = Math.max(this.maxOrthogonal, bbox.height);
                break;
            case "up":
            case "down":
                this.maxOrthogonal = Math.max(this.maxOrthogonal, bbox.width);
                break;
            }
        }
    }
	
	if (this.layoutParams.minWidth > 0)
	{
        var sumLength = 0;
        var elCount = 0;
        for (var i in this.childNodes)
        {
			var bbox = this.childNodes[i].getBBox();
			
            switch (this.layoutParams.direction)
            {
            case "left":
            case "right":
                sumLength += bbox.width;
                break;
            case "up":
            case "down":
                sumLength += bbox.height;
                break;
            }
            elCount++;
        }

        var startPos = 0;
        switch (this.layoutParams.flowAlignment)
        {
        case "justify":
            // Calculate spacing
            this.layoutParams.spacing = (this.layoutParams.minWidth - sumLength) / (elCount - 1);
            if (this.layoutParams.spacing < this.layoutParams.minSpacing)
                this.layoutParams.spacing = this.layoutParams.minSpacing;
            break;
        
        case "right":
            // Calculate starting position
            startPos = this.layoutParams.minWidth - sumLength - (elCount - 1) * this.layoutParams.minSpacing;
            if (startPos < 0)
                startPos = 0;
            break;
        
        case "centre":
            // Calculate starting position
            startPos = (this.layoutParams.minWidth - sumLength - (elCount - 1) * this.layoutParams.minSpacing) / 2;
            if (startPos < 0)
                startPos = 0;
            break;
            
        case "left":
        default:
            // This is the default.
            startPos = 0;
            break;
        }

        // Apply the startPos
        switch (this.layoutParams.direction)
        {
        case "left":
        case "right":
            this.currentX = startPos;
            break;
        case "up":
        case "down":
            this.currentY = startPos;
            break;
        }
    }
    
    for (var i in this.childNodes)
    {
        this.placeAppendedChild(this.childNodes[i]);
    }

	this.tellResizeListeners(this);
}

FlowLayout.prototype.notifyResize = function(src)
{
    FlowLayout.superClass.notifyResize.call(this, src);
	this.refreshLayout();
}

// An area of text. "\n" in the source text cause hard line breaks.
// layoutParams should be a list {}, with the usual params for flow
// layout, with the following additions and changes:
//     - direction default is "down"
//     - maxWidth: the maximum width of any line (will also cause line breaks)
function TextLabel(textVal, textAttributes, layoutParams)
{
    this.layoutParams = layoutParams;
    if (layoutParams == null)
        layoutParams = {};
        
    // For text, the default flow for lines is each line below the previous.
    if (layoutParams.direction == null)
        layoutParams.direction = "down";
    
    var yOffset = 0;
    if (textAttributes != null && textAttributes["font-size"] != null)
        yOffset = textAttributes["font-size"];
        
    TextLabel.baseConstructor.call(this, 0, yOffset, layoutParams);
    
    this.textAttributes = textAttributes;
    
    this.setValue(textVal);
}

KevLinDev.extend(TextLabel, FlowLayout);

// Layout the text
TextLabel.prototype.setValue = function(textVal)
{
	this.textValue = textVal;
	
    this.removeChildren();
    
    if (textVal == null)
        return;
    
    var paraTokens = textVal.split("\n");
    
    for (var i in paraTokens)
    {
        this.setParagraph(paraTokens[i]);
    }
}

// Layout a single paragraph of text.
TextLabel.prototype.setParagraph = function(textVal)
{
    if (this.layoutParams.maxWidth == null)
    {
        // Don't attempt soft line breaks
        var nextLine = new SVGElement("text", this.textAttributes, textVal);
        this.appendChild(nextLine);
        return;
    }

    var wordTokens = textVal.split(" ");
    
    // Use greedy algorithm to get array of text strings
    var i = 0;
    while (i < wordTokens.length)
    {
        var currText = wordTokens[i];
        var tempText = currText;
        var nextLine = new SVGElement("text", this.textAttributes, tempText);

        while (nextLine.getBBox().width <= this.layoutParams.maxWidth)
        {
            currText = tempText; // The test line worked
            i++;
            if (i >= wordTokens.length)
                break;
            
            tempText = currText + " " + wordTokens[i];
            nextLine.setValue(tempText);
        }
        
        if (i < wordTokens.length)
        {
            // Broke out of the loop because the line was too long.
            // Reset to the last good value
            nextLine.setValue(currText);

            // If the single word was enough to overrun the length,
            // we need to skip ahead to the next word anyway.
            if (currText == tempText)
                i++;
        }
        this.appendChild(nextLine);
    }
}

var g_dragndrop = new DragNDropHandler();

function DragNDropHandler()
{
    this.dragObject = null;
    this.offsetX = 0;
    this.offsetY = 0;
}

DragNDropHandler.prototype.dragstart = function(src, evt, initialX, initialY)
{
    this.dragObject = src;

    var newScale = evt.target.ownerDocument.documentElement.currentScale;
    var translation = evt.target.ownerDocument.documentElement.currentTranslate;
    this.offsetX = (evt.clientX - translation.x) / newScale - initialX;
    this.offsetY = (evt.clientY - translation.y) / newScale - initialY;
}

DragNDropHandler.prototype.dragmove = function(evt)
{
    if (this.dragObject != null)
    {
       var newScale = evt.target.ownerDocument.documentElement.currentScale;
       var translation = evt.target.ownerDocument.documentElement.currentTranslate;
       var newX = (evt.clientX - translation.x) / newScale;
       var newY = (evt.clientY - translation.y) / newScale;
   
       this.dragObject.setDragPosition(newX - this.offsetX, newY - this.offsetY);
    }
}

DragNDropHandler.prototype.dragend = function(evt)
{
	if (this.dragObject != null)
		this.dragObject.setDragEnd(); // Let the drag object know we're done.
    
	this.dragObject = null;
}

function dragndrop_Start(src, evt, initialX, initialY)
{
    if (g_dragndrop)
       g_dragndrop.dragstart(src, evt, initialX, initialY);  
}

function dragndrop_Move(evt)
{
    if (g_dragndrop)
       g_dragndrop.dragmove(evt);  
}

function dragndrop_End(evt)
{
    if (g_dragndrop)
       g_dragndrop.dragend(evt);  
}

// Slider
// params:
// 		orientation - "h" or "v" (default: "h")
// 		sliderWidth - width of the Slider (default: 10)
//      sliderLength - length of the Slider (default: 200)
//      startPosition - starting position of the slider, as a proportion between 0 and 1 (default: 0)
//      draggerWidth - width of the dragger (default: 10)
//      draggerHeight - height of the dragger (default: 20)
//      sliderColor - color of the slider (default: "gray")
//      draggerColor - color of the dragger (default: "white")
function Slider(params)
{   
    this.params = params;
    if (!this.params)
       this.params = [];
    
	if (!this.params.orientation)
		this.params.orientation = "h";

	if (!this.params.sliderWidth || isNaN(this.params.sliderWidth))
		this.params.sliderWidth = 10;

	if (!this.params.sliderLength || isNaN(this.params.sliderLength))
		this.params.sliderLength = 200;

	if (!this.params.draggerWidth || isNaN(this.params.draggerWidth))
		this.params.draggerWidth = 10;

	if (!this.params.draggerHeight || isNaN(this.params.draggerHeight))
		this.params.draggerHeight = 20;

	if (!this.params.sliderColor)
		this.params.sliderColor = "gray";

	if (!this.params.draggerColor)
		this.params.draggerColor = "white";

	if (!this.params.startPosition || isNaN(this.params.startPosition))
		this.params.startPosition = 0;
	else if (this.params.startPosition > 1.0)
		this.params.startPosition = 1.0;
	else if (this.params.startPosition < 0.0)
		this.params.startPosition = 0.0;

    var direction;
    var backIcon;
    var fwdIcon;
    var sliderWidth = 0;
    var sliderHeight = 0;
    var draggerWidth = 0;
    var draggerHeight = 0;
	var bgX = 0;
	var bgY = 0;
    if (params.orientation == "h")
    {
       	direction = "right";
       	sliderHeight = this.params.sliderWidth;
		sliderWidth = this.params.sliderLength;
       	draggerHeight = this.params.draggerHeight;
		draggerWidth = this.params.draggerWidth;
		bgY = (this.params.sliderWidth < this.params.draggerHeight) ? (this.params.draggerHeight - this.params.sliderWidth) / 2 : 0;
    }
    else
    {
       	direction = "down";
       	sliderWidth = this.params.sliderWidth;
		sliderHeight = this.params.sliderLength;
       	draggerWidth = this.params.draggerHeight;
		draggerHeight = this.params.draggerWidth;
		bgX = (this.params.sliderWidth < this.params.draggerHeight) ? (this.params.draggerHeight - this.params.sliderWidth) / 2 : 0;
    }
    Slider.baseConstructor.call(this, 0, 0);
   
    this.slider = new SVGComponent(0, 0);
    this.scrollBg = new RectButton("scrollBG", bgX, bgY, null, {fill:this.params.sliderColor, stroke:"black", width:sliderWidth, height:sliderHeight}, {opacity:0}, {opacity:0}, 4, false);
    this.scrollBg.addActionListener(this);

    this.scrollTop = new RectButton("scrollDragger", 0, 0, null, {fill:this.params.draggerColor, stroke:"black", width:draggerWidth, height:draggerHeight}, {fill:"blue"}, {fill:"blue"}, 4, false);
    this.scrollTop.addActionListener(this);
   
    this.slider.appendChild(this.scrollBg);
    this.slider.appendChild(this.scrollTop);
    this.appendChild(this.slider);
   
	this.setSliderPosition(this.params.startPosition);
}

KevLinDev.extend(Slider, SVGComponent);

Slider.prototype.setDragPosition = function(x, y)
{
	var position = (this.params.orientation == "h" ? x : y) / (this.params.sliderLength - this.params.draggerWidth);
    this.setSliderPosition(position);
}

Slider.prototype.setDragEnd = function()
{
}

// Set the slider position as a proportion of its length
Slider.prototype.setSliderPosition = function(position)
{
	this.sliderPosition = position < 0 ? 0 : (position > 1.0 ? 1.0 : position);
	var absolutePosition = this.sliderPosition * (this.params.sliderLength - this.params.draggerWidth);
	
    if (this.params.orientation == "h")
    {
        this.scrollTop.setPosition(absolutePosition, 0);
    }
    else
    {
        this.scrollTop.setPosition(0, absolutePosition);
    }

    this.tellActionListeners(this, {type:"dragSlider", position:this.sliderPosition});
}

Slider.prototype.doAction = function(src, evt)
{
    if (src.src == "scrollDragger" && evt.type == "mousedown")
    {
       	dragndrop_Start(this, evt, this.scrollTop.x, this.scrollTop.y);
    }
	else if (src.src == "scrollBG" && evt.type == "click")
	{
		// Move the slider to the specified position
		var currPos = 0;
	    if (this.params.orientation == "h")
	    {
			currPos = (evt.clientX - this.svg.getCTM().e) - 0.5 * this.params.draggerWidth;
		}
		else
		{
			currPos = (evt.clientY - this.svg.getCTM().f) - 0.5 * this.params.draggerWidth;
		}
	    
		this.setSliderPosition(currPos / (this.params.sliderLength - this.params.draggerWidth));
	}
}


// Scrollbar
// Consists of an up/left button, scrollbar region, and down/right button. 
// The scrollbar region consists of a background area with a dragbar on top of it.
// params:
// orientation - "h" or "v"
// width - width of the scrollbar
function Scrollbar(params)
{   
    this.params = params;
    if (!this.params)
       this.params = [];
       
    var direction;
    var backIcon;
    var fwdIcon;
    var width = 0;
    var height = 0;
    if (params.orientation == "h")
    {
       direction = "right";
       backIcon = new SVGElement("path", {d:"M0,0L0,20L-14,10z", fill:"blue"});
       fwdIcon = new SVGElement("path", {d:"M0,0L0,20L14,10z", fill:"blue"});
       height = params.width;
    }
    else
    {
       direction = "down";
       backIcon = new SVGElement("path", {d:"M0,0L20,0L10,-14z", fill:"blue"});
       fwdIcon = new SVGElement("path", {d:"M0,0L20,0L10,14z", fill:"blue"});
       width = params.width;
    }
    Scrollbar.baseConstructor.call(this, 0, 0, {direction:direction});

    this.backButton = new RectButton("backButton", 0, 0, backIcon, {fill:"white", stroke:"black", rx:2, width:params.width, height:params.width}, {fill:"blue"}, {fill:"blue"}, 4, false);
    this.backButton.addActionListener(this);
    this.appendChild(this.backButton);
   
    this.scrollbar = new SVGComponent(0, 0);
    this.scrollBg = new SVGElement("rect", {x:0, y:0, width:width, height:height, fill:"gray", stroke:"black"});
    this.scrollTop = new RectButton("scrollDragger", 0, 0, null, {fill:"white", stroke:"black", width:width, height:height}, {fill:"blue"}, {fill:"blue"}, 4, false);
    this.scrollTop.addActionListener(this);
   
    this.scrollbar.appendChild(this.scrollBg);
    this.scrollbar.appendChild(this.scrollTop);
    this.appendChild(this.scrollbar);
   
    this.fwdButton = new RectButton("fwdButton", 0, 0, fwdIcon, {fill:"white", stroke:"black", rx:2, width:params.width, height:params.width}, {fill:"blue"}, {fill:"blue"}, 4, false);
    this.fwdButton.addActionListener(this);
    this.appendChild(this.fwdButton);
    
    this.position = 0; // The position of the top of the dragbar
    this.scrollbarLength = 0; // The length of the scrollbar background
    this.dragbarLength = 0; // The length of the dragbar
}

KevLinDev.extend(Scrollbar, FlowLayout);

// Update the length and position of the dragbar. 
// internalLength - the length of the contents that the scrollbar is applied to
// externalLength - the length of the container
// position - the position in the contents to be placed at the top of the container
Scrollbar.prototype.updateScrollbar = function(internalLength, externalLength, position)
{
    this.scrollbarLength = externalLength - 2 * this.params.width; // Take into account the buttons
    this.dragbarLength = externalLength / internalLength * this.scrollbarLength;
	if (this.dragbarLength > this.scrollbarLength)
		this.dragbarLength = this.scrollbarLength;
   
    if (this.params.orientation == "h")
    {
        this.scrollBg.setAttribute("width", this.scrollbarLength);
        this.scrollTop.bgElement.rectAttributes.width = this.dragbarLength;
    }
    else
    {
        this.scrollBg.setAttribute("height", this.scrollbarLength);
        this.scrollTop.bgElement.rectAttributes.height = this.dragbarLength;
    }

	// Work out the position on the scrollbar of the dragbar
	var scrollbarPos = 0;
	if (internalLength - externalLength > 0)
		scrollbarPos = position * (this.scrollbarLength - this.dragbarLength) / (internalLength - externalLength);
    var retVal = this.setScrollbarPosition(scrollbarPos);

    this.scrollTop.refreshLayout();
    this.refreshLayout();

	return retVal; // This is an update to the position
}

Scrollbar.prototype.setDragPosition = function(x, y)
{
    this.setScrollbarPosition(this.params.orientation == "h" ? x : y);
    this.tellActionListeners(this, {type:"dragScrollbar", position:this.position / (this.scrollbarLength - this.dragbarLength)});
}

Scrollbar.prototype.setDragEnd = function()
{
}

// Set the scrollbar position
Scrollbar.prototype.setScrollbarPosition = function(position)
{
    this.position = position < 0 ? 0 : ((position > this.scrollbarLength - this.dragbarLength) ? this.scrollbarLength - this.dragbarLength : position);
    
    if (this.params.orientation == "h")
    {
        this.scrollTop.setPosition(this.position, 0);
    }
    else
    {
        this.scrollTop.setPosition(0, this.position);
    }

	return this.position;
}

Scrollbar.prototype.doAction = function(src, evt)
{
    if (src.src == "scrollDragger" && evt.type == "mousedown")
    {
       dragndrop_Start(this, evt, this.scrollTop.x, this.scrollTop.y);
    }
    else if (evt.type == "click")
    {
        if (src.src == "backButton")
        {
            this.setScrollbarPosition(this.position - this.dragbarLength / 2);
		    this.tellActionListeners(this, {type:"dragScrollbar", position:this.position / (this.scrollbarLength - this.dragbarLength)});
        }
        else if (src.src == "fwdButton")
        {            
            this.setScrollbarPosition(this.position + this.dragbarLength / 2);
		    this.tellActionListeners(this, {type:"dragScrollbar", position:this.position / (this.scrollbarLength - this.dragbarLength)});
        }
		evt.stopPropagation();
    }
}


// A region with automatic scrollbars. If the contents are wider than the container,
// put scrollbars on the container.
// params contents:
// - width - width of the container (default: 100)
// - height - height of the container (default: 100)
// - scrollbarWidth - width of the scrollbar (default: 10)
// - scrollbarGap - gap between contents and scrollbar/s (default: 3)
// - rectBorder - params for a rect that serves as a border. (default: null)
//                The width and height of the rect will be synchronised to the ScrollbarRegion size.
function ScrollbarRegion(params, contents)
{    
    ScrollbarRegion.baseConstructor.call(this, 0, 0);
    this.params = params;

    if (this.params.scrollbarWidth == null)
        this.params.scrollbarWidth = 10;

    if (this.params.scrollbarGap == null)
        this.params.scrollbarGap = 3;

    if (this.params.width == null)
        this.params.width = 100;

	if (this.params.height == null)
	    this.params.height = 100;

	// Initial scroll position
	this.scroll_x = 0; 
	this.scroll_y = 0;

	if (this.params.rectBorder != null)
	{
		// Put a border on the scrollbar region
		this.rectBorder = new SVGElement("rect", this.params.rectBorder);
		this.appendChild(this.rectBorder);
	}

    this.mask = new SVGRoot({width:params.width, height:params.height});
    this.contents = new SVGComponent(0, 0);
    this.contents.appendChild(contents);
    this.mask.appendChild(this.contents);
    this.appendChild(this.mask);

    // horizontal scrollbar
    this.hBar = new Scrollbar({orientation:"h", width:this.params.scrollbarWidth});
    this.appendChild(this.hBar);
    this.hBar.addActionListener(this);

    // vertical scrollbar
    this.vBar = new Scrollbar({orientation:"v", width:this.params.scrollbarWidth});
    this.appendChild(this.vBar);
    this.vBar.addActionListener(this);

    this.refreshLayout();
}

KevLinDev.extend(ScrollbarRegion, SVGComponent);

// Refresh the layout of the scrollbar region.
// Resize the scrollbars if necessary.
ScrollbarRegion.prototype.refreshLayout = function()
{
	if (this.rectBorder != null)
	{
		this.rectBorder.setAttribute("width", this.params.width);
		this.rectBorder.setAttribute("height", this.params.height);
	}

    var bbox = this.contents.getVisualBBox();
    this.xExtent = bbox.width; // The extent of the contents 
    this.yExtent = bbox.height;
   
	// Show the horizontal scrollbar if the x extent is larger than the width of the scroll window
    var showH = (this.xExtent > this.params.width);
    
    var scrollSpace = this.params.scrollbarWidth + this.params.scrollbarGap;
    
    // Show the vertical scrollbar if necessary
    var showV = (this.yExtent > (showH ? this.params.height - scrollSpace : this.params.height));
    
	// showH needs to be recalculated - it may be required if we just had to showV
    showH = (this.xExtent > (showV ? this.params.width - scrollSpace : this.params.width));
    
    this.effectiveWidth = showV ? this.params.width - scrollSpace : this.params.width;
    this.effectiveHeight = showH ? this.params.height - scrollSpace : this.params.height;

    this.updateContentPosition();

	// Update the horizontal scrollbar.
    this.hBar.updateScrollbar(this.xExtent, this.effectiveWidth, this.scroll_x);
    this.hBar.setPosition(0, this.effectiveHeight + this.params.scrollbarGap);

    this.vBar.updateScrollbar(this.yExtent, this.effectiveHeight, this.scroll_y);
    this.vBar.setPosition(this.effectiveWidth + this.params.scrollbarGap, 0);

    if (showH)
    {
       this.mask.setAttribute("height", this.params.height - scrollSpace);
       this.hBar.show();
    }
    else
    {
        this.mask.setAttribute("height", this.params.height);
        this.hBar.hide();
    }
   
    if (showV)
    {
       this.mask.setAttribute("width", this.params.width - scrollSpace);
       this.vBar.show();
    }
    else
    {
        this.mask.setAttribute("width", this.params.width);
        this.vBar.hide();
    }

}

// Set the scrollbar position, as a percentage of the possible range
// orientation is "h" or "v"
// position is a number from 0 to 1
ScrollbarRegion.prototype.updateScrollbarPosition = function(orientation, position)
{
	this.scroll_x = -this.contents.x;
	this.scroll_y = -this.contents.y;
	
	if (orientation == "h")
	{
    	this.scroll_x = (this.xExtent - this.effectiveWidth) * position;
	}
	else
	{
    	this.scroll_y = (this.yExtent - this.effectiveHeight) * position;
	}
	
	this.updateContentPosition();
}

ScrollbarRegion.prototype.updateContentPosition = function()
{
	// Update the current position of the contents within the scroll window
	// if necessary. 
	// 
	// <--------------xExtent----------------->
	// <--scroll_x-><---effectiveWidth--->    
	//            <------params.width------>
	if (this.scroll_x + this.effectiveWidth > this.xExtent)
	{
		this.scroll_x = this.xExtent - this.effectiveWidth;
	}
	
	if (this.scroll_x < 0)
	{
		this.scroll_x = 0;
	}

	if (this.scroll_y + this.effectiveHeight > this.yExtent)
	{
		this.scroll_y = this.yExtent - this.effectiveHeight;
	}
	
	if (this.scroll_y < 0)
	{
		this.scroll_y = 0;
	}

	this.contents.setPosition(-this.scroll_x, -this.scroll_y);
}

ScrollbarRegion.prototype.doAction = function(src, evt)
{
    if (evt.type == "dragScrollbar")
    {
		this.updateScrollbarPosition(src.params.orientation, evt.position);
    }
}

ScrollbarRegion.prototype.notifyResize = function(src)
{
    ScrollbarRegion.superClass.notifyResize.call(this, src);
	this.refreshLayout();
}
// A window is a rectLabel containing a vertical FlowLayout with the first element being a title bar
// windowParams can have the following params:
// width            - width of the window (default: 200)
// height           - height of the window (default: 200)
// titleBarHeight   - the height of the title bar (default: 16)
// titleBarGap      - the gap between the title bar and the body (default: 2)
// scrollbarWidth   - the width of each scrollbar (default: 20)
// contentsSpacing  - spacing between elements added to the window's vertical flow layout (default: 0)
// allowUserResize  - allow the user to resize the window (default: false)
// 
// storePrefix      - a prefix that gets used by localStore (if that exists) to store
//                    the window position
//
// The contents of the window should be appended to window.contents, which is a flowLayout
// going down.
function SVGWindow(windowName, borderWidth, rectAttributes, windowParams)
{    
    this.windowName = windowName;
    this.windowParams = windowParams;
    this.borderWidth = borderWidth;

    if (this.windowParams == null)
       this.windowParams = [];
       
    if (this.windowParams.width == null)
        this.windowParams.width = 200;

    if (this.windowParams.height == null)
        this.windowParams.height = 200;
    
	if (this.windowParams.titleBarHeight == null)
        this.windowParams.titleBarHeight = 16;

    if (this.windowParams.statusBarHeight == null)
        this.windowParams.statusBarHeight = 10;

    if (this.windowParams.titleBarGap == null)
        this.windowParams.titleBarGap = 2;

    if (this.windowParams.scrollbarWidth == null)
        this.windowParams.scrollbarWidth = 20;

    if (this.windowParams.contentsSpacing == null)
        this.windowParams.contentsSpacing = 0;

	if (this.windowParams.allowUserResize == null)
	    this.windowParams.allowUserResize = false;

    // If we use local storage, determine the position of the window.
    var x = 0;
    var y = 0;
    if (this.windowParams.storePrefix && window.localStorage)
    {
        x = localStorage.getItem(this.windowParams.storePrefix + "_x");
        if (x == null || x < 0)
            x = 0;

        y = localStorage.getItem(this.windowParams.storePrefix + "_y");
        if (y == null || y < 0)
            y = 0;
    }
    SVGWindow.baseConstructor.call(this, x, y);

	this.resizeHandler = new Object();
	this.resizeHandler.owner = this;
	this.resizeHandler.startX= this.x;
	this.resizeHandler.startY = this.y;
	this.resizeHandler.startWidth = 0;
	this.resizeHandler.startHeight = 0;
	this.resizeHandler.setDragPosition = function(x, y)
		{
			this.owner.isDragging = true;
			
			// Set the new window height and width
			this.owner.windowParams.width = this.startWidth + (x - this.startX);
			this.owner.windowParams.height = this.startHeight + (y - this.startY);

			var minHt = this.owner.windowParams.scrollbarWidth * 3 + this.owner.windowParams.titleBarHeight + this.owner.windowParams.statusBarHeight;
			if (this.owner.windowParams.height < minHt)
				this.owner.windowParams.height = minHt;

			var minWidth = this.owner.windowParams.scrollbarWidth * 3;
			if (this.owner.windowParams.width < minWidth)
				this.owner.windowParams.width = minWidth;
				
			this.owner.refreshLayout();
		}

	this.resizeHandler.setDragEnd = function(x, y)
		{
			this.owner.isDragging = false;
			this.owner.windowStatusText.setValue(""); // Don't show the size of the window in the status any more
		}
		
    this.bgRect = new SVGElement("rect", rectAttributes);    
    this.appendChild(this.bgRect);
	this.bgRect.addEventListener("mousedown", this.bgRect, false);
	this.bgRect.addActionListener(this);

    this.titleBar = new FlowLayout(0, 0, {flowAlignment:"justify"});

    var textHt = this.windowParams.titleBarHeight - 2 * this.windowParams.titleBarGap;
    this.windowTitle = new RectButton("dragWindow", 0, 0, new SVGElement("text", {y:textHt, "font-size":textHt}, this.windowName), {fill:"white", stroke:"none", rx:2, width:20, height:this.windowParams.titleBarHeight}, {fill:"orange"}, {fill:"red"}, this.windowParams.titleBarGap, false);
    this.titleBar.appendChild(this.windowTitle);
    this.windowTitle.svg_cover.addEventListener("mousemove", this.windowTitle, false);
    this.windowTitle.addActionListener(this);

    // Close Button
    var xPath = "M0,0 L" + textHt + "," + textHt + " M0," + textHt + " L" + textHt + ",0";
    this.closeButton =  new RectButton("closeWindow", 0, 0, new SVGElement("path", {d:xPath, stroke:"black", x:0, y:10}), {fill:"white", stroke:"red", rx:2}, {fill:"orange"}, {fill:"red"}, this.windowParams.titleBarGap, false);    
    this.titleBar.appendChild(this.closeButton);
    this.closeButton.addActionListener(this);

	// Status bar
    this.statusBar = new FlowLayout(0, 0, {});

	// Status text
	this.windowStatusText = new SVGElement("text", {y:textHt, fill:"black", "font-size":textHt}, "");
	this.windowStatus = new RectLabel(0, 0, this.windowStatusText, {fill:"white", stroke:"none", opacity:"0", width:"100", height:this.windowParams.statusBarHeight}, 0);
	this.statusBar.appendChild(this.windowStatus);

	// Resize Button
	var resizeEl = new SVGElement("path", {d:"M9,3.5 L3.5,9 M9,6 L6,9 M9,8 L8,9", fill:"gray", stroke:"black", "stroke-width":"0.6"});
	var resizeElCover = new SVGElement("path", {d:"M10,0 L10,10 0,10 0,0z", fill:"white", opacity:"0"});
	this.resizeButton = new ParamButton2("resizeWindow", {x:0, y:0, width:10, height:10, normalElements: {normal:resizeEl, cover:resizeElCover} });
    this.resizeButton.addActionListener(this);
	this.statusBar.appendChild(this.resizeButton);

    // Contents of the window are inside a scrollbar region.
    this.contents = new FlowLayout(0, 0, {direction:"down", minSpacing:this.windowParams.contentsSpacing});
	this.scrollbarRegion = new ScrollbarRegion({width:100, height:100, scrollbarWidth:this.windowParams.scrollbarWidth}, this.contents);

    // WindowContents is the layout of the whole window - the title bar, then the scrollbar region, then the resize button
    this.windowContents = new FlowLayout(0, 0, {direction:"down", flowAlignment:"justify", minSpacing:3});
    this.windowContents.appendChild(this.titleBar);
    this.windowContents.appendChild(this.scrollbarRegion);
    this.appendChild(this.windowContents);
    this.appendChild(this.statusBar);

    this.fgRect = new SVGElement("rect", rectAttributes);
	this.fgRect.setAttribute("opacity", "0.3");
	this.fgRect.setAttribute("fill", "black");
	this.fgRect.hide();
	this.appendChild(this.fgRect);
    
    this.refreshLayout();
}

KevLinDev.extend(SVGWindow, SVGComponent);

// When the window title bar is moved, move the window
SVGWindow.prototype.setDragPosition = function(x, y)
{
    this.setPosition(x, y);
}

// Called when the window has finished dragging.
SVGWindow.prototype.setDragEnd = function()
{
}

SVGWindow.prototype.doAction = function(src, evt)
{
    SVGWindow.superClass.doAction.call(this, src, evt);

    if (src.src == "closeWindow" && evt.type == "click")
    {
        this.tellActionListeners(this, {type:"closeWindow"});
    }
    else if (src.src == "dragWindow" && evt.type == "mousedown")
    {
		// Tell listeners that this window has been selected
		this.tellActionListeners(this, {type:"windowSelected"});
		
		// Allow user to drag window
        dragndrop_Start(this, evt, this.x, this.y);
    }
    else if (src.src == "resizeWindow")
    {
		if (evt.type == "mousedown")
		{
			// Allow user to resize window
			this.resizeHandler.startX= this.x;
			this.resizeHandler.startY = this.y;
			this.resizeHandler.startWidth = this.windowParams.width;
			this.resizeHandler.startHeight = this.windowParams.height;
	        dragndrop_Start(this.resizeHandler, evt, this.x, this.y);
		}
	}
	else if (src == this.bgRect && evt.type == "mousedown")
	{
		// Tell listeners that this window has been selected
		this.tellActionListeners(this, {type:"windowSelected"});		
	}
}

SVGWindow.prototype.setPosition = function(x, y)
{
    SVGWindow.superClass.setPosition.call(this, x, y);
   
    if (this.windowParams.storePrefix && window.localStorage)
    {
        localStorage.setItem(this.windowParams.storePrefix + "_x", this.x);
        localStorage.setItem(this.windowParams.storePrefix + "_y", this.y);
    }
}

// The window can be disabled. This is done by putting a semi-opaque black
// cover over it.
SVGWindow.prototype.setAble = function(isAble)
{
    // Set whether this window is active or not
    if (isAble)
		this.fgRect.hide();
	else
		this.fgRect.show();
};

// Recalculate the size using window params
SVGWindow.prototype.refreshLayout = function()
{
    // Set the title bar button width
    this.windowTitle.bgElement.rectAttributes.width = this.windowParams.width - this.windowParams.titleBarHeight;
    this.windowTitle.refreshLayout();
	this.titleBar.refreshLayout();
    
    this.scrollbarRegion.params.width = this.windowParams.width;
    this.scrollbarRegion.params.height = this.windowParams.height - this.windowParams.titleBarHeight - 3 - this.windowParams.statusBarHeight;    
    this.scrollbarRegion.refreshLayout();
    this.bgRect.setAttribute("x", -this.borderWidth);
    this.bgRect.setAttribute("y", -this.borderWidth);    
    this.bgRect.setAttribute("width", this.windowParams.width + this.borderWidth * 2);
    this.bgRect.setAttribute("height", this.windowParams.height + this.borderWidth * 2);

    this.fgRect.setAttribute("x", -this.borderWidth);
    this.fgRect.setAttribute("y", -this.borderWidth);    
    this.fgRect.setAttribute("width", this.windowParams.width + this.borderWidth * 2);
    this.fgRect.setAttribute("height", this.windowParams.height + this.borderWidth * 2);
	
	if (this.isDragging)
		this.windowStatusText.setValue(this.windowParams.width + "x" + this.windowParams.height);
	
    this.windowStatus.rectAttributes.width = this.windowParams.width - 10;
    this.windowStatus.refreshLayout();
    this.statusBar.setPosition(0, this.windowParams.height - this.windowParams.statusBarHeight);    
	this.statusBar.refreshLayout();
	this.windowContents.refreshLayout();
}
// Manages a set of windows underneath us.
//
// Has the following functionality:
// - Moves selected window to top of z-order 
// - Disables all other windows if a window claims exclusive focus (TODO)
// - Keeps a focus ring of the windows (TODO)
//
function SVGWindowManager()
{
    SVGWindowManager.baseConstructor.call(this, 0, 0);
}

KevLinDev.extend(SVGWindowManager, SVGComponent);

// Add a window to the list of windows we're managing
SVGWindowManager.prototype.addWindow = function(newWindow)
{
	this.appendChild(newWindow);
	newWindow.addActionListener(this);
}

SVGWindowManager.prototype.setPositionConstraints = function(x, y, width, height)
{
	this.childConstraints = {x:x, y:y, width:width, height:height};
}

SVGWindowManager.prototype.doAction = function(src, evt)
{
    SVGWindowManager.superClass.doAction.call(this, src, evt);

    if (evt.type == "windowSelected")
    {
		this.appendChild(src);
	}
}// Item container holds items
function ItemContainer()
{
    ItemContainer.baseConstructor.call(this);

    this.myItems = [];
    this.owner = null; // no owner by default
}

KevLinDev.extend(ItemContainer, ActionObject);

// Move the item from its current parent to the target
ItemContainer.prototype.moveItem = function(target)
{
    if (this.owner)
    {
		// Find the index
	    for (var i = 0; i < this.owner.myItems.length; ++i)
	    {
	        if (this.owner.myItems[i] == this)
	        {
				// Found the item - remove it from the current owner.
			    this.owner.myItems.splice(i, 1);
			    this.owner.tellActionListeners(this.owner, {type:"removeItem", itemIndex:i});
	            break;
	        }    
	    }
    }

	target.appendItem(this);
}

ItemContainer.prototype.removeAllItems = function()
{
    while (this.myItems.length > 0)
        this.removeItemByIndex(0);
}

ItemContainer.prototype.removeItem = function(item)
{
    for (var i = 0; i < this.myItems.length; ++i)
    {
        if (this.myItems[i] == item)
        {
            this.removeItemByIndex(i);
            break;
        }    
    }
}

// Get a flat list of all the items in the tree
ItemContainer.prototype.getFlattenedTree = function()
{
    var result = [this];
    for (var i = 0; i < this.myItems.length; ++i)
    {
        result = result.concat(this.myItems[i].getFlattenedTree());
    }
    return result;
}

// Find the first item that has the name value pair in the params
ItemContainer.prototype.find = function(name, value)
{
    if (this.params != null && this.params[name] === value)
        return this;
        
    for (var i = 0; i < this.myItems.length; ++i)
    {
        var result = this.myItems[i].find(name, value);
        if (result != null)
            return result;
    }
}

ItemContainer.prototype.removeItemByIndex = function(itemIndex)
{
    if (itemIndex < 0 || itemIndex >= this.myItems.length)
        return;
    
    this.myItems[itemIndex].cleanup();
    
    this.myItems.splice(itemIndex, 1);

    this.tellActionListeners(this, {type:"removeItem", itemIndex:itemIndex});
}

// Clean up, because we're about to be removed from our parent
ItemContainer.prototype.cleanup = function()
{
    this.owner = null;
    for (var i = 0; i < this.myItems.length; ++i)
    {
        this.myItems[i].cleanup();
    }
}

ItemContainer.prototype.setOwner = function(owner)
{
    this.owner = owner;
}

ItemContainer.prototype.appendItem = function(item)
{
    this.myItems.push(item);
    item.setOwner(this);
    this.tellActionListeners(this, {type:"appendedItem", item:item});
}

ItemContainer.prototype.notifyAppendItemChildren = function()
{
	if (this.myItems == null)
		return;
		
	for (var i = 0; i < this.myItems.length; ++i)
	{
	    this.tellActionListeners(this, {type:"appendedItem", item:this.myItems[i]});
	    this.myItems[i].notifyAppendItemChildren();
	}
}

// ViewItemContainer is the view of the ItemContainer.
// It updates whenever the ItemContainer updates.
function ViewItemContainer(x, y, modelItem, viewItemFactory)
{
    ViewItemContainer.baseConstructor.call(this, x, y);
    this.rootContainer = this;
    this.parentContainer = null;

    this.modelItem = modelItem;
    this.viewItemFactory = viewItemFactory;
    
    // Put contained items into a separate group
    this.containedItems = new SVGElement("g");
    this.appendChild(this.containedItems);
    
    // Create a separate group for things you wish to display in
    // a separate layer
    this.auxGroup = new SVGElement("g");
}

KevLinDev.extend(ViewItemContainer, SVGComponent);

ViewItemContainer.prototype.doAction = function(src, evt)
{
    ViewItemContainer.superClass.doAction.call(this, src, evt);   

    if (evt.type == "appendedItem")
    {
        this.appendViewItemAndChildren(evt.item);
    }
    else if (evt.type == "removeItem")
    {
        // Abandon the view of this item
        
        // First remove the viewItem from the item's action listeners
        var viewItem = this.containedItems.childNodes[evt.itemIndex];
        viewItem.removeActionListeners();
        
        // Remove the viewItem
        this.containedItems.removeChildByIndex(evt.itemIndex);
        this.auxGroup.removeChildByIndex(evt.itemIndex);
    }
}

ViewItemContainer.prototype.updateChildrenFromModel = function()
{
    for (var i = 0; i < this.modelItem.myItems.length; ++i)
    {
        this.appendViewItemAndChildren(this.modelItem.myItems[i]);
    }
}

ViewItemContainer.prototype.appendViewItemAndChildren = function(item)
{
    var viewItem = this.viewItemFactory.makeViewItem(item);
    if (viewItem != null)
    {
        viewItem.rootContainer = this.rootContainer;
        viewItem.parentContainer = this;
        item.addActionListener(viewItem); // Listen for changes to the item
        viewItem.rootContainer.addActionListener(viewItem); // Listen for changes from our root
        this.containedItems.appendChild(viewItem);
        
        this.auxGroup.appendChild(viewItem.auxGroup);
        viewItem.onBeingAdded();
    }
    
	// If the item has children, also append those.
	if (item.myItems != null)
	{
		for (var i = 0; i < item.myItems.length; ++i)
		{
			viewItem.appendViewItemAndChildren(item.myItems[i]);
		}
	}
	return viewItem;
}

// Default method called when a ViewItemContainer is itself contained
// in another item. Useful when this item wants to change its appearance
// based on what it's on.
ViewItemContainer.prototype.onBeingAdded = function()
{
}

ViewItemContainer.prototype.removeActionListeners = function()
{
    for (var i = 0; i < this.containedItems.childNodes.length; ++i)
    {
        this.containedItems.childNodes[i].removeActionListeners();
    }
    this.modelItem.removeActionListener(this);
}
// Model for a two-dimensional grid
// - Each (i, j) position contains a GridContents object
// - It's a sparce array, so don't bother generating the GridContents
//   until someone tries to access that coordinate.
function GridModel(itemFactory)
{
    GridModel.baseConstructor.call(this);
    this.src = "GridModel";

	this.xmlDoc = createXMLDoc("m");
    this.xmlModel = this.xmlDoc.firstChild;
    
    this.gridData = {};

	// Keep track of the moveable items in the model
	this.moveableItems = [];

    // Items need ids so actions and conditions can refer 
    // to them for serialisation purposes.
    this.itemIdIndex = 0;
    this.itemIdList = [];

    this.itemFactory = itemFactory;
    
    this.quadList = [{x:1,y:1},{x:-1,y:1},{x:-1,y:-1},{x:1,y:-1}];
    
    // Default list of adjacent cellContents
    this.adjList = [
        {x:1,y:0,inFront:false, side:0},
        {x:0,y:1,inFront:true, side:1},
        {x:-1,y:0,inFront:true, side:0},
        {x:0,y:-1,inFront:false, side:1}
        ];
    
    // Whether to show items that have the isInvisible param set to true.
    this.showInvisible = false;    
}

KevLinDev.extend(GridModel, ActionObject);

GridModel.prototype.clear = function()
{
    for (var i in this.gridData)
    {
        for (var j in this.gridData[i])
        {
            this.gridData[i][j].clear();
        }
    }
    this.moveableItems = [];

    this.itemIdIndex = 0;
    this.itemIdList = [];
}

GridModel.prototype.registerItem = function(item)
{
    if (item.id == null)
        item.id = "i_" + this.itemIdIndex++;
        
    this.itemIdList[item.id] = item;
}

// Add the item to the itemIdList, so that we can later more easily retrieve items with ids.
// Also ensure that any new id we create doesn't overlap existing ids.
GridModel.prototype.importItem = function(item)
{
    // We only care about items with ids.
    if (item.id == null)
        return;
        
    // When importing items, we need to take into account existing item ids,
    // to ensure we don't issue one that already exists.
    // We do so by ensuring our item id index is always greater than any
    // imported item id.
    var idIndex = parseInt(item.id.slice(2)); // remove the prefix "i_"
    if (idIndex >= this.itemIdIndex)
        this.itemIdIndex = idIndex + 1;
        
    this.itemIdList[item.id] = item;
}

GridModel.prototype.getItemById = function(itemId)
{
    return this.itemIdList[itemId];
}

GridModel.prototype.addToMoveableItems = function(item)
{
    // Check that it's not already here.
    for (var i = 0; i < this.moveableItems.length; ++i)
    {
     	if (this.moveableItems[i] == item)
     	{
         	return;
     	}
    }

    this.moveableItems.push(item);
}

GridModel.prototype.removeFromMoveableItems = function(item)
{
    for (var i = 0; i < this.moveableItems.length; ++i)
    {
     	if (this.moveableItems[i] == item)
     	{
         	this.moveableItems.splice(i, 1);
         	break;
     	}
    }
}

// Return a GridContents for the coordinates
GridModel.prototype.getContents = function(x, y)
{
    if (this.gridData[x] == null)
       this.gridData[x] = [];
   
    if (this.gridData[x][y] == null)
    {
        this.gridData[x][y] = this.itemFactory.makeContents(this, x, y, 0);
    }

    return this.gridData[x][y];
}

// Default is for a rect grid
GridModel.prototype.getWithinRadius = function(x, y, radius)
{
    var result = [];
    for (var x1 = x - radius; x1 <= x + radius; x1++)
    {
       for (var y1 = y - radius; y1 <= y + radius; y1++)
       {
           var dist = this.getDistance(x, y, x1, y1);

           if (dist != null && dist < radius)
           {
               result.push(this.getContents(x1, y1));
           }
       }
    }
    return result;
}

// Default is for a rect grid
GridModel.prototype.getDistance = function(x1, y1, x2, y2)
{
    // Default is the D&D approximation
    var x = Math.abs(x2 - x1);
    var y = Math.abs(y2 - y1);
    return (x > y) ? x + Math.floor(y / 2) : y + Math.floor(x / 2);
}

/*
GridModel.prototype.toString = function()
{
    var result = "";
   
    for (var i in this.gridData)
    {
       for (var j in this.gridData[i])
       {
           var gridContents = this.gridData[i][j].toString();
           if (gridContents != null)
           {
               result += "[" + i + "," + j + "," + gridContents + "]";
           }
       }
    }
    return result;
}
*/

GridModel.prototype.clearXML = function()
{
    // Remove all child nodes of the model element
    while (this.xmlModel.firstChild != null)
        this.xmlModel.removeChild(this.xmlModel.firstChild);
}

GridModel.prototype.toXML = function()
{
    this.clearXML();
    
    for (var i in this.gridData)
    {
        for (var j in this.gridData[i])
        {
            var cellContentsXML = this.gridData[i][j].toXML(this.xmlDoc);
            if (cellContentsXML != null)
                this.xmlModel.appendChild(cellContentsXML);
        }
    }
    
    return this.xmlModel;
}

GridModel.prototype.fromXML = function(xml)
{
    if (xml == null)
        return;
        
    var xmlContentsList = xml.getElementsByTagName("c");
    
    for (var i = 0; i < xmlContentsList.length; i++)
    {
        var xmlContents = xmlContentsList.item(i);
        var x = parseInt(xmlContents.getAttribute("x"));
        var y = parseInt(xmlContents.getAttribute("y"));
        var cellContents = this.getContents(x, y);
        
        cellContents.fromXML(xmlContents);
    }    
}

// String is of form [x,y,content][x,y,content]...
// Content cannot contain "," or "[" or "]"
GridModel.prototype.fromString = function(str)
{
    var nodeList = str.split("]");
    for (var k in nodeList)
    {
       if (nodeList[k][0] == "[")
       {
           var bits = nodeList[k].split(",");
           var x = parseInt(bits[0].substr(1)); // skip the "["
           var y = parseInt(bits[1]);
           var cellContents = this.getContents(x, y);
           cellContents.fromString(bits[2]);
       }
    }
}

// Find the items with the specified item code
GridModel.prototype.findItemsByCode = function(itemCode)
{
	var result = [];
    for (var i in this.gridData)
    {
        for (var j in this.gridData[i])
        {
            var currItem = this.gridData[i][j].findItemByCode(itemCode);
            if (currItem != null)
                result.push(currItem);
        }
    }
	if (result.length == 0)
    	return null;
	else
		return result;
}
// The contents of a particular element in the grid
function GridContents(model, x, y)
{
    GridContents.baseConstructor.call(this);
    this.src = "GridContents";

    this.model = model;
    this.x = x;
    this.y = y;

    this.seenBy = []; // List of [item, elevation, distance] that can see this contents
	this.tempParams = {};
}

KevLinDev.extend(GridContents, ItemContainer);

GridContents.prototype.clear = function()
{
	this.tempParams = {};
    this.removeAllItems();
}

GridContents.prototype.toString = function()
{
    var result = "";
    var isFirst = true;
    for (var i = 0; i < this.myItems.length; ++i)
    {
        if (this.myItems[i] != null)
        {
            if (!isFirst)
                result += ";";
            else
                isFirst = false;
                   
            result += this.myItems[i].toString();
        }
    }
   
    if (result.length == 0)
        return null;
       
    return result;
}

GridContents.prototype.getLocationString = function()
{
	return this.x + "," + this.y;
}

// String is of the form a;b;c;...
// The item contents get parsed into this.myItems
GridContents.prototype.fromString = function(str)
{
    this.myItems = [];
    if (str != null)
    {
        var itemCodes = str.split(";");
        for (var i in itemCodes)
        {
            var currItem = this.model.itemFactory.makeItem(itemCodes[i]);
            this.appendItem(currItem);
        }
    }
}

GridContents.prototype.toXML = function(xmlDoc, showAll)
{
    // Only add a contents if there's actually something in it.
    if (this.myItems.length == 0)
        return null;
    
    var xmlContents = xmlDoc.createElement("c");
    xmlContents.setAttribute("x", this.x);
    xmlContents.setAttribute("y", this.y);
    
    for (var i = 0; i < this.myItems.length; ++i)
    {
        var xmlItem = this.myItems[i].toXML(xmlDoc, showAll);
        if (xmlItem != null)
            xmlContents.appendChild(xmlItem);
    }

    if (showAll)
    {
        for (var i = 0; i < this.seenBy.length; ++i)
        {
            var xmlSeen = xmlDoc.createElement("seen");
            xmlSeen.setAttribute("item", this.seenBy[i].item);
            xmlSeen.setAttribute("elev", this.seenBy[i].viewElev);
            xmlSeen.setAttribute("dist", this.seenBy[i].distance);
            xmlSeen.setAttribute("x", this.seenBy[i].x);
            xmlSeen.setAttribute("y", this.seenBy[i].y);
            xmlSeen.setAttribute("type", this.seenBy[i].viewType);
            xmlContents.appendChild(xmlSeen);
        }
    }
    return xmlContents;
}

GridContents.prototype.fromXML = function(xml)
{
    for (var i = 0; i < xml.childNodes.length; i++)
    {
        var xmlItem = xml.childNodes.item(i);        
		var currItem = this.model.itemFactory.makeItemFromXML(xmlItem, this.model);
        this.appendItem(currItem);
    }
}

GridContents.prototype.addSeenBy = function(item, viewElev, distance, x, y, viewType)
{
    this.seenBy.push({
         item:item, 
         viewElev:viewElev, 
         distance:distance,
         x:x,
         y:y,
         viewType:viewType
         });
}

GridContents.prototype.removeSeenBy = function(item)
{
    for (var i = 0; i < this.seenBy.length; ++i)
    {
        if (this.seenBy[i].item == item)
        {
            this.seenBy.splice(i, 1);
            return;
        }
    }
}

// Find the highest elevation of any item that blocks
GridContents.prototype.getBlockingHeight = function()
{
    var result = 0;
    for (var i = 0; i < this.myItems.length; ++i)
    {
        var currHt = this.myItems[i].getBlockingHeight();
        if (currHt > result)
            result = currHt;
    }
    return result;
}

// Bit of a hack, because this really only gets the first child at each
// layer
GridContents.prototype.getTopItem = function()
{
    var topData = this;
    while (topData.myItems.length > 0)
    {
        topData = topData.myItems[0];
    }
    return topData;
}

// Find the first item with the specified item code
GridContents.prototype.findItemByCode = function(itemCode)
{
    return this.find("itemCode", itemCode);
}

// params is a list {} of parameters. It must include the following:
//      itemName - the full name of the item
//      itemCode - code for the item, used by templates
// Optional parameters are:
//      ht - the height of the item (default 0)
//      blockView - whether it stops pov from seeing through it (default false)
//      povRange - the range that this item can "see" with a pov (default 0)
//      isTemporary - don't save the item when writing to xml (default false)
//      canStandOn - indicates whether this item can be stood on (default true)
//      speech - what the item is speaking (default null)
//      isInvisible - if true, hide the item from the user unless
//                  the model specifies showInvisible=true (default false)
// Read-only params are:
//      elev - base elevation of the item (depends on what items it's sitting on)

function GridItem(params)
{
    GridItem.baseConstructor.call(this);
    this.src = "GridItem";

    this.params = (params == null) ? {} : params;
	this.params.saveVals = {};
	
    if (this.params.ht == null)
        this.params.ht = 0; 
    if (this.params.elev == null)
        this.params.elev = 0; 
    if (this.params.blockView == null)
        this.params.blockView = false; 
    if (this.params.povRange == null)
        this.params.povRange = 0; 
    if (this.params.isTemporary == null)
        this.params.isTemporary = false; 
    if (this.params.canStandOn == null)
        this.params.canStandOn = false; 
    if (this.params.isInvisible == null)
        this.params.isInvisible = false; 
	if (this.params.isHighlighted == null)
		this.params.isHighlighted = false;
	
    this.cellContents = null; // doesn't belong to anything yet
    this.canSee = {}; // Can't see anything yet

	this.dirns = ['r', 'b', 'l', 'f']; // default directions
}

KevLinDev.extend(GridItem, ItemContainer);

// Grid items can move between owners and layers.
GridItem.prototype.setOwner = function(owner)
{    
    GridItem.superClass.setOwner.call(this, owner);   

    // Set our elevation based on our owner.
    this.updateElev();

    // Set the cellContents
    this.updateOwnerContents();
}

// Update any POV affected by changes to this grid item
GridItem.prototype.updateAffectedPOV = function()
{
    // If we're in the path of any seeing items, update those
    if (this.cellContents != null)
    {
        // First get a list of the items that will need their povs updated
        // Note that the cellContents.seenBy list may change as we update the
        // povs of the items.
        var povItems = [];
        for (var i = 0; i < this.cellContents.seenBy.length; ++i)
        {
            povItems.push(this.cellContents.seenBy[i].item);
        }
        
        for (var j = 0; j < povItems.length; ++j)
        {
            povItems[j].updatePOV();
        }
    }
}

GridItem.prototype.updatePOV = function()
{
    // update what we can see
    if (this.params.povRange > 0)
    {
        this.updateVisibleWithinRadius(this.params.povRange, "pov");
    }
}

GridItem.prototype.toString = function()
{
    var result = this.params.itemCode + this.params.ht;
    
    if (this.myItems.length > 0)
        result += "(";
        
    for (var i = 0; i < this.myItems.length; ++i)
    {
        if (i != 0)
            result += " ";
            
        result += this.myItems[i].toString();
    }
    
    if (this.myItems.length > 0)
        result += ")";
    
    return result;
}

GridItem.prototype.toXML = function(xmlDoc, showAll)
{
    // Temporary items shouldn't get saved
    if (this.params.isTemporary)
        return null;

	var xmlItem = null;
    if (xmlDoc == null)
	{
		xmlDoc = createXMLDoc("i");
		xmlItem = xmlDoc.firstChild;
	}
	else
	{
		xmlItem = xmlDoc.createElement("i");		
	}

	xmlItem.setAttribute("c", this.params.itemCode);

	if (this.params.saveVals.ht != null)
    	xmlItem.setAttribute("h", this.params.saveVals.ht);
	else
    	xmlItem.setAttribute("h", this.params.ht);

	// Lots of items can have directions that don't need to be saved - only
	// save if the user specifically set the initial direction.
	if (this.params.saveVals.direction != null)
		xmlItem.setAttribute("d", this.params.saveVals.direction);
    
    if (this.id != null)
    {
        xmlItem.setAttribute("id", this.id);
    }
    
    if (showAll)
    {
        xmlItem.setAttribute("e", this.params.elev);
    }
    
    for (var i = 0; i < this.myItems.length; ++i)
    {
        var xmlChildItem = this.myItems[i].toXML(xmlDoc);
        if (xmlChildItem != null)
            xmlItem.appendChild(xmlChildItem);
    }
    
    return xmlItem;
}

// The item is being removed, so let listeners know
GridItem.prototype.cleanup = function()
{
    GridItem.superClass.cleanup.call(this);   
	this.updateCellContents(null);
	this.tellActionListeners(this, {type:"ItemBeingDeleted", item:this});
}

// Update the item and its children regarding the cellContents that
// it is part of
GridItem.prototype.updateOwnerContents = function()
{
    if (this.owner != null)
    {
        if (this.owner.src == "GridContents")
		{
			this.updateCellContents(this.owner);
        }
		else
        {
			this.updateCellContents(this.owner.cellContents);
    	}
	}
    
    for (var i = 0; i < this.myItems.length; ++i)
    {
        this.myItems[i].updateOwnerContents();
    }
}

// Update the cellContents for this item.
// Also handle all the things that happen when the item is placed in a new cell.
GridItem.prototype.updateCellContents = function(newCellContents)
{
	if (this.cellContents != newCellContents)
	{
    	this.cellContents = newCellContents;
		if (this.cellContents != null)
		{
			this.updatePOV();
			this.updateAffectedPOV();
		}
		else
		{
		    this.clearSeenBy();
		}
	}
}

// Set what is visible to this item.
//
// We tell the item what height it can see at each grid cellContents within the
// radius, and inform each of the cellContents that they can be seen by this item
// at that height.
// 
// We calculate the view height at each cellContents. Anything below that height
// is not visible. The view height for each viewed cellContents is a function of the 
// viewer elevation, the height of the objects between the viewer
// and the viewed, and the distance between the viewer and viewed.
// To simplify matters, we evaluate each viewed cellContents in an increasing 
// radius, so we never have to evaluate the height using more than just the
// cellContents one step away from the viewed cellContents.
// To calculate what we have to look at, we use the following chart:
//
// dddlllllddd  
// dddklllkddd  
// ddddllldddd
// lkddklkddkl  
// lllkdldklll     
// lllll*lllll
// lllkdldklll  
// lkddklkddkl  
// ddddllldddd  
// dddklllkddd
// dddlllllddd
//
//
// l: Calculate height one closer to the origin is not visible or is opaque
//    and higher than the viewer,
//    this point is not visible.
//
// d: If the point one closer to the origin is not visible or is opaque,
//    this point is not visible.
//    If both of the diagonal lines either side of the diagonal are blocked
//    (at any point) this point is not visible.
//
// k: If the adjacent diagonal is not visible or opaque, AND either of the
//    adjacent straight line points is not visible or opaque, this point
//    is not visible (eg. the "k" points are blocked by the closer "d"
//    plus either of the closer "l"s)
//
GridItem.prototype.updateVisibleWithinRadius = function(radius, viewType)
{
    this.clearSeenBy(viewType);
    
    // Start with adjacent cellContents, the widen the field of view
    if (this.cellContents == null)
        return;
    var model = this.cellContents.model;
        
    var x = this.cellContents.x;
    var y = this.cellContents.y;
    var q = model.quadList;
    var sourceElevation = this.params.elev + this.params.ht;
   
    this.setVisibility(this.cellContents, this.params.elev, 0, x, y, viewType);

    // For each cellContents, set the height that can be seen at that
    // cellContents by the viewer.
    // This will depend on the height of the viewer, and the height
    // of objects between the viewer and the cellContents.
    for (var i = 1; i <= radius; i++)
    {
        // Test central l
        
        var target = model.getContents(x + i, y);
        var viewElev = this.getViewElevation(model, x + i - 1, y, sourceElevation, i, viewType);
        this.setVisibility(target, viewElev, i, x, y, viewType);
               
        target = model.getContents(x - i, y);
        viewElev = this.getViewElevation(model, x - i + 1, y, sourceElevation, i, viewType);
        this.setVisibility(target, viewElev, i, x, y, viewType);

        target = model.getContents(x, y + i);
        viewElev = this.getViewElevation(model, x, y + i - 1, sourceElevation, i, viewType);
        this.setVisibility(target, viewElev, i, x, y, viewType);

        target = model.getContents(x, y - i);
        viewElev = this.getViewElevation(model, x, y - i + 1, sourceElevation, i, viewType);
        this.setVisibility(target, viewElev, i, x, y, viewType);
    }
   
    // d is diagonal index, i is distance along that diagonal.
    for (var d = 1; d < radius; d++)
    {
        for (var i = 0; i <= radius - d; i++)
        {
            if (i == 0)
            {
                // Test d
                var dist = d * 1.4142;
                for (var j = 0; j < q.length; ++j)
                {
                    var x1 = x + q[j].x * d;
                    var y1 = y + q[j].y * d;

                    var target = model.getContents(x1, y1);
                    var viewElev = this.getViewElevation(model, x1 - q[j].x, y1 - q[j].y, sourceElevation, dist, viewType);
                    this.setVisibility(target, viewElev, dist, x, y, viewType);
                }
            }
            else if (i < d)
            {
                // Test off-diagonal "d"s
                var dist = Math.sqrt(d * d + (d + i) * (d + i));
                for (var j = 0; j < q.length; ++j)
                {
                    var x1 = x + q[j].x * (d + i);
                    var y1 = y + q[j].y * d;
                   
                    var target = model.getContents(x1, y1);
                    var viewElev = this.getViewElevation(model, x1 - q[j].x, y1 - q[j].y, sourceElevation, dist, viewType);
                    this.setVisibility(target, viewElev, dist, x, y, viewType);

                    var x1 = x + q[j].x * d;
                    var y1 = y + q[j].y * (d + i);
                   
                    target = model.getContents(x1, y1);
                    viewElev = this.getViewElevation(model, x1 - q[j].x, y1 - q[j].y, sourceElevation, dist, viewType);
                    this.setVisibility(target, viewElev, dist, x, y, viewType);
                }
            }
            else if (i == d)
            {
                // Test k
                var dist = Math.sqrt(d * d + (d + i) * (d + i));
                for (var j = 0; j < q.length; ++j)
                {
                    // (x-dx,y) || (x-dx,y-dy) && (x,y-dy))
                    var x1 = x + q[j].x * (d + i);
                    var y1 = y + q[j].y * d;
                   
                    var target = model.getContents(x1, y1);
                    
                    var v1 = this.getViewElevation(model, x1 - q[j].x, y1, sourceElevation, dist, viewType);
                    var v2 = this.getViewElevation(model, x1 - q[j].x, y1 - q[j].y, sourceElevation, dist, viewType);
                    var v3 = this.getViewElevation(model, x1, y1 - q[j].y, sourceElevation, dist, viewType);
                   
                    var viewElev = (v2 < v3) ? v2 : v3;
                    viewElev = (v1 > viewElev) ? v1 : viewElev;
                    this.setVisibility(target, viewElev, dist, x, y, viewType);
                   
                    // (x,y-dy) || (x-dx,y-dy) && (x-dx,y))
                    x1 = x + q[j].x * d;
                    y1 = y + q[j].y * (d + i);
                   
                    target = model.getContents(x1, y1);
                    
                    v1 = this.getViewElevation(model, x1, y1 - q[j].y, sourceElevation, dist, viewType);
                    v2 = this.getViewElevation(model, x1 - q[j].x, y1 - q[j].y, sourceElevation, dist, viewType);
                    v3 = this.getViewElevation(model, x1 - q[j].x, y1, sourceElevation, dist, viewType);
                   
                    viewElev = (v2 < v3) ? v2 : v3;
                    viewElev = (v1 > viewElev) ? v1 : viewElev;
                    this.setVisibility(target, viewElev, dist, x, y, viewType);
                }
            }
            else
            {
                // Test off-centre l
                var dist = Math.sqrt(d * d + (d + i) * (d + i));
                for (var j = 0; j < q.length; ++j)
                {
                    var x1 = x + q[j].x * (d + i);
                    var y1 = y + q[j].y * d;

                    var target = model.getContents(x1, y1);
                    var viewElev = this.getViewElevation(model, x1 - q[j].x, y1, sourceElevation, dist, viewType);
                    this.setVisibility(target, viewElev, dist, x, y, viewType);

                    var x1 = x + q[j].x * d;
                    var y1 = y + q[j].y * (d + i);

                    target = model.getContents(x1, y1);
                    viewElev = this.getViewElevation(model, x1, y1 - q[j].y, sourceElevation, dist, viewType);
                    this.setVisibility(target, viewElev, dist, x, y, viewType);
                }
            }
        }
    }
}

GridItem.prototype.getViewElevation = function(model, x, y, sourceElevation, distance, viewType)
{
    var blockerViewElev = this.canSee[viewType][x][y].viewElev;
    var blockerBlockElev = model.getContents(x, y).getBlockingHeight();
    var h = blockerViewElev > blockerBlockElev ? blockerViewElev : blockerBlockElev;
    return h - (sourceElevation - h) / distance * 2; // TODO: The *2 is a fudge factor
}

// This item can see this cellContents at this elevation
GridItem.prototype.setVisibility = function(cellContents, viewElev, distance, x, y, viewType)
{
    cellContents.addSeenBy(this, viewElev, distance, x, y, viewType);

    if (this.canSee[viewType] == null)
        this.canSee[viewType] = {};

    if (this.canSee[viewType][cellContents.x] == null)
        this.canSee[viewType][cellContents.x] = {};
   
    this.canSee[viewType][cellContents.x][cellContents.y] = {cellContents:cellContents, viewElev:viewElev, distance:distance};
}

GridItem.prototype.clearSeenBy = function(viewType)
{
    if (viewType == null)
    {
        for (var s in this.canSee)
        {
            for (var i in this.canSee[s])
            {
                for (var j in this.canSee[s][i])
                {
                    this.canSee[s][i][j].cellContents.removeSeenBy(this);
                }
            }
        }        
        this.canSee = {};
    }
    else
    {
        for (var i in this.canSee[viewType])
        {
            for (var j in this.canSee[viewType][i])
            {
                this.canSee[viewType][i][j].cellContents.removeSeenBy(this);
            }
        }
        this.canSee[viewType] = {};
    }
}

// Find the blocking height of this item and anything it's holding.
GridItem.prototype.getBlockingHeight = function()
{
    var result = 0;
    
    if (this.params.blockView)
        result = this.params.elev + this.params.ht;
        
    for (var i = 0; i < this.myItems.length; ++i)
    {
        var currHt = this.myItems[i].getBlockingHeight();
        if (currHt > result)
            result = currHt;
    }
    return result;
}

// Set a parameter that will be associated with this item
GridItem.prototype.setItemParam = function(name, value, doSave)
{
	if (doSave)
	{
		this.params.saveVals[name] = value;
	}
	
    // If the param is already in this state, don't bother sending
    // an action event.
    if (this.params[name] == value)
        return;
        
    this.params[name] = value;

    // Tell our listeners
    this.tellActionListeners(this, {type:"paramChanged", name:name, value:value});
}

// Update the elevation based on our owner's height and elevation
GridItem.prototype.updateElev = function()
{
    // The owner could be a GridContents or a GridItem
    // If the owner is a GridItem, we are sitting on top of it.
    if (this.owner == null)
    {
        this.setItemParam("elev", 0);
    }
    else if (this.owner.params != null && this.owner.params.elev != null)
    {
        if (this.owner.params.ht != null && !this.params.isCarried)
       		this.setItemParam("elev", this.owner.params.elev + this.owner.params.ht);
   		else
       		this.setItemParam("elev", this.owner.params.elev);
	}
	
	// Also update elevations of all our children
	for (var i = 0; i < this.myItems.length; ++i)
		this.myItems[i].updateElev();
}

// Set the direction of this item.
// Also update the direction of all its children, by rotating them correspondingly.
GridItem.prototype.setDirection = function(direction, doSave)
{
	var delta = this.getDirectionDelta(this.params.direction, direction);
	this.setItemParam("direction", direction, doSave);
	
	// Rotate all our children
	for (var i = 0; i < this.myItems.length; ++i)
    {
		this.myItems[i].rotateItem(delta, false); // Don't save the child direction rotations.
    }
}

// Find the delta between the src and dest
GridItem.prototype.getDirectionDelta = function(src, dest)
{
	// Find the index of the src
	var srcIndex = 0;
	for (var i = 0; i < this.dirns.length; ++i)
	{
		if (this.dirns[i] == src)
		{
			srcIndex = i;
			break;
		}
	}

	// Find the index of the dest relative to the src
	for (var i = 0; i < this.dirns.length; i++)
	{
		if (this.dirns[i] == dest)
			return (i - srcIndex + this.dirns.length) % this.dirns.length;
	}
	
	return 0;
}

// Rotate the specified item to the right, by the specified amount (-1 to turn left)
GridItem.prototype.rotateItem = function(rotation, doSave)
{
	// Check if the item has no direction specified
	if (this.params.direction == null)
	{
		this.params.direction = "f";
	}
	
	for (var i = 0; i < this.dirns.length; ++i)
	{
		if (this.dirns[i] == this.params.direction)
		{
			// Rotate to the specified direction
			i += rotation;
			i = i % this.dirns.length;
			while (i < 0)
				i += this.dirns.length;
			
			this.setDirection(this.dirns[i], doSave);
			
			break;
		}
	}
}

// Object height is a special case of an item param because it can affect pov,
// and items with a wtPerHt have their weight calculated according to height
GridItem.prototype.setHeight = function(height, doSave)
{
	this.setItemParam("ht", height, doSave);
	
	// Weight can be a function of height for some items.
	if (this.params.wtPerHt != null)
		this.params.wt = this.params.wtPerHt * height;
	
	// Update the POV of this item and each item on top of it
	var items = this.getFlattenedTree();
	for (var i = 0; i < items.length; ++i)
	{
		items[i].updateElev();
    	items[i].updatePOV();
	}
	
	// Update any items with a POV that touches this cellContents
	this.updateAffectedPOV();
}

// Return true if the item can be moved to the destination cellContents
// This is only true if the destination cellContents can be stood upon, and
// if the height of the cellContents is less than the item's current height
// plus the delta height specified (ie. can't climb too high)
GridItem.prototype.canMoveTo = function(destItem, maxClimbHeight, maxDropHeight)
{
	// Can only move items onto other items
	if (destItem.src == "GridContents")
		return false;
		
    if (!destItem.params.canStandOn)
        return false;
    
    var delta = destItem.params.ht + destItem.params.elev - this.params.elev;
    if (delta >= 0 && delta <= maxClimbHeight)
        return true;
    else if (delta < 0 && (maxDropHeight == null || -delta <= maxDropHeight))
        return true;
    else
        return false;
}

// Return a list of items with the matching item codes that this item can see,
// in the form of a list of {item, distance}
GridItem.prototype.searchFor = function(itemCode)
{
    var itemList = [];
    
    for (var i in this.canSee["pov"])
    {
        for (var j in this.canSee["pov"][i])
        {
            var canSee = this.canSee["pov"][i][j];
            
            // Find if there are any items in this cellContents match our request
            // TODO: need a find function that gets all results, not just the first.
            var item = canSee.cellContents.find("itemCode", itemCode);

            // Is it in view?
            if (item != null && item.params.elev + item.params.ht >= canSee.viewElev)
            {
                itemList.push({item:item, distance:canSee.distance})
            }
        }
    }
    
    return itemList;
}

// Summarise this item's desires. 
// Relevent parameters are:
// moveTowards: {list} - a list of itemCode, ordered by preference
// scaredOf: {list} - a list of itemCode. Will not move towards any item in this list
//                    that is facing it (ie. facing in the opposite direction to
//                    the direction this wants to move).
//                    If the scaredOf item has no direction, this will not move towards
//                    it at all.
// Returns:
// {x:desired_x, y:desired_y, params:updated_param_list}
GridItem.prototype.requestChange = function()
{
    var destContents = null;
    
    if (this.params.moveTowards == null)
        return null;
    
    for (var i in this.params.scaredOf)
    {
        // Can we see an item we want to avoid moving towards?
        var items = this.searchFor(this.params.scaredOf[i]);
        if (items.length > 0)
        {
            // Found one or more items to fear
            // TODO
        }
    }

    for (var i in this.params.moveTowards)
    {
        // Can we see an item we want to move towards?
        var items = this.searchFor(this.params.moveTowards[i]);
        if (items.length > 0)
        {
            // Found one or more items
            
            // Is there one that is unambiguously closest?
            var closestDist = items[0].distance;
            var closestItems = [items[0]];
            for (var j = 1; j < items.length; j++)
            {
                if (items[j].distance < closestDist)
                {
                    closestDist = items[j].distance;
                    closestItems.push(items[j]);
                }
                else if (items[j].distance == closestDist)
                {
                    closestItems = [items[j]];
                }
            }

            if (closestItems.length == 1)
            {
                destContents = this.followSimplePathTo(closestItems[0].item);
            }
            else
            {
                var sumX = 0;
                var sumY = 0;
                // Try to get a mean direction
                for (var j = 0; j < closestItems.length; ++j)
                {
                    destContents = this.followSimplePathTo(closestItems[j].item);
                    sumX += (destContents.x - this.cellContents.x);
                    sumY += (destContents.y - this.cellContents.y);                    
                }
                
                if (Math.abs(sumX) > Math.abs(sumY))
                {
                    destContents = this.cellContents.model.getContents(this.cellContents.x + (sumX > 0 ? 1 : -1), this.cellContents.y);
                }
                else if (Math.abs(sumX) < Math.abs(sumY))
                {
                    destContents = this.cellContents.model.getContents(this.cellContents.x, this.cellContents.y + (sumY > 0 ? 1 : -1));
                }
                else if (sumX != 0)
                {
                    // sumX and sumY are equal - we default to X direction
                    destContents = this.cellContents.model.getContents(this.cellContents.x + (sumX > 0 ? 1 : -1), this.cellContents.y);
                }
                else
                {
                    // We are perilously indecisive. Don't move.
                    destContents = null;
                }
            }
            break; // We found something/s we wanted to move towards.
        }
    }
    
    if (destContents != null)
    {
        // Hooray! We have a destination. We'll also want to set the direction label.
        var dirnLabel = (destContents.x != this.cellContents.x ? (destContents.x < this.cellContents.x ? "r" : "l") : (destContents.y < this.cellContents.y ? "b" : "f"));
        return {cellContents: destContents, params:{direction:dirnLabel}};
    }
    
    return null;
}

GridItem.prototype.getSimplePathPreferred = function(item, goLong)
{
    var deltaX = this.cellContents.x - item.cellContents.x;
    var deltaY = this.cellContents.y - item.cellContents.y;
    var destX = this.cellContents.x;
    var destY = this.cellContents.y;

    // Try the preferred direction first, with X as default.
    if (goLong == (Math.abs(deltaX) >= Math.abs(deltaY)))
    {
        destX += (deltaX == 0 ? 0 : (deltaX > 0 ? -1 : 1));
    }
    else 
    {
        destY += (deltaY == 0 ? 0 : (deltaY > 0 ? -1 : 1));
    }
    return this.cellContents.model.getContents(destX, destY);
}

// Calculate the simple "as the crow flies" direction to go towards the
// specified item. 
GridItem.prototype.followSimplePathTo = function(item)
{
    // Try the more compelling direction
    var destContents = this.getSimplePathPreferred(item, true);
    if (destContents == null)
        return null;
    
    // If we're right next to it, we can move there
    if (destContents == item.cellContents)
    {
        // Need to check whether we'd be able to move to where the item is
        // standing
        if (this.canMoveTo(item.owner, this.params.climbHeight))
            return destContents;
        else
            return null;
    }
    
    if (this.canMoveTo(destContents.getTopItem(), this.params.climbHeight))
    {
        // Good. That's where we'll say we're going.
        return destContents;
    }
    
    // Oookay, we'll try the less compelling direction.
    var destContents = this.getSimplePathPreferred(item, false);
    if (destContents == this.cellContents)
    {
        // That's where we are now, so let's not move at all.
        // (This happens if the simple path is a straight line in x or y direction)
        return null;
    }

    if (this.canMoveTo(destContents.getTopItem(), this.params.climbHeight))
    {
        // Good. That's where we'll say we're going.
        return destContents;
    }
    
    // Couldn't go anywhere.
    return null;
}
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
// View corresponding to a grid model
// - each node has mouseover and mouseclick
// - overall view has key events
// - queries model for what to show
// - tells controller when user input happens
// - receives update info from model.
// 
// Has the following structure
// <svg x="" y="" width="" height=""> // clip layer
//     <g transform=""> // Transform layer
//         <g/> // Objects go in here
//         <g/> // Covers go in here
//         <g/> // Bonus covers go in here
//     </svg>
// </g>
function GridView(gridModel, itemFactory, numCols, numRows, startCol, startRow, cellWidth, cellHeight)
{
	// Setup the view area
	this.cellWidth = cellWidth;
	this.cellHeight = cellHeight;
	
	this.setCellCentre(startCol, startRow);
	this.setViewCentre(187, 165);
	this.setViewSize(375, 330);

    GridView.baseConstructor.call(this, {width:375, height:330});

    this.itemFactory = itemFactory;

	this.transformLayer = new SVGElement("g");
	this.appendChild(this.transformLayer);
	
	this.objectLayer = new SVGElement("g");
	this.transformLayer.appendChild(this.objectLayer);
    this.coverLayer = new SVGElement("g"); // svg for the cover layer
	this.transformLayer.appendChild(this.coverLayer);
    this.coverLayer2 = new SVGElement("g"); // svg for the cover2 layer
	this.transformLayer.appendChild(this.coverLayer2);
    
    this.view = []; // Keep an array for the view elements
   
    // Keep an array for the z-order groups
    // Cells are added to the view array, and also to a group
    // for each z-plane (as specified in the drawCell method)
    this.z_list = [];
   
    this.gridModel = gridModel;
   
	this.setFixedCellCount(8);
    this.updateView();
}

KevLinDev.extend(GridView, SVGRoot);

// Set the size of the view area. This will dictate the pattern of cells 
// that we draw.
GridView.prototype.setViewSize = function(width, height)
{
	this.viewWidth = width;
	this.viewHeight = height;
}

// Set the viewpoint centre.
// - centre_x, centre_y: the view is centred around this point
GridView.prototype.setViewCentre = function(centre_x, centre_y)
{
	this.viewCentreX = centre_x;
	this.viewCentreY = centre_y;
}

// Set the cell that is at the viewCentre.
GridView.prototype.setCellCentre = function(i, j)
{
	this.cellCentreX = i;
	this.cellCentreY = j;
}

// Set a fixed cell count in the x direction
GridView.prototype.setFixedCellCount = function(cellCountX)
{
	this.fixedCellCountX = cellCountX;
}

// Update the view appearance
// 
// Prototype method. Derived classes should implement this.
GridView.prototype.updateView = function()
{
}

// Default visual layout of cells
// (These functions will get overriden by child classes if they require
// more sophisticated mappings)
GridView.prototype.getLayoutX = function(i, j)
{
    return i;
}

GridView.prototype.getLayoutY = function(i, j)
{
    return j;
}

GridView.prototype.inView = function(i, j)
{
}

// Set the bounds of the gridView to be within the specified bbox.
// Also adjust the width or height of the clipBox
GridView.prototype.setBounds = function(bbox)
{
	// We have a fixed aspect ratio, so trim the bbox correspondingly.
	var testWidth = this.cellWidth * bbox.height / this.cellHeight;
	if (bbox.width > testWidth)
	{
		// trim width and maintain centre.
		bbox.x += (bbox.width - testWidth) / 2.0;
		bbox.width = testWidth;
	}
	else
	{
		// trim height and maintain centre.
		var testHeight = this.cellHeight * bbox.width / this.cellWidth;
		bbox.y += (bbox.height - testHeight) / 2.0;
		bbox.height = testHeight;
	}
	this.setClipRect(bbox);
	this.setViewSize(bbox.width, bbox.height);
	this.setViewCentre(bbox.width / 2.0, bbox.height / 2.0);
	this.updateView();
}

GridView.prototype.drawCell = function(x, y)
{
    if (!this.inView(x, y))
       return;
       
    var modelContents = this.gridModel.getContents(x, y);

    // Register this cell in the view
    if (this.view[x] == null)
       this.view[x] = [];
       
    if (this.view[x][y] == null)
    {
        // Add a new grid object view
       
        var x_posn = this.getLayoutX(x, y) * this.cellWidth;
        var y_posn = this.getLayoutY(x, y) * this.cellHeight;

        // Update with the model cellContents
        var currCell = this.itemFactory.makeViewContents(this, x_posn, y_posn, x, y, modelContents, true);
   
        this.view[x][y] = currCell;
       
        // Receive user input from the grid buttons
        currCell.addActionListener(this);

        // Insert the node in the correct z-order position
       
        // Find the z-order group
        // Items at bottom are always in front
        var z = this.getLayoutY(x, y);
       
        var zGroup = this.z_list[z];
       
        if (zGroup == null)
        {
            // Start a new z-order group
            zGroup = new SVGElement("g");

            // Find the next highest z-order group
            var next_z = z;
            for (var curr_z in this.z_list)
            {
                // Note we have to go through the entire list
                // because the order they appear may not be
                // monotonic (in fact, saying z_list[z] = zGroup
                // always appends the zGroup to the end of the
                // list - at that point, it's an associative array
                // and the numbers are treated as strings. So be
                // careful.)
                var curr_z_index = parseInt(curr_z);
                if (curr_z_index > z)
                {
                    if (next_z == z || curr_z_index < next_z)
                    {
                        next_z = curr_z_index;
                    }
                }
            }
           
            if (next_z == z)
            {
                // There wasn't anything after z
                this.objectLayer.appendChild(zGroup);
            }
            else
            {
                this.objectLayer.insertBefore(zGroup, this.z_list[next_z]);
            }

            this.z_list[z] = zGroup;
        }
       
        zGroup.appendChild(currCell);
       
        // The cover is in a separate auxiliary component, ready
        // to be placed in a separate layer.
        this.coverLayer.appendChild(currCell.auxiliaryComponents[0]);
        
        // The items also can put visual elements into the cover layer
        // via their auxGroup.
        this.coverLayer.appendChild(currCell.auxiliaryComponents[1]);
    }
}

// Remove any view cellContents that are outside the visible area
GridView.prototype.removeOutsideView = function()
{
    for (var i in this.view)
    {        
       for (var j in this.view[i])
       {
           if (!this.inView(parseInt(i), parseInt(j)))
           {
               this.view[i][j].remove();
               delete this.view[i][j];
           }
       }
    }
}

// Update the view to include the points of view in the povList
GridView.prototype.updatePOV = function(povList)
{
    for (var i in this.view)
    {
        for (var j in this.view[i])
        {
            if (povList == null)
                this.view[i][j].setAble(true);
            else
                this.view[i][j].setAble(false);
           
            this.view[i][j].updatePOV(povList);
        }
    }
}

GridView.prototype.clear = function()
{
    for (var i in this.view)
    {
        for (var j in this.view[i])
        {
			this.view[i][j].clear();
		}
	}
}

GridView.prototype.doAction = function(src, evt)
{
    if (evt.type == "cellContentsUpdate")
    {
       this.drawCell(src.x, src.y);
    }
   
    this.tellActionListeners(src, evt);
}

// Default content factory
function ContentFactory()
{
}

ContentFactory.prototype.makeContents = function(model, x, y, baseHeight)
{
    return new GridContents(model, x, y, baseHeight);
}

ContentFactory.prototype.makeItem = function(itemCode)
{
    return null;
}

ContentFactory.prototype.makeItemFromXML = function(xml, model)
{
	return null;
}

ContentFactory.prototype.makeViewContents = function(view, x, y, x_index, y_index, modelContents)
{
    return new GridViewContents(view, x, y, x_index, y_index, modelContents);
}

ContentFactory.prototype.makeSimpleViewItem = function(item)
{
    return null;
}

ContentFactory.prototype.makeViewItem = function(item)
{
    return null;
}
// This class applies lighting effects to the GridModel base class.
// It allows ambient light levels to be set for each cellContents, and
// for point sources to be defined in GridItems, which radiate light
// except where they are blocked.
// GridContents understand about blocking light.

function LitGridModel(itemFactory)
{
    LitGridModel.baseConstructor.call(this, itemFactory);
}

KevLinDev.extend(LitGridModel, GridModel);

// Get the light level the specified distance from the light source
LitGridModel.prototype.calcLightLevel = function(distance, srcLevel)
{
    // Default max is four
    if (distance >= 4)
        return 0;
    else if (distance <= 0)
        return srcLevel;
    else
        return (1.0 - distance / 4) * srcLevel;
}

// Contents of a lit grid point
// This is mainly about keeping track of the ambient light level of a grid point.
function LitGridContents(model, x, y, ambientLight)
{
    LitGridContents.baseConstructor.call(this, model, x, y);
   
    this.ambientLight = ambientLight;
}

KevLinDev.extend(LitGridContents, GridContents);

LitGridContents.prototype.setAmbientLight = function(level)
{
    this.ambientLight = level;

    this.tellActionListeners(null, {type:"lightChanged"});
}

LitGridContents.prototype.removeSeenBy = function(item)
{
    LitGridContents.superClass.removeSeenBy.call(this, item);
    
    this.tellActionListeners(null, {type:"lightChanged"});
}

// string is of form ambient_light:item_list
LitGridContents.prototype.fromString = function(str)
{
    var split = str.split(":");
    this.ambientLight = parseInt(split[0]);
    
    LitGridContents.superClass.fromString.call(this, split[1]);   
}

LitGridContents.prototype.toString = function()
{
    var result = LitGridContents.superClass.toString.call(this);

    if (result != null)
        result = String(this.ambientLight) + ":" + result;
    
    return result;
}

LitGridContents.prototype.toXML = function(xmlDoc, showAll)
{
    var result = LitGridContents.superClass.toXML.call(this, xmlDoc, showAll);
    
    if (result != null)
        result.setAttribute("l", this.ambientLight);

    return result;
}

LitGridContents.prototype.fromXML = function(xml)
{
    this.ambientLight = parseFloat(xml.getAttribute("l"));
    
    LitGridContents.superClass.fromXML.call(this, xml);
}

// LitGridItem keeps track of lighting for an item, using the POV model of GridItem
//
// Extra params relevant to LitGrid items are:
//      lightStrength - how strong the light being emitted by this item is.
//      lightRadius - how far the light spreads.
function LitGridItem(params)
{
    LitGridItem.baseConstructor.call(this, params);
}

KevLinDev.extend(LitGridItem, GridItem);

LitGridItem.prototype.updatePOV = function()
{
    LitGridItem.superClass.updatePOV.call(this);   

    // update what we can see
    if (this.params.lightStrength > 0)
    {
        this.updateVisibleWithinRadius(this.params.lightRadius, "light");
        for (var i in this.canSee.light)
        {
            for (var j in this.canSee.light[i])
            {
                var evt = new Object();
                evt.type = "lightChanged";
                this.canSee.light[i][j].cellContents.tellActionListeners(this, evt);
            }
        }
    }
}

// LitGridViewItem handles the lighting effects on this item.
function LitGridViewItem(modelItem, viewItemFactory, itemGraphics)
{
    LitGridViewItem.baseConstructor.call(this, modelItem, viewItemFactory, itemGraphics);
    this.setLighting();
}

KevLinDev.extend(LitGridViewItem, GridViewItem);

// Set light level for this item
LitGridViewItem.prototype.setLightLevel = function(level)
{
	// TODO: At some point, we may need to set the light levels on
	// all relevant children, but currently there are some children 
	// we add that aren't ShadowItem (e.g. item selection highlight).
	this.itemGraphics.childNodes[0].setLightLevel(level);
}

// Set the lighting from the item information
LitGridViewItem.prototype.setLighting = function()
{
    var cellContents = this.modelItem.cellContents;
    if (cellContents == null)
	{
        return;
	}
	
    if (this.itemGraphics != null)
    {
        // Set the shadow according to ambient light and light sources
        // this item is seen by.
        var lightLevel = cellContents.ambientLight;
        
        for (var j in cellContents.seenBy)
        {
            if (cellContents.seenBy[j].item.params.lightStrength == null || cellContents.seenBy[j].item.params.lightStrength == 0)
                continue;
            
            if (cellContents.seenBy[j].viewType != "light")
                continue;
            
            // Not visible if the top isn't visible
            var elev = cellContents.seenBy[j].viewElev;
            if (cellContents.seenBy[j].viewElev > this.modelItem.params.elev + this.modelItem.params.ht)
                continue;
            
            var sourceLevel = cellContents.model.calcLightLevel(cellContents.seenBy[j].distance, cellContents.seenBy[j].item.params.lightStrength);
            if (sourceLevel > lightLevel)
            {
                lightLevel = sourceLevel;
            }
        }
    
        this.setLightLevel(lightLevel);
    }
        
    for (var i in this.containedItems.childNodes)
    {
        this.containedItems.childNodes[i].setLighting();
    }
}

LitGridViewItem.prototype.doAction = function(src, evt)
{
    LitGridViewItem.superClass.doAction.call(this, src, evt);   

    if (evt.type == "paramChanged" && evt.name == "ht")
    {
        this.setLighting();
    }
}

// LitGridViewContents handles lighting changes by telling all the items in the cellContents
// about it.
function LitGridViewContents(view, x, y, x_index, y_index, modelContents, doSeparateCoverLayer)
{
    LitGridViewContents.baseConstructor.call(this, view, x, y, x_index, y_index, modelContents, doSeparateCoverLayer);
}

KevLinDev.extend(LitGridViewContents, GridViewContents);

LitGridViewContents.prototype.doAction = function(src, evt)
{
    LitGridViewContents.superClass.doAction.call(this, src, evt);   

    if (evt.type == "lightChanged")
    {
        this.setLighting();
    }
}

LitGridViewContents.prototype.setLighting = function()
{
    for (var i in this.viewItems.containedItems.childNodes)
    {
        this.viewItems.containedItems.childNodes[i].setLighting();
    }
}

// Handles lighting changes for the grid
function LitGridView(gridModel, itemFactory, numCols, numRows, startCol, startRow, width, height)
{
    LitGridView.baseConstructor.call(this, gridModel, itemFactory, numCols, numRows, startCol, startRow, width, height);   
}

KevLinDev.extend(LitGridView, GridView);

// Redo the lighting for the entire scene
// This needs to be done if we change gLightLevelScaleFactor, for example.
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

// Default Content factory for lit items
function LitContentFactory(ambientLight)
{
    LitContentFactory.baseConstructor.call(this);
       
    this.ambientLight = ambientLight;
}

KevLinDev.extend(LitContentFactory, ContentFactory);

LitContentFactory.prototype.makeContents = function(model, x, y, baseHeight)
{
    return new LitGridContents(model, x, y, baseHeight, this.ambientLight);
}

LitContentFactory.prototype.makeItem = function(itemCode)
{
    return null;
}

LitContentFactory.prototype.makeViewContents = function(view, x, y, x_index, y_index, modelContents)
{
    return new LitGridViewContents(view, x, y, x_index, y_index, modelContents);
}

LitContentFactory.prototype.makeViewItem = function(itemCode)
{
    return null;
}

// Overall opacity of the shadows - if this is less than 1, shadows aren't as dark.
var gLightLevelScaleFactor = 1.0;

// Keep a list of id indexes, so that we can uniquely light each ShadowElement.
var gShadowElementIdIndex = 0;

// ShadowElement 
// The showInvisible parameter determines whether the element is hidden
// or merely darkened when it is not visible due to lighting conditions.
function ShadowElement(base, showInvisible, showInvisibleHidden)
{
    ShadowElement.baseConstructor.call(this, "g");

    this.setBaseElement(base);
    this.showInvisible = showInvisible;
    if (!this.showInvisible)
        this.hide();

	this.showInvisibleHidden = showInvisibleHidden;
    
	this.shadowID = gShadowElementIdIndex++;

    this.isVisible = true;     
}

KevLinDev.extend(ShadowElement, SVGElement);

ShadowElement.prototype.setBaseElement = function(base)
{
    if (this.base != null)
        this.removeChild(this.base);

    this.base = base;
    if (this.base != null)
        this.appendChild(this.base);
}

// If the shadow element isn't visible, either hide it or
// show it as dark no matter what the light level
ShadowElement.prototype.setVisible = function(isVisible)
{
    this.isVisible = isVisible;
    
    if (this.isVisible)
    {
        this.show();
        this.setLightLevel2(this.lightLevel);
    }
    else if (this.showInvisible && this.showInvisibleHidden)
    {
        this.show();
        this.setLightLevel2(0.0);
    }
    else
        this.hide();
}

ShadowElement.prototype.setLightLevel = function(lightLevel)
{
	if (lightLevel == this.lightLevel)
		return;
		
    this.lightLevel = lightLevel;

    if (this.isVisible)
    {
        this.setLightLevel2(this.lightLevel);
    }
}

// Internal method for setting light level.
ShadowElement.prototype.setLightLevel2 = function(lightLevel)
{
    if (this.base != null)
    {
	    lightLevel = lightLevel + (1.0 - lightLevel) * (1.0 - gLightLevelScaleFactor);
		setLightLevel(this.base.svg, {r:lightLevel, g:lightLevel, b:lightLevel}, "shadow" + this.shadowID);
    }
}// A grid model where the layout is hexagonal.
function HexGridModel(ambientLight, itemProperties)
{
    HexGridModel.baseConstructor.call(this, ambientLight, itemProperties);
}

KevLinDev.extend(HexGridModel, GridModel);

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

// Rectangular grid model
function RectGridModel(ambientLight, itemProperties)
{
    RectGridModel.baseConstructor.call(this, ambientLight, itemProperties);
}

KevLinDev.extend(RectGridModel, GridModel);

// View of rectangular grid
function RectGridView(gridModel, itemFactory, numCols, numRows, startCol, startRow, width, height)
{
    RectGridView.baseConstructor.call(this, gridModel, itemFactory, numCols, numRows, startCol, startRow, width, height);
}

KevLinDev.extend(RectGridView, GridView);

// Find the top block item, or null if there are no block items.
// This is like GridContents.getTopItem but with the additional restriction
// that the item is a block.
function getTopBlockItem(currContents)
{
    var result = null;
    
    var topData = currContents;
    while (topData.myItems.length > 0)
    {
        for (var i in topData.myItems)
        {
            if (topData.myItems[i].params.isBlock)
            {
                break;
            }
        }
        if (topData.myItems[i].params.isBlock)
        {
            topData = topData.myItems[i];
        }
        else
            break;
    }
    if (topData.params != null && topData.params.isBlock)
        result = topData;
        
    return result;
}

function PerspectiveGridModel(itemFactory)
{
    PerspectiveGridModel.baseConstructor.call(this, itemFactory);
    
    this.itemsInTheWay = [];
}

KevLinDev.extend(PerspectiveGridModel, LitGridModel);

PerspectiveGridModel.prototype.clearInTheWay = function()
{
    for (var i in this.itemsInTheWay)
    {
        this.itemsInTheWay[i].tellActionListeners(this.itemsInTheWay[i], {type:"InTheWay", opacity:1});
    }
    
    this.itemsInTheWay = [];
}

// Contents of a perspective grid. Handles opacity issues (e.g. if the user
// can't see an item because there's another "in front", this will reduce the opacity
// of the in-front item).
function PerspectiveGridContents(model, x, y, ambientLight)
{
    PerspectiveGridContents.baseConstructor.call(this, model, x, y, ambientLight);
}

KevLinDev.extend(PerspectiveGridContents, LitGridContents);

// Ensure this grid cellContents at the specified height is visible
// by making the cellContents "in front" of it from the perspective of the user
// semi-opaque
PerspectiveGridContents.prototype.setVisibleToUser = function(elevation)
{
    for (var i = 1; i < 3; i++)
    {
        var cellContents = this.model.getContents(this.x - i, this.y + i);
		if (cellContents.tempParams.neverInWay)
			continue;
			
        var topData = cellContents;
        while (topData.myItems.length > 0)
        {
            topData = topData.myItems[0];
            if (topData.params.elev + topData.params.ht > 30 * (i - 1) + elevation)
            {
                // This item is in the way!
				var itemOpacity = 0;
				if (this.model.getContents(this.x - i - 1, this.y + i + 1).tempParams.avatarSees)
                	itemOpacity = 0.8;
            	
				topData.setInTheWay(itemOpacity);
            }
        }
    }
}

// PerspectiveGridItem 
// Helps handle "in the way" items (i.e. items that, due to perspective, block the
// user's view of something they should be able to see, and should therefore be made
// partially opaque)
function PerspectiveGridItem(params)
{
    PerspectiveGridItem.baseConstructor.call(this, params);
}

KevLinDev.extend(PerspectiveGridItem, LitGridItem);

PerspectiveGridItem.prototype.setInTheWay = function(opacity)
{
    if (this.cellContents != null)
    {
        this.cellContents.model.itemsInTheWay.push(this);
        this.tellActionListeners(this, {type:"InTheWay", opacity:opacity});
    }
}

// The view of a perspective grid model
function PerspectiveGridView(gridModel, itemFactory, numCols, numRows, startCol, startRow, width, height)
{
    PerspectiveGridView.baseConstructor.call(this, gridModel, itemFactory, numCols, numRows, startCol, startRow, width, height);

	this.extraBottomRows = 4; // Draw some extra bottom rows to avoid visual cutoff issues at the bottom.

	this.adjustCellBounds();
}

KevLinDev.extend(PerspectiveGridView, LitGridView);

PerspectiveGridView.prototype.setFixedCellCount = function(cellCountX)
{
    PerspectiveGridView.superClass.setFixedCellCount.call(this, cellCountX);   
	this.adjustCellBounds();
}

PerspectiveGridView.prototype.setViewSize = function(width, height)
{
    PerspectiveGridView.superClass.setViewSize.call(this, width, height);   
	this.adjustCellBounds();
}

// Calculate the max x and y.
PerspectiveGridView.prototype.adjustCellBounds = function()
{
	if (this.fixedCellCountX == null)
	{
		this.scaleFactor = 1.0;
		this.maxX = Math.ceil(this.viewWidth / this.cellWidth);
		this.maxY = Math.ceil(this.viewHeight / this.cellHeight / 2);
	}
	else
	{
		this.maxX = this.fixedCellCountX;

		// Work out how much scaling to apply
		this.scaleFactor = this.viewWidth / this.cellWidth / this.fixedCellCountX;

		// Also adjust the maximum y
		this.maxY = Math.ceil(this.viewHeight / this.cellHeight / this.scaleFactor);
	}
}

// Update the view appearance.
PerspectiveGridView.prototype.updateView = function()
{
	// Don't update if centre position is unset (can happen during init)
	if (this.cellCentreX == null)
		return;

	// Here is the grid, relative to the cellCentre:
	//    /\    /\    /\    /\    /\
	//   /  \  /  \  /  \  /  \  /  \
	//  / -1 \/  0 \/  1 \/  2 \/  3 \
	//  \ -3 /\ -2 /\ -1 /\  0 /\  1 /
	//   \  /  \  /  \  /  \  /  \  /
	//    \/ -1 \/  0 \/  1 \/  2 \/
	//    /\ -2 /\ -1 /\  0 /\  1 /\
	//   /  \  /  \  /  \  /  \  /  \
	//  / -2 \/ -1 \/  0 \/  1 \/  2 \
	//  \ -2 /\ -1 /\  0 /\  1 /\  2 /
	//   \  /  \  /  \  /  \  /  \  /
	//    \/ -2 \/ -1 \/  0 \/  1 \/
	//    /\ -1 /\  0 /\  1 /\  2 /\
	//   /  \  /  \  /  \  /  \  /  \
	//  / -3 \/ -2 \/ -1 \/  0 \/  1 \
	//  \ -1 /\  0 /\  1 /\  2 /\  3 /
	//   \  /  \  /  \  /  \  /  \  /
	//    \/    \/    \/    \/    \/
	// This grid shows the (i, j) coords of the cells.
	// We can convert to something more useful as follows:
	// x = j + i
	// y = j - i
	//    /\    /\    /\    /\    /\
	//   /  \  /  \  /  \  /  \  /  \
	//  / -4 \/ -2 \/  0 \/  2 \/  4 \
	//  \ -2 /\ -2 /\ -2 /\ -2 /\ -2 /
	//   \  /  \  /  \  /  \  /  \  /
	//    \/ -3 \/ -1 \/  1 \/  3 \/
	//    /\ -1 /\ -1 /\ -1 /\ -1 /\
	//   /  \  /  \  /  \  /  \  /  \
	//  / -4 \/ -2 \/  0 \/  2 \/  4 \
	//  \  0 /\  0 /\  0 /\  0 /\  0 /
	//   \  /  \  /  \  /  \  /  \  /
	//    \/ -3 \/ -1 \/  1 \/  3 \/
	//    /\  1 /\  1 /\  1 /\  1 /\
	//   /  \  /  \  /  \  /  \  /  \
	//  / -4 \/ -2 \/  0 \/  2 \/  4 \
	//  \  2 /\  2 /\  2 /\  2 /\  2 /
	//   \  /  \  /  \  /  \  /  \  /
	//    \/    \/    \/    \/    \/
	// This grid is 4 x 2 (the maxX and maxY vals)
	// We can convert back using
	// i = (x - y) / 2
	// j = (x + y) / 2

    for (var y = -this.maxY; y <= this.maxY + this.extraBottomRows; y++)
    {
		// Odd numbered rows are offset by 1
		var xOffset = (y % 2 == 0) ? 0 : 1;
        for (var x = xOffset; x <= this.maxX; x += 2)
        {
			// Convert back to native coordinates
            var i = (x - y) / 2;
            var j = (x + y) / 2;
            this.drawCell(i + this.cellCentreX, j + this.cellCentreY);
			if (x != 0)
			{
				i = (-x - y) / 2;
				j = (-x + y) / 2;
            	this.drawCell(i + this.cellCentreX, j + this.cellCentreY);
			}
		} 
    }

	// Set the cell Centre to be at (0,0) so we can do a scale. Then move it to the screen centre.
	var centreX = -(this.cellCentreX + this.cellCentreY) * this.cellWidth;
	var centreY = -(this.cellCentreY - this.cellCentreX) * this.cellHeight;
	
	// Show the transformed image. Note that the scaleFactor is divided by 2 - this is because
	// we actually show twice the maxX and maxY in width and height.
	this.transformLayer.setAttribute("transform", "translate(" + this.viewCentreX + "," + this.viewCentreY + ") scale(" + (this.scaleFactor / 2) + ") translate(" + centreX + "," + centreY + ")"); 
}

PerspectiveGridView.prototype.getLayoutX = function(i, j)
{
    return i + j;
}

PerspectiveGridView.prototype.getLayoutY = function(i, j)
{
    return j - i;
}

PerspectiveGridView.prototype.inView = function(i, j)
{
    var x = (i - this.cellCentreX) + (j - this.cellCentreY);
    var y = (j - this.cellCentreY) - (i - this.cellCentreX);

    return (Math.abs(x) <= this.maxX && (y >= -this.maxY && y <= this.maxY + this.extraBottomRows));
}

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

// This is an item with a left, front, and top that are viewable in a 
// perspective scene.
function PerspectiveGridViewItem(modelItem, viewItemFactory, elements)
{
    this.elements = elements;

    PerspectiveGridViewItem.baseConstructor.call
       (this, modelItem, viewItemFactory, this.elements["bottom"]);   

    this.appendItemContents(this.elements["top"]);
    this.appendItemContents(this.elements["left"]);
    this.appendItemContents(this.elements["front"]);
	
	if (this.elements["highlight"])
	{	
		this.elements["highlight"].hide();
    	this.appendItemContents(this.elements["highlight"]);
	}
}

KevLinDev.extend(PerspectiveGridViewItem, LitGridViewItem);

PerspectiveGridViewItem.prototype.setLighting = function()
{
    PerspectiveGridViewItem.superClass.setLighting.call(this);   

    // The light on these cellContents has changed, so we need to 
    // update the shadows on the verticals for this and adjacent
    // cellContents.
    var cellContents = this.modelItem.cellContents;
    if (cellContents == null)
        return;
        
    for (var i in this.elements)
    {
        if (this.elements[i] == null || i == "bottom" || i == "highlight")
            continue;
            
        // See what light sources affect this vertical
        var lightLevel = cellContents.ambientLight;
        
        for (var j in cellContents.seenBy)
        {
			var p = cellContents.seenBy[j].item.params;
			
            if (p.lightStrength == null || p.lightStrength == 0)
                continue;
           
            // It's unlit unless the light reaching it is low enough
            if (cellContents.seenBy[j].viewElev > this.modelItem.params.elev + this.modelItem.params.ht)
                continue;

            if (i == "top")
            {
				// Don't light the top of this item with the light source if the light source is below it
                if (p.elev + p.ht < this.modelItem.params.elev + this.modelItem.params.ht)
                    continue;
                
				// The top of the item must be higher than the lowest height of light on this cellContents
                //if (cellContents.seenBy[j].viewElev <= this.modelItem.params.elev + this.modelItem.params.ht)
                //{
                    var sourceLevel = cellContents.model.calcLightLevel(cellContents.seenBy[j].distance, p.lightStrength);
                    if (sourceLevel > lightLevel)
                        lightLevel = sourceLevel;
                //}
            }
            else
            {
                // Distance 0 means the current square
                // which doesn't contribute to the light on the
                // verticals
                if (cellContents.seenBy[j].distance == 0)
                    continue;
            
                // For the verticals, we need to calculate the distances again
                var dist = 0;
                if (i == "left")
                {
                    // This side is unlit unless its x value is less
                    if (cellContents.seenBy[j].x >= cellContents.x)
                        continue;
                        
                    dist = cellContents.model.getDistance(cellContents.seenBy[j].x, cellContents.seenBy[j].y, cellContents.x - 1, cellContents.y);            
                }
                else if (i == "front")
                {
                    // This side is unlit unless its y value is greater
                    if (cellContents.seenBy[j].y <= cellContents.y)
                        continue;
                    dist = cellContents.model.getDistance(cellContents.seenBy[j].x, cellContents.seenBy[j].y, cellContents.x, cellContents.y + 1);
                }
                
                var sourceLevel = cellContents.model.calcLightLevel(dist, cellContents.seenBy[j].item.params.lightStrength);
                if (sourceLevel > lightLevel)
                {
                    lightLevel = sourceLevel;
                }
            }
        }
        this.elements[i].setLightLevel(lightLevel);
    }
}

// A block view item.
// Handles the top and two visible vertical elements.
function BlockGridViewItem(modelItem, viewItemFactory, elements)
{
    BlockGridViewItem.baseConstructor.call
       (this, modelItem, viewItemFactory, elements);   
}

KevLinDev.extend(BlockGridViewItem, PerspectiveGridViewItem);

// Update our height when we get added to the view. At this point,
// we can find the heights of any adjacent cellContents.
BlockGridViewItem.prototype.onBeingAdded = function()
{    
    this.updateNearbyHeights();
}

BlockGridViewItem.prototype.updateNearbyHeights = function()
{
    this.updateHeight();
        
	// Also need to update all the items behind and to the right
	// because some wall heights might need to change
	if (this.rootContainer.view != null)
	{
	    var x = this.rootContainer.x_index;
	    var y = this.rootContainer.y_index;
	    this.updateItemHeightsAtContents(this.rootContainer.view, x + 1, y);
	    this.updateItemHeightsAtContents(this.rootContainer.view, x, y - 1);
	}
}

BlockGridViewItem.prototype.updateHeight = function()
{
    var y = -this.modelItem.params.elev - this.modelItem.params.ht;
    this.rootContainer.setMouseoverPosition(0, y);
    this.itemGraphics.setAttribute("transform", "translate(0, " + y + ")");

	// Adjust our left and right heights according to our neighbour block heights
	
    var cellContents = this.modelItem.cellContents;
	if (cellContents == null)
		return;

    var leftContents = cellContents.model.getContents(cellContents.x - 1, cellContents.y);
    var topLeftItem = getTopBlockItem(leftContents);
    
    var leftHeight = this.modelItem.params.ht;
    if (topLeftItem != null)
    {
        leftHeight = this.modelItem.params.ht + this.modelItem.params.elev - topLeftItem.params.elev - topLeftItem.params.ht;
        if (leftHeight > this.modelItem.params.ht)
            leftHeight = this.modelItem.params.ht;
    }
    
    if (leftHeight > 0)
    {
        var path = this.viewItemFactory.getVerticalPath(leftHeight, 0);
        this.elements["left"].base.setAttribute("d", path);
        this.elements["left"].show();
    }
    else
    {
        this.elements["left"].base.removeAttribute("d");
        this.elements["left"].hide();
    }

    var frontContents = cellContents.model.getContents(cellContents.x, cellContents.y + 1);
    var topFrontItem = getTopBlockItem(frontContents);
    
    var frontHeight = this.modelItem.params.ht;
    if (topFrontItem != null)
    {
        frontHeight = this.modelItem.params.ht + this.modelItem.params.elev - topFrontItem.params.elev - topFrontItem.params.ht;
        if (frontHeight > this.modelItem.params.ht)
            frontHeight = this.modelItem.params.ht;
    }

    if (frontHeight > 0)
    {            
        var path = this.viewItemFactory.getVerticalPath(frontHeight, 1);
        this.elements["front"].base.setAttribute("d", path);
        this.elements["front"].show();
    }
    else
    {
        this.elements["front"].base.removeAttribute("d");
        this.elements["front"].hide();
    }
}

BlockGridViewItem.prototype.updateItemHeightsAtContents = function(view, x, y)
{
    if (view.view[x] != null)
    {
        var viewContents = this.rootContainer.view.view[x][y];
        if (viewContents != null)
        {
            viewContents.tellActionListeners(viewContents, {type:"otherItemHeight"});
        }
    }
}

BlockGridViewItem.prototype.doAction = function(src, evt)
{
    BlockGridViewItem.superClass.doAction.call(this, src, evt);   

    if (evt.type == "paramChanged")
    {
		if (evt.name == "ht")
		{
	        this.updateNearbyHeights();
		}
		else if (evt.name == "isHighlighted")
		{
			this.setHighlight(evt.value);
		}
		else if (evt.name == "elev")
		{
			this.updateHeight();
		}
    }
    else if (evt.type == "otherItemHeight")
    {
        // The height of another item changed, so we might have to change 
        // our wall heights
        this.updateHeight();
    }
    else if (evt.type == "InTheWay")
    {
        this.setAttribute("opacity", evt.opacity);
    }
    else if (evt.type == "paramChanged")
    {
	}
}

BlockGridViewItem.prototype.setHighlight = function(doHighlight)
{
	if (this.elements["highlight"] == null)
		return;
	
	if (doHighlight)	
		this.elements["highlight"].show();
	else
		this.elements["highlight"].hide();		
}

BlockGridViewItem.prototype.updatePOV = function(povList)
{
    var cellContents = this.modelItem.cellContents;
    if (cellContents == null)
        return;

    if (povList == null)
    {
        this.elements["top"].setVisible(true);
        this.elements["left"].setVisible(true);
        this.elements["front"].setVisible(true);
    }
    else if (this.itemGraphics != null)
    {
        var modelElev = this.modelItem.params.elev + this.modelItem.params.ht;

        var povTop = false;
        var povBottom = false;
        var povLeft = false;
        var povRight = false;
        var povFront = false;
        var povBack = false;
        for (var j in cellContents.seenBy)
        {
            if (cellContents.seenBy[j].viewType == "pov")
            {
                // Check whether this pov is one in the list
                for (var k in povList)
                {
                    if (povList[k] == cellContents.seenBy[j].item)
                    {
                        if (cellContents.seenBy[j].viewElev <= this.modelItem.params.elev)
                        {
                            // Pov can see base of item
                            povBottom = true;
                        }                            

                        var srcElev = cellContents.seenBy[j].item.params.elev + cellContents.seenBy[j].item.params.ht;

                        if (cellContents.seenBy[j].viewElev <= modelElev) 
                        {
                            if (srcElev >= modelElev) 
                                povTop = true;

                            if (cellContents.seenBy[j].x < cellContents.x)
                            {
                                povLeft = true;
                            }
                            
                            if (cellContents.seenBy[j].y > cellContents.y)
                            {
                                povFront = true;
                            }
                        }
                        
                        // Found the povList item we were looking for
                        break;
                    }
                }
            }
        }
        
        if (!povLeft)
        {
            // Can't see the left side, but perhaps we can see the cellContents
            // to the left, in which case let's say we can see it anyway.
            var leftContents = cellContents.model.getContents(cellContents.x - 1, cellContents.y);
            for (var j in leftContents.seenBy)
            {
                if (leftContents.seenBy[j].viewType == "pov")
                {
                    // Check whether this pov is one in the list
                    for (var k in povList)
                    {
                        if (povList[k] == leftContents.seenBy[j].item)
                        {
                            if (leftContents.seenBy[j].viewElev <= modelElev)
                            {
                                // NOTE: we still have to be standing to the
                                // left of the item to see its left side
                                if (leftContents.seenBy[j].x < cellContents.x)
                                {
                                    povLeft = true;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        if (!povFront)
        {
            // Can't see the front side, but perhaps we can see the cellContents
            // to the front, in which case let's say we can see it anyway.
            var frontContents = cellContents.model.getContents(cellContents.x, cellContents.y + 1);
            for (var j in frontContents.seenBy)
            {
                if (frontContents.seenBy[j].viewType == "pov")
                {
                    // Check whether this pov is one in the list
                    for (var k in povList)
                    {
                        if (povList[k] == frontContents.seenBy[j].item)
                        {
                            if (frontContents.seenBy[j].viewElev <= modelElev)
                            {
                                // NOTE: we still have to be standing to the
                                // front of the item to see its front side
                                if (frontContents.seenBy[j].y > cellContents.y)
                                {
                                    povFront = true;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        this.elements["top"].setVisible(povTop);
        this.elements["left"].setVisible(povLeft);
        this.elements["front"].setVisible(povFront);
    }
    
    for (var i in this.containedItems.childNodes)
    {
        this.containedItems.childNodes[i].updatePOV(povList);
    }
}

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

// StateDirectionShadowElement handles svg from a graphics file that has the following layout:
// <g id="itemId">
//     <g id="itemId_def" state="def">
//         <g id="itemId_def_def" [direction="dirn"]>
//             [graphics describing default state, with default direction]
//         </g>
//         <g id="itemId_def_back" direction="back"/>
//     </g>
//     <g id="itemId_state2" state="state2"/>
// </g>
// 
// The only compulsory item is the id="itemId_def_def", which is 
// the default graphic used if no other information is provided about
// direction or state.
// If a state X is provided, the subset of items under the id "itemId_X"
// are used. If not, the default state is "def".
// If a direction D is provided, the item with the id "itemId_X_D" is used.
function StateDirectionShadowElement(base, stateName, directionName, showInvisible, showInvisibleHidden)
{
    StateDirectionShadowElement.baseConstructor.call
        (this, base, showInvisible, showInvisibleHidden);   

	this.itemStates = {}; // List of all item states, and directions
	
	this.itemState = null; // Current item state
	this.stateName = null; // Current item state name
	this.itemStateDirection = null; // Current item direction
	this.directionName = null; // Current item direction name
	
	for (var i = 0; i < this.base.childNodes.length; ++i)
    {
        var currState = this.base.childNodes[i];
        if (currState.hasAttribute("state"))
		{
			var currStateName = currState.getAttribute("state");
	    	currState.removeAttribute("style"); // Hack - Inkscape will include "display=none" in the style attribute, so we need to remove it.
			currState.hide();
			this.itemStates[currStateName] = {};
			this.itemStates[currStateName].state = currState;

			// Also setup the directions for this state
			var directionSet = {};
	        for (var j = 0; j < currState.childNodes.length; ++j)
	        {
	            var currDirn = currState.childNodes[j];
	            if (currDirn.hasAttribute("direction"))
	            {
					var directionStrings = currDirn.getAttribute("direction");
	            	currDirn.removeAttribute("style"); // Hack - Inkscape will include "display=none" in the style attribute, so we need to remove it.
	            	currDirn.hide();
					for (var k = 0; k < directionStrings.length; ++k)
					{
						directionSet[directionStrings[k]] = currDirn;
					}
	            }
	        }
			this.itemStates[currStateName].directions = directionSet;
		}
    }

    this.setState(stateName, directionName);
}

KevLinDev.extend(StateDirectionShadowElement, ShadowElement);

// Show the graphics corresponding to the state based on what our parent is
StateDirectionShadowElement.prototype.setStateBasedOnParentTag = function(parentTags)
{
	// Try to find a match between the parent tags and the possible states of this item
	for (var i = 0; i < parentTags.length; ++i)
	{
		for (var j in this.itemStates)
		{
			if (this.itemStates[j].state.hasAttribute("parentTag") && this.itemStates[j].state.getAttribute("parentTag") == parentTags[i])
			{
				// Change to this state
				this.setState(j);
				break;
			}
		}
	}
}

// Show the graphics corresponding to the state, and hide the others.
// If you don't specify directionName, the existing direction will be used.
StateDirectionShadowElement.prototype.setState = function(stateName, directionName)
{
	// If a direction name isn't provided, use the current direction
	if (directionName == null)
		directionName = this.directionName;
	
	// Update the state based on the name
	if (this.stateName != stateName) 
	{
		if (this.itemState != null)
		{
			// We're going to change states, so hide the current one.
			this.itemState.state.hide();
			
			if (this.itemDirection != null)
				this.itemDirection.hide();
		}
		
	    this.stateName = stateName;
	    this.itemState = null;
    
	    if (this.itemStates[this.stateName] != null)
	    {
	        this.itemState = this.itemStates[this.stateName];
	    	this.itemState.state.show();
	    }
	
		// Clear the existing direction
		this.setDirection(null);
	}

	this.setDirection(directionName);
}

// Show the graphics corresponding to the direction, and hide the others.
// Show the first direction that is contained in the direction string.
// The intention is that if the direction requested is "f" for forward, 
// a graphic with direction "fb" (eg. a door) would match.
StateDirectionShadowElement.prototype.setDirection = function(directionName)
{
	if (this.directionName == directionName)
		return;
	
	if (this.directionName != null)
		this.itemStateDirection.hide();
		
    this.directionName = directionName;
    this.itemStateDirection = null;
    
    if (this.itemState != null && this.itemState.directions[this.directionName] != null)
    {
		this.itemStateDirection = this.itemState.directions[this.directionName];
		this.itemStateDirection.show();
    }
}


// Handle the view of an item that has multiple states
// NOTE: This is not yet a PerspectiveGridViewItem, but probably should be at some point.
function StateGridViewItem(modelItem, viewItemFactory, stateItem)
{
    this.stateItem = stateItem;
    
    StateGridViewItem.baseConstructor.call
        (this, modelItem, viewItemFactory, this.stateItem);   

	this.updateElevation();
	
	if (this.modelItem.owner != null && this.modelItem.owner.params != null && this.modelItem.owner.params.itemTags != null)
		this.stateItem.setStateBasedOnParentTag(this.modelItem.owner.params.itemTags);
}

KevLinDev.extend(StateGridViewItem, LitGridViewItem);

StateGridViewItem.prototype.updateElevation = function()
{
    // We set the base position to be the height of the object
    // so that items that go on top of it are correctly placed
    var translateHeight = -this.modelItem.params.elev;    
    this.itemGraphics.setAttribute("transform", "translate(0, " + translateHeight + ")");
}

StateGridViewItem.prototype.doAction = function(src, evt)
{
    StateGridViewItem.superClass.doAction.call(this, src, evt);   

    if (evt.type == "paramChanged")
    {
        if (evt.name == "state")
        {
            this.stateItem.setState(evt.value);
        }
        else if (evt.name == "direction")
        {
            this.stateItem.setDirection(evt.value);
        }
		else if (evt.name == "elev")
		{
			this.updateElevation();
		}
    }
}

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

// Factory for creating rectangular perspective items
function PerspectiveItemFactory(ambientLight, x, y, itemTemplates, baseSummary)
{
    PerspectiveItemFactory.baseConstructor.call(this, ambientLight);

    // The base rect for the perspective model is
    //       0,-y
    //  -x,0  /\   x,0
    //        \/
    //       0,y
    //
    // The rectangles may also have visible sides, depending on the
    // height of adjacent squares.
    // 
	// There is a small delta-sized extra "bottom" on the rectangle, to get around
	// anti-aliasing issues
	this.delta = 0.5;
	this.slope = y / x;
    this.x = x;
    this.y = y;

    this.baseRectTemplate = "M -x,0 L 0,-y x,0 x,f 0,g -x,f -x,0 z";
    
    // The vertical templates for the perspective model are
    //               0,-y
    //          -x,0 /\ x,0
    //              |\/|0,y
    //          -x,d| ||x,d  
    //               \|/ 
    //               0,f
    // where d is the block height and f=d+y
    //
	// The points f, g, h, p, q, r are present to allow a tick-shaped delta-sized overlap of the two vertical panels,
	// to get around the anti-aliasing issues of drawing adjacent rectangles.
    this.verticalTemplate = ["M -x,0 0,y g,h g,j 0,f -x,d z", "M x,0 x,d 0,f p,q p,r 0,y z", "M -x,0 L-x,-d 0,-f 0,-y z", "M x,0 0,-y 0,-f x,-d z"];

    this.baseRect = this.baseRectTemplate.replace(/x/gi, x).replace(/y/gi, y).replace(/f/gi, this.delta).replace(/g/gi, this.delta + y);

    this.baseSummary = baseSummary;
    
    this.itemTemplates = itemTemplates;
}

KevLinDev.extend(PerspectiveItemFactory, LitContentFactory);

PerspectiveItemFactory.prototype.makeContents = function(model, x, y, baseHeight)
{
    return new PerspectiveGridContents(model, x, y, baseHeight, this.ambientLight);
}

// Construct the item given the xml.
// We also provide the model so that it can register moving items and items with ids.
PerspectiveItemFactory.prototype.makeItemFromXML = function(xml, model)
{
    var itemCode = xml.getAttribute("c");
    var result = this.makeItem(itemCode);

    if (xml.hasAttribute("id"))
    {
        result.id = xml.getAttribute("id");
        model.importItem(result);
    }

    result.setHeight(parseInt(xml.getAttribute("h")), true);

	if (xml.hasAttribute("d"))
	{
		result.setDirection(xml.getAttribute("d"), true);
	}

    // Update all the child items of this item as well
    for (var i = 0; i < xml.childNodes.length; i++)
    {
        var xmlItem = xml.childNodes.item(i);

        var currItem = this.makeItemFromXML(xmlItem, model);
        result.appendItem(currItem);

        // If the item is moveable, add it to the moveable list.
        if (currItem.params.moveTowards != null)
        {
            model.addToMoveableItems(currItem);
        }
    }

	return result;
}

PerspectiveItemFactory.prototype.makeItem = function(itemCode)
{
    if (itemCode == null)
        return null;
    
    var b = this.baseSummary[itemCode];
    if (b != null)
    {
        return new PerspectiveGridItem({itemName:b[0], itemCode:itemCode, canStandOn:b[4], blockView:true, isBlock:true, wtPerHt:b[5]});
    }
    else
    {
        var t = this.itemTemplates[itemCode];
        if (t != null)
        {
            // Copy param values
            var params = {};
            for (var j in t)
                params[j] = t[j];

            return new PerspectiveGridItem(params);
        }
    }    
       
    return null;
}

PerspectiveItemFactory.prototype.makeViewContents = function(view, x, y, x_index, y_index, modelContents, doSeparateCoverLayer)
{
    return new PerspectiveGridViewContents(view, x, y, x_index, y_index, modelContents, doSeparateCoverLayer);
}

PerspectiveItemFactory.prototype.makeSimpleViewItem = function(modelItem)
{
    if (this.baseSummary[modelItem.params.itemCode] != null)
    {
		return new SimpleBlockGridViewItem(this, modelItem.params.itemCode, modelItem.params.ht);
    }
    else
	{
		return this.makeSimpleViewItemFromCode(modelItem.params.itemCode);
	}
}

PerspectiveItemFactory.prototype.makeSimpleViewItemFromCode = function(itemCode)
{
    var t = this.itemTemplates[itemCode];
    if (t != null)
    {
	    var currItem = new SVGElement();
	    var artSVG = this.artwork.getElementById(t.itemName + "_def_def");
	    currItem.cloneElement(artSVG);
        currItem.removeAttribute("display");
        currItem.removeAttribute("style");
        
        return currItem; 
    }

    return null;
}

PerspectiveItemFactory.prototype.makeViewItem = function(modelItem)
{
    if (modelItem == null)
       return null;
       
    var b = this.baseSummary[modelItem.params.itemCode];
    if (b != null)
    {
        // top of the block
        var top = new ShadowElement(
            new SVGElement("path", {d:this.baseRect, fill:this.baseSummary[modelItem.params.itemCode][1], stroke:"none"}),
            true, 
			true
            );

        // Only bother with the left and front vertical sides
        
        // path for the verticals gets filled out later by setHeight
        var left = new ShadowElement(
            new SVGElement("path", {fill:this.baseSummary[modelItem.params.itemCode][2], stroke:"none"}),
            true,
			true
            );        
        var front = new ShadowElement(
            new SVGElement("path", {fill:this.baseSummary[modelItem.params.itemCode][3], stroke:"none"}),
            true,
			true
            );
		
        left.hide();
        front.hide();
        
        var bottom = new ShadowElement(null, true, true);
        
        var highlight = new SVGElement("path", {d:this.baseRect, fill:"red", stroke:"black", opacity:0.5});

        var elements = {bottom:bottom, front:front, left:left, top:top, highlight:highlight};
        return new BlockGridViewItem(modelItem, this, elements);
    }
    else
    {
        var t = this.itemTemplates[modelItem.params.itemCode];
        if (t != null)
        {
            var state = "def";
            if (modelItem.params.state != null)
                state = modelItem.params.state;

            var dirn = "f";
            if (modelItem.params.direction != null)
                dirn = modelItem.params.direction;
                
            var currItem = new SVGElement();
    	    currItem.cloneElement(this.artwork.getElementById(t.itemName));
    	    
    	    var showInvisible = true;
    	    if (modelItem.params.isInvisible)
    	        showInvisible = false;
    	    
    	    // Set a default state and direction
    	    var stateItem = new StateDirectionShadowElement(currItem, state, dirn, showInvisible, false);
    	    
            return new StateGridViewItem(modelItem, this, stateItem);
        }
    }
           
    return null;
}

PerspectiveItemFactory.prototype.getVerticalPath = function(deltaY, side)
{
    return this.verticalTemplate[side]
		.replace(/x/gi, this.x)
		.replace(/y/gi, this.y)
		.replace(/d/gi, deltaY)
		.replace(/f/gi, this.y + deltaY)
		.replace(/g/gi, this.delta)
		.replace(/h/gi, this.y - this.slope * this.delta)
		.replace(/j/gi, this.y + deltaY - this.slope * this.delta)
		.replace(/p/gi, -this.delta)
		.replace(/q/gi, this.y + deltaY - this.slope * this.delta)
		.replace(/r/gi, this.y - this.slope * this.delta);
}

PerspectiveItemFactory.prototype.createSpeechBubble = function(textVal)
{
    if (this.artwork == null)
        return null;

    var bubbleTemplate = this.artwork.getElementById("speechBubble");
    if (bubbleTemplate == null)
        return null;
    
    // Get the centre of the speech bubble
    var bubbleX = parseInt(bubbleTemplate.getAttribute("bubbleX"));
    var bubbleY = parseInt(bubbleTemplate.getAttribute("bubbleY"));
    
    var result = new SVGElement("g");
    var bubble = bubbleTemplate.cloneNode(true);
    result.svg.appendChild(bubble);

    var textSVG = new MultilineText(bubbleX, bubbleY + 3, textVal, {"font-size":14, fill:"white"}, {maxWidth:120, lineSpacing:0.3});
    result.appendChild(textSVG);
    
    return result;
}

// ACItemHandler is responsible for handling items that belong to actions and conditions.
// Actions and conditions sometimes use items to either perform actions on or with, or to check conditions.
// This class helps handle the items for the actions and conditions.
function ACItemHandler(model, item, itemName)
{
    ACItemHandler.baseConstructor.call(this);
    this.model = model;
	this.itemName = itemName;

	// Match criterion is "id", "code", or "tag". Default is "id".
    this.matchCriterion = "id"; 
	
	this.setItem(item);
}

KevLinDev.extend(ACItemHandler, ActionObject);

ACItemHandler.prototype.setItem = function(item)
{
	if (item == this.item)
		return;
	
	// Remove our old action listener
	if (this.item != null)
		this.item.removeActionListener(this);
		
    this.item = item;

    if (this.item != null)
    {
		// Add a listener to the item so we know if it gets deleted.
		this.item.addActionListener(this);
				
    	// Need to register this item so the action can use it.
		if (this.item.id == null)
		{
        	this.model.registerItem(item);
		}
    }
	this.tellActionListeners(this, {type:"itemUpdated", item:this.item});
}

// Set the match criterion for this item.
// - "id" - the id of this item needs to be matched by the input item.
// - "code" - the item's itemCode must match the input item.
// - "tag" - the items must have at least one tag in common.
ACItemHandler.prototype.setItemMatchCriterion = function(matchCriterion, itemTag)
{
	if (matchCriterion == this.matchCriterion && (itemTag == null || (this.item.params.itemTags != null && this.item.params.itemTags[0] == itemTag)))
		return;

	if (itemTag != null)
		this.item.params.itemTags = [itemTag];
		
	this.matchCriterion = matchCriterion;
	this.tellActionListeners(this, {type:"itemUpdated", item:this.item});
}

ACItemHandler.prototype.matchesItem = function(item)
{
	if (item == null || this.item == null)
	{
		return (item == this.item);
	}
	else if (this.matchCriterion == "code")
	{
		if (item.params.itemCode != null && item.params.itemCode == this.item.params.itemCode)
			return true;
	}
	else if (this.matchCriterion == "id")
	{
		if (item.id == this.item.id)
			return true;
	}
	else if (this.matchCriterion == "tag")
	{
		if (item.params.itemTags != null && this.item.params.itemTags != null)
		{
			for (var i = 0; i < item.params.itemTags.length; ++i)
			{
				for (var j = 0; j < this.item.params.itemTags.length; ++j)
				{
					if (item.params.itemTags[i] == this.item.params.itemTags[j])
						return true;
				}
			}
		}
	}
	return false;
}


// This doesn't actually create any nodes, but adds item details to the existing node
ACItemHandler.prototype.addToXML = function(xml)
{
	if (this.item != null)
    {
		if (this.matchCriterion == "code")
		{
			xml.setAttribute(this.itemName + "ItemCode", this.item.params.itemCode);
		}
		else if (this.matchCriterion == "id")
		{
			xml.setAttribute(this.itemName + "ItemId", this.item.id);
    	}
		else if (this.matchCriterion == "tag")
		{
			// TODO: Cope with more than one tag
			xml.setAttribute(this.itemName + "ItemTag", this.item.params.itemTags[0]);
		}
	}
}

ACItemHandler.prototype.fromXML = function(xml)
{
	var item = null;
	
	// First check if there's an id for this item
	var itemId = xml.getAttribute(this.itemName + "ItemId");
	if (itemId != null)
	{
		this.matchCriterion = "id";
	    item = this.model.getItemById(itemId);
	}
	else
	{
		// No id - see if there's an ItemCode for this item
		var itemCode = xml.getAttribute(this.itemName + "ItemCode");
		if (itemCode != null)
		{
			this.matchCriterion = "code";
			item = this.model.itemFactory.makeItem(itemCode);
		}
		else
		{
			// No itemCode - see if there's an itemTag for this item
			// TODO: Cope with more than one tag
			var itemTag = xml.getAttribute(this.itemName + "ItemTag");
			if (itemTag != null)
			{
				this.matchCriterion = "tag";
				item = this.model.itemFactory.makeItem("t");
				item.params.itemTags = [itemTag];
			}			
		}
	}
	this.setItem(item);
}

ACItemHandler.prototype.doAction = function(src, evt)
{
	if (evt.type == "ItemBeingDeleted" && this.item.markedForDeath)
	{
		// A GridItem is politely letting us know it's being deleted.
		this.setItem(null);
	}
}

ACItemHandler.prototype.onDelete = function()
{
	// Remove our action listener
	if (this.item != null)
		this.item.removeActionListener(this);		
}
function MyActionFactory(model, controller)
{
    this.model = model;
    this.controller = controller;
}

MyActionFactory.prototype.fromXML = function(xml)
{
    var result = null;
    
    switch (xml.getAttribute("type"))
    {
    case 'Speech':
        result = new SpeechAction(this.model, this.controller, null, null);
        break;

    case 'Height':
        result = new HeightAction(this.model, this.controller, null, 0);
        break;

    case 'Teleport':
        result = new TeleportAction(this.model, this.controller, 0);
        break;

    default:
        break;
    }
    
    if (result == null)
        return null;

	result.fromXML(xml);

    return result;
}

function GameAction(model, controller)
{
    GameAction.baseConstructor.call(this);
	
    this.type = "Default";
    this.model = model; 
    this.occuranceCount = 0;
    this.conditions = [];
    this.controller = controller; 
}

// Note: The "Action" in ActionObject actually has nothing to do with item actions.
KevLinDev.extend(GameAction, ActionObject);

GameAction.prototype.addCondition = function(condition)
{
    this.conditions.push(condition);
	this.tellActionListeners(this, {type:"actionUpdated"});
}

GameAction.prototype.attemptAction = function()
{
    var result = true;

    // Ensure all our conditions are met
    for (var i = 0; i < this.conditions.length; ++i)
    {
        if (!this.conditions[i].isMet())
        {
            result = false;
            break;
        }
    }
    
    if (result)
        this.occuranceCount++;
            
    return this.performAction(result);
}

// Default
GameAction.prototype.performAction = function(areConditionsMet)
{
    return true; // Return false to stop further actions.
}

// Clean up the action on delete.
// Default
GameAction.prototype.onDelete = function()
{
}

GameAction.prototype.toXML = function()
{
    var xmlAction = this.model.xmlDoc.createElement("action");

	xmlAction.setAttribute("type", this.type);
    
    for (var i = 0; i < this.conditions.length; ++i)
    {
        var xmlCondRef = this.model.xmlDoc.createElement("condRef");
        xmlCondRef.setAttribute("condId", this.conditions[i].id);
        xmlAction.appendChild(xmlCondRef);
    }
    
    return xmlAction;
}

GameAction.prototype.fromXML = function(xml)
{
    // Update all the conditions references attached to this action as well
    if (this.controller == null)
        alert("Oops! Trying to get item action from XML, but item action doesn't have a controller.");
        
    for (var i = 0; i < xml.childNodes.length; i++)
    {
        var xmlConditionRef = xml.childNodes.item(i);
        var cond = this.controller.getConditionById(
            xmlConditionRef.getAttribute("condId"));
        if (cond != null)
            this.conditions.push(cond);        
    }
}

GameAction.prototype.doAction = function(src, evt)
{
	if (evt.type == "itemUpdated")
	{
		// An ACItemHandler has let us know it's been updated, so pass on the update request.
		this.tellActionListeners(this, {type:"actionUpdated"});
	}		
}

function SpeechAction(model, controller, item, speechArray)
{
    SpeechAction.baseConstructor.call(this, model, controller);

	this.setSpeechArray(speechArray);	
    this.currentIndex = 0;
    this.type = "Speech";

    this.speechItem = new ACItemHandler(this.model, item, this.type);
	this.speechItem.addActionListener(this);
}

KevLinDev.extend(SpeechAction, GameAction);

SpeechAction.prototype.setSpeechArray = function(speechArray)
{
    this.speechArray = speechArray;
	if (this.speechArray == null)
		this.speechArray = [];
	this.tellActionListeners(this, {type:"actionUpdated"});
}

SpeechAction.prototype.performAction = function(areConditionsMet)
{
	if (this.speechItem.item == null)
		return;
		
    var text = null;
    if (areConditionsMet && this.currentIndex < this.speechArray.length)
    {
        text = this.speechArray[this.currentIndex];
        this.currentIndex++;
        this.controller.setItemSpeech(this.speechItem.item, text);
    }

    return true; 
}

SpeechAction.prototype.toXML = function()
{
    var result = SpeechAction.superClass.toXML.call(this);      
    result.setAttribute("speech", htmlspecialchars(this.speechArray.join("|")));
	this.speechItem.addToXML(result);
    return result;
}

SpeechAction.prototype.fromXML = function(xml)
{
    SpeechAction.superClass.fromXML.call(this, xml);      

	this.speechItem.fromXML(xml);
    var speechText = htmlspecialchars_decode(xml.getAttribute('speech'));
    this.setSpeechArray(speechText.split('|'));
}

SpeechAction.prototype.onDelete = function()
{
	this.speechItem.onDelete();
	this.speechItem.removeActionListener(this);
}

function HeightAction(model, controller, item, newHeight)
{
    HeightAction.baseConstructor.call(this, model, controller);

    this.setHeight(newHeight);    
    this.type = "Height";

    this.heightItem = new ACItemHandler(this.model, item, this.type);
	this.heightItem.addActionListener(this);
}

KevLinDev.extend(HeightAction, GameAction);

HeightAction.prototype.doAction = function(src, evt)
{
	if (evt.type == "itemUpdated")
	{
		// The item has been updated, so it needs an oldHeight for
		// when the height changes, so we can change it back later.
		if (src.item != null)
		{
			this.oldHeight = src.item.params.ht;
		}
	}		
    HeightAction.superClass.doAction.call(this, src, evt);
}

HeightAction.prototype.setHeight = function(height)
{
	this.newHeight = height;
	this.tellActionListeners(this, {type:"actionUpdated"});
}

HeightAction.prototype.performAction = function(areConditionsMet)
{
	if (this.heightItem.item == null)
		return;
		
    if (areConditionsMet)
    {
        if (this.heightItem.item.params.ht != this.newHeight)
        {
            this.oldHeight = this.heightItem.item.params.ht;
            this.heightItem.item.setHeight(this.newHeight, false);
        }
    }
    else
    {
        if (this.heightItem.item.params.ht != this.oldHeight)
        {
            this.heightItem.item.setHeight(this.oldHeight, false);
        }
    }
    return true;
}

HeightAction.prototype.toXML = function()
{
    var result = HeightAction.superClass.toXML.call(this);      
    result.setAttribute("ht", this.newHeight);
	this.heightItem.addToXML(result);
    return result;
}

HeightAction.prototype.fromXML = function(xml)
{
    HeightAction.superClass.fromXML.call(this, xml);

	this.heightItem.fromXML(xml);
    
	var ht = parseInt(xml.getAttribute("ht"));
	this.setHeight(ht);
}

HeightAction.prototype.onDelete = function()
{
	this.heightItem.onDelete();
	this.heightItem.removeActionListener(this);
}

function TeleportAction(model, controller, destination)
{
    TeleportAction.baseConstructor.call(this, model, controller);
    this.setDestination(destination);
    this.type = "Teleport";
}

KevLinDev.extend(TeleportAction, GameAction);

TeleportAction.prototype.setDestination = function(destination)
{
	this.destination = destination;
	this.tellActionListeners(this, {type:"actionUpdated"});
}

TeleportAction.prototype.performAction = function(areConditionsMet)
{
    if (areConditionsMet && this.controller.turnClock.currentTime != 0)
    {
        // We don't allow teleport at time 0 - this stops shennanigans with
        // multiple teleports.
        this.controller.parentController.gameServerInterface.submitSaveItemsAndTeleport(this.destination);
        return false; // Stop further actions
    }
    return true;
}

TeleportAction.prototype.toXML = function()
{
    var result = TeleportAction.superClass.toXML.call(this);      
    result.setAttribute("dest", this.destination);
    return result;
}

TeleportAction.prototype.fromXML = function(xml)
{
    TeleportAction.superClass.fromXML.call(this, xml);
    
	var dest = parseInt(xml.getAttribute("dest"));
	this.setDestination(dest);
}

// Move the specified item to the specified destination.
// Destination is an ItemContainer, so could be an item or grid contents.
function MoveAction(model, controller, targetItem, destItem)
{
    MoveAction.baseConstructor.call(this, model, controller);
    this.type = "Move";

    this.targetItem = new ACItemHandler(this.model, targetItem, "src");
	this.targetItem.addActionListener(this);

    this.destItem = new ACItemHandler(this.model, destItem, "dest");
	this.destItem.addActionListener(this);
}

KevLinDev.extend(MoveAction, GameAction);

MoveAction.prototype.performAction = function(areConditionsMet)
{
    if (areConditionsMet)
    {
        if (this.targetItem.item != null)
        {
            if (this.destItem.item != null)
            {
                this.targetItem.item.moveItem(this.destItem.item);
            }
            else
            {
                // Delete the item
                // TODO
            }
        }
    }
    return true;
}

MoveAction.prototype.toXML = function()
{
    var result = MoveAction.superClass.toXML.call(this);
    this.targetItem.addToXML(result);
	this.destItem.addToXML(result);
    return result;
}

MoveAction.prototype.fromXML = function(xml)
{
    MoveAction.superClass.fromXML.call(this, xml);
    this.targetItem.fromXML(xml);
	this.destItem.fromXML(xml);
}

MoveAction.prototype.onDelete = function()
{
	this.targetItem.onDelete();
	this.destItem.onDelete();
	this.targetItem.removeActionListener(this);
	this.destItem.removeActionListener(this);
}


function ActionController(model, parentController, turnClock)
{
    ActionController.baseConstructor.call(this);

    this.model = model;
    this.parentController = parentController;
    this.turnClock = turnClock;
    
    // Actions and conditions
    this.actionFactory = new MyActionFactory(this.model, this);
    this.conditionFactory = new MyConditionFactory(this.model, this, this.turnClock);
    
    // List of actions that can happen to items under specified conditions.
    // These actions are carried out in order.
    this.itemActionList = [];

    // Keep a list of conditions by id.    
    // Not all items have ids.
    // Conditions need ids so actions and other conditions can refer 
    // to them for serialisation purposes.
    this.conditionIdIndex = 0;
    this.condIdList = {};
    
    // Some items speak. We keep track of these here.
    this.speakingItems = [];
}

KevLinDev.extend(ActionController, ActionObject);

ActionController.prototype.clear = function()
{
	for (var i = 0; i < this.itemActionList.length; ++i)
	{
		this.itemActionList[i].onDelete();
	}
	this.itemActionList = [];

	for (var i in this.condIdList)
	{
		this.condIdList[i].onDelete();
	}
	this.conditionIdIndex = 0;
	this.condIdList = {};
	this.clearSpeakingItems();
	this.tellActionListeners(this, {type:"allActionsAndConditionsDeleted"});
}

ActionController.prototype.clearSpeakingItems = function()
{
    for (var i = 0; i < this.speakingItems.length; ++i)
    {
        this.speakingItems[i].setItemParam('speech', null, false);
    }
    this.speakingItems = [];
}

ActionController.prototype.setItemSpeech = function(item, text)
{
    item.setItemParam('speech', text, false);
    this.speakingItems.push(item);
}

ActionController.prototype.teleportTo = function(destination)
{
    this.parentController.gameServerInterface.submitLoadMap(destination);
}

// Export the actions and conditions into the specified parent XML
ActionController.prototype.toXML = function(parentXML)
{
    // Export conditions
    for (var i in this.condIdList)
    {
		var conditionUsed = false;
		for (var j = 0; j < this.itemActionList.length; ++j)
		{
			for (var k = 0; k < this.itemActionList[j].conditions.length; ++k)
			{
				if (this.itemActionList[j].conditions[k] == this.condIdList[i])
				{
					conditionUsed = true;
					break;
				}
			}
			
			if (conditionUsed)
				break;
		}
		
		if (conditionUsed)
		{
        	var condXML = this.condIdList[i].toXML();
        	parentXML.appendChild(condXML);
		}
    }
            
    // Export actions
    for (var i = 0; i < this.itemActionList.length; ++i)
    {
        var actionXML = this.itemActionList[i].toXML();
        parentXML.appendChild(actionXML);
    }
}

ActionController.prototype.fromXML = function(xml)
{
    if (xml == null)
        return;
        
    // Import conditions
    var xmlCondList = xml.getElementsByTagName("cond");
    for (var i = 0; i < xmlCondList.length; i++)
    {
        var cond = this.conditionFactory.fromXML(xmlCondList.item(i));
        this.importCondition(cond); // register the condition in the condition list
    }
    
    // Import actions
    var xmlActionList = xml.getElementsByTagName("action");
    for (var i = 0; i < xmlActionList.length; i++)
    {
        var action = this.actionFactory.fromXML(xmlActionList.item(i));
        this.appendAction(action);
    }
}

ActionController.prototype.registerCondition = function(condition)
{
    if (condition.id == null)
        condition.id = "c_" + this.conditionIdIndex++;
    
    this.condIdList[condition.id] = condition;
}

ActionController.prototype.importCondition = function(condition)
{
    // We only care about conditions with ids.
    if (condition.id == null)
        return;
        
    // As per importItemId
    var idIndex = parseInt(condition.id.slice(2)); // remove the prefix "c_"
    if (idIndex >= this.conditionIdIndex)
        this.conditionIdIndex = idIndex + 1;

    this.condIdList[condition.id] = condition;
}

ActionController.prototype.getConditionById = function(conditionId)
{
    return this.condIdList[conditionId];
}

ActionController.prototype.appendAction = function(action)
{
    action.controller = this;
    this.itemActionList.push(action);
	this.tellActionListeners(action, {type:"ActionAdded"});
}

ActionController.prototype.removeAction = function(action)
{
	// Remove the action
    for (var i = 0; i < this.itemActionList.length; ++i)
    {
     	if (this.itemActionList[i] == action)
     	{
			action.onDelete();
			action.tellActionListeners(this, {type:"actionDeleted"});
     	    action.controller = null;
         	this.itemActionList.splice(i, 1);
         	break;
     	}
    }

	// remove all conditions that refer only to this action
	for (var i = 0; i < action.conditions.length; ++i)
	{
		var isUsed = false;
		for (var j = 0; j < this.itemActionList.length; ++j)
		{
			for (var k = 0; k < this.itemActionList[j].conditions.length; ++k)
			{
				if (this.itemActionList[j].conditions[k] == action.conditions[i])
				{
					isUsed = true;
					break;
				}
			}
		}
		
		if (!isUsed)
			this.removeCondition(action.conditions[i]);
	}
}

ActionController.prototype.removeCondition = function(condition)
{
	for (var j = 0; j < this.itemActionList.length; ++j)
	{
		for (var k = 0; k < this.itemActionList[j].conditions.length; ++k)
		{
			var currCondition = this.itemActionList[j].conditions[k];
			if (currCondition == condition)
			{
				condition.tellActionListeners(this, {type:"conditionDeleted"});
	         	this.itemActionList[j].conditions.splice(k, 1);
				break;
			}
		}
	}
}

// Go through all the actions in order and attempt to execute them.
ActionController.prototype.attemptActions = function()
{
    for (var i = 0; i < this.itemActionList.length; ++i)
    {
        var result = this.itemActionList[i].attemptAction();
        if (!result)
            return;
    }
}
// The action area allows the user to view and edit a single action.
function ActionSummary(controller, action, colour1, colour2)
{
    this.controller = controller;
	this.myAction = action;
	this.colour1 = colour1;
	this.colour2 = colour2;

	this.myAction.addActionListener(this);

	// Create the presentation layout

    // Layout of conditions
	// TODO: Where to attach conditionList?
	this.conditionSummaries = new FlowLayout(0, 0, {direction:"down", minSpacing:3});

    this.presentationLayout = new FlowLayout(0, 0, {minSpacing:3});

    this.editButton = new RectButton("editAction", 0, 0, new SVGElement("text", {"font-size":12, fill:"black", x:5, y:12}, "Edit"), {fill:"white", stroke:"green", rx:2}, {fill:"green"}, {fill:"blue"}, 2, false);    
    this.editButton.addActionListener(this);
    this.presentationLayout.appendChild(this.editButton);

	// Add existing conditions
	this.updateConditionSummaries(this.myAction.conditions);

    ActionSummary.baseConstructor.call(this, 0, 0, this.presentationLayout, {fill:this.colour2,stroke:this.colour1,rx:4}, 3);
}

KevLinDev.extend(ActionSummary, RectLabel);

ActionSummary.prototype.updateConditionSummaries = function(conditionList)
{
    this.clearConditionSummaries();

    for (var i in conditionList)
    {
        var newConditionView = makeConditionSummary(this.controller, conditionList[i]);
        this.conditionSummaries.appendChild(newConditionView);
		newConditionView.addActionListener(this);
    }
}

ActionSummary.prototype.clearConditionSummaries = function()
{
    this.conditionSummaries.removeChildren();
}

ActionSummary.prototype.doAction = function(src, evt)
{
    ActionSummary.superClass.doAction.call(this, src, evt);

	if (evt.type == "click" && src.src == "editAction")
	{
 		// User wishes to edit this action
		this.tellActionListeners(this.myAction, {type:"actionEditRequested"});
	}
	else if (evt.type == "actionUpdated")
	{
		this.initFromAction();
	}
	else if (evt.type == "actionDeleted")
	{
		// The action has been deleted, so we should remove ourselves too
		this.tellActionListeners(this, {type:"actionSummaryDeleted"});
	}
}

// Default initialisation of the action summary from the action data
// Used at init, and whenever the action data has changed
ActionSummary.prototype.initFromAction = function()
{
	this.refreshLayout();
}
 // Height action requires a block item and the target height
function HeightActionSummary(controller, action, colour1, colour2)
{
    HeightActionSummary.baseConstructor.call(this, controller, action, colour1, colour2);
    
	// Create presentation contents
    var presentationContents = new FlowLayout(0, 0, {minSpacing:3});

	// action type icon
    var currIcon = new SVGElement();
    currIcon.cloneElement(this.controller.artwork.getElementById("iconActionRaiseLower"));
    var actionButton = new RectLabel(0, 0, currIcon, {fill:colour1, stroke:"none", rx:2, width:30, height:30}, 2);
    presentationContents.appendChild(actionButton);

	// block item
    this.itemPresentationLabel = new SummaryItemDisplay(this.controller, {fill:"white", stroke:"none", rx:2, width:30, height:30}, 2);
	presentationContents.appendChild(this.itemPresentationLabel);

	// Right arrow 
    rightArrow = new SVGElement();
    rightArrow.cloneElement(this.controller.artwork.getElementById("iconRightArrow"));
    this.rightArrowLabelPres = new RectLabel(0, 0, rightArrow, {fill:"none", stroke:"none", width:30, height:30});	
	presentationContents.appendChild(this.rightArrowLabelPres);

	// Resulting item appearance
    this.finalItemAppearancePres = new RectLabel(0, 0, null, {fill:"white", stroke:"none", rx:2, width:30, height:30}, 2);	
	presentationContents.appendChild(this.finalItemAppearancePres);

	this.presentationLayout.prependChild(presentationContents);

    this.initFromAction();
}

KevLinDev.extend(HeightActionSummary, ActionSummary);

HeightActionSummary.prototype.initFromAction = function()
{
 	this.setSelectedItem(this.myAction.heightItem.item);
    this.setNewHeight(this.myAction.newHeight);

	HeightActionSummary.superClass.initFromAction.call(this);    
}

HeightActionSummary.prototype.setNewHeight = function(height)
{
    this.newHeight = height;

    // Update the final item appearance 
    if (this.finalItemAppearancePresEl != null)
    {
        this.finalItemAppearancePresEl.setHeight(height);
        this.finalItemAppearancePres.refreshLayout();
    }
}

HeightActionSummary.prototype.setSelectedItem = function(item)
{
    if (this.selectedItem == item)
        return;

	this.itemPresentationLabel.setSelectedItem(item);

	if (item != null)
	{
	    this.newHeight = item.params.ht;

		// Show the final item appearance and arrow
        this.rightArrowLabelPres.show();
		this.finalItemAppearancePres.show();

		this.finalItemAppearancePresEl = this.controller.model.itemFactory.makeSimpleViewItem(item);
		this.finalItemAppearancePres.setContents(this.finalItemAppearancePresEl);
	}
	else
	{
		// Hide the final item appearance and arrow
        this.rightArrowLabelPres.hide();

		this.finalItemAppearancePres.setContents(null);
		this.finalItemAppearancePres.hide();
	}
}

// Speech action requires an item and the speech text
function SpeechActionSummary(controller, action, colour1, colour2)
{
    SpeechActionSummary.baseConstructor.call(this, controller, action, colour1, colour2);

	// Create presentation contents
    var presentationContents = new FlowLayout(0, 0, {minSpacing:3});

    var currIcon = new SVGElement();
    currIcon.cloneElement(this.controller.artwork.getElementById("iconActionSpeech"));
    var actionButton = new RectLabel(0, 0, currIcon, {fill:colour1, stroke:"none", rx:2, width:30, height:30}, 2);
    presentationContents.appendChild(actionButton);

    this.itemPresentationLabel = new SummaryItemDisplay(this.controller, {fill:"white", stroke:"none", rx:2, width:30, height:30}, 2);
	presentationContents.appendChild(this.itemPresentationLabel);

    this.speechPresentationElement = new SVGElement("text", {"font-size":12, fill:"black", x:5, y:14}, null);
    presentationContents.appendChild(this.speechPresentationElement);
	
	this.presentationLayout.prependChild(presentationContents);

    this.initFromAction();
}

KevLinDev.extend(SpeechActionSummary, ActionSummary);

SpeechActionSummary.prototype.initFromAction = function()
{
	this.itemPresentationLabel.setSelectedItem(this.myAction.speechItem.item);
	this.setSpeechArray(this.myAction.speechArray);
	
	SpeechActionSummary.superClass.initFromAction.call(this);    
}

SpeechActionSummary.prototype.setSpeechArray = function(speechArray)
{
    var speech = speechArray.join("|");

	// Presentation requires summary
    if (speech.length > 20)
        speech = speech.substr(0, 17) + "...";
	this.speechPresentationElement.setValue(speech);
	this.presentationLayout.refreshLayout();
}
// Teleport action requires an item and the teleport destination
function TeleportActionSummary(controller, action, colour1, colour2)
{
    TeleportActionSummary.baseConstructor.call(this, controller, action, colour1, colour2);

	// Create presentation contents
    var presentationContents = new FlowLayout(0, 0, {minSpacing:3});

    var currIcon = new SVGElement();
    currIcon.cloneElement(this.controller.artwork.getElementById("iconActionTeleport"));
    var actionButton = new RectLabel(0, 0, currIcon, {fill:colour1, stroke:"none", rx:2, width:30, height:30}, 2);
    presentationContents.appendChild(actionButton);

    this.destinationPresentationElement = new SVGElement("text", {"font-size":12, fill:"black", x:5, y:14}, null);
    presentationContents.appendChild(this.destinationPresentationElement);
	
	this.presentationLayout.prependChild(presentationContents);

    this.initFromAction();
}

KevLinDev.extend(TeleportActionSummary, ActionSummary);

TeleportActionSummary.prototype.initFromAction = function()
{
	this.setDestination(this.myAction.destination);
	TeleportActionSummary.superClass.initFromAction.call(this);    
}

TeleportActionSummary.prototype.setDestination = function(destinationId)
{
	var destination = "";
    if (destinationId != null && this.controller.visitedWorlds[destinationId] != null)
	{
		destination = this.controller.visitedWorlds[destinationId].map_name;
	}
	this.destinationPresentationElement.setValue(destination);
	this.presentationLayout.refreshLayout();
}

// Move action requires an item and the destination
function MoveActionSummary(controller, action, colour1, colour2)
{
    MoveActionSummary.baseConstructor.call(this, controller, action, colour1, colour2);

	// Create presentation contents
    var presentationContents = new FlowLayout(0, 0, {minSpacing:3, orthogonalAlignment:"centre"});

    var currIcon = new SVGElement();
    currIcon.cloneElement(this.controller.artwork.getElementById("iconActionMove"));
    var actionButton = new RectLabel(0, 0, currIcon, {fill:colour1, stroke:"none", rx:2, width:30, height:30}, 2);
    presentationContents.appendChild(actionButton);

	var moveText = new SVGElement("text", {y:12, "font-size":12}, "Move");
	presentationContents.appendChild(moveText);

    this.targetLabel = new SummaryItemDisplay(this.controller, {fill:"white", stroke:"none", rx:2, width:30, height:30}, 2);
	presentationContents.appendChild(this.targetLabel);

	var toText = new SVGElement("text", {y:12, "font-size":12}, "to");
	presentationContents.appendChild(toText);

    this.destinationLabel = new SummaryItemDisplay(this.controller, {fill:"white", stroke:"none", rx:2, width:30, height:30}, 2);
	presentationContents.appendChild(this.destinationLabel);

	this.presentationLayout.prependChild(presentationContents);

    this.initFromAction();
}

KevLinDev.extend(MoveActionSummary, ActionSummary);

MoveActionSummary.prototype.initFromAction = function()
{
	this.targetLabel.setSelectedItem(this.myAction.targetItem.item);
	this.destinationLabel.setSelectedItem(this.myAction.destItem.item);

	MoveActionSummary.superClass.initFromAction.call(this);    
}
// A generic selector for items 
// ActionEditor and ConditionEditor classes call this when they want the user to select
// an item, either from the item menu or from the play area.
// itemChoiceSet is "topItem" or "topBlock"
function ItemViewSelector(controller, colour1, tag, itemChoiceSet)
{
    ItemViewSelector.baseConstructor.call(this, "itemButton", 0, 0, null, {fill:"white", stroke:colour1, rx:2, width:40, height:40}, {fill:"yellow"}, {fill:"orange"}, 2, false);

    this.controller = controller;
    this.selectedItem = null;
	this.tag = tag;
	this.itemChoiceSet = itemChoiceSet;
}

KevLinDev.extend(ItemViewSelector, RectButton);

ItemViewSelector.prototype.doAction = function(src, evt)
{
	if (evt.type == "click" && src == this)
	{
     	// Update the item using the item selector window
    	this.controller.editWindow.itemSelectorWindow.setClient(this, this.selectedItem, this.itemChoiceSet, this.tag);
		this.controller.editWindow.itemSelectorWindow.show();
	}
	else if (evt.type == "itemUpdated")
	{
		// The item has been updated by something, so update the appearance
		this.setSelectedItem(evt.item);
	}	

    ItemViewSelector.superClass.doAction.call(this, src, evt);
}

ItemViewSelector.prototype.userHasSelectedItem = function(item, tag)
{
	if (tag == this.tag)
    	this.setSelectedItem(item);
}

ItemViewSelector.prototype.setSelectedItem = function(item)
{
    if (this.selectedItem == item)
        return;
        
	this.selectedItem = item;
	
	if (item != null)
	{
		var itemEditElement = this.controller.model.itemFactory.makeSimpleViewItem(item);
		this.setContents(itemEditElement);
	}
	else
	{
		var itemEditElement = new SVGElement();
		itemEditElement.cloneElement(this.controller.artwork.getElementById("clickToChooseItem"));
		this.setContents(itemEditElement);
	}
	this.tellActionListeners(this, {type:"itemViewUpdated"});
}

// The action area allows the user to view and edit a single action.
function ActionEditor(controller, action, colour1, colour2)
{
    this.controller = controller;
	this.myAction = action;
	this.colour1 = colour1;
	this.colour2 = colour2;

    ActionEditor.baseConstructor.call(this, "Action Editor", 5, {fill:this.colour2, stroke:this.colour1, rx:4}, {width:250, height:300, storePrefix:"MW_ActionEditor", contentsSpacing:3});

	// Create the editable layout
	var buttonArea = new FlowLayout(0, 0, {minSpacing:20});	

	// New condition buttons
    this.newConditionButtons = new FlowLayout(0, 0, {minSpacing:3});
    this.conditionButtonParams = ["iconConditionTime", "iconConditionWeight", "iconConditionHasItem"];

    for (var i in this.conditionButtonParams)
    {
        var currIcon = new SVGElement();
        currIcon.cloneElement(
            this.controller.artwork.getElementById(this.conditionButtonParams[i]));

        var conditionButton = new RectButton(this.conditionButtonParams[i], 0, 0, currIcon, {fill:"white", stroke:"orange", rx:2, width:30, height:30}, {fill:"yellow"}, {fill:"orange"}, 5, false);
        conditionButton.addActionListener(this);
        this.newConditionButtons.appendChild(conditionButton);
    }
    this.contents.appendChild(this.newConditionButtons);

    // Layout of conditions
	this.conditionSummaries = new FlowLayout(0, 0, {direction:"down", minSpacing:3});
	this.conditionScrollbarRegion = new ScrollbarRegion({width:240, height:200, scrollbarWidth:20}, this.conditionSummaries);
    this.conditionSummaries.addResizeListener(this.conditionScrollbarRegion);
	this.contents.appendChild(this.conditionScrollbarRegion);

	this.updateConditionSummaries(this.myAction.conditions);
	
	// Fill out with existing conditions
	
	this.contents.appendChild(this.conditionSummaries);

	// Update, cancel and delete buttons
    this.updateButton = new RectButton("updateAction", 0, 0, new SVGElement("text", {"font-size":12, fill:"black", x:5, y:12}, "Update"), {fill:"white", stroke:"green", rx:2}, {fill:"green"}, {fill:"blue"}, 2, false);    
    this.updateButton.addActionListener(this);
    buttonArea.appendChild(this.updateButton);

    this.deleteButton = new RectButton("deleteAction", 0, 0, new SVGElement("text", {"font-size":12, fill:"black", x:5, y:12}, "Delete"), {fill:"white", stroke:"red", rx:2}, {fill:"orange"}, {fill:"red"}, 2, false);    
    this.deleteButton.addActionListener(this);
	buttonArea.appendChild(this.deleteButton);
	
    this.cancelButton = new RectButton("cancelAction", 0, 0, new SVGElement("text", {"font-size":12, fill:"black", x:5, y:12}, "Cancel"), {fill:"white", stroke:"red", rx:2}, {fill:"orange"}, {fill:"red"}, 2, false);    
    this.cancelButton.addActionListener(this);
	buttonArea.appendChild(this.cancelButton);
	
	this.contents.appendChild(buttonArea);
	this.addResizeListener(this);
	
}

KevLinDev.extend(ActionEditor, SVGWindow);

ActionEditor.prototype.updateConditionSummaries = function(conditionList)
{
    this.clearConditionSummaries();

    for (var i in conditionList)
    {
        this.addConditionSummary(conditionList[i]);
    }
}

ActionEditor.prototype.clearConditionSummaries = function()
{
    this.conditionSummaries.removeChildren();
}

ActionEditor.prototype.addConditionSummary = function(condition)
{
    var newConditionSummary = makeConditionSummary(this.controller, condition, false);
    this.conditionSummaries.appendChild(newConditionSummary);
	newConditionSummary.addActionListener(this);
}

ActionEditor.prototype.deleteConditionSummary = function(conditionSummary)
{
    this.conditionSummaries.removeChild(conditionSummary);
}

ActionEditor.prototype.doAction = function(src, evt)
{
    ActionEditor.superClass.doAction.call(this, src, evt);

	if (evt.type == "click")
	{
		var condition = null;
		
		switch (src.src)
		{
    	case "cancelAction":
 		    this.initFromAction(); // Reset to match actual action
			this.tellActionListeners(this, {type:"cancelAction"});
			break;
        
    	case "updateAction":
 			// Change to presentation mode
			this.tellActionListeners(this, {type:"updateAction"});
            this.controller.setMapSavedStatus(false);
			break;

		case "deleteAction":
	 		// Remove this action
			this.tellActionListeners(this, {type:"deleteAction"});
            this.controller.setMapSavedStatus(false);
			break;

		case "iconConditionTime":
			// Create a new timer condition
			condition = new TimestampCondition(this.controller.model, this.controller, this.controller.turnClock, 0);
			break;		

		case "iconConditionWeight":
			// Create a new weight condition
			condition = new WeightCondition(this.controller.model, this.controller, null, 1);
			break;		

    	case "iconConditionHasItem":
    		// Create a new hasItem condition
    		condition = new HasItemCondition(this.controller.model, this.controller, null, false, null);
    		break;		
		}
		
		if (condition != null)
		{
            if (condition.id == null)
            {
		        this.controller.actionController.registerCondition(condition);
			}
			this.myAction.addCondition(condition); // add the condition
			this.appendConditionEditor(condition); // create an editor widget
			this.addConditionSummary(condition); // also create a summary widget

            this.controller.setMapSavedStatus(false);
		}
	}
	else if (evt.type == "deleteCondition")
	{
		this.controller.actionController.removeCondition(src.myCondition);
        this.controller.setMapSavedStatus(false);

		this.setAble(true);
		this.removeChild(src);
	}
	else if (evt.type == "cancelCondition")
	{
		this.setAble(true);
		this.removeChild(src);
	}
	else if (evt.type == "updateCondition")
	{
		this.setAble(true);
		this.removeChild(src);
	}
	else if (evt.type == "conditionSummaryDeleted")
	{
		this.deleteConditionSummary(src);
	}
	else if (evt.type == "conditionEditRequested")
	{
		this.appendConditionEditor(src); // create an editor widget for the requested condition
	}
}

ActionEditor.prototype.appendConditionEditor = function(condition)
{
    var newConditionEditor = makeConditionEditor(this.controller, condition);
	if (newConditionEditor != null)
	{
		newConditionEditor.addActionListener(this);
	
		// Show the condition editor
		this.setAble(false);
		this.appendChild(newConditionEditor);
	}
}

// Default initialisation of the action area from the action data
// Used at init, and whenever we want to edit the action
ActionEditor.prototype.initFromAction = function()
{
}

function makeConditionSummary(controller, condition)
{
	var result = null;
	
	switch (condition.type)
	{
	case "Timestamp":
    	result = new TimestampConditionSummary(controller, condition);
		break;
		
	case "Weight":
		result = new WeightConditionSummary(controller, condition);
		break;
		
	case "HasItem":
		result = new HasItemConditionSummary(controller, condition);
		break;
	}
	return result;
}

function makeConditionEditor(controller, condition)
{
	var result = null;
	
	switch (condition.type)
	{
	case "Timestamp":
    	result = new TimestampConditionEditor(controller, condition);
		break;
		
	case "Weight":
		result = new WeightConditionEditor(controller, condition);
		break;
		
	case "HasItem":
		result = new HasItemConditionEditor(controller, condition);
		break;
	}
	return result;
}// Speech action requires an item and the speech text
function SpeechActionEditor(controller, action, colour1, colour2)
{
    SpeechActionEditor.baseConstructor.call(this, controller, action, colour1, colour2);
    this.myTag = "SpeakingItem";

	this.selectedItem = null;

	// Create editable contents
    var editableContents = new FlowLayout(0, 0, {minSpacing:3});

    var currIcon = new SVGElement();
    currIcon.cloneElement(this.controller.artwork.getElementById("iconActionSpeech"));
    var actionButton = new RectLabel(0, 0, currIcon, {fill:colour1, stroke:"none", rx:2, width:30, height:30}, 2);
    editableContents.appendChild(actionButton);

    this.speechItemButton = new ItemViewSelector(this.controller, colour1, "speechItem", "topItem");
	editableContents.appendChild(this.speechItemButton);

	this.speechEditTextbox = new TextArea("speechText", controller.background, {width:100, height:40, fill:"white", "stroke":colour1, rx:5}, {"font-size":14, fill:"black", x:3, y:14}, 0, 0, {normal:{stroke:"blue"}, focus:{stroke:"red"}});
   	editableContents.appendChild(this.speechEditTextbox);

	this.contents.prependChild(editableContents);

    this.initFromAction();
}

KevLinDev.extend(SpeechActionEditor, ActionEditor);

SpeechActionEditor.prototype.initFromAction = function()
{
	this.speechItemButton.setSelectedItem(this.myAction.speechItem.item);
	this.setSpeechArray(this.myAction.speechArray);
	this.refreshLayout();
}

SpeechActionEditor.prototype.doAction = function(src, evt)
{
	if (evt.type == "click")
	{
		switch (src.src)
		{
		case "updateAction":
			// Commit the updates into the action
			var speechArray = this.speechEditTextbox.textVal.split('|');
		
			// Update the action
			this.myAction.speechItem.setItem(this.speechItemButton.selectedItem);
			this.myAction.setSpeechArray(speechArray);
		
			// Update the appearance
			this.setSpeechArray(speechArray);
			break;
		}
	}		

    SpeechActionEditor.superClass.doAction.call(this, src, evt);
}

SpeechActionEditor.prototype.setSpeechArray = function(speechArray)
{
    var speech = speechArray.join("|");
	this.speechEditTextbox.setValue(speech);
}
// Teleport action requires an item and the teleport destination
function MoveActionEditor(controller, action, colour1, colour2)
{
    MoveActionEditor.baseConstructor.call(this, controller, action, colour1, colour2);

	// Create editable contents
    var editableContents = new FlowLayout(0, 0, {minSpacing:3, orthogonalAlignment:"centre"});
    
    var currIcon = new SVGElement();
    currIcon.cloneElement(this.controller.artwork.getElementById("iconActionMove"));
    var actionButton = new RectLabel(0, 0, currIcon, {fill:colour1, stroke:"none", rx:2, width:30, height:30}, 2);
    editableContents.appendChild(actionButton);

	var moveText = new SVGElement("text", {y:12, "font-size":12}, "Move");
	editableContents.appendChild(moveText);

    this.targetItemButton = new ItemViewSelector(controller, colour1, "targetItem", "topItem");
	editableContents.appendChild(this.targetItemButton);

	var toText = new SVGElement("text", {y:12, "font-size":12}, "to");
	editableContents.appendChild(toText);

    this.destinationItemButton = new ItemViewSelector(controller, colour1, "destItem", "topItem");
	editableContents.appendChild(this.destinationItemButton);

	this.contents.prependChild(editableContents);

    this.initFromAction();
}

KevLinDev.extend(MoveActionEditor, ActionEditor);

MoveActionEditor.prototype.initFromAction = function()
{
	this.targetItemButton.setSelectedItem(this.myAction.targetItem.item);
	this.destinationItemButton.setSelectedItem(this.myAction.destItem.item);
	this.refreshLayout();
}

MoveActionEditor.prototype.doAction = function(src, evt)
{
	if (evt.type == "click")
	{
		switch (src.src)
		{
		case "updateAction":
			// Update the action
			this.myAction.targetItem.setItem(this.targetItemButton.selectedItem);
			this.myAction.destItem.setItem(this.destinationItemButton.selectedItem);
			break;
		}
	}		

    MoveActionEditor.superClass.doAction.call(this, src, evt);
}
// Height action requires a block item and the target height
function HeightActionEditor(controller, action, colour1, colour2)
{
    HeightActionEditor.baseConstructor.call(this, controller, action, colour1, colour2);
    this.myTag = "HeightChangeBlock";
    
	// Create editable contents
    var editableContents = new FlowLayout(0, 0, {minSpacing:3});

	// action type icon
    var currIcon = new SVGElement();
    currIcon.cloneElement(this.controller.artwork.getElementById("iconActionRaiseLower"));
    var actionButton = new RectLabel(0, 0, currIcon, {fill:colour1, stroke:"none", rx:2, width:30, height:30}, 2);
    editableContents.appendChild(actionButton);

	// Item that has its height changed
    this.heightItemButton = new ItemViewSelector(controller, colour1, "heightItem", "topBlock");
	editableContents.appendChild(this.heightItemButton);
	this.heightItemButton.addActionListener(this); // We get an "itemViewUpdated" action event when the item is updated

	// Right arrow - hidden until a block item has been selected
    var rightArrow = new SVGElement();

    rightArrow.cloneElement(this.controller.artwork.getElementById("iconRightArrow"));
    this.rightArrowLabelEdit = new RectLabel(0, 0, rightArrow, {fill:"none", stroke:"none", width:30, height:40});	
	editableContents.appendChild(this.rightArrowLabelEdit);

	// Resulting item appearance - hidden until a block item has been selected
    this.finalItemAppearanceEdit = new RectLabel(0, 0, null, {fill:"white", stroke:"none", width:40, height:40}, 2);	
	editableContents.appendChild(this.finalItemAppearanceEdit);

	// Up and down buttons - hidden until a block item has been selected
    this.heightButtons = new FlowLayout(0, 0, {direction:"down", minSpacing:5});

    var upArrow = new SVGElement();
    upArrow.cloneElement(this.controller.artwork.getElementById("iconUpArrow"));
    this.upArrowButton = new RectButton("upArrowButton", 0, 0, upArrow, {fill:"white", stroke:colour1, rx:2, width:30, height:13}, {fill:"yellow"}, {fill:"orange"}, 2, false);
	this.heightButtons.appendChild(this.upArrowButton);
	this.upArrowButton.addActionListener(this);

    var downArrow = new SVGElement();
    downArrow.cloneElement(this.controller.artwork.getElementById("iconDownArrow"));
    this.downArrowButton = new RectButton("downArrowButton", 0, 0, downArrow, {fill:"white", stroke:colour1, rx:2, width:30, height:13}, {fill:"yellow"}, {fill:"orange"}, 2, false);	
	this.heightButtons.appendChild(this.downArrowButton);
	this.downArrowButton.addActionListener(this);

	editableContents.appendChild(this.heightButtons);

	this.contents.prependChild(editableContents);

    this.initFromAction();
}

KevLinDev.extend(HeightActionEditor, ActionEditor);

HeightActionEditor.prototype.initFromAction = function()
{
 	this.heightItemButton.setSelectedItem(this.myAction.heightItem.item);
	this.updateHeightEditAppearance(this.heightItemButton.selectedItem);
    this.setNewHeight(this.myAction.newHeight);
	this.refreshLayout();
}

HeightActionEditor.prototype.doAction = function(src, evt)
{
	if (evt.type == "click")
	{
		switch (src.src)
		{
		case "upArrowButton":
		    this.setNewHeight(this.newHeight + 5);
			break;

		case "downArrowButton":
		    this.setNewHeight(this.newHeight - 5);
			break;

		case "updateAction":
			// Commit the updates into the action

			// Update the action
			this.myAction.heightItem.setItem(this.heightItemButton.selectedItem);
			this.myAction.setHeight(this.newHeight);

			// Update the appearance
			this.setNewHeight(this.newHeight);
			break;
		}
	}
	else if (evt.type == "itemViewUpdated")
	{
		this.updateHeightEditAppearance(this.heightItemButton.selectedItem);
	}
    
	HeightActionEditor.superClass.doAction.call(this, src, evt);
}

HeightActionEditor.prototype.setNewHeight = function(height)
{
    this.newHeight = height;

    // Update the final item appearance 
    if (this.finalItemAppearanceEditEl != null)
    {
        this.finalItemAppearanceEditEl.setHeight(height);
        this.finalItemAppearanceEdit.refreshLayout();
    }
}

HeightActionEditor.prototype.updateHeightEditAppearance = function(item)
{
	if (item != null)
	{
	    this.newHeight = item.params.ht;

		// Show the final item appearance and arrow
        this.rightArrowLabelEdit.show();
        this.heightButtons.show();
		this.finalItemAppearanceEdit.show();

		this.finalItemAppearanceEditEl = this.controller.model.itemFactory.makeSimpleViewItem(item);
		this.finalItemAppearanceEdit.setContents(this.finalItemAppearanceEditEl);
	}
	else
	{
		// Hide the final item appearance and arrow
        this.rightArrowLabelEdit.hide();
        this.heightButtons.hide();

		this.finalItemAppearanceEdit.setContents(null);
		this.finalItemAppearanceEdit.hide();
	}
}

// Teleport action requires an item and the teleport destination
function TeleportActionEditor(controller, action, colour1, colour2)
{
    TeleportActionEditor.baseConstructor.call(this, controller, action, colour1, colour2);

	this.destinationId = null;

	// Create editable contents
    var editableContents = new FlowLayout(0, 0, {minSpacing:3});

    var currIcon = new SVGElement();
    currIcon.cloneElement(this.controller.artwork.getElementById("iconActionTeleport"));
    var actionButton = new RectLabel(0, 0, currIcon, {fill:colour1, stroke:"none", rx:2, width:30, height:30}, 2);
    editableContents.appendChild(actionButton);

    var reminderText = new SVGElement("text", {"font-size":12, y:12, fill:"black"}, "Destination:");
	editableContents.appendChild(reminderText);
	
    // Select teleport button
    this.teleportToText = new SVGElement("text", {"font-size":12, y:12, fill:"black"}, "Select Destination");
    this.selectTeleportButton = new RectButton("selectTeleportButton", 0, 0, this.teleportToText, {fill:"white", stroke:"none"}, {fill:"yellow"}, {fill:"orange"}, 2, false);	
    this.selectTeleportButton.addActionListener(this);
	editableContents.appendChild(this.selectTeleportButton);	

	// Teleport destination subwindow
	this.teleportWindow = new WorldChooserWindow(this.controller, {windowName:"Teleport Destination", showAccessOnly:true, closeOnSelect:true});
	this.teleportWindow.addActionListener(this);
	this.teleportWindow.hide();
	this.appendChild(this.teleportWindow);
    this.controller.visitedWorldNotifier.addActionListener(this.teleportWindow);

	this.contents.prependChild(editableContents);

    this.initFromAction();
}

KevLinDev.extend(TeleportActionEditor, ActionEditor);

TeleportActionEditor.prototype.initFromAction = function()
{
	this.setDestination(this.myAction.destination);
	this.refreshLayout();
}

TeleportActionEditor.prototype.doAction = function(src, evt)
{
	if (evt.type == "click")
	{
		switch (src.src)
		{
		case "updateAction":
			// Update the action
			this.myAction.setDestination(this.destinationId);
			break;
			
		case "selectTeleportButton":
			this.teleportWindow.show();
			break;
		}
	}		
    else if (evt.type == "worldSelected")
    {
		this.setDestination(evt.value);
    }

    TeleportActionEditor.superClass.doAction.call(this, src, evt);
}

TeleportActionEditor.prototype.setDestination = function(destinationId)
{
    this.destinationId = destinationId;

	var destination = "";
    if (destinationId != null && this.controller.visitedWorlds[destinationId] != null)
	{
    	this.teleportToText.setValue(this.controller.visitedWorlds[destinationId].map_name);
    	this.selectTeleportButton.refreshLayout();
	}
}

// This is a window holding a list of action summaries. 
// It also has buttons to create new actions.
function ActionViewWindow(controller)
{
	this.controller = controller;
	
    ActionViewWindow.baseConstructor.call(this, "Actions", 5, {fill:"lightGreen", stroke:"green", rx:4}, {width:240, height:280, storePrefix:"MW_ActionViewWindow", contentsSpacing:3});

    // The actions view window allows the user to create and edit actions.
    this.newActionButtons = new FlowLayout(0, 0, {minSpacing:3});

    var actionButtonParams = ["iconActionSpeech", "iconActionRaiseLower", "iconActionTeleport", "iconActionMove"];

	// New action buttons
    for (var i in actionButtonParams)
    {
        var currIcon = new SVGElement();
        currIcon.cloneElement(
            this.controller.artwork.getElementById(actionButtonParams[i]));

        var actionButton = new RectButton(actionButtonParams[i], 0, 0, currIcon, {fill:"white", stroke:"green", rx:2, width:40, height:40}, {fill:"yellow"}, {fill:"orange"}, 5, false);
        actionButton.addActionListener(this);
        this.newActionButtons.appendChild(actionButton);
    }
    this.contents.appendChild(this.newActionButtons);
    
    // List of action summaries
    this.actionSummaries = new FlowLayout(0, 0, {direction:"down", minSpacing:3});
	this.actionScrollbarRegion = new ScrollbarRegion({width:240, height:200, scrollbarWidth:20, rectBorder:{stroke:"black", "stroke-width":"2", fill:"none"}}, this.actionSummaries);
    this.actionSummaries.addResizeListener(this.actionScrollbarRegion);
	this.contents.appendChild(this.actionScrollbarRegion);

	// Update our action summary list from the action controller
    for (var i in this.controller.actionController.itemActionList)
    {
        this.addActionSummary(this.controller.actionController.itemActionList[i]);
    }

	// We wish to get updates from the action controller about actions being added or deleted
	// so we can update our corresponding action summaries.
	this.controller.actionController.addActionListener(this);
}

KevLinDev.extend(ActionViewWindow, SVGWindow);

// Add an action summary widget for this action
ActionViewWindow.prototype.addActionSummary = function(action)
{
    var newActionSummary = makeActionSummary(this.controller, action);
    this.actionSummaries.appendChild(newActionSummary);
	newActionSummary.addActionListener(this);
}

ActionViewWindow.prototype.deleteActionSummary = function(actionSummary)
{
    this.actionSummaries.removeChild(actionSummary);
}

ActionViewWindow.prototype.doAction = function(src, evt)
{
    ActionViewWindow.superClass.doAction.call(this, src, evt);

	if (evt.type == "click")
	{
		var action = null;
		
    	switch (src.src)
 		{
		case "iconActionSpeech":
			// Create an empty speech action
			action = new SpeechAction(this.controller.model, this.controller, null, null);
			break;

		case "iconActionRaiseLower":
			// Create an empty height action
			action = new HeightAction(this.controller.model, this.controller, null, 0);
			break;

		case "iconActionTeleport":
			// Create an empty teleport action
			action = new TeleportAction(this.controller.model, this.controller, null);
			break;

    	case "iconActionMove":
    		// Create an empty teleport action
    		action = new MoveAction(this.controller.model, this.controller, null, null);
    		break;
		}
		
		if (action != null)
		{
			this.controller.actionController.appendAction(action); // add the action
			this.appendActionEditor(action); // create an editor widget
			
			this.controller.setMapSavedStatus(false);
		}
	}
	else if (evt.type == "deleteAction")
	{
		// ActionEditor has told us the user deleted an action
		this.controller.actionController.removeAction(src.myAction);
        this.controller.setMapSavedStatus(false);

		this.setAble(true);
		this.removeChild(src);
	}
	else if (evt.type == "cancelAction")
	{
		// ActionEditor has told us the user cancelled what they were doing to an action
		// We don't need to do anything except close the ActionEditor window.
		this.setAble(true);
		this.removeChild(src);
	}
	else if (evt.type == "updateAction")
	{
		// ActionEditor has told us the user updated an action
		// We don't need to do anything except close the ActionEditor window.
		this.setAble(true);
		this.removeChild(src);
	}
	else if (evt.type == "actionSummaryDeleted")
	{
		// An ActionSummary in our list told us it wants to get deleted
		// (Probably because an action told the ActionSummary it was getting deleted)
		this.deleteActionSummary(src);
	}
	else if (evt.type == "actionEditRequested")
	{
		// An ActionSummary in our list wants its action to get edited
		this.appendActionEditor(src);
	}
	else if (evt.type == "allActionsAndConditionsDeleted")
	{
		// ActionController has told us it has cleared all the actions.
	    this.actionSummaries.removeChildren();
	}
	else if (evt.type == "ActionAdded")
	{
		// ActionController has told us an action has been added
		this.addActionSummary(src);
	}
}

ActionViewWindow.prototype.appendActionEditor = function(action)
{
    var newActionEditor = makeActionEditor(this.controller, action);
	newActionEditor.addActionListener(this);
	
	// Show the action editor
	this.setAble(false);
	this.appendChild(newActionEditor);
}

function makeActionSummary(controller, action)
{
	var result = null;
	
	switch (action.type)
	{
	case "Speech":
		result = new SpeechActionSummary(controller, action, "blue", "lightBlue");
		break;
		
	case "Height":
		result = new HeightActionSummary(controller, action, "purple", "plum");
		break;
		
	case "Teleport":
		result = new TeleportActionSummary(controller, action, "darkGreen", "green");
		break;

    case "Move":
    	result = new MoveActionSummary(controller, action, "khaki", "darkkhaki");
    	break;
	}
	return result;
}

function makeActionEditor(controller, action)
{
	var result = null;
	
	switch (action.type)
	{
	case "Speech":
		result = new SpeechActionEditor(controller, action, "blue", "lightBlue");
		break;
		
	case "Height":
		result = new HeightActionEditor(controller, action, "purple", "plum");
		break;
		
	case "Teleport":
		result = new TeleportActionEditor(controller, action, "darkGreen", "green");
		break;

    case "Move":
    	result = new MoveActionEditor(controller, action, "khaki", "darkkhaki");
    	break;
	}
	return result;
}

function MyConditionFactory(model, controller, clock)
{
    this.model = model;
    this.controller = controller;
    this.turnClock = clock;
}

MyConditionFactory.prototype.fromXML = function(xml)
{
    var result = null;
    
    switch (xml.getAttribute("type"))
    {
    case 'Timestamp':
        result = new TimestampCondition(this.model, this.controller, this.turnClock, 0);
        break;

    case 'Weight':
        result = new WeightCondition(this.model, this.controller, null, 0);
        break;

    case 'HasItem':
        result = new HasItemCondition(this.model, this.controller, null, false, null);
        break;

    default:
        break;
    }

    if (result == null)
        return null;

	result.fromXML(xml);

    return result;
}

function GameCondition(model, controller)
{
    GameCondition.baseConstructor.call(this);

    this.model = model;
    this.controller = controller;
    this.type = "Default";
}

KevLinDev.extend(GameCondition, ActionObject);

// Default
GameCondition.prototype.isMet = function()
{
    return false;
}

// Default
GameCondition.prototype.onDelete = function()
{
}

GameCondition.prototype.toXML = function()
{
    var xmlCond = this.model.xmlDoc.createElement("cond");
    xmlCond.setAttribute("id", this.id);
    xmlCond.setAttribute("type", this.type);
    
    return xmlCond;
}

GameCondition.prototype.fromXML = function(xml)
{
	this.id = xml.getAttribute("id");
	
	// Don't need to get type, as the factory determines which
	// subclass to create based on the type. So it's updated already.
}

GameCondition.prototype.doAction = function(src, evt)
{
	if (evt.type == "itemUpdated")
	{
		// An ACItemHandler has let us know it's been updated, so pass on the update request.
		this.tellActionListeners(this, {type:"conditionUpdated"});
	}		
}

function TimestampCondition(model, controller, turnClock, timestamp)
{    
    this.turnClock = turnClock;
    this.timestamp = timestamp;
    TimestampCondition.baseConstructor.call(this, model, controller);
    this.type = "Timestamp";
}

KevLinDev.extend(TimestampCondition, GameCondition);

TimestampCondition.prototype.isMet = function()
{
    return (this.turnClock.currentTime == this.timestamp);
}

TimestampCondition.prototype.setTimestamp = function(timestamp)
{
	this.timestamp = timestamp;
	this.tellActionListeners(this, {type:"conditionUpdated"});
}

TimestampCondition.prototype.toXML = function()
{
    var result = TimestampCondition.superClass.toXML.call(this);      
    result.setAttribute("timestamp", this.timestamp);
    return result;
}

TimestampCondition.prototype.fromXML = function(xml)
{
    TimestampCondition.superClass.fromXML.call(this, xml);      
	this.setTimestamp(parseInt(xml.getAttribute('timestamp')));
}

function WeightCondition(model, controller, item, minWeight)
{
    WeightCondition.baseConstructor.call(this, model, controller);
    this.type = "Weight";

    this.weightItem = new ACItemHandler(this.model, item, this.type);
	this.weightItem.addActionListener(this);
	
    this.setMinWeight(minWeight);
}

KevLinDev.extend(WeightCondition, GameCondition);

WeightCondition.prototype.isMet = function()
{
	if (this.weightItem.item == null)
		return false;
		
    // Get the weight of items on top of this item
    var items = this.weightItem.item.getFlattenedTree();
    var weight = 0;
    for (var i in items)
    {
        if (items[i] != this.weightItem.item && items[i].params.wt != null)
        {
            weight += items[i].params.wt;
        }
    }
    return (weight >= this.minWeight);
}

WeightCondition.prototype.setMinWeight = function(minWeight)
{
	this.minWeight = minWeight;
	this.tellActionListeners(this, {type:"conditionUpdated"});
}

WeightCondition.prototype.toXML = function()
{
    var result = WeightCondition.superClass.toXML.call(this);      
    result.setAttribute("minWt", this.minWeight);
	this.weightItem.addToXML(result);

    return result;
}

WeightCondition.prototype.fromXML = function(xml)
{
    WeightCondition.superClass.fromXML.call(this, xml);    
  
    this.weightItem.fromXML(xml);
	this.setMinWeight(parseInt(xml.getAttribute('minWt')));
}

WeightCondition.prototype.onDelete = function()
{
	this.weightItem.onDelete();
}


// True if the container has the itemId or itemCode as a descendant
function HasItemCondition(model, controller, heldItem, matchCriterion, container, itemTag)
{
    HasItemCondition.baseConstructor.call(this, model, controller);
    this.type = "HasItem";

    this.heldItem = new ACItemHandler(this.model, heldItem, "held");
	this.heldItem.setItemMatchCriterion(matchCriterion, itemTag);
	this.heldItem.addActionListener(this);
	
    this.containerItem = new ACItemHandler(this.model, container, "container");
	this.containerItem.addActionListener(this);
}

KevLinDev.extend(HasItemCondition, GameCondition);

HasItemCondition.prototype.isMet = function()
{
    if (this.containerItem.item == null)
        return false;
    
    var tree = this.containerItem.item.getFlattenedTree();
    for (var i in tree)
    {
        if (this.heldItem.matchesItem(tree[i]))
            return true;
    }
    
    return false;
}

HasItemCondition.prototype.toXML = function()
{
    var result = HasItemCondition.superClass.toXML.call(this);   

    this.heldItem.addToXML(result);
	this.heldItem.addActionListener(this);

    this.containerItem.addToXML(result);
	this.containerItem.addActionListener(this);

    return result;
}

HasItemCondition.prototype.fromXML = function(xml)
{
    HasItemCondition.superClass.fromXML.call(this, xml);    
  
    this.heldItem.fromXML(xml);
	this.containerItem.fromXML(xml);
}

HasItemCondition.prototype.onDelete = function()
{
	this.heldItem.onDelete();
	this.containerItem.onDelete();
}

// The condition summary allows the user to view a single condition
function ConditionSummary(controller, condition)
{
    this.controller = controller;
	this.myCondition = condition;

	this.myCondition.addActionListener(this);

	// Create the presentation layout
    this.presentationLayout = new FlowLayout(0, 0, {minSpacing:3});

    this.editButton = new RectButton("editCondition", 0, 0, new SVGElement("text", {"font-size":12, fill:"black", x:5, y:12}, "Edit"), {fill:"white", stroke:"green", rx:2}, {fill:"green"}, {fill:"blue"}, 2, false);    
    this.editButton.addActionListener(this);
    this.presentationLayout.appendChild(this.editButton);

    ConditionSummary.baseConstructor.call(this, 0, 0, this.presentationLayout, {fill:"lightyellow",stroke:"orange",rx:4}, 3);
}

KevLinDev.extend(ConditionSummary, RectLabel);

ConditionSummary.prototype.doAction = function(src, evt)
{
    ConditionSummary.superClass.doAction.call(this, src, evt);

	if (evt.type == "click")
	{
		switch (src.src)
		{
		case "editCondition":
			// User wishes to edit the condition
			this.tellActionListeners(this.myCondition, {type:"conditionEditRequested"});
			break;
		}
	}
	else if (evt.type == "conditionUpdated")
	{
		this.initFromCondition();
	}
	else if (evt.type == "conditionDeleted")
	{
		// The condition has been deleted, so we should remove ourselves too
		this.tellActionListeners(this, {type:"conditionSummaryDeleted"});
	}
}

// Default init from condition, used in init and when starting to edit
ConditionSummary.prototype.initFromCondition = function()
{
	this.refreshLayout();
}

function TimestampConditionSummary(controller, condition)
{
    TimestampConditionSummary.baseConstructor.call(this, controller, condition);

	// Create presentation contents
    var presentationContents = new FlowLayout(0, 0, {minSpacing:3});

    var currIcon = new SVGElement();
    currIcon.cloneElement(this.controller.artwork.getElementById("iconConditionTime"));
    conditionTypeLabel = new RectLabel(0, 0, currIcon, {fill:"orange", stroke:"none", rx:2, width:20, height:20}, 2);
    presentationContents.appendChild(conditionTypeLabel);

    this.timestampPresentationElement = new SVGElement("text", {"font-size":12, fill:"black", x:5, y:14}, "time: 0");
    presentationContents.appendChild(this.timestampPresentationElement);
	
	this.presentationLayout.prependChild(presentationContents);

    this.initFromCondition();
}

KevLinDev.extend(TimestampConditionSummary, ConditionSummary);

TimestampConditionSummary.prototype.initFromCondition = function()
{
	this.setTimestamp(this.myCondition.timestamp);

	TimestampConditionSummary.superClass.initFromCondition.call(this);    
}

TimestampConditionSummary.prototype.setTimestamp = function(timestamp)
{
	this.timestampPresentationElement.setValue("time: " + timestamp);	
	this.presentationLayout.refreshLayout();
}

function WeightConditionSummary(controller, condition)
{
    WeightConditionSummary.baseConstructor.call(this, controller, condition);

	// Create presentation contents
    var presentationContents = new FlowLayout(0, 0, {minSpacing:3});

    var currIcon = new SVGElement();
    currIcon.cloneElement(this.controller.artwork.getElementById("iconConditionWeight"));
    conditionTypeLabel = new RectLabel(0, 0, currIcon, {fill:"orange", stroke:"none", rx:2, width:20, height:20}, 2);
    presentationContents.appendChild(conditionTypeLabel);

    this.itemPresentationLabel = new SummaryItemDisplay(this.controller, {fill:"white", stroke:"none", rx:2, width:30, height:30}, 2);
	presentationContents.appendChild(this.itemPresentationLabel);

    this.weightPresentationElement = new SVGElement("text", {"font-size":12, fill:"black", x:5, y:14}, "weight: 0");
    presentationContents.appendChild(this.weightPresentationElement);
	
	this.presentationLayout.prependChild(presentationContents);

    this.initFromCondition();
}

KevLinDev.extend(WeightConditionSummary, ConditionSummary);

WeightConditionSummary.prototype.initFromCondition = function()
{
    this.itemPresentationLabel.setSelectedItem(this.myCondition.weightItem.item);
	this.setWeight(this.myCondition.minWeight);

	WeightConditionSummary.superClass.initFromCondition.call(this);    
}

WeightConditionSummary.prototype.setWeight = function(weight)
{
	this.weightPresentationElement.setValue("weight: " + weight);	
	//this.presentationLayout.refreshLayout(); // TODO: Do we need to refresh here?
}
function HasItemConditionSummary(controller, condition)
{
    HasItemConditionSummary.baseConstructor.call(this, controller, condition);

    this.selectedItem = null;
    this.selectedContainer = null;

	// Create presentation contents
	// Consists of [icon] [container] has [this|any] [item]
    var presentationContents = new FlowLayout(0, 0, {minSpacing:3});

    // icon
    var currIcon = new SVGElement();
    currIcon.cloneElement(this.controller.artwork.getElementById("iconConditionHasItem"));
    conditionTypeLabel = new RectLabel(0, 0, currIcon, {fill:"orange", stroke:"none", rx:2, width:20, height:20}, 2);
    presentationContents.appendChild(conditionTypeLabel);

    // container
    this.containerLabel = new SummaryItemDisplay(this.controller, {fill:"white", stroke:"none", rx:2, width:30, height:30}, 2);
	presentationContents.appendChild(this.containerLabel);

    // contains
    var hasElement = new SVGElement("text", {"font-size":12, fill:"black", x:5, y:14}, "contains");
    presentationContents.appendChild(hasElement);

    // this/any/a
    this.thisOrAnyElement = new SVGElement("text", {"font-size":12, fill:"black", x:5, y:14}, "this");
    presentationContents.appendChild(this.thisOrAnyElement);
    
    // item
    this.heldLabel = new SummaryItemDisplay(this.controller, {fill:"white", stroke:"none", rx:2, width:30, height:30}, 2);
	presentationContents.appendChild(this.heldLabel);

	this.presentationLayout.prependChild(presentationContents);

    this.initFromCondition();
}

KevLinDev.extend(HasItemConditionSummary, ConditionSummary);

HasItemConditionSummary.prototype.initFromCondition = function()
{
	this.heldLabel.setSelectedItem(this.myCondition.heldItem.item);
    this.containerLabel.setSelectedItem(this.myCondition.containerItem.item);

	if (this.myCondition.heldItem.matchCriterion == "code")
	{
		this.thisOrAnyElement.setValue("any");
	}
	else if (this.myCondition.heldItem.matchCriterion == "id")
	{
		this.thisOrAnyElement.setValue("this");
	}
	else
	{
		this.thisOrAnyElement.setValue("a");
	}

	HasItemConditionSummary.superClass.initFromCondition.call(this);    
}
// The action area allows the user to view and edit a single action.
function ConditionEditor(controller, condition, width, height)
{
    this.controller = controller;
	this.myCondition = condition;

    ConditionEditor.baseConstructor.call(this, "Condition Editor", 5, {fill:"yellow", stroke:"black", rx:4}, {width:width, height:height, storePrefix:"MW_ConditionEditor", contentsSpacing:3});

	// Create the editable layout
	var buttonArea = new FlowLayout(0, 0, {minSpacing:20});	

    this.updateButton = new RectButton("updateCondition", 0, 0, new SVGElement("text", {"font-size":12, fill:"black", x:5, y:12}, "Update"), {fill:"white", stroke:"green", rx:2}, {fill:"green"}, {fill:"blue"}, 2, false);    
    this.updateButton.addActionListener(this);
    buttonArea.appendChild(this.updateButton);

    this.deleteButton = new RectButton("deleteCondition", 0, 0, new SVGElement("text", {"font-size":12, fill:"black", x:5, y:12}, "Delete"), {fill:"white", stroke:"red", rx:2}, {fill:"orange"}, {fill:"red"}, 2, false);    
    this.deleteButton.addActionListener(this);
	buttonArea.appendChild(this.deleteButton);
	
    this.cancelButton = new RectButton("cancelCondition", 0, 0, new SVGElement("text", {"font-size":12, fill:"black", x:5, y:12}, "Cancel"), {fill:"white", stroke:"red", rx:2}, {fill:"orange"}, {fill:"red"}, 2, false);    
    this.cancelButton.addActionListener(this);
	buttonArea.appendChild(this.cancelButton);
	
	this.contents.appendChild(buttonArea);
}

KevLinDev.extend(ConditionEditor, SVGWindow);

ConditionEditor.prototype.doAction = function(src, evt)
{
    ConditionEditor.superClass.doAction.call(this, src, evt);

	if (evt.type == "click")
	{
		switch (src.src)
		{
		case "cancelCondition":
		    this.initFromCondition();
			this.tellActionListeners(this, {type:"cancelCondition"});
			break;

		case "updateCondition":
			// Change to presentation mode
			this.tellActionListeners(this, {type:"updateCondition"});
            this.controller.setMapSavedStatus(false);
			break;

		case "deleteCondition":
			// Remove the condition
			this.tellActionListeners(this, {type:"deleteCondition"});
            this.controller.setMapSavedStatus(false);
			break;
		}
	}
}

// Default init from condition, used in init and when starting to edit
ConditionEditor.prototype.initFromCondition = function()
{
}

function TimestampConditionEditor(controller, condition)
{
    TimestampConditionEditor.baseConstructor.call(this, controller, condition, 173, 86);

	// Create editable contents
    var editableContents = new FlowLayout(0, 0, {minSpacing:3});

    var currIcon = new SVGElement();
    currIcon.cloneElement(this.controller.artwork.getElementById("iconConditionTime"));
    var conditionTypeLabel = new RectLabel(0, 0, currIcon, {fill:"orange", stroke:"none", rx:2, width:20, height:20}, 2);
    editableContents.appendChild(conditionTypeLabel);

	this.timestampEditTextbox = new TextArea("timestampText", controller.background, {width:40, height:20, fill:"white", "stroke":"orange", rx:5}, {"font-size":14, fill:"black", x:3, y:14}, 0, 0, {normal:{stroke:"orange"}, focus:{stroke:"red"}});
   	editableContents.appendChild(this.timestampEditTextbox);

	this.contents.prependChild(editableContents);

    this.initFromCondition();
}

KevLinDev.extend(TimestampConditionEditor, ConditionEditor);

TimestampConditionEditor.prototype.initFromCondition = function()
{
	this.setTimestamp(this.myCondition.timestamp);
	this.refreshLayout();
}

TimestampConditionEditor.prototype.doAction = function(src, evt)
{
	if (evt.type == "click")
	{
		switch (src.src)
		{
		case "updateCondition":
			// Commit the updates into the condition
			var timestamp = parseInt(this.timestampEditTextbox.textVal);
			this.myCondition.setTimestamp(timestamp);
		
			// Update the appearance
			this.setTimestamp(timestamp);
			break;
		}
	}		

    TimestampConditionEditor.superClass.doAction.call(this, src, evt);
}

TimestampConditionEditor.prototype.setTimestamp = function(timestamp)
{
	this.timestampEditTextbox.setValue(timestamp);
}

function WeightConditionEditor(controller, condition)
{
    WeightConditionEditor.baseConstructor.call(this, controller, condition, 168, 90);
    this.myTag = "holdingItem";

	// Create editable contents
    var editableContents = new FlowLayout(0, 0, {minSpacing:3});

    var currIcon = new SVGElement();
    currIcon.cloneElement(this.controller.artwork.getElementById("iconConditionWeight"));
    var conditionTypeLabel = new RectLabel(0, 0, currIcon, {fill:"orange", stroke:"none", rx:2, width:20, height:20}, 2);
    editableContents.appendChild(conditionTypeLabel);

    // The item on which we wish to measure the weight
    this.weightItemButton = new ItemViewSelector(controller, "orange", "weightItem", "topBlock");
	editableContents.appendChild(this.weightItemButton);

	this.weightEditTextbox = new TextArea("weightText", controller.background, {width:40, height:20, fill:"white", "stroke":"orange", rx:5}, {"font-size":14, fill:"black", x:3, y:14}, 0, 0, {normal:{stroke:"orange"}, focus:{stroke:"red"}});
   	editableContents.appendChild(this.weightEditTextbox);

	this.contents.prependChild(editableContents);

    this.initFromCondition();
}

KevLinDev.extend(WeightConditionEditor, ConditionEditor);

WeightConditionEditor.prototype.initFromCondition = function()
{
    this.weightItemButton.setSelectedItem(this.myCondition.weightItem.item);
	this.setWeight(this.myCondition.minWeight);
	this.refreshLayout();
}

WeightConditionEditor.prototype.doAction = function(src, evt)
{
	if (evt.type == "click")
	{
		switch (src.src)
		{
		case "updateCondition":
			// Commit the updates into the condition
			var weight = parseInt(this.weightEditTextbox.textVal);
			this.myCondition.setMinWeight(weight);
		
			// Update the appearance
			this.setWeight(weight);
			this.myCondition.weightItem.setItem(this.weightItemButton.selectedItem);

			break;
		}
	}		

    WeightConditionEditor.superClass.doAction.call(this, src, evt);
}

WeightConditionEditor.prototype.setWeight = function(weight)
{
	this.weightEditTextbox.setValue(weight);
}
function HasItemConditionEditor(controller, condition)
{
    HasItemConditionEditor.baseConstructor.call(this, controller, condition, 218, 149);
    this.itemTag = "HeldItem";
    this.containerTag = "ContainerItem";

	// Create editable contents
	// Consists of [icon] [container] contains [item] 
    var editableContents = new FlowLayout(0, 0, {direction:"down", minSpacing:3});
    
    var topRow = new FlowLayout(0, 0, {minSpacing:3});
    editableContents.appendChild(topRow);

    var currIcon = new SVGElement();
    currIcon.cloneElement(this.controller.artwork.getElementById("iconConditionHasItem"));
    var conditionTypeLabel = new RectLabel(0, 0, currIcon, {fill:"orange", stroke:"none", rx:2, width:20, height:20}, 2);
    topRow.appendChild(conditionTypeLabel);

    // The container we wish to test
    this.containerEditButton = new ItemViewSelector(controller, "orange", "containerItem", "topItem");
	topRow.appendChild(this.containerEditButton);

    // contains
    var hasElement = new SVGElement("text", {"font-size":12, fill:"black", x:5, y:14}, "contains");
    topRow.appendChild(hasElement);

    // The item whose presence we want to detect
    this.itemEditButton = new ItemViewSelector(controller, "orange", "heldItem", "topItem");
	topRow.appendChild(this.itemEditButton);

	this.heldItemTypeRadioGroup = new RadioButtonGroup();

    var secondRow = new FlowLayout(0, 0, {minSpacing:3});
    editableContents.appendChild(secondRow);
	var checkboxParams = makeSimpleCheckboxParamButtonIdSet();
	checkboxParams.width = 10;
	checkboxParams.height = 10;
	this.matchHeldByCodeCheckbox = new ParamButton2("matchHeldByCodeCheckbox", checkboxParams);
	this.matchHeldByCodeCheckbox.setToggle(true);
	this.heldItemTypeRadioGroup.addButton(this.matchHeldByCodeCheckbox);
	secondRow.appendChild(this.matchHeldByCodeCheckbox);
	secondRow.appendChild(new SVGElement("text", {"font-size":12, fill:"black", x:5, y:12}, "Match any held item that looks the same"));
	this.matchHeldByCodeCheckbox.addActionListener(this);

    var thirdRow = new FlowLayout(0, 0, {minSpacing:3});
    editableContents.appendChild(thirdRow);
	var checkboxParams2 = makeSimpleCheckboxParamButtonIdSet();
	checkboxParams2.width = 10;
	checkboxParams2.height = 10;
	this.matchHeldByIdCheckbox = new ParamButton2("matchHeldByIdCheckbox", checkboxParams2);
	this.matchHeldByIdCheckbox.setToggle(true);
	this.heldItemTypeRadioGroup.addButton(this.matchHeldByIdCheckbox);
	thirdRow.appendChild(this.matchHeldByIdCheckbox);
	thirdRow.appendChild(new SVGElement("text", {"font-size":12, fill:"black", x:5, y:12}, "Match only this held item"));
	this.matchHeldByIdCheckbox.addActionListener(this);

    var forthRow = new FlowLayout(0, 0, {minSpacing:3});
    editableContents.appendChild(forthRow);
	var checkboxParams3 = makeSimpleCheckboxParamButtonIdSet();
	checkboxParams3.width = 10;
	checkboxParams3.height = 10;
	this.matchHeldByTagCheckbox = new ParamButton2("matchHeldByTagCheckbox", checkboxParams3);
	this.matchHeldByTagCheckbox.setToggle(true);
	this.heldItemTypeRadioGroup.addButton(this.matchHeldByTagCheckbox);
	forthRow.appendChild(this.matchHeldByTagCheckbox);
	forthRow.appendChild(new SVGElement("text", {"font-size":12, fill:"black", x:5, y:12}, "Match any held item with the tag \"avatar\""));
	this.matchHeldByTagCheckbox.addActionListener(this);

	this.contents.prependChild(editableContents);

    this.initFromCondition();
}

KevLinDev.extend(HasItemConditionEditor, ConditionEditor);

HasItemConditionEditor.prototype.initFromCondition = function()
{
	this.containerEditButton.setSelectedItem(this.myCondition.containerItem.item);
    this.itemEditButton.setSelectedItem(this.myCondition.heldItem.item);

	this.matchHeldByCodeCheckbox.setSelected(this.myCondition.heldItem.matchCriterion == "code");
	this.matchHeldByIdCheckbox.setSelected(this.myCondition.heldItem.matchCriterion == "id");
	this.matchHeldByTagCheckbox.setSelected(this.myCondition.heldItem.matchCriterion == "tag");
}

HasItemConditionEditor.prototype.doAction = function(src, evt)
{
	if (evt.type == "click")
	{
		if (src.src == "updateCondition")
		{
			// Commit the updates into the condition
			// TODO: Deal with different tags
			var matchCriterion = 
				this.matchHeldByCodeCheckbox.isSelected ? "code" : 
				(this.matchHeldByIdCheckbox.isSelected ? "id" : "tag");
			var itemTag = (matchCriterion == "tag") ? "avatar" : null;
			
			this.myCondition.heldItem.setItem(this.itemEditButton.selectedItem);
			this.myCondition.heldItem.setItemMatchCriterion(matchCriterion, itemTag);

			this.myCondition.containerItem.setItem(this.containerEditButton.selectedItem);
		}
		else if (src.src == "matchHeldByCodeCheckbox" || src.src == "matchHeldByIdCheckbox")
		{
			// If held item is currently a tag, replace with default
			if (this.itemEditButton.selectedItem != null && this.itemEditButton.selectedItem.params.itemCode == "t")
				this.itemEditButton.setSelectedItem(null);
		}
		else if (src.src == "matchHeldByTagCheckbox")
		{
			// Replace held item with "tag"
			this.itemEditButton.setSelectedItem(this.controller.model.itemFactory.makeItem("t"));
		}
	}
	
    HasItemConditionEditor.superClass.doAction.call(this, src, evt);
}
// Content layout view shows a tree of the items at a given cellContents,
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

ContentLayoutView.prototype.setContents = function(cellContents)
{
    var x_posn = this.view.getLayoutX(cellContents.x, cellContents.y) * this.view.width;
    var y_posn = this.view.getLayoutY(cellContents.x, cellContents.y) * this.view.height;

    this.setPosition(x_posn, y_posn);
    this.show();
    
    if (this.cellContents == cellContents)
        return;
        
    this.cellContents = cellContents;
    this.tree.removeChildren();
        
    //this.cellContents.addActionListener(this);
    
    // Add the cellContents
    for (var i in this.cellContents.myItems)
    {
        var currItemView = makeItemLayout(this.view, this.cellContents.myItems[i]);
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
}// SVG Login controller.
// Checks update.php to see if user has cookies set for login.
// If not, brings up login box.
// Once logged in, replaces login boxes with login status and button to logout.
function LoginController(background, loginArea, username, password)
{
    LoginController.baseConstructor.call(this);

    this.background = background;

    this.listeningForResponse = false;
    this.loggedIn = false;
    this.loginArea = loginArea;
    
    // login textbox
    this.loginGroup = new SVGComponent(50, 50);
    
    var loginLabel = new SVGElement("text", {"font-size":20, fill:"white", y:20}, "username");
    this.loginGroup.appendChild(loginLabel);
    this.loginTextbox = new TextArea("login", this.background, {width:200, height:30, fill:"black", "stroke-width":3}, {"font-size":20, fill:"red", x:5, y:20}, 90, 0, {normal:{stroke:"white"}, focus:{stroke:"red"}});
    this.loginGroup.appendChild(this.loginTextbox);

    // password textbox
    var passwordLabel = new SVGElement("text", {"font-size":20, fill:"white", y:70}, "password");
    this.loginGroup.appendChild(passwordLabel);
    this.passwordTextbox = new TextArea("password", this.background, {width:200, height:30, fill:"black", "stroke-width":3}, {"font-size":20, fill:"red", x:5, y:20}, 90, 50, {normal:{stroke:"white"}, focus:{stroke:"red"}});
    this.passwordTextbox.setSecret();
    this.loginGroup.appendChild(this.passwordTextbox);
    
    // Login button
    this.loginButton = new SimpleButton("login", "rect", {width:70, height:30, rx:10, fill:"black", "stroke-width":3}, 30, 100, {normal:{stroke:"white"}, over:{stroke:"red"}, focus:{stroke:"red"}});
    this.loginButton.addSVG("text", {"font-size":20, fill:"white", x:15, y:20}, "login");
    this.loginButton.addActionListener(this);
    this.loginButton.setBackground(this.background);
    this.loginGroup.appendChild(this.loginButton);

    // "or" label
    var orLabel = new SVGElement("text", {"font-size":20, fill:"white", x:115, y:120}, "or");
    this.loginGroup.appendChild(orLabel);

    // Guest login button
    this.guestLoginButton = new SimpleButton("guestLogin", "rect", {width:140, height:30, rx:10, fill:"black", "stroke-width":3}, 150, 100, {normal:{stroke:"white"}, over:{stroke:"red"}, focus:{stroke:"red"}});
    this.guestLoginButton.addSVG("text", {"font-size":20, fill:"white", x:15, y:20}, "login as guest");
    this.guestLoginButton.addActionListener(this);
    this.guestLoginButton.setBackground(this.background);
    this.loginGroup.appendChild(this.guestLoginButton);
    

    // Status message
    this.statusLabel = new SVGElement("text", {"font-size":20, fill:"white", x:20, y:160}, "");
    this.loginGroup.appendChild(this.statusLabel);

    // Set focus listeners
    this.loginTextbox.addFocusListener(this.passwordTextbox);
    this.passwordTextbox.addFocusListener(this.loginTextbox);
    this.passwordTextbox.addFocusListener(this.loginButton);
    this.loginButton.addFocusListener(this.passwordTextbox);
    
    // Set focus ring
    this.loginTextbox.setNextFocus(this.passwordTextbox);
    this.passwordTextbox.setPreviousFocus(this.loginTextbox);
    this.passwordTextbox.setNextFocus(this.loginButton);
    this.loginButton.setPreviousFocus(this.passwordTextbox);
    
    this.loginArea.appendChild(this.loginGroup);

    // Logout group holds info on user, and a logout button
    this.logoutGroup = new FlowLayout(0, 0, {minSpacing:5});
    this.logoutGroup.appendChild(new SVGElement("text", {y:12, "font-size":12, fill:"black"}, "Logged in as:"));

    this.usernameLabel = new SVGElement("text", {y:12, "font-size":12, fill:"black"}, "");
    this.logoutGroup.appendChild(this.usernameLabel);

    this.logoutButton = new RectButton("logout", 0, 0, new SVGElement("text", {y:12, "font-size":12}, "Logout"), {fill:"lightblue", stroke:"black", rx:2}, {fill:"orange"}, {fill:"red"}, 2, false);
    this.logoutButton.addActionListener(this);
    this.logoutButton.setBackground(this.background);
    this.logoutGroup.appendChild(this.logoutButton);
    
    // Check whether we've got stored username and password
    this.login = null;
    this.password = null;
    if (window.localStorage)
    {
        this.login = localStorage.getItem('MW_Login');
        this.password = localStorage.getItem('MW_Password');
    }
}

KevLinDev.extend(LoginController, ActionObject);

LoginController.prototype.start = function()
{
    if (this.login != null && this.password != null)
    {
        this.submitLogin(this.login, this.password);
    }
    else
    {
        // The login and password may have been set externally by cookies,
        // so check that.
        this.checkLogin();
    }
}

LoginController.prototype.submitLogin = function(login, password)
{
    var http_string = "update.php";
    var params = "login=" + login + "&password=" + password;
    
    if (!this.listeningForResponse)
    {
        this.listeningForResponse = true;
    }
    
    // Give an updating message
    this.statusLabel.setValue("logging in...");
    
    var me = this;
    ajax_post(
            http_string, 
            function(xml) 
            {
                me.receiveLoginFromServer(xml);
            }, 
            params
        );
}

LoginController.prototype.checkLogin = function()
{
    var http_string = "update.php";
    var params = "loginStatus=1";
    
    // Give an updating message
    this.statusLabel.setValue("checking login status...");
    
    var me = this;
    ajax_post(
            http_string, 
            function(xml) 
            {
                me.receiveLoginFromServer(xml);
            }, 
            params
        );
}

LoginController.prototype.receiveLoginFromServer = function(xml)
{    
    if (xml.nodeName == "result" && xml.getAttribute("status") == "1")
    {
        this.user_id = xml.getAttribute("user_id");
        this.curr_map = xml.getAttribute("curr_map");
        this.usernameLabel.setValue(xml.getAttribute("login"));
        this.logoutGroup.refreshLayout();
        
        this.setLoginStatus(true);
    }
    else
    {
        // Not logged in
        this.statusLabel.setValue(xml.textContent);
        this.setLoginStatus(false);
    }
    
    this.listeningForResponse = false;
}

LoginController.prototype.doAction = function(src, evt)
{
    if (src.src == "login" && (evt.type == "click" || evt.type == "keypress"))
    {
        // Store login and password
        this.login = this.loginTextbox.textVal;
        this.password = this.passwordTextbox.secretVal;
        
        if (window.localStorage)
        {
            localStorage.setItem('MW_Login', this.login);
            localStorage.setItem('MW_Password', this.password);
        }
        
        this.submitLogin(this.login, this.password);
    }
    else if (src.src == "guestLogin" && (evt.type == "click" || evt.type == "keypress"))
    {
        this.login = "guest";
        this.password = "guest";

        this.submitLogin(this.login, this.password);
    }
    else if (src.src == "logout" && evt.type == "click")
    {
        this.statusLabel.setValue("");
        this.setLoginStatus(false);
        this.loginTextbox.setFocus(true);
    }
}  

LoginController.prototype.setLoginStatus = function(isLoggedIn)
{
    if (isLoggedIn)
    {
        this.loginGroup.hide();
        this.logoutGroup.show();
    }
    else
    {
        // Set logout
        this.user_id = null;
        this.tempLogin = null;
        this.login = null;
        this.tempPassword = null;
        this.password = null;
        localStorage.removeItem('MW_Login');
        localStorage.removeItem('MW_Password');
        this.loginTextbox.setValue("");
        this.passwordTextbox.setValue("");
        this.loginGroup.show();
        this.logoutGroup.hide();
    }

    if (isLoggedIn != this.loggedIn)
    {
        this.tellActionListeners(this, isLoggedIn ? {type:"loggedIn"} : {type:"loggedOut"});
    }
    this.loggedIn = isLoggedIn;
}

LoginController.prototype.getHTTPLoginString = function()
{
	return "login=" + escape(this.login) + "&password=" + escape(this.password);
}// A generic selector for items 
function SummaryItemDisplay(controller, rectAttributes, borderWidth)
{
    this.controller = controller;
    this.selectedItem = null;

    SummaryItemDisplay.baseConstructor.call(this, 0, 0, null, rectAttributes, borderWidth);
}

KevLinDev.extend(SummaryItemDisplay, RectLabel);

SummaryItemDisplay.prototype.setSelectedItem = function(item)
{
    if (this.selectedItem == item)
        return;
        
	this.selectedItem = item;
	
	if (item != null)
	{
		var itemPresentationElement = this.controller.model.itemFactory.makeSimpleViewItem(item);
		this.setContents(itemPresentationElement);
	}
	else
	{
		var itemPresentationElement = new SVGElement();
		itemPresentationElement.cloneElement(this.controller.artwork.getElementById("noChosenItem"));
		this.setContents(itemPresentationElement);
	}
}

// The Item Selector is responsible for letting the user choose an item,
// either from the grid, or from the item selector window itself (in the
// case of items that are not on the grid, eg. the avatar.)
function ItemSelectorWindow(controller)
{
    this.selectedItem = null;
	this.itemType = null; // Which types of items are valid for selection
	this.client = null;
    this.controller = controller;
    
    ItemSelectorWindow.baseConstructor.call(this, "Item Selection", 5, {fill:"lightGreen",stroke:"green",rx:4}, {storePrefix:"MW_ItemSelectorWindow"});

    // Show what is currently selected
    var emptyText = new MultilineText(0, 0, "Nothing selected yet", {"font-size":15, fill:"black"}, {maxWidth:70, lineSpacing:0});

    this.defaultSelection = new RectLabel(0, 0, emptyText, {fill:"white", stroke:"green", rx:2}, 2);
    
    this.selectionArea = new SVGElement("g");
    this.selectionArea.appendChild(this.defaultSelection);
    
    var selectionBar = new FlowLayout(0, 0, {minSpacing:3});

	var selectionText = new TextLabel("Current Item: ", {"font-size":15, fill:"black"}, {maxWidth:160, lineSpacing:0});
	
    selectionBar.appendChild(selectionText)
    selectionBar.appendChild(this.selectionArea);
    this.contents.appendChild(selectionBar);

    
	this.explanationText = new TextLabel("Select an item in the grid", {"font-size":15, fill:"black"}, {maxWidth:160, lineSpacing:0});
    this.contents.appendChild(this.explanationText)

    // Allow the avatars to be selected
	for (var i = 0; i < this.controller.avatarGroupController.avatarList.length; ++i)
	{
		var avatarElement = this.controller.avatarGroupController.avatarList[i].copyItem();

		// TODO: Handle more than one avatar.
    	this.avatarButton = new RectButton("avatarButton", 0, 0, avatarElement, {fill:"white", stroke:"green", rx:2, width:40, height:40}, {fill:"yellow"}, {fill:"orange"}, 5, false);

    	this.contents.appendChild(this.avatarButton);
    	this.avatarButton.addActionListener(this);
	}
	
    var okCancelButtons = new FlowLayout(0, 0, {minSpacing:3});
    this.contents.appendChild(okCancelButtons);

    this.okButton = new RectButton("ItemSelectionOK", 0, 0, new SVGElement("text", {"font-size":15, fill:"black", x:0, y:15}, "OK"), {fill:"white", stroke:"green", rx:2}, {fill:"yellow"}, {fill:"orange"}, 2, false);
    okCancelButtons.appendChild(this.okButton);
    this.okButton.addActionListener(this);

    this.cancelButton = new RectButton("ItemSelectionCancel", 0, 0, new SVGElement("text", {"font-size":15, fill:"black", x:30, y:15}, "Cancel"), {fill:"white", stroke:"green", rx:2}, {fill:"yellow"}, {fill:"orange"}, 2, false);
    okCancelButtons.appendChild(this.cancelButton);
    this.cancelButton.addActionListener(this);
}

KevLinDev.extend(ItemSelectorWindow, SVGWindow);

ItemSelectorWindow.prototype.doAction = function(src, evt)
{
    ItemSelectorWindow.superClass.doAction.call(this, src, evt);

	// Don't do anything unless we're showing
	if (!this.showing)
		return;
		
    if (evt.type == "click")
    {
        if (src.src == "avatarButton")
        {
			// TODO: Cope with more than one avatar.
            this.setItem(this.controller.avatarGroupController.avatarList[0].avatarItem);
        }
        else if (src.src == "ItemSelectionCancel")
        {
			this.hide();            
        }
        else if (src.src == "ItemSelectionOK")
        {
			this.hide();
            if (this.client != null)
				this.client.userHasSelectedItem(this.selectedItem, this.itemTag);
        }
    }
}

// User has selected a gridContents, so we choose the top relevent item out of it
ItemSelectorWindow.prototype.setGridContents = function(cellContents)
{
	var item = null;
	switch (this.itemType)
	{
	case "topBlock":
		item = getTopBlockItem(cellContents);
		break;
		
	case "topItem":
	case null:
	default:
		item = cellContents.getTopItem();
		break;
	}
	
 	this.setItem(item);
}

ItemSelectorWindow.prototype.setItem = function(item)
{
	this.controller.clearHighlightedItems();
    this.selectedItem = item;
    
    if (item != null)
    {
        // show the item 
        this.selectionArea.removeChildren();
        
        var itemElement = this.controller.model.itemFactory.makeSimpleViewItem(item);

        this.itemButton = new RectButton("itemButton", 0, 0, itemElement, {fill:"white", stroke:"green", rx:2, width:40, height:40}, {fill:"yellow"}, {fill:"orange"}, 5, false);

        this.selectionArea.appendChild(this.itemButton);

		// Also tell the controller to highlight the item
		this.controller.highlightItem(item);
    }
    else
    {
        // Show the default
        this.selectionArea.removeChildren();
        this.selectionArea.appendChild(this.defaultSelection);
    }

	// Exit once the user has chosen the item.
	// TODO: This is pretty hacky - should refactor to have ItemSelectorWindow listening for model item selections,
	// and have clients listen to this.
	this.hide();
    if (this.client != null)
		this.client.userHasSelectedItem(this.selectedItem, this.itemTag);
}

// Set the client of the item selection - this is who we tell what item was 
// selected when we are closed. The client must have a method setSelectedItem()
ItemSelectorWindow.prototype.setClient = function(client, item, itemType, itemTag)
{
	this.client = client;
	this.itemType = itemType;
	this.itemTag = itemTag;
	this.setItem(item);
	
	if (this.itemType == "topBlock")
	{
		// Hide the extra items
		this.avatarButton.hide();
		this.explanationText.setValue("Select a point in the grid.");
	}
	else
	{
		// Show the extra items
		this.avatarButton.show();
		this.explanationText.setValue("Select an item in the grid, or the avatar icon below.");
	}
	
}
// BlockItemWindow is used for setting block appearance and params
function BlockItemWindow(controller)
{
    BlockItemWindow.baseConstructor.call(this, "Create Block", 5, {fill:"lightGreen", stroke:"green", rx:4}, {width:88, height:160, storePrefix:"MW_BlockItemWindow", contentsSpacing:3});

	this.controller = controller;
	
    this.itemBar = new FlowLayout(0, 0, {minSpacing:5});
    this.contents.appendChild(this.itemBar);

	// Create a default item for us to display
    this.itemAppearanceLabel = new RectLabel(0, 0, null, {fill:"white", stroke:"none", width:30, height:40}, 2);	
    this.itemAppearanceButton = new RectButton("blockItemButton", 0, 0, null, {fill:"white", stroke:"none", width:30, height:30}, {fill:"yellow"}, {fill:"orange"}, 2, false);	

    this.setItem("d"); // Create a default item
    
    this.itemBar.appendChild(this.itemAppearanceLabel);

    this.heightButtons = new FlowLayout(0, 0, {direction:"down", minSpacing:5});

    var upArrow = new SVGElement();
    upArrow.cloneElement(this.controller.artwork.getElementById("iconUpArrow"));
    this.upArrowButton = new RectButton("upArrowButton", 0, 0, upArrow, {fill:"white", stroke:"blue", rx:2, width:30, height:16}, {fill:"yellow"}, {fill:"orange"}, 2, false);
	this.heightButtons.appendChild(this.upArrowButton);
	this.upArrowButton.addActionListener(this);

    var downArrow = new SVGElement();
    downArrow.cloneElement(this.controller.artwork.getElementById("iconDownArrow"));
    this.downArrowButton = new RectButton("downArrowButton", 0, 0, downArrow, {fill:"white", stroke:"blue", rx:2, width:30, height:16}, {fill:"yellow"}, {fill:"orange"}, 2, false);	
	this.heightButtons.appendChild(this.downArrowButton);
	this.downArrowButton.addActionListener(this);
	
	this.itemBar.appendChild(this.heightButtons);

    this.colourButtons = [];
    var currIndex = 0;
    var numCols = 3;
    for (var i in this.controller.itemFactory.baseSummary)
    {
        var currRow = Math.floor(currIndex / numCols);        
        if (this.colourButtons[currRow] == null)
        {
            this.colourButtons[currRow] = new FlowLayout(0, 0, {minSpacing:3});
            this.contents.appendChild(this.colourButtons[currRow]);
        }

        var b = this.controller.itemFactory.baseSummary[i];
        var currButton = new RectButton("i_" + i, 0, 0, new SVGElement("rect", {width:"5", height:"5", fill:b[1]}), {stroke:"black", fill:b[1]}, {stroke:"red"}, {stroke:"red"}, 7, false);
        this.colourButtons[currRow].appendChild(currButton);
        currButton.addActionListener(this);
        currIndex++;
    }
}

KevLinDev.extend(BlockItemWindow, SVGWindow);

BlockItemWindow.prototype.setItem = function(itemCode)
{
    var ht = 0;
    if (this.item != null && this.item.params != null && this.item.params.ht != null)
        ht = this.item.params.ht;
        
	this.item = this.controller.itemFactory.makeItem(itemCode);
	this.item.setItemParam("ht", ht);

	this.itemAppearance = this.controller.model.itemFactory.makeSimpleViewItem(this.item);
    this.itemAppearanceLabel.setContents(this.itemAppearance);
	this.item.addActionListener(this.itemAppearance);

	this.itemAppearance2 = this.controller.model.itemFactory.makeSimpleViewItem(this.item);
    this.itemAppearanceButton.setContents(this.itemAppearance2);
	this.item.addActionListener(this.itemAppearance2);
}

BlockItemWindow.prototype.doAction = function(src, evt)
{
    BlockItemWindow.superClass.doAction.call(this, src, evt);

	if (evt.type == "click")
	{
    	if (src.src == "upArrowButton")
    	{
		    this.item.setHeight(this.item.params.ht + 5);
		    this.itemAppearanceLabel.refreshLayout();
		    this.itemAppearanceButton.bgElement.refreshLayout();
		}
		else if (src.src == "downArrowButton")
		{
		    if (this.item.params.ht >= 5)
		    {
		        this.item.setHeight(this.item.params.ht - 5);
    		    this.itemAppearanceLabel.refreshLayout();
    		    this.itemAppearanceButton.bgElement.refreshLayout();
			}
        }
        else if (src.src.substring(0, 2) == "i_")
        {
            // Colour
            this.setItem(src.src.substring(2));
        }
        else
        {
            return;
        }
                
        // Also make sure the item is selected in the edit menu
	    this.tellActionListeners(this.itemAppearanceButton, {type:"selected"});
	}
}

// ItemWindow is used for setting item appearance and params when editing
function ItemWindow(controller)
{
    ItemWindow.baseConstructor.call(this, "Create Item", 5, {fill:"lightGreen", stroke:"green", rx:4}, {width:170, height:170, storePrefix:"MW_ItemWindow", contentsSpacing:3});

	this.controller = controller;
	
    this.itemBar = new FlowLayout(0, 0, {minSpacing:5});
    this.contents.appendChild(this.itemBar);

    // Select teleport button
    this.teleportToText = new SVGElement("text", {"font-size":12, y:12, fill:"black"}, "Select Destination");
    this.selectTeleportButton = new RectButton("selectTeleportButton", 0, 0, this.teleportToText, {fill:"white", stroke:"none"}, {fill:"yellow"}, {fill:"orange"}, 2, false);	
    this.selectTeleportButton.addActionListener(this);
    this.teleportWindow = new WorldChooserWindow(this.controller,{windowName:"Teleport Destination", showAccessOnly:true, closeOnSelect:true});
    this.teleportWindow.addActionListener(this);
    this.teleportWindow.hide();
    this.controller.visitedWorldNotifier.addActionListener(this.teleportWindow);

	// Create a default item for us to display
    this.itemAppearanceLabel = new RectLabel(0, 0, null, {fill:"white", stroke:"none", width:40, height:40}, 2);	
    this.itemAppearanceButton = new RectButton("itemButton", 0, 0, null, {fill:"white", stroke:"none", width:30, height:30}, {fill:"yellow"}, {fill:"orange"}, 2, false);	

    this.itemBar.appendChild(this.itemAppearanceLabel);
    
    this.extrasArea = new FlowLayout(0, 0, {minSpacing:3});
    this.itemBar.appendChild(this.extrasArea);

    this.setItem("x"); // Create a default item
    
    this.itemButtons = [];
    var currIndex = 0;
    var numCols = 5;
    for (var i in this.controller.itemFactory.itemTemplates)
    {
        var currRow = Math.floor(currIndex / numCols);
        
        // Make sure we've got a FlowLayout row to put the item in.
        if (this.itemButtons[currRow] == null)
        {
            this.itemButtons[currRow] = new FlowLayout(0, 0, {minSpacing:3});
            this.contents.appendChild(this.itemButtons[currRow]);
        }

        // Get the graphics to put in the button
        var template = this.controller.itemFactory.itemTemplates[i];
        if (template == null || template.noEdit)
            continue;

        var el = this.controller.itemFactory.artwork.getElementById(template.itemName + "_def_def");
        if (el == null)
            continue;

        var itemElement = new SVGElement();
    	itemElement.cloneElement(el);
    	itemElement.removeAttribute("style");
    	itemElement.removeAttribute("display");
    	if (itemElement.hasAttribute("transform"))
    	{
    	    // There's a transform on this element, so encase it in another group
    	    // so that we can freely put our own transforms on it.
    	    var parentElement = new SVGElement("g");
    	    parentElement.appendChild(itemElement);
    	    itemElement = parentElement;
    	}
            
        // Draw the button
        var currButton = new RectButton("i_" + i, 0, 0, itemElement, {stroke:"black", fill:"white", rx:2, width:30, height:30}, {stroke:"red"}, {stroke:"red"}, 3, false);
        this.itemButtons[currRow].appendChild(currButton);
        currButton.addActionListener(this);
        currIndex++;
    }
}

KevLinDev.extend(ItemWindow, SVGWindow);

ItemWindow.prototype.setItem = function(itemCode)
{
    if (this.item && this.item.params && this.item.params.itemCode == itemCode)
        return;
    
    this.extrasArea.removeChildren();
        
	this.item = this.controller.itemFactory.makeItem(itemCode);
	
	var currEl = this.controller.itemFactory.makeViewItem(this.item);
    currEl.setLightLevel(1.0); // Hack to set the light level directly
	var elHolder = new SVGElement("g");
	elHolder.appendChild(currEl);
    this.itemAppearanceLabel.setContents(elHolder);
    this.item.addActionListener(currEl);

	var currEl2 = this.controller.itemFactory.makeViewItem(this.item);
    currEl2.setLightLevel(1.0); // Hack to set the light level directly
	var elHolder2 = new SVGElement("g");
	elHolder2.appendChild(currEl2);
    this.itemAppearanceButton.setContents(elHolder2);
    this.item.addActionListener(currEl2);
    
    // There may be extras to show depending on what the item is
    if (this.item.params.doesTeleport)
    {
        this.extrasArea.appendChild(this.selectTeleportButton);
    }
    
    if (this.item.params.lightStrength)
    {
        
    }
}

ItemWindow.prototype.doAction = function(src, evt)
{
    ItemWindow.superClass.doAction.call(this, src, evt);

	if (evt.type == "click")
	{
	    
	    if (src.src.substring(0, 2) == "i_")
	    {
    	    this.setItem(src.src.substring(2));

            // Also make sure the item is selected in the edit menu
	        this.tellActionListeners(this.itemAppearanceButton, {type:"selected"});
	    }
	    else if (src.src == "selectTeleportButton")
	    {
	        this.teleportWindow.show();
	    }
    }
    else if (evt.type == "worldSelected")
    {
        this.item.params.doTeleport = evt.value;
        var destName = this.controller.visitedWorlds[evt.value].map_name;
        this.teleportToText.setValue(destName);
        this.selectTeleportButton.refreshLayout();
    }
}

// LightLevelWindow is used for setting light levels and the default light level for 
// the scene.
function LightLevelWindow(controller)
{
    LightLevelWindow.baseConstructor.call(this, "Ambient Light Level", 5, {fill:"lightGreen", stroke:"green", rx:4}, {width:260, height:60, storePrefix:"MW_LightLevelWindow"});

	this.controller = controller;
	
    this.lightBar = new FlowLayout(0, 0, {minSpacing:5});
    this.contents.appendChild(this.lightBar);

	// Create a default item for us to display

    this.labelIcon = new SVGElement();
    this.labelIcon.cloneElement(this.controller.artwork.getElementById("iconLightbulb"));
    this.lightAppearanceLabel = new RectLabel(0, 0, this.labelIcon, {fill:"white", stroke:"none", width:40, height:40}, 2);	

    this.buttonIcon = new SVGElement();
    this.buttonIcon.cloneElement(this.controller.artwork.getElementById("iconLightbulb"));
    this.lightAppearanceButton = new RectButton("lightButton", 0, 0, this.buttonIcon, {fill:"white", stroke:"none", width:30, height:30}, {fill:"yellow"}, {fill:"orange"}, 2, false);	

    this.setLightLevel(0); // Set the default light level
    
    this.lightBar.appendChild(this.lightAppearanceLabel);

    for (var i = 0; i <= 5; i++)
    {
        var currButtonIcon = new SVGElement();
        currButtonIcon.cloneElement(this.controller.artwork.getElementById("iconLightbulb"));
        currButtonIcon.firstChild.setAttribute("style", "fill:'black';opacity:" + (i * 0.2));
            
        var currButton = new RectButton("l_" + i, 0, 0, currButtonIcon, {stroke:"black", fill:"white", rx:2, width:30, height:30}, {stroke:"red"}, {stroke:"red"}, 2, false);
        this.lightBar.appendChild(currButton);
        currButton.addActionListener(this);
    }
}

KevLinDev.extend(LightLevelWindow, SVGWindow);

LightLevelWindow.prototype.setLightLevel = function(lightLevel)
{
    this.lightLevel = lightLevel;
    this.labelIcon.firstChild.setAttribute("style", "fill:'black';opacity:" + (1 - lightLevel));
    this.buttonIcon.firstChild.setAttribute("style", "fill:'black';opacity:" + (1 - lightLevel));
}

LightLevelWindow.prototype.doAction = function(src, evt)
{
    LightLevelWindow.superClass.doAction.call(this, src, evt);

	if (evt.type == "click" && src.src.substring(0, 2) == "l_")
	{
    	this.setLightLevel(1.0 - parseInt(src.src.substring(2)) * 0.2);

        // Also make sure the item is selected in the edit menu
	    this.tellActionListeners(this.lightAppearanceButton, {type:"selected"});
	}
}

// EditWindow has a set of all editing buttons, many of which call subwindows.
function EditWindow(controller, editRoot)
{
    EditWindow.baseConstructor.call(this, "Edit Map", 5, {fill:"lightGreen", stroke:"green", rx:4}, {width:71, height:246, storePrefix:"MW_EditWindow", contentsSpacing:3});

	this.controller = controller;
	this.editRoot = editRoot;
	
    this.actionsBar = new FlowLayout(0, 0, {minSpacing:5});
    this.contents.appendChild(this.actionsBar);

    var actionEl = new SVGElement();
    actionEl.cloneElement(this.controller.artwork.getElementById("iconHammer"));
    this.actionsButton = new RectButton("actionsWindow", 0, 0, actionEl, {fill:"white", stroke:"black", rx:2, width:30, height:30}, {fill:"yellow"}, {fill:"orange"}, 4, false);
    this.actionsButton.addActionListener(this);
    this.actionsBar.appendChild(this.actionsButton);
    
    var infoEl = new SVGElement();
    infoEl.cloneElement(this.controller.artwork.getElementById("iconInformation"));
    this.infoButton = new RectButton("infoWindow", 0, 0, infoEl, {fill:"white", stroke:"black", rx:2, width:30, height:30}, {fill:"yellow"}, {fill:"orange"}, 4, false);
    this.infoButton.addActionListener(this);
    this.actionsBar.appendChild(this.infoButton);

    this.actionViewWindow = new ActionViewWindow(this.controller);
	if (this.actionViewWindow.x == 0 && this.actionViewWindow.y == 0)
        this.actionViewWindow.setPosition(920, 35);
    this.actionViewWindow.hide();
    this.actionViewWindow.addActionListener(this);
    this.editRoot.appendChild(this.actionViewWindow);
    
    // Item selector window is for selecting an existing item on the map or an
    // avatar, used by actions and conditions.
    this.itemSelectorWindow = new ItemSelectorWindow(this.controller);
	if (this.itemSelectorWindow.x == 0 && this.itemSelectorWindow.y == 0)
        this.itemSelectorWindow.setPosition(170, 100);
	this.itemSelectorWindow.hide();
    this.editRoot.appendChild(this.itemSelectorWindow);

    this.infoWindow = new SVGWindow("info", 3, {fill:"white", stroke:"black", rx:4}, {storePrefix:"MW_InfoWindow"});
    this.infoWindow.hide();
	if (this.infoWindow.x == 0 && this.infoWindow.y == 0)
        this.infoWindow.setPosition(50, 350);
    this.infoWindowContents = new TextLabel(null, {"font-size":10, fill:"black", "space":"preserve"}, {minSpacing:0, maxWidth:200});
    this.infoWindow.contents.appendChild(this.infoWindowContents);
    this.infoWindow.addActionListener(this);
    this.editRoot.appendChild(this.infoWindow);

    // Edit/create actions
    this.radioButtonGroup = new RadioButtonGroup();

    // Delete
    var deleteEl = new SVGElement();
    deleteEl.cloneElement(this.controller.artwork.getElementById("iconDelete"));
    this.deleteButton = new RectButton("deleteButton", 0, 0, deleteEl, {fill:"white", stroke:"black", rx:2, width:30, height:30}, {fill:"yellow"}, {fill:"orange"}, 4, false);
	this.deleteButton.addActionListener(this);
    this.deleteButton.setToggle(true);
    this.radioButtonGroup.addButton(this.deleteButton);

    // Raise/lower top block
    var upArrow = new SVGElement();
    upArrow.cloneElement(this.controller.artwork.getElementById("iconUpArrow"));
    this.upArrowButton = new RectButton("upArrowButton", 0, 0, upArrow, {fill:"white", stroke:"black", rx:2, width:30, height:30}, {fill:"yellow"}, {fill:"orange"}, 4, false);
	this.upArrowButton.addActionListener(this);
    this.upArrowButton.setToggle(true);
    this.radioButtonGroup.addButton(this.upArrowButton);

    var downArrow = new SVGElement();
    downArrow.cloneElement(this.controller.artwork.getElementById("iconDownArrow"));
    this.downArrowButton = new RectButton("downArrowButton", 0, 0, downArrow, {fill:"white", stroke:"black", rx:2, width:30, height:30}, {fill:"yellow"}, {fill:"orange"}, 4, false);	
	this.downArrowButton.addActionListener(this);
    this.downArrowButton.setToggle(true);
    this.radioButtonGroup.addButton(this.downArrowButton);
    
    // Rotate right/left top item
    var rotateRightArrow = new SVGElement();
    rotateRightArrow.cloneElement(this.controller.artwork.getElementById("iconRotateRight"));
    this.rotateRightArrowButton = new RectButton("rotateRightArrowButton", 0, 0, rotateRightArrow, {fill:"white", stroke:"black", rx:2, width:30, height:30}, {fill:"yellow"}, {fill:"orange"}, 4, false);
	this.rotateRightArrowButton.addActionListener(this);
    this.rotateRightArrowButton.setToggle(true);
    this.radioButtonGroup.addButton(this.rotateRightArrowButton);

    var rotateLeftArrow = new SVGElement();
    rotateLeftArrow.cloneElement(this.controller.artwork.getElementById("iconRotateLeft"));
    this.rotateLeftArrowButton = new RectButton("rotateLeftArrowButton", 0, 0, rotateLeftArrow, {fill:"white", stroke:"black", rx:2, width:30, height:30}, {fill:"yellow"}, {fill:"orange"}, 4, false);
	this.rotateLeftArrowButton.addActionListener(this);
    this.rotateLeftArrowButton.setToggle(true);
    this.radioButtonGroup.addButton(this.rotateLeftArrowButton);

    // Set light level (also sets default light level)
    this.lightLevelWindow = new LightLevelWindow(this.controller);
    this.lightLevelWindow.hide();
	if (this.lightLevelWindow.x == 0 && this.lightLevelWindow.y == 0)
        this.lightLevelWindow.setPosition(0, 260);
    this.editRoot.appendChild(this.lightLevelWindow);
    this.lightLevelWindow.addActionListener(this);

    // The light apperance button is for us
    this.lightLevelWindow.lightAppearanceButton.addActionListener(this);
    this.lightLevelWindow.lightAppearanceButton.setToggle(true);
    this.radioButtonGroup.addButton(this.lightLevelWindow.lightAppearanceButton);    
    
    // Block Item window allows user to add block items to the scene
    this.blockItemWindow = new BlockItemWindow(this.controller);
    this.blockItemWindow.hide();
	if (this.blockItemWindow.x == 0 && this.blockItemWindow.y == 0)
        this.blockItemWindow.setPosition(175, 330);
    this.editRoot.appendChild(this.blockItemWindow);
    this.blockItemWindow.addActionListener(this);

    // The item appearance button is for us
    this.blockItemWindow.itemAppearanceButton.addActionListener(this);
    this.blockItemWindow.itemAppearanceButton.setToggle(true);
    this.radioButtonGroup.addButton(this.blockItemWindow.itemAppearanceButton);    
    
    // Item window allows user to add items to the scene
    this.itemWindow = new ItemWindow(this.controller);
    this.itemWindow.hide();
	if (this.itemWindow.x == 0 && this.itemWindow.y == 0)
        this.itemWindow.setPosition(0, 330);
    this.editRoot.appendChild(this.itemWindow);
    this.itemWindow.addActionListener(this);
    this.editRoot.appendChild(this.itemWindow.teleportWindow);

    // The item appearance button is for us
    this.itemWindow.itemAppearanceButton.addActionListener(this);
    this.itemWindow.itemAppearanceButton.setToggle(true);
    this.radioButtonGroup.addButton(this.itemWindow.itemAppearanceButton);    

    // Arrange the buttons
    this.editBar = [];
    for (var i = 0; i < 4; i++)
    {
        var newFlow = new FlowLayout(0, 0, {minSpacing:5});
        this.editBar.push(newFlow);
        this.contents.appendChild(newFlow);
    }

	this.editBar[0].appendChild(this.deleteButton);
	this.editBar[0].appendChild(this.upArrowButton);
    
    this.editBar[1].appendChild(this.lightLevelWindow.lightAppearanceButton);
	this.editBar[1].appendChild(this.downArrowButton);

    this.editBar[2].appendChild(this.blockItemWindow.itemAppearanceButton);
    this.editBar[2].appendChild(this.itemWindow.itemAppearanceButton);

    this.editBar[3].appendChild(this.rotateLeftArrowButton);
    this.editBar[3].appendChild(this.rotateRightArrowButton);

    this.finalButtonsBar = new FlowLayout(0, 0, {minSpacing:3});
    this.contents.appendChild(this.finalButtonsBar);

    this.saveMapButton = new SimpleButton("savemap", "rect", {width:40, height:20, rx:3, fill:"lightgreen", stroke:"black", "stroke-width":2}, 0, 0, {normal:{stroke:"black", fill:"lightgreen"}, over:{stroke:"red"}, focus:{stroke:"red"}, select:{fill:"green"}, disable:{fill:"gray"}});
    this.saveMapButton.addSVG("text", {"font-size":15, fill:"black", x:5, y:15}, "Save");
    this.saveMapButton.addActionListener(this);
    this.finalButtonsBar.appendChild(this.saveMapButton);

    this.playButton = new RectButton("play", 0, 0, new SVGElement("text", {"font-size":12}, "Play"), {fill:"lightblue", stroke:"black", rx:2}, {fill:"orange"}, {fill:"red"}, 2, false);
    this.playButton.addActionListener(this);
    this.finalButtonsBar.appendChild(this.playButton);

	// Slider for zooming
	this.zoomSlider = new Slider({orientation:"h", sliderLength:65, startPosition:0.5});
	this.zoomSlider.addActionListener(this);
	this.contents.appendChild(this.zoomSlider);
}

KevLinDev.extend(EditWindow, SVGWindow);

EditWindow.prototype.doAction = function(src, evt)
{
    EditWindow.superClass.doAction.call(this, src, evt);

    if (evt.type == "closeWindow")
    {
        src.hide();
    }
	else if (evt.type == "click")
	{
    	if (src.src == "lightButton")
    	{
    	    this.lightLevelWindow.show();
	    }
        else if (src.src == "savemap")
        {
            this.controller.saveMap();
        }
        else if (src.src == "actionsWindow")
        {
            this.actionViewWindow.show();
        }
        else if (src.src == "infoWindow")
        {
            this.infoWindow.show();
        }
        else if (src.src == "blockItemButton")
        {
            this.blockItemWindow.show();
        }
        else if (src.src == "itemButton")
        {
            this.itemWindow.show();
        }
        else if (src.src == "play")
        {
            this.controller.playLevel();
        }
	}
	else if (evt.type == "selected")
	{
	    this.radioButtonGroup.setSelected(src);
	}
	else if (evt.type == "dragSlider" && src == this.zoomSlider)
	{
		this.controller.setZoom(evt.position);
	}
}

// TextEditWindow is a window with an editable text field in it, and an OK and Cancel button.
function TextEditWindow(controller, windowName, initialText)
{
    TextEditWindow.baseConstructor.call(this, windowName, 5, {fill:"white", stroke:"green", rx:4}, {width:205, height:86, storePrefix:"MW_TextEditWindow", contentsSpacing:3});

	this.controller = controller;

    this.textbox = new TextArea(
		"myText", // Identifier
		this.controller.background, // background object, so that the textArea gets keystrokes
		{width:200, height:30, fill:"white", "stroke-width":3}, // parameters for bounding rect
		{"font-size":20, fill:"black", x:5, y:20}, // parameters for text
		0, // x
		0,  // y
		{normal:{stroke:"black"}, focus:{stroke:"red"}} // bounding rect states
		);
    this.contents.appendChild(this.textbox);
	this.textbox.setValue(initialText);

	var buttonArea = new FlowLayout(0, 0, {minSpacing:20});	

    this.okButton = new RectButton("OK", 0, 0, new SVGElement("text", {y:12, "font-size":12}, "OK"), {fill:"lightblue", stroke:"black", rx:2}, {fill:"orange"}, {fill:"red"}, 2, false);
    this.okButton.addActionListener(this);    
	buttonArea.appendChild(this.okButton);

    this.cancelButton = new RectButton("Cancel", 0, 0, new SVGElement("text", {y:12, "font-size":12}, "Cancel"), {fill:"lightblue", stroke:"black", rx:2}, {fill:"orange"}, {fill:"red"}, 2, false);
    this.cancelButton.addActionListener(this);    
	buttonArea.appendChild(this.cancelButton);

	this.contents.appendChild(buttonArea);
}

KevLinDev.extend(TextEditWindow, SVGWindow);

TextEditWindow.prototype.doAction = function(src, evt)
{
    TextEditWindow.superClass.doAction.call(this, src, evt);

    if (evt.type == "closeWindow")
    {
		this.tellActionListeners(this, {type:"cancelRenameWorld"});
    }
    else if (evt.type == "click")
	{
    	if (src.src == "OK")
    	{
			this.tellActionListeners(this, {type:"renameWorld", newWorldName:this.textbox.textVal});
	    }
	    else if (src.src == "Cancel")
	    {
			this.tellActionListeners(this, {type:"cancelRenameWorld"});
	    }
	}
}

// When we get focus, give it to the text box right away
TextEditWindow.prototype.setFocus = function()
{
    TextEditWindow.superClass.setFocus.call(this);    
	this.textbox.setFocus();
};


// AdminWindow is used for editing functions
// Allows the user to logout, to change worlds to ones they've visited, and to edit worlds.
function AdminWindow(controller, logoutButton)
{
    AdminWindow.baseConstructor.call(this, "Mezzacotta World v" + g_mwVersion, 5, {fill:"lightGreen", stroke:"green", rx:4}, {width:183, height:104, storePrefix:"MW_AdminWindow", contentsSpacing:3});

	this.controller = controller;
	this.controller.addActionListener(this); // We want to know when a world has been renamed on the server
	
	this.contents.appendChild(logoutButton);
	
	this.worldLabelGroup = new FlowLayout(0, 0, {minSpacing:5});
	this.worldLabelGroup.appendChild(new SVGElement("text", {y:12, "font-size":12, fill:"black"}, "Current world:"));
	this.worldLabel = new TextLabel("foobarworld", {"font-size":12, fill:"black"});
	this.worldLabelGroup.appendChild(this.worldLabel);
	this.contents.appendChild(this.worldLabelGroup);
	
	this.editMapButtonEditText = new SVGElement("text", {y:12, "font-size":12}, "Edit");
	this.editMapButtonPlayText = new SVGElement("text", {y:12, "font-size":12}, "Play");
    this.editMapButton = new RectButton("editmap", 0, 0, this.editMapButtonEditText, {fill:"lightblue", stroke:"black", rx:2}, {fill:"orange"}, {fill:"red"}, 2, false);
    this.editMapButton.addActionListener(this);
	this.worldLabelGroup.appendChild(this.editMapButton);

    this.renameWorldButton = new RectButton("renameworld", 0, 0, new SVGElement("text", {y:12, "font-size":12}, "Rename World"), {fill:"lightblue", stroke:"black", rx:2}, {fill:"orange"}, {fill:"red"}, 2, false);
    this.renameWorldButton.addActionListener(this);    
	this.contents.appendChild(this.renameWorldButton);

    this.newWorldButton = new RectButton("newworld", 0, 0, new SVGElement("text", {y:12, "font-size":12}, "Change World"), {fill:"lightblue", stroke:"black", rx:2}, {fill:"orange"}, {fill:"red"}, 2, false);
    this.newWorldButton.addActionListener(this);    
	this.contents.appendChild(this.newWorldButton);

	this.isDebugging = false;
    this.debugText = new SVGElement("text", {y:12, "font-size":12}, "Debug");
	this.debugButton = new RectButton("debug", 0, 0, this.debugText, {fill:"lightblue", stroke:"black", rx:2}, {fill:"orange"}, {fill:"red"}, 2, false);
    this.debugButton.addActionListener(this);    
	this.contents.appendChild(this.debugButton);
}

KevLinDev.extend(AdminWindow, SVGWindow);

AdminWindow.prototype.setMapName = function(mapName)
{
	this.worldLabel.setValue(mapName);
}

AdminWindow.prototype.doAction = function(src, evt)
{
    AdminWindow.superClass.doAction.call(this, src, evt);

    if (evt.type == "closeWindow")
    {
        src.hide();
    }
    else if (evt.type == "click")
	{
    	if (src.src == "newworld")
    	{
    	    this.controller.worldChooserWindow.show();
	    }
    	else if (src.src == "renameworld")
    	{
		    var renameWorldWindow = new TextEditWindow(this.controller, "Rename World", this.worldLabel.textValue);
			renameWorldWindow.addActionListener(this);

			// Show the rename world editor
			this.setAble(false);
			this.appendChild(renameWorldWindow);
			renameWorldWindow.setFocus();
	    }
	    else if (src.src == "editmap")
	    {
	        if (this.controller.editMode)
	        {
                this.controller.playLevel();
	        }
	        else
	        {
                this.controller.editLevel();
	        }
	    }
		else if (src.src == "debug")
		{
			// Go into or out of debug mode
			this.isDebugging = !this.isDebugging;
			this.controller.setDebugMode(this.isDebugging);
			if (this.isDebugging)
				this.debugText.setValue("Play");
			else
				this.debugText.setValue("Debug");
		}
		evt.stopPropagation();
	}
	else if (evt.type == "renameWorld")
	{
		// World renamer has returned a new name
		this.controller.gameServerInterface.renameWorld(evt.newWorldName);
		
		this.setAble(true);
		this.removeChild(src);
	}
	else if (evt.type == "cancelRenameWorld")
	{
		this.setAble(true);
		this.removeChild(src);
 	}
	else if (evt.type == "serverWorldRenamed")
	{
		this.setMapName(evt.map_name);
	}
}

// WorldChooserWindow gives a list of worlds to teleport to.
function WorldChooserWindow(controller, params)
{
    this.params = params;
    if (this.params == null)
        this.params = [];
    if (!this.params.windowName)
        this.params.windowName = "Window Chooser";
        
    WorldChooserWindow.baseConstructor.call(this, this.params.windowName, 5, {fill:"lightGreen", stroke:"green", rx:4}, {width:150, storePrefix:"MW_WorldChooserWindow", contentsSpacing:3});

	this.controller = controller;
	this.controller.addActionListener(this); // Listen to the server for changes to world names
	
	for (var i in this.controller.visitedWorlds)
	{
		this.addWorld(this.controller.visitedWorlds[i]);
	}
}

KevLinDev.extend(WorldChooserWindow, SVGWindow);

WorldChooserWindow.prototype.doAction = function(src, evt)
{
    WorldChooserWindow.superClass.doAction.call(this, src, evt);

    if (evt.type == "click")
	{
    	if (src.src.indexOf("world_") == 0)
    	{
     	    var world_id = src.src.slice(6);
    	    this.tellActionListeners(this, {type:"worldSelected", value:world_id});
    	    if (this.params.closeOnSelect)
    	        this.hide();
	    }
	}
	else if (evt.type == "add")
	{
        this.addWorld(evt.value);   
	}
	else if (evt.type == "clear")
	{
	    this.clear();
	}
	else if (evt.type == "serverWorldRenamed")
	{
		// The server has renamed one of the worlds. Find the appropriate one
		// if it is in our list, and rename it.
		for (var i in this.contents.childNodes)
		{
			var currButton = this.contents.childNodes[i].firstChild;
			if (currButton.src == "world_" + evt.map_id)
			{
				currButton.bgElement.setContents(new SVGElement("text", {y:12, "font-size":12}, evt.map_name));
			}
		}
	}
}

WorldChooserWindow.prototype.addWorld = function(world)
{
    // Access is for showing valid teleport destinations
    if (this.params.showAccessOnly && !world.access)
        return;
        
    var worldButton = new RectButton("world_" + world.map_id, 0, 0, new SVGElement("text", {y:12, "font-size":12}, world.map_name), {fill:"lightblue", stroke:"black", rx:2, width:80, height:16}, {fill:"orange"}, {fill:"red"}, 2, false);
    worldButton.addActionListener(this);
    this.contents.appendChild(worldButton);
    this.scrollbarRegion.refreshLayout();
}

WorldChooserWindow.prototype.clear = function()
{
    this.contents.removeChildren();
    this.refreshLayout();
}
// Avatar controller keeps track of items in the inventory and movement for a character.
// It is also responsible for which items have been saved.
function AvatarController(controller, avatarIndex, avatarCode)
{
    AvatarController.baseConstructor.call(this);

	this.controller = controller;

	this.avatarIndex = avatarIndex;
    this.avatarItem = this.controller.itemFactory.makeItem(avatarCode);
    this.avatarItem.params.isTemporary = true;

	if (this.avatarItem.params.itemTags == null)
		this.avatarItem.params.itemTags = [];
	this.avatarItem.params.itemTags.push("avatar"); 
	
    this.avatarItem.id = "avatar_" + this.avatarIndex;
    this.avatarItem.povHeight = 25;
    this.registerAvatar();
    
	// List of items held by this avatar
	this.heldItems = [];
	this.weildedItem = null;
}

KevLinDev.extend(AvatarController, ActionObject);

// Register the avatar in the model.
AvatarController.prototype.registerAvatar = function()
{
    this.controller.model.registerItem(this.avatarItem);
}

AvatarController.prototype.attemptMoveAvatar = function(direction)
{
	this.avatarItem.setDirection(direction);

    if (this.avatarItem.cellContents == null)
        return;
    
	var deltaX = 0;
	var deltaY = 0;	
	switch (direction)
	{
	case "b":
		deltaY = -1;
		break;
	
	case "r":
		deltaX = -1;
		break;

	case "f":
		deltaY = 1;
		break;
		
	case "l":
		deltaX = 1;
		break;
	}
	
    var destContents = this.controller.model.getContents(this.avatarItem.cellContents.x + deltaX, this.avatarItem.cellContents.y + deltaY);
    var topData = destContents.getTopItem();

	if (topData.src == "GridContents")
		return;

    var climbHeight = 0; // Can't climb at all, by default
    if (this.avatarItem.params.climbHeight != null)
        climbHeight = this.avatarItem.params.climbHeight;
    
    var dropHeight = null; // Can drop any distance, by default
    if (this.avatarItem.params.dropHeight != null)
        dropHeight = this.avatarItem.params.dropHeight;
        
    if (this.avatarItem.canMoveTo(topData, climbHeight, dropHeight))
    { 
        this.moveAvatar(topData);
    }
    else if (topData.params.isPushable)
    {
        // A pushable item can be pushed if:
        // - the user would be able to move into its cellContents
        //   if the pushable item wasn't there
        // - the cellContents that the pushable item would move into
        //   is the same level or lower than the cellContents it is
        //   currently in, and can be stood on.
        var deltaHeight = topData.params.elev - this.avatarItem.params.elev;
        if (deltaHeight < 20)
        {
            // User would be able to move into this cellContents
            var pushedDestContents = this.controller.model.getContents(this.avatarItem.cellContents.x + deltaX * 2, this.avatarItem.cellContents.y + deltaY * 2);            
            while (pushedDestContents.myItems.length > 0)
            {
                pushedDestContents = pushedDestContents.myItems[0];
            }
            
            var deltaPushedHeight = pushedDestContents.params.ht + pushedDestContents.params.elev - topData.params.elev;
            
            if (deltaPushedHeight <= 0)
            {
                topData.moveItem(pushedDestContents);
                topData = destContents.getTopItem();
                if (topData.params.canStandOn)
                {
                    this.moveAvatar(topData);
                }
            }
        }
    }        
}

AvatarController.prototype.moveAvatar = function(destItem)
{
    // Check if character is in the model
    if (this.avatarItem.cellContents == null)
        return;
	else
		this.avatarItem.cellContents.tempParams.neverInWay = false;

    // If there are any takeable items, take them first
    while (destItem.params.isTakeable)
    {
        var owner = destItem.owner;
        if (owner)
        {            
            // Remove item
            owner.removeItem(destItem);

            // Add to our inventory
            this.addItemToInventory(this.current_map_id, destItem);
        }
        destItem = owner;
    }

	destItem.cellContents.tempParams.neverInWay = true;
    this.avatarItem.moveItem(destItem);    

    this.controller.view.setCellCentre(this.avatarItem.cellContents.x, this.avatarItem.cellContents.y);
}

AvatarController.prototype.placeAvatar = function()
{
	// Reset the start direction
	this.avatarItem.setDirection("f");
	
	// Find the start position
	var startX = 0;
	var startY = 0;

	// If there is a start marker, use that
	var startItemList = this.controller.model.findItemsByCode("S");
	if (startItemList != null)
	{
		// Find the appropriate start item
		// TODO: For the moment, just use the first item.
	    startX = startItemList[0].cellContents.x;
	    startY = startItemList[0].cellContents.y;
	}
  
	// Add the avatar to the world
	var currCell = this.controller.model.getContents(startX, startY);
	var topData = currCell.getTopItem();
	currCell.tempParams.neverInWay = true;
	topData.appendItem(this.avatarItem);
}

// Remove the avatar from the board.
AvatarController.prototype.removeAvatar = function()
{
    if (this.avatarItem.owner != null)
	{
        this.avatarItem.owner.removeItem(this.avatarItem);
		if (this.avatarItem.cellContents != null)
			this.avatarItem.cellContents.tempParams.neverInWay = false;
	}
}

// Clear the inventory and avatar item listeners.
AvatarController.prototype.clear = function()
{
	this.avatarItem.clearActionListeners();
	this.clearInventory();
}

// Clear the inventory and avatar item listeners.
AvatarController.prototype.clearInventory = function()
{
	this.heldItems = [];
	this.avatarItem.removeAllItems();
	this.tellActionListeners(this, {type:"inventoryUpdated"});
}

AvatarController.prototype.addItemToInventory = function(map_id, item)
{
	item.params.isInvisible = true;
	item.params.isCarried = true;
	this.avatarItem.appendItem(item);
	
	// Set the item's direction to correspond to the avatar
	item.setDirection(this.avatarItem.params.direction); 

	this.heldItems.push({map_id:map_id, item:item});
	this.tellActionListeners(this, {type:"inventoryUpdated"});
}

AvatarController.prototype.setItemSaved = function(item_id)
{
	for (var i = 0; i < this.heldItems.length; ++i)
	{
		if (this.heldItems[i].item.id == item_id)
		{
			this.heldItems[i].item.params.isSaved = true;
			break;
		}
	}
}

AvatarController.prototype.removeUnsavedItems = function()
{
	// Pull items out of the list if they're not tagged as saved.
	for (var i = 0; i < this.heldItems.length;)
	{
		if (!this.heldItems[i].item.params.isSaved)
		{
			// Remove this item
			this.heldItems.splice(i, 1);
		}
		else
			++i;
	}
	this.tellActionListeners(this, {type:"inventoryUpdated"});
}

// Reset the inventory as the items in the xml.
AvatarController.prototype.resetInventoryFromXML = function(xmlInventory)
{
	this.clearInventory();
    var xmlContentsList = xmlInventory.getElementsByTagName("item");
    
    for (var i = 0; i < xmlContentsList.length; i++)
    {
        var xmlContents = xmlContentsList.item(i);
        var avatar_index = parseInt(xmlContents.getAttribute("avatar_index"));
		if (avatar_index == this.avatarIndex)
		{
        	var map_id = xmlContents.getAttribute("map_id");
			var item = this.controller.itemFactory.makeItemFromXML(xmlContents.firstChild, this.controller.model);
			item.params.isSaved = true; // The item came from the server, so tag as saved.
			this.addItemToInventory(map_id, item);
    	}
	}   
}

// Update saved items, given an xml response from the server of the form:
// <result status="1" ...>
//   <update item_id=""/>
//   ...
//   <delete item_id=""/>
//   ...
//   <new item_id=""/>
//   ...
// </result>
//
// Update any unsaved items to saved if they're on the new list.
AvatarController.prototype.updateFromXML = function(xml)
{
    var xmlContentsList = xml.getElementsByTagName("new");
    
    for (var i = 0; i < xmlContentsList.length; i++)
    {
        var xmlContents = xmlContentsList.item(i);
		var item_id = xmlContents.getAttribute("item_id");
		
		// Locate the item with this id
		this.setItemSaved(item_id);
    }   
}

// Return a list of ids of saved items in the specified map.
AvatarController.prototype.getSavedItemIDs = function(map_id)
{
	var result = [];
	for (var i = 0; i < this.heldItems.length; ++i)
	{
		if (this.heldItems[i].map_id == map_id && this.heldItems[i].item.params.isSaved)
			result.push(this.heldItems[i].item.id);
	}
	return result;
}

// Create an HTTP string to add unsaved items
AvatarController.prototype.getUnsavedItemHTTPString = function()
{
	var serverString = "";
	for (var i = 0; i < this.heldItems.length; ++i)
	{
		var currItem = this.heldItems[i].item;
		if (!currItem.params.isSaved)
		{
		    if (currItem.id != null && currItem.params.itemCode != null && currItem.params.isSaveable)
		    {
				var itemXML = currItem.toXML();
				var itemXMLString = (new XMLSerializer()).serializeToString(itemXML);

		        serverString += "&itemId_" + i + "=" + currItem.id + "&itemXML_" + i + "=" + escape(itemXMLString) + "&avatarIndex_" + i + "=" + this.avatarIndex;
		    }
		}
	}
	return serverString;
}

AvatarController.prototype.copyItem = function()
{
	return this.controller.itemFactory.makeSimpleViewItem(this.avatarItem);
}

AvatarController.prototype.setWeilding = function(item)
{
	if (item == this.weildedItem)
		return;
		
	// Tell the avatar it is holding the specified item, and should therefore
	// attempt to change its state.
	if (this.weildedItem != null)
	{
		this.weildedItem.setItemParam("isInvisible", true);
	}
	
	this.weildedItem = item;
	
	if (this.weildedItem != null)
	{
		this.weildedItem.setItemParam("isInvisible", false);
	}
}// Controls a group of avatars
function AvatarGroupController(controller)
{
    AvatarGroupController.baseConstructor.call(this);

	this.controller = controller;
	
	// List of avatars
	this.avatarList = [];
	this.currentAvatar = null;
	
	// List of cells visible to the avatars
	this.visibleCells = [];
	
	// The xml version of the inventory. We can reset the inventory to this
	// when required.
	this.xmlInventory = null;
}

KevLinDev.extend(AvatarGroupController, ActionObject);

// Add an avatar to the list
AvatarGroupController.prototype.addAvatar = function(itemCode)
{
	var avatarIndex = this.avatarList.length;
	var newAvatar = new AvatarController(this.controller, avatarIndex, itemCode);
	this.avatarList.push(newAvatar);
	this.currentAvatar = newAvatar;
	
	return newAvatar;
}

// Register all the avatars with the model.
AvatarGroupController.prototype.registerAvatars = function()
{
	for (var i = 0; i < this.avatarList.length; ++i)
	{
		this.avatarList[i].registerAvatar();
	}
}

AvatarGroupController.prototype.attemptMoveCurrentAvatar = function(direction)
{
	if (this.currentAvatar != null)
		this.currentAvatar.attemptMoveAvatar(direction);
}

AvatarGroupController.prototype.placeAvatars = function()
{
	for (var i = 0; i < this.avatarList.length; ++i)
	{
		this.avatarList[i].placeAvatar();
	}	
}

AvatarGroupController.prototype.removeAvatars = function()
{
	for (var i = 0; i < this.avatarList.length; ++i)
	{
		this.avatarList[i].removeAvatar();
	}
}

// Get the centre cell that shows the current avatar
AvatarGroupController.prototype.getAvatarCentreCell = function()
{
	if (this.currentAvatar != null && this.currentAvatar.avatarItem != null)
		return this.currentAvatar.avatarItem.cellContents;
	else
		return null;
}

// Get all the cells that the avatars can see
AvatarGroupController.prototype.updateAvatarViewedCells = function()
{
	// Clear the existing viewed cells
	for (var i = 0; i < this.visibleCells.length; ++i)
	{
		this.visibleCells[i].tempParams.avatarSees = null;
	}
	
	// Find cells containing visible items
	if (this.currentAvatar != null && this.currentAvatar.avatarItem != null)
	{
		this.visibleCells = [];
		var avatarViewElev = this.currentAvatar.avatarItem.params.elev + this.currentAvatar.avatarItem.params.ht;
		for (var i in this.currentAvatar.avatarItem.canSee["pov"])
	    {
	        for (var j in this.currentAvatar.avatarItem.canSee["pov"][i])
	        {
				var currView = this.currentAvatar.avatarItem.canSee["pov"][i][j];
				// Add this contents if it has any items visible to the avatar.
				for (var k = 0; k < currView.cellContents.seenBy.length; ++k)
				{
					var currTarget = currView.cellContents.seenBy[k];
					if (currTarget.item == this.currentAvatar.avatarItem && currTarget.viewType == "pov" && currTarget.viewElev <= avatarViewElev)
					{
		            	this.visibleCells.push(currView.cellContents);
						currView.cellContents.tempParams.avatarSees = true;
						break;
					}
				}
			}
		}
		return this.visibleCells; // [this.currentAvatar.avatarItem.cellContents];
	}
	else
		return null;
}

// Get a list of the avatars that are contributing to the pov
AvatarGroupController.prototype.getAvatarPOV = function()
{
	return [this.currentAvatar.avatarItem];
}

AvatarGroupController.prototype.clearTalkingAvatars = function()
{
	for (var i = 0; i < this.avatarList.length; ++i)
	{
		// Clear any existing speech bubbles.
		this.avatarList[i].avatarItem.setItemParam('speech', null, false);
	}
}

// Return any avatar that is at the specified location.
AvatarGroupController.prototype.getAvatarAt = function(locationString)
{
	for (var i = 0; i < this.avatarList.length; ++i)
	{
		var currAvatarItem = this.avatarList[i].avatarItem;
		if (currAvatarItem != null && currAvatarItem.cellContents != null && currAvatarItem.cellContents.getLocationString() == locationString)
			return this.avatarList[i];
	}
	return null;
}

// Attack the avatar. If there are no living avatars remaining, end the game.
// TODO: For the moment, just end the game anyway.
AvatarGroupController.prototype.attackAvatar = function(avatar, attacker)
{
    avatar.avatarItem.setItemParam('speech', "Death by " + attacker.params.fullname + "! Press space to restart.", false);
	this.controller.endGame();   

    // Oh dear. They've lost all their loot since their last save.
    //this.inventoryController.removeUnsavedItems();
}

AvatarGroupController.prototype.clear = function()
{
	for (var i = 0; i < this.avatarList.length; ++i)
	{
		// Clear any existing inventories
		this.avatarList[i].clear();
	}
}

AvatarGroupController.prototype.getUnsavedItemsHTTPString = function()
{
	var result = "";
	for (var i = 0; i < this.avatarList.length; ++i)
	{
		// Get the unsaved items from each avatar and concatinate
		result += this.avatarList[i].getUnsavedItemHTTPString();
	}
	return result;
}

// Update the inventories from the input xml
AvatarGroupController.prototype.updateFromXML = function(xml)
{
	for (var i = 0; i < this.avatarList.length; ++i)
	{
		this.avatarList[i].updateFromXML(xml);
	}
}

AvatarGroupController.prototype.getSavedItemIDs = function(map_id)
{
	var result = [];

	for (var i = 0; i < this.avatarList.length; ++i)
	{
		var savedIds = this.avatarList[i].getSavedItemIDs(map_id);
		result = result.concat(savedIds);
	}

	return result;
}

// This is the full inventory for all avatars, as loaded from the server xml.
AvatarGroupController.prototype.setInventoryXML = function(inventoryXML)
{
	this.xmlInventory = inventoryXML;
	this.resetInventoryFromXML();
}

AvatarGroupController.prototype.resetInventoryFromXML = function()
{
	if (this.xmlInventory != null)
	{
		for (var i = 0; i < this.avatarList.length; ++i)
		{
			this.avatarList[i].resetInventoryFromXML(this.xmlInventory);
		}
	}
}

// InventoryViewItem holds a single item that is in the inventory
function InventoryViewItem(inventoryWindow, gridItem)
{
	this.gridItem = gridItem;
	this.inventoryWindow = inventoryWindow;
	this.inventorySlot = null;
	
	var itemCopy = this.inventoryWindow.controller.itemFactory.makeItem(this.gridItem.params.itemCode);
	var currEl = this.inventoryWindow.controller.itemFactory.makeSimpleViewItem(itemCopy);

    InventoryViewItem.baseConstructor.call(this, "dragItem", 0, 0, currEl, {fill:"none", stroke:"none", rx:2, width:40, height:40});

	this.addActionListener(this.inventoryWindow);
}

KevLinDev.extend(InventoryViewItem, RectButton);

InventoryViewItem.prototype.setDragPosition = function(x, y)
{
	this.tellActionListeners(this, {type:"viewItemDragMove", x:x, y:y});
}

InventoryViewItem.prototype.setDragEnd = function()
{
	this.tellActionListeners(this, {type:"viewItemDragEnd"});
}

// Put this item into the specified slot.
InventoryViewItem.prototype.setSlot = function(slot)
{
	// If this item already has a slot, tell that slot it's now empty.
	if (this.inventorySlot != null)
		this.inventorySlot.setViewItem(null);
		
	this.inventorySlot = slot;
	this.inventorySlot.setViewItem(this);
	this.resetSlotPosition();
}

InventoryViewItem.prototype.resetSlotPosition = function()
{
	if (this.inventorySlot != null)
	{
		this.setPosition(this.inventorySlot.x, this.inventorySlot.y);
	}
}// InventorySlot holds a single inventory item
function InventorySlot(inventoryWindow, x, y, slotIndex)
{
    InventorySlot.baseConstructor.call(this);

	this.inventoryWindow = inventoryWindow;
	this.x = x;
	this.y = y;
	this.viewItem = null;
	this.slotIndex = slotIndex;
}

KevLinDev.extend(InventorySlot, ActionObject);

InventorySlot.prototype.isEmpty = function()
{
	return (this.viewItem == null);
}

InventorySlot.prototype.canAcceptItem = function(viewItem)
{
	// If this is the "weild item" slot, refuse items that can't be weilded.
	if (this.slotIndex == 1 && !viewItem.gridItem.params.canWeild)
		return false;
		
	// Otherwise, we can accept an item as long as there isn't an item already here.
	return this.isEmpty();
}

InventorySlot.prototype.setViewItem = function(viewItem)
{
	this.viewItem = viewItem;

	if (this.slotIndex == 1)
	{
		// This is the "weild slot"
		// Tell the avatar it is now weilding the item
		this.inventoryWindow.setWeilding((this.viewItem == null) ? null : this.viewItem.gridItem);
	}
}

InventorySlot.prototype.getDistance = function(x, y)
{
	return Math.sqrt((this.x - x) * (this.x - x) + (this.y - y) * (this.y - y));
}
// InventoryWindow is used for displaying items the user is holding.
function InventoryWindow(controller)
{
    InventoryWindow.baseConstructor.call(this, "Inventory", 5, {fill:"none", stroke:"green", rx:4}, {width:382, height:225, storePrefix:"MW_InventoryWindow", contentsSpacing:3});

	this.controller = controller;
	this.avatar = null;
	this.snapDistance = 20;
	
	this.inventorySlots = [];
	this.inventorySlots.push(new InventorySlot(this, 14, 85, this.inventorySlots.length));
	this.inventorySlots.push(new InventorySlot(this, 74, 83, this.inventorySlots.length));

	this.inventorySlots.push(new InventorySlot(this, 147, 23, this.inventorySlots.length));
	this.inventorySlots.push(new InventorySlot(this, 147, 85, this.inventorySlots.length));
	this.inventorySlots.push(new InventorySlot(this, 147, 142, this.inventorySlots.length));

	this.inventorySlots.push(new InventorySlot(this, 207, 23, this.inventorySlots.length));
	this.inventorySlots.push(new InventorySlot(this, 207, 85, this.inventorySlots.length));
	this.inventorySlots.push(new InventorySlot(this, 207, 142, this.inventorySlots.length));

	this.inventorySlots.push(new InventorySlot(this, 267, 23, this.inventorySlots.length));
	this.inventorySlots.push(new InventorySlot(this, 267, 85, this.inventorySlots.length));
	this.inventorySlots.push(new InventorySlot(this, 267, 142, this.inventorySlots.length));

	this.inventorySlots.push(new InventorySlot(this, 327, 23, this.inventorySlots.length));
	this.inventorySlots.push(new InventorySlot(this, 327, 85, this.inventorySlots.length));
	this.inventorySlots.push(new InventorySlot(this, 327, 142, this.inventorySlots.length));
	
	this.itemArea = new SVGComponent(0, 0);
	this.contents.appendChild(this.itemArea);
	this.itemArea.childConstraints = {x:0, y:0, width:382, height:195};
}

KevLinDev.extend(InventoryWindow, SVGWindow);

InventoryWindow.prototype.setBgImage = function(bgImage)
{
	// Add a background image
	var currItem = new SVGElement();
	currItem.cloneElement(bgImage);
	currItem.removeAttribute("display");
	currItem.removeAttribute("style");
	currItem.setAttribute("transform", "matrix(5,0,0,5,66,188)");
	this.prependChild(currItem);
}


InventoryWindow.prototype.clear = function()
{
	this.clearAvatar();
	this.clearInventory();
}

InventoryWindow.prototype.clearAvatar = function()
{
	if (this.avatar != null)
	{
		this.avatar.removeActionListener(this);
		this.avatar = null;
	}
}

InventoryWindow.prototype.clearInventory = function()
{
	this.itemArea.removeChildren();
	for (var i = 0; i < this.inventorySlots.length; ++i)
	{
		this.inventorySlots[i].setViewItem(null);
	}
}

// Set the avatar for whom we are showing the inventory
InventoryWindow.prototype.setAvatar = function(avatar)
{
	this.clearAvatar();
	this.avatar = avatar;
	this.syncInventory();
	this.avatar.addActionListener(this);
}

InventoryWindow.prototype.syncInventory = function()
{
	this.clearInventory();
	if (this.avatar != null)
	{
		for (var i = 0; i < this.avatar.heldItems.length; ++i)
		{
			this.tryToCarryItem(this.avatar.heldItems[i].item);
		}
	}
}

// Try to carry the item.
// Return true if able, false if we couldn't.
InventoryWindow.prototype.tryToCarryItem = function(item)
{
	// Find an empty slot
	// Slots 0 and 1 are reserved for left and right hand.
	for (var i = 2; i < this.inventorySlots.length; ++i)
	{
		if (this.inventorySlots[i].isEmpty())
		{
			var newInventoryItem = new InventoryViewItem(this, item);
			
			// The itemBar is the thing that actually holds all the items.
			this.itemArea.appendChild(newInventoryItem);
			
			// Add to the inventory slot
			newInventoryItem.setSlot(this.inventorySlots[i]);
			break;
		}
	}
	
	return false; // unable to find an empty slot
}

InventoryWindow.prototype.doAction = function(src, evt)
{
    InventoryWindow.superClass.doAction.call(this, src, evt);

	if (evt.type == "mousedown" && src.src == "dragItem")
	{
		// Allow user to drag button
        dragndrop_Start(src, evt, src.x, src.y);
	}
	else if (evt.type == "viewItemDragMove")
	{
		// User is moving item. Make the item "sticky" near inventory slots.
		var distance = null;
		var bestSlot = null;
		for (var i = 0; i < this.inventorySlots.length; ++i)
		{
			var currDistance = this.inventorySlots[i].getDistance(evt.x, evt.y);
			if (distance == null || currDistance < distance)
			{
				distance = currDistance;
				bestSlot = i;
			}
		}
		
		var x = evt.x;
		var y = evt.y;
		if (distance != null && distance < this.snapDistance)
		{
			x = this.inventorySlots[bestSlot].x;
			y = this.inventorySlots[bestSlot].y;
		}
		src.setPosition(x, y);
	}
	else if (evt.type == "viewItemDragEnd")
	{
		// Decide where to put the inventory item
		var distance = null;
		var bestSlot = null;
		for (var i = 0; i < this.inventorySlots.length; ++i)
		{
			var currDistance = this.inventorySlots[i].getDistance(src.x, src.y);
			if (distance == null || currDistance < distance)
			{
				distance = currDistance;
				bestSlot = i;
			}
		}
		
		if (distance != null && distance < this.snapDistance)
		{
			if (!this.tryToPlaceItemInSlot(bestSlot, src))
				src.resetSlotPosition();
		}
		else
		{
			src.resetSlotPosition();
		}
	}
	else if (evt.type == "inventoryUpdated")
	{
		this.syncInventory();
	}
}

InventoryWindow.prototype.tryToPlaceItemInSlot = function(slot, viewItem)
{
	var result = false;
	
	// Ask the slot if its okay for this item to be placed there
	if (this.inventorySlots[slot].canAcceptItem(viewItem))
	{
		viewItem.setSlot(this.inventorySlots[slot]);
		result = true;
	}

	return result;
}

InventoryWindow.prototype.setWeilding = function(item)
{
	if (this.avatar != null)
		this.avatar.setWeilding(item);
}
// Interface between the game and the server, using ajax to get xml.

function GameServerInterface(controller)
{
	this.controller = controller;
}

GameServerInterface.prototype.renameWorld = function(newWorldName)
{
    var http_string = "update.php";
    var params = "changemapname=" + escape(newWorldName) + "&" + this.controller.loginController.getHTTPLoginString() + "&map_id=" + this.controller.current_map_id;
    
	if (g_config.showServerTransactions)
	{
		this.controller.addInfo(params + '\n');
	}

    var me = this;
    ajax_post(
            http_string, 
            function(xml) 
            {
                me.receiveRenameWorldResultFromServer(xml);
            }, 
            params
        );
}

GameServerInterface.prototype.receiveRenameWorldResultFromServer = function(xml)
{
    if (xml.nodeName == "result" && xml.getAttribute("status") == "1")
    {
		var map_id = xml.getAttribute("map_id");
		var map_name = xml.getAttribute("map_name");
        this.controller.tellActionListeners(this.controller, {type:"serverWorldRenamed", map_id:map_id, map_name:map_name});
    }
    else
    {
        alert(xml.textContent);
    }
}

GameServerInterface.prototype.submitLoadArtworkAndMap = function(artFile)
{    
    var me = this;
    ajax_post(
            artFile, 
            function(xml, xmlDoc) 
            {
                me.receiveArtworkFromServer(xmlDoc);
            }, 
            null
        );
}

GameServerInterface.prototype.receiveArtworkFromServer = function(xmlDoc)
{
    this.controller.artwork = xmlDoc;
    
    // Copy all the definitions from the xmlDoc to the current doc
    // TODO: currently require everything to be put in "defs_external" element.
    // Is this necessary/useful?
    var defs = this.controller.artwork.getElementsByTagName("defs");
    var dest = document.getElementById("defs_external");
    for (var i = 0; i < defs.length; i++)
    {
        for (var j = 0; j < defs[i].children.length; j++)
        {
            dest.appendChild(defs[i].children[j].cloneNode(true));
        }
    }
    this.controller.itemFactory.artwork = xmlDoc;

	var bgInventoryImage = this.controller.artwork.getElementById("inventory_bg");
	this.controller.inventoryWindow.setBgImage(bgInventoryImage);

    // We can now use the artwork to setup the edit area
    this.controller.setupEditArea();
    //updateLayout();
    
    // Finally, load the starting map, also loading any saved items
    this.submitLoadMap(this.controller.loginController.curr_map, true);
}

// Save items, and optionally teleport to a new map. Set teleportDestination to null
// if you don't wish to teleport.
GameServerInterface.prototype.submitSaveItemsAndTeleport = function(teleportDestination)
{    
    var http_string = "update.php";
    var params = "saveitems=1&" + this.controller.loginController.getHTTPLoginString();
    
	var saveItemParams = this.controller.avatarGroupController.getUnsavedItemsHTTPString();
    if (saveItemParams.length == 0)
    {
        // Don't bother saving anything; there isn't anything to save.
        this.submitLoadMap(teleportDestination);
        return;
    }
    
    params += saveItemParams;

	if (g_config.showServerTransactions)
	{
		this.controller.addInfo(params + '\n');
	}
	
    var me = this;
    ajax_post(
            http_string, 
            function(xml) 
            {
                me.receiveSaveItemsResultFromServer(xml, teleportDestination);
            }, 
            params
        );
}

GameServerInterface.prototype.receiveSaveItemsResultFromServer = function(xml, teleportDestination)
{
    if (xml.nodeName == "result" && xml.getAttribute("status") == "1")
    {
        console.log('save items successful: added ' + xml.getAttribute('added') + ' deleted ' + xml.getAttribute('deleted') + ' updated ' + xml.getAttribute('updated'));
		
		this.controller.avatarGroupController.updateFromXML(xml);
		
        this.submitLoadMap(teleportDestination, false);
    }
    else
    {
        alert(xml.textContent);
    }
}

GameServerInterface.prototype.submitLoadMap = function(map_id, doGetItems)
{
    if (map_id == null)
        return;

    // We don't teleport if there's unsaved data.
    // Instead, return to edit mode.
    if (!this.controller.isMapSaved)
    {
		alert("Can't teleport - there is unsaved data.");
        this.controller.editLevel();
        return;
    }
        
    document.getElementById("loadingNotification").setAttribute("display", "inline");
    this.controller.setActive(false);

    var http_string = "update.php";
    var params = "load=" + escape(map_id) + "&save_level=1&" + this.controller.loginController.getHTTPLoginString();
    
    if (!this.controller.hasLoadedVisitedWorlds)
    {
        params += "&get_visit=1";
        this.controller.hasLoadedVisitedWorlds = true;
    }
    
    if (doGetItems)
        params += "&get_items=1";
    
	if (g_config.showServerTransactions)
	{
		this.controller.addInfo(params + '\n');
	}

    var me = this;
    ajax_post(
            http_string, 
            function(xml) 
            {
                me.receiveMapFromServer(xml);
            }, 
            params
        );
}

GameServerInterface.prototype.receiveMapFromServer = function(xml)
{
    document.getElementById("persMapArea").setAttribute("display", "inline");
    document.getElementById("loadingNotification").setAttribute("display", "none");

    if (xml.nodeName == "result" && xml.getAttribute("status") == "1")
    {
		// Clear the map and inventory
		this.controller.currentMap = null;
		this.controller.avatarGroupController.setInventoryXML(null);

		// Load map and inventory from xml
		for (var i = 0; i < xml.children.length; ++i)
		{
			switch (xml.children[i].nodeName)
			{
			case "m":
        		this.controller.currentMap = xml.children[i];
				break;
				
			case "items":
				this.controller.avatarGroupController.setInventoryXML(xml.children[i]);
				break;
			}
		}

		this.controller.setMapSavedStatus(true);

        this.controller.getVisitedWorldsFromXML(xml);
        
		// Get map info
	    if (xml.hasAttribute("map_id"))
	    {
	        this.controller.current_map_id = xml.getAttribute("map_id");
	    }

	    if (xml.hasAttribute("map_name"))
	    {
	        this.controller.setMapName(xml.getAttribute("map_name"));
	    }

		// Set whether the level is editable
		this.controller.enableEditMode(xml.hasAttribute("editable") && xml.getAttribute("editable") == "1");

		// Load the map
		this.controller.unsavedMap = null;
		this.controller.initialiseModelFromXML();
		
		this.controller.playLevel();
	}
    else
    {
        alert(xml.textContent);
    }

    this.controller.setActive(true);
}

GameServerInterface.prototype.submitSaveMap = function(map)
{
    var http_string = "update.php";
    var params = "save=" + escape(this.controller.current_map_id) + "&map=" + escape(map) + "&" + this.controller.loginController.getHTTPLoginString();

	if (g_config.showServerTransactions)
	{
		this.controller.addInfo(params + '\n');
	}
	    
    var me = this;
    ajax_post(
            http_string, 
            function(xml) 
            {
                me.sendMapToServer(xml);
            }, 
            params
        );
}

GameServerInterface.prototype.sendMapToServer = function(xml)
{
    if (xml.nodeName == "result" && xml.getAttribute("status") == "1")
    {
        this.controller.setMapSavedStatus(true);
		this.controller.unsavedMap = null;
        alert('sent map OK');
        if (xml.hasAttribute("map_id"))
        {
            this.controller.current_map_id = xml.getAttribute("map_id");
        }
    }
    else
    {
        alert(xml.textContent);
    }
}


// TurnClock keeps track of the time in the game. It starts at zero
// at the beginning of each level and increments by 1 for each turn.
function TurnClock()
{
    this.currentTime = 0;
}

function GameController(background, itemFactory, model, view)
{
    GameController.baseConstructor.call(this);
	
    this.current_map_id = -1; // Current map is not set
    
    this.background = background;
    this.background.addActionListener(this);

    // The overlayer is for user interface elements - the user preferences,
    // inventory, world name, etc.
    this.overLayer = wrapElementById("overLayer");
    this.overLayer.childConstraints = {x:0, y:0, width:1000, height:1000};
    this.overLayer.show();

    // Start the login controller.
    var loginArea = document.getElementById("loginArea");

    this.loginController = new LoginController(background, this.overLayer);
    this.loginController.loginTextbox.setFocus(true);
    
    // We wish to be notified when there is a "loggedIn" or "loggedOut" action
    this.loginController.addActionListener(this);

	this.gameServerInterface = new GameServerInterface(this);
    
    this.adminWindow = new AdminWindow(this, this.loginController.logoutGroup);
    this.overLayer.appendChild(this.adminWindow);
    this.adminWindow.hide();
    this.adminWindow.addActionListener(this);

    // Visited world notifier is for notifying about any changes to 
    // the list of visited worlds.
    this.visitedWorldNotifier = new ActionObject();
    
    this.worldChooserWindow = new WorldChooserWindow(this, {windowName:"World Chooser"});
    this.overLayer.appendChild(this.worldChooserWindow);
    this.worldChooserWindow.hide();
    this.worldChooserWindow.addActionListener(this); 
    this.visitedWorldNotifier.addActionListener(this.worldChooserWindow);

	// Inventory window shows inventory items for the current character.
    this.inventoryWindow = new InventoryWindow(this, {windowName:"inventory"});
    this.overLayer.appendChild(this.inventoryWindow);
    this.inventoryWindow.hide();
    this.inventoryWindow.addActionListener(this); 
    
    this.editLayer = wrapElementById("editLayer"); 
    this.editLayer.childConstraints = {x:0, y:0, width:1000, height:1000};
    this.editLayer.hide();

    this.itemFactory = itemFactory;
    this.model = model;
    this.view = view;
    this.view.addActionListener(this);
   
    this.avatarGroupController = new AvatarGroupController(this);
    
    // The game is not initially active (ie. listening for events)
    this.isActive = false;

    this.canEdit = false; // Whether editing is allowed or not for this level.
	this.editMode = false;
    
    // TurnClock keeps a track of how many turns have passed since
    // the player entered the current map.
    this.turnClock = new TurnClock();
    
    // Action controller is responsible for the game actions and conditions that
    // trigger them
    this.actionController = new ActionController(this.model, this, this.turnClock);
    
    // add the default avatar
	var currAvatar = this.avatarGroupController.addAvatar("b");
	this.inventoryWindow.setAvatar(currAvatar);
	
    this.clearPlayerData();
}

KevLinDev.extend(GameController, ActionObject);

GameController.prototype.start = function()
{
	this.loginController.start();
}

GameController.prototype.clearPlayerData = function()
{
    // The xml for the map is stored here.
    this.currentMap = null;
    this.isMapSaved = true;

	// The xml for any unsaved map is stored here.
	this.unsavedMap = null;
	
    // part of the map that is currently selected
    this.mapSelect = null;    
    
	// Keep track of the highlighted items
	this.highlightedItems = [];	
	
	// Clear avatars
	this.avatarGroupController.clear();
	
	// Keep track of the visited worlds
	this.visitedWorlds = [];
    this.hasLoadedVisitedWorlds = false;
    this.visitedWorldNotifier.tellActionListeners(this, {type:"clear"})
}

GameController.prototype.clearHighlightedItems = function()
{
	for (var i = 0; i < this.highlightedItems.length; ++i)
	{
		this.highlightedItems[i].setItemParam("isHighlighted", false, false);
	}
	this.highlightedItems = [];
}

GameController.prototype.addVisitedWorld = function(visitedWorld)
{
    if (!this.visitedWorlds[visitedWorld.map_id])
    {
	    this.visitedWorlds[visitedWorld.map_id] = visitedWorld;
        this.visitedWorldNotifier.tellActionListeners(this, {type:"add", value:visitedWorld})
    }
}

GameController.prototype.setMapName = function(mapName)
{
    // Show the map name for the first two turns
    this.adminWindow.worldLabel.setValue(mapName);
}

GameController.prototype.highlightItem = function(item)
{
	this.highlightedItems.push(item);
	item.setItemParam("isHighlighted", true, false);
}

GameController.prototype.setupEditArea = function()
{    
    // Show the contract/expand icon for the AdminWindow
	var coverEl1 = cloneElementById(this.artwork, "iconCircleCover");
	var contractEl = cloneElementById(this.artwork, "iconContract");
	var contractOverEl = cloneElementById(this.artwork, "iconContractMouseover");

	var coverEl2 = cloneElementById(this.artwork, "iconCircleCover");
	var expandEl = cloneElementById(this.artwork, "iconExpand");
	var expandOverEl = cloneElementById(this.artwork, "iconExpandMouseover");
	
	this.expandButton = new ParamButton2("adminExpand", {x:10, y:10, width:20, height:20, normalElements:{normal:expandEl, mouseover:expandOverEl, cover:coverEl1}, selectedElements:{normal:contractEl, mouseover:contractOverEl, cover:coverEl2}});
	this.expandButton.setToggle(true);
	this.overLayer.appendChild(this.expandButton);
	this.expandButton.addActionListener(this);

    this.contentLayoutView = new ContentLayoutView(this.view);
    this.view.coverLayer2.appendChild(this.contentLayoutView);    

	this.editWindow = new EditWindow(this, this.editLayer);
	this.editLayer.appendChild(this.editWindow);
}

GameController.prototype.saveMap = function()
{
    if (this.loginController.loggedIn)
    {
        var xml = this.model.toXML();
    
        // Also append the actions and conditions
        this.actionController.toXML(xml);
    
        var xmlString = (new XMLSerializer()).serializeToString(xml);
        this.gameServerInterface.submitSaveMap(xmlString);
    }
}

GameController.prototype.setInfo = function(info)
{
    this.editWindow.infoWindowContents.setValue(info);
}

GameController.prototype.addInfo = function(info)
{
    this.editWindow.infoWindowContents.setValue(this.editWindow.infoWindowContents.getValue() + info);
}

GameController.prototype.removeSavedItemsFromMap = function()
{
	var savedItemIDs = this.avatarGroupController.getSavedItemIDs(this.current_map_id);
    for (var i = 0; i < savedItemIDs.length; ++i)
    {
        var item = this.model.getItemById(savedItemIDs[i]);
        if (item != null && item.owner != null)
        {
            item.owner.removeItem(item);
        }
    }
}

GameController.prototype.getVisitedWorldsFromXML = function(xml)
{
    if (xml == null)
        return;
        
    var xmlVisitedList = xml.getElementsByTagName("visit");
    
    for (var i = 0; i < xmlVisitedList.length; i++)
    {
        var xmlVisit = xmlVisitedList.item(i);
        this.addVisitedWorld({
            map_id:xmlVisit.getAttribute("map_id"), 
            map_name:xmlVisit.getAttribute("map_name"),
            owner_id:xmlVisit.getAttribute("owner_id"),
            access:xmlVisit.getAttribute("access")
            });
    }    
}

// Reset the game from the XML 
GameController.prototype.initialiseModelFromXML = function()
{
	var xml = this.unsavedMap;
	if (xml == null)
	{
		xml = this.currentMap;
    }

    this.model.clear();
	this.view.clear();
    this.actionController.clear();

    this.avatarGroupController.registerAvatars();
    this.avatarGroupController.resetInventoryFromXML();	
    
    this.gameState = "normal";
    this.turnClock.currentTime = 0;
    this.model.fromXML(xml);
    this.actionController.fromXML(xml);
}

GameController.prototype.setMapSavedStatus = function(isMapSaved)
{
    this.isMapSaved = isMapSaved;
    this.editWindow.saveMapButton.setAble(!this.isMapSaved);
}

GameController.prototype.doAction = function(src, evt)
{
    if (evt.type == "keypress")
        evt.preventDefault();
    
    if (evt.type == "closeWindow")
    {
        src.hide();
        if (src.windowName == "Admin")
        {
            this.expandButton.isSelected = false;
            this.expandButton.updateAppearance();
        }
    }
    else if (evt.type == "loggedIn")
    {
        // User has successfully logged in, so load the artwork and 
        // map from the server
        this.gameServerInterface.submitLoadArtworkAndMap("images/gameGraphics.svg");
        this.setActive(true);
    }
    else if (evt.type == "loggedOut")
    {
        // User has logged out
        this.setActive(false);
        this.enableEditMode(false);
        this.worldChooserWindow.hide();
        this.worldChooserWindow.clear();
        this.adminWindow.hide();
        document.getElementById("persMapArea").setAttribute("display", "none");
        this.model.clear();
		this.view.clear();
        this.actionController.clear();
        this.clearPlayerData();
    }
    else if (evt.type == "worldSelected")
    {
        this.gameServerInterface.submitLoadMap(evt.value, false);
    }
    else if (src.src == "adminExpand" && evt.type == "click")
    {
        if (src.isSelected)
            this.adminWindow.show();
        else
            this.adminWindow.hide();
    }
    else if (!this.isActive)
    {
        // If the game is inactive, we don't care about any user input events.
        return;
    }
    else if (!this.editMode)
    {
        this.parseGameAction(src, evt);
    }
    else 
    {
        this.parseEditAction(src, evt);
    }
}

function parseKeycodesAndCharcodes(keyCode, charCode)
{
    var result = null;
    switch (charCode)
    {
    case 0:
        break;
        
    case 119:
        // w
        result = "up";     
        break;

    case 97:
        // a
        result = "left";       
        break;

    case 115:
        // s
        result = "down";        
        break;

    case 100:
        // d
        result = "right"     
        break;

	case 105:
		// i
		result = "inventory";
		break;
		
    case 32:
        // space
        result = "wait";        
        break;

    case 43:
        // -
        result = "zoom_out";        
        break;

    case 45:
        // +
        result = "zoom_in";        
        break;
    }    
    
    switch (keyCode)
    {
    case 0:
        break;
        
    case 37:
        // left
        result = "left";
        break;
   
    case 38:
        // up
        result = "up";
        break;
   
    case 39:
        // right
        result = "right";
        break;

    case 40:
        // down
        result = "down";
        break;
    }
    
    return result;
}

GameController.prototype.parseGameAction = function(src, evt)
{
    if (this.gameState == "dead")
    {
        if (evt.type == "keypress" && parseKeycodesAndCharcodes(evt.keyCode, evt.charCode) == "wait")
        {
            // The user has been notified that they are dead, so
            // restart the map.
            this.initialiseModelFromXML();
			this.playLevel();
        }
        return;
    }
    
    if (evt.type == "keypress" && this.background.focus == null)
    {
        switch (parseKeycodesAndCharcodes(evt.keyCode, evt.charCode))
        {
        case "up":
            this.avatarGroupController.attemptMoveCurrentAvatar("b");
            this.stepTime();        
            break;

        case "left":
            this.avatarGroupController.attemptMoveCurrentAvatar("r");
            this.stepTime();        
            break;

        case "down":
            this.avatarGroupController.attemptMoveCurrentAvatar("f");
            this.stepTime();        
            break;
            
        case "right":
            this.avatarGroupController.attemptMoveCurrentAvatar("l");
            this.stepTime();        
            break;

        case "wait":
            this.stepTime();        
            break;

		case "inventory":
			if (this.inventoryWindow.showing)
				this.inventoryWindow.hide();
			else
				this.inventoryWindow.show();
		    
			break;
        }    
    }
    else if (evt.type == "click")
    {
        if (src.src == "editmap")
        {
            if (src.isSelected)
				this.editLevel();
			else
				this.playLevel();
        }
    }
}

GameController.prototype.parseEditAction = function(src, evt)
{
    if (src.src == "gridCell" && evt.type == "mouseover")
    {
        // Make sure the cellContents are visible
        this.setVisibleToUser([src.modelContents], 5);
    
        if (this.editWindow.infoWindow.showing)
        {
            // Update the info about this square
            var infoXML = src.modelContents.toXML(this.model.xmlDoc, true);
            if (infoXML != null)
            {
                // Use E4X to prettyprint the XML
                var infoString = XML((new XMLSerializer()).serializeToString(infoXML)).toXMLString();
                this.setInfo(infoString);
            }
            else
            {
                this.setInfo("null");
            }
        }
    }
    else if (evt.type == "click")
    {
        if (src.src == "editmap")
        {
            if (src.isSelected)
				this.editLevel();
			else
				this.playLevel();
        }
        else if (src.src == "gridCell")
        {
            this.contentSelected(src, evt);
        }
    }
    else if (evt.type == "keypress" && this.background.focus == null)
    {
        switch (parseKeycodesAndCharcodes(evt.keyCode, evt.charCode))
        {
        case "left":
            this.view.setCellCentre(this.view.cellCentreX - 1, this.view.cellCentreY);
		    this.view.updateView();
		    this.view.removeOutsideView();
            break;
       
        case "up":
            this.view.setCellCentre(this.view.cellCentreX, this.view.cellCentreY - 1);
		    this.view.updateView();
		    this.view.removeOutsideView();
            break;
       
        case "right":
            this.view.setCellCentre(this.view.cellCentreX + 1, this.view.cellCentreY);
		    this.view.updateView();
		    this.view.removeOutsideView();
            break;

        case "down":
            this.view.setCellCentre(this.view.cellCentreX, this.view.cellCentreY + 1);
		    this.view.updateView();
		    this.view.removeOutsideView();
            break;

        case "zoom_out":
            break;

        case "zoom_in":
            break;
        }
    }
}

// Ensure all the blocks in the cellList are visible to the user
// by ensuring no blocks are obscuring them (i.e. are in front and higher).
// offset - how much taller a front block must be in order to obscure the ones behind it.
GameController.prototype.setVisibleToUser = function(cellList, offset)
{
	if (cellList == null)
		return;
		
    this.model.clearInTheWay();
	for (var i = 0; i < cellList.length; ++i)
	{
		var currCell = cellList[i];
		
		// Don't need to make a cell visible if it's got nothing in it.
		if (currCell.myItems.length == 0)
			continue;
		
	    // Make sure the top block is visible
	    var ht = offset;
    
	    var topBlock = getTopBlockItem(currCell);
	    if (topBlock != null)
	    {
	        ht = topBlock.params.elev + topBlock.params.ht + offset;
	    }
    
	    currCell.setVisibleToUser(ht);
	    this.model.getContents(currCell.x, currCell.y - 1).setVisibleToUser(ht);
	    this.model.getContents(currCell.x + 1, currCell.y).setVisibleToUser(ht);
	}
}

GameController.prototype.contentSelected = function(src, evt)
{
    if (this.editMode && evt.shiftKey)
    {
        var currData = this.model.getContents(src.x_index, src.y_index);
        this.contentLayoutView.setContents(currData);
        
        /*
        if (this.editWindow.radioButtonGroup.currentSelection.src == "select")
        {
            // Unselect existing map selection
            if (this.mapSelect != null)
            {
                this.mapSelect.setToggle(false);
                this.mapSelect.setSelected(false);
            }
            
            // Set the state of the button as selected
            this.mapSelect = src;
            src.setToggle(true);
            src.setSelected(true);
            
            // Update the content view
            this.contentLayoutView.setContents(currData);
        }
        */
    }
    else if (this.editMode)
    {
        var currData = this.model.getContents(src.x_index, src.y_index);
        
        if (this.editWindow.itemSelectorWindow.isShowing())
        {
 			this.editWindow.itemSelectorWindow.setGridContents(currData);
        }
        else if (this.editWindow.radioButtonGroup.currentSelection == null || this.editWindow.radioButtonGroup.currentSelection.isSelected == false)
        {
            // Nothing selected
        }
        else if (this.editWindow.radioButtonGroup.currentSelection.src == "deleteButton")
        {
            // Delete the last thing
            var topData = currData.getTopItem();
			topData.markedForDeath = true; // We need to mark this so that actions and conditions know this is an actual delete rather than just moving the item
            
            // First remove from moveable item list (if present)
            this.model.removeFromMoveableItems(topData);
            
            if (topData.owner != null)
            {
                topData.owner.removeItemByIndex(0);
            }
            //this.updateItemsRemainingText();
            this.setMapSavedStatus(false);
        }
        else if (this.editWindow.radioButtonGroup.currentSelection.src == "upArrowButton")
        {
            // Raise the top block item
            var topBlock = getTopBlockItem(currData);

            if (topBlock != null)
            {
                var targetHeight = topBlock.params.ht + 5;
                if (targetHeight > 60)
                    targetHeight = 60;
                    
                topBlock.setHeight(targetHeight, true);
            }
            this.setMapSavedStatus(false);
        }
        else if (this.editWindow.radioButtonGroup.currentSelection.src == "downArrowButton")
        {
            // Lower the top block item
            var topBlock = getTopBlockItem(currData);

            if (topBlock != null)
            {
                var targetHeight = topBlock.params.ht - 5;
                if (targetHeight < 0)
                    targetHeight = 0;
                    
                topBlock.setHeight(targetHeight, true);
            }
            this.setMapSavedStatus(false);
        }
        else if (this.editWindow.radioButtonGroup.currentSelection.src == "rotateLeftArrowButton")
        {
            // Rotate the top item left
            var topItem = currData.getTopItem();

            if (topItem != null)
            {
				// Rotate the item to the left
				var doSaveValue = true;
				topItem.rotateItem(-1, doSaveValue);
            }
            this.setMapSavedStatus(false);
        }
        else if (this.editWindow.radioButtonGroup.currentSelection.src == "rotateRightArrowButton")
        {
            // Rotate the top item right
            var topItem = currData.getTopItem();

            if (topItem != null)
            {
				// Rotate the item to the left
				var doSaveValue = true;
				topItem.rotateItem(1, doSaveValue);
            }
            this.setMapSavedStatus(false);
        }
        else if (this.editWindow.radioButtonGroup.currentSelection.src == "lightButton")
        {
            currData.setAmbientLight(this.editWindow.lightLevelWindow.lightLevel);
            this.setMapSavedStatus(false);
        }
        else if (this.editWindow.radioButtonGroup.currentSelection.src == "blockItemButton")
        {
            // Set the ambient light default if this is the first item
            // to be added
            if (currData.myItems.length == 0)
                currData.setAmbientLight(this.editWindow.lightLevelWindow.lightLevel);

            var item = this.editWindow.blockItemWindow.item;
            
            this.appendItem(currData.getTopItem(), item);
        }
        else if (this.editWindow.radioButtonGroup.currentSelection.src == "itemButton")
        {
            // Need a block item to go first
            if (currData.myItems.length == 0)
                return;
                
            var item = this.editWindow.itemWindow.item;
            
            if (item.params.itemCode == "S")
            {
				// User is placing a start marker.
				
                // Remove any existing start items
                var existingStartItemList = this.model.findItemsByCode("S");
				if (existingStartItemList != null)
				{
                	for (var i = 0; i < existingStartItemList.length; ++i)
                	{
                    	existingStartItemList[i].owner.removeItem(existingStartItemList[i]);
					}
                }
            }
            
            this.appendItem(currData.getTopItem(), item);

            if (item.params.doTeleport)
            {
                // Create a corresponding action and condition
                var teleportAction = new TeleportAction(this.model, this, item.params.doTeleport);
				this.actionController.appendAction(teleportAction);
				
				var teleportCondition = new HasItemCondition(this.model, this, null, "tag", item, "avatar");
		        this.actionController.registerCondition(teleportCondition);
	    		teleportAction.addCondition(teleportCondition);
			}
        }
    }
}

GameController.prototype.appendItem = function(topData, item)
{
    var params = {};
    for (var i in item.params)
        params[i] = item.params[i];
    
    var itemCopy = new PerspectiveGridItem(params);

    // add the foreground object
    topData.appendItem(itemCopy);
    if (itemCopy.params.isSaveable)
    {
        // Takeable items must have ids
        this.model.registerItem(itemCopy);
    }

    // If the item is moveable, add it to the moveable list.
    if (itemCopy.params.moveTowards != null)
    {
        this.model.addToMoveableItems(itemCopy);
    }

    this.setMapSavedStatus(false);
}

GameController.prototype.endGame = function()
{
    this.gameState = "dead";
}

GameController.prototype.stepTime = function()
{
    // Anything that was speaking from last turn gets turned off.
    this.actionController.clearSpeakingItems();
    
    // When the avatar has completed their action for the turn, 
    // check the block the avatar is standing on for triggered actions
    // and check whether any items want to change.
    this.changeItems();    
    
    this.actionController.attemptActions();
    this.turnClock.currentTime++;

	// Finally update the view
    this.view.updateView();
    this.view.removeOutsideView();

	var pov = this.avatarGroupController.getAvatarPOV();
    this.view.updatePOV(pov);

	var viewedCells = this.avatarGroupController.updateAvatarViewedCells();
    this.setVisibleToUser(viewedCells, 15);
}

GameController.prototype.changeItems = function()
{
    // Make a list of the items that want to change (including movement), sorted by where they want to move to.
    var destinationList = {};
    for (var i = 0; i < this.model.moveableItems.length; ++i)
    {
        var currRequest = this.model.moveableItems[i].requestChange();
        
        if (currRequest == null)
            continue;
        
		var requestLocation = currRequest.cellContents.getLocationString();
        if (destinationList[requestLocation] == null)
        {
            destinationList[requestLocation] = [];
        }
        
        destinationList[requestLocation].push({item:this.model.moveableItems[i], dest:currRequest});
    }
    
    for (var i in destinationList)
    {
		var targetAvatar = this.avatarGroupController.getAvatarAt(i);
        if (targetAvatar != null)
        {
            // The item wishes to move into the current character's cellContents
			this.avatarGroupController.attackAvatar(targetAvatar, destinationList[i][0].item);
        }
        else if (destinationList[i].length == 1)
        {
            // Move the item as per its request.
            var topData = destinationList[i][0].dest.cellContents.getTopItem();
            destinationList[i][0].item.moveItem(topData);
            destinationList[i][0].item.setDirection(destinationList[i][0].dest.params.direction);
        }
        else 
        {
            // More than one thing wanted to move here.
            // For the moment, none of them move.
            
            // However, they all at least turn in the direction they
            // want to move.
            destinationList[i][0].item.setDirection(destinationList[i][0].dest.params.direction);
        }
    }    
}

GameController.prototype.enableEditMode = function(doEnable)
{
	this.canEdit = doEnable;
	
	// Also clear the buttons if necessary.
    if (doEnable)
        this.adminWindow.editMapButton.show();
    else
        this.adminWindow.editMapButton.hide();
}

GameController.prototype.setActive = function(isActive)
{
    this.isActive = isActive;
}

GameController.prototype.setZoom = function(zoomLevel)
{
	// Set zoom level of window
	if (zoomLevel < 0.2)
		this.view.setFixedCellCount(4);
	else if (zoomLevel < 0.4)
		this.view.setFixedCellCount(8);
	else if (zoomLevel < 0.6)
		this.view.setFixedCellCount(12);
	else if (zoomLevel < 0.8)
		this.view.setFixedCellCount(20);
	else
		this.view.setFixedCellCount(30);
	
	this.view.updateView();
}

// Go into debug mode - it's like edit mode, except it doesn't load or save the level
// or remove the avatar
GameController.prototype.setDebugMode = function(debugMode)
{
    // Clear any "in the way" squares that might be left over
    this.model.clearInTheWay();

    this.editMode = debugMode; // Emulate editMode for the purposes of handling move events

    if (debugMode)
    {        
        this.model.showInvisible = true;

        var bgrect = document.getElementById("baseBG");
        bgrect.setAttribute("fill", "white");

        gLightLevelScaleFactor = 0.6;

		this.view.updatePOV(null);
        this.view.setLighting();
        this.editLayer.show();
		this.setZoom(this.editWindow.zoomSlider.sliderPosition);
    }
    else
    {
		this.playLevel();
    }
}

// Initialise and start editing the level, if permitted.
GameController.prototype.editLevel = function(debugMode)
{
	if (this.canEdit == false)
	{
		this.playLevel();
		return;
	}
	
    this.editMode = true;

    // Clear any "in the way" squares that might be left over
    this.model.clearInTheWay();

	this.adminWindow.editMapButton.setContents(this.adminWindow.editMapButtonPlayText);

	this.model.showInvisible = true;

	var bgrect = document.getElementById("baseBG");
	bgrect.setAttribute("fill", "white");

	gLightLevelScaleFactor = 0.6;

	if (!debugMode)
	{
		// Remove the avatars
		this.avatarGroupController.removeAvatars();

		// Initialise the level from the xml, so that all the actions are reset
		this.initialiseModelFromXML();
	}
	
    this.view.updateView();
	this.view.updatePOV(null);
	this.view.setLighting();
	this.editLayer.show();
	this.setZoom(this.editWindow.zoomSlider.sliderPosition);
}

// Initialise and play the level.
GameController.prototype.playLevel = function()
{
    this.editMode = false;

    // Clear any "in the way" squares that might be left over
    this.model.clearInTheWay();

	// Hide the editor
    this.adminWindow.editMapButton.setContents(this.adminWindow.editMapButtonEditText);
    this.editLayer.hide();

	// Save any unsaved map data
	if (!this.isMapSaved)
   		this.unsavedMap = this.model.toXML();
    
	this.clearHighlightedItems();
    this.model.showInvisible = false;
    
	// reset the lighting
    gLightLevelScaleFactor = 1.0;
    this.view.setLighting();
    
    // reset the turn clock
    this.turnClock.currentTime = 0;

	// Remove held items from the map.
    this.removeSavedItemsFromMap();

    // Add the avatar into the scene
    this.avatarGroupController.placeAvatars();

	// Set up the board
    this.view.setFixedCellCount(8);
	var centreCell = this.avatarGroupController.getAvatarCentreCell();
	if (centreCell != null)
	{
		this.view.setCellCentre(centreCell.x, centreCell.y);
	}

    this.view.updateView();

	var pov = this.avatarGroupController.getAvatarPOV();
    this.view.updatePOV(pov);
    this.view.removeOutsideView();
    
	// Set the background appearance to black.
    var bgrect = document.getElementById("baseBG");
    bgrect.setAttribute("fill", "black");

	// Clear any existing speech bubbles from avatars.
    this.avatarGroupController.clearTalkingAvatars();

	// Start the first turn.
    this.stepTime();	
}

var gController;
var gWindow = this;

function init()
{
    var background = new Background();
    
	// base summaries are for blocks - how they appear; what properties they have.
	// name, topColor, frontLeftColor, frontRightColor, canStandOn, weight
	// Weight of blocks is per unit of height.
    var baseSummary = {
        s:["Sand", "#d1df5d", "#c1cf4d", "#b1bf3d", true, 50],
        m:["Mud", "#808000", "#707000", "#606000", true, 50],
        e:["Earth", "#79621c", "#695218", "#594210", true, 50],
        f:["Field", "#00ff00", "#00ee00", "#00dd00", true, 50],
        g:["Grass", "#33c52e", "#28b520", "#20a518", true, 40],
        h:["Hedge", "#108010", "#0c700c", "#096009", true, 40],
        a:["Aqua", "#00eeee", "#00dddd", "#00cccc", false, 30],
        w:["Water", "#4b60e5", "#3b50d5", "#3240c5", false, 30],
        o:["Ocean", "#0000dd", "#0000cc", "#0000aa", false, 30],
        c:["Clay", "#a0522d", "#954623", "#80391b", true, 60],
        r:["Rock", "#696969", "#595959", "#494949", true, 100],
        d:["Stone", "#506070", "#405060", "#304050", true, 100]
        };
    
	// itemTemplates are params for all the non-block items in the game.
    // itemName, itemCode, ht, wt, lightStrength, lightRadius, povRange, blockView, canStandOn, isPushable, isTakeable, isVisible

    var itemTemplates = {
        x:{itemName:"boulder01", fullname:"Large Boulder", itemCode:"x", ht:20, wt:1000, isPushable:true, blockView:true},
        X:{itemName:"tree01", fullname:"Palm Tree", itemCode:"X", ht:30, wt:400},
        ".":{itemName:"pebbles01", fullname:"Pebbles", itemCode:".", canStandOn:true},
        z:{itemName:"brazier01", fullname:"Brazier", itemCode:"z", ht:10, wt:20, lightStrength:1, lightRadius:3},
        i:{itemName:"coin01", fullname:"Coin", itemCode:"i", wt:0.1, canStandOn:true, isTakeable:true, isSaveable:true},
        k:{itemName:"key01", fullname:"Key", itemCode:"k", wt:0.1, canStandOn:true, isTakeable:true, isSaveable:true},
        I:{itemName:"stick01", fullname:"Stick", itemCode:"I", wt:0.1, canStandOn:true, isTakeable:true, isSaveable:true, canWeild:true},
        j:{itemName:"ghost01", fullname:"Ghost", itemCode:"j", ht:10, povRange:4},
        G:{itemName:"golem01", fullname:"Golem", itemCode:"G", ht:20, wt:500, povRange:4, climbHeight:0},
        L:{itemName:"goblin01", fullname:"Goblin", itemCode:"L", ht:10, wt:30, povRange:4, climbHeight:5, moveTowards:["b"], scaredOf:["b"]},
        Z:{itemName:"zombie01", fullname:"Zombie", itemCode:"Z", ht:20, wt:100, povRange:4, climbHeight:0, moveTowards:["b"]},
        Y:{itemName:"zombie02", fullname:"Ghoul", itemCode:"Y", ht:20, wt:100, povRange:4, climbHeight:0, moveTowards:["b"]},
        T:{itemName:"teleport01", fullname:"Teleport", itemCode:"T", canStandOn:true, doesTeleport:true},
        S:{itemName:"start01", fullname:"Start Square", itemCode:"S", canStandOn:true, isInvisible:true},
        b:{itemName:"avatar02", fullname:"Avatar", itemCode:"b", ht:20, wt:100, lightStrength:1, lightRadius:4, povRange:9, climbHeight:10, dropHeight:20, noEdit:true},
        t:{itemName:"tag01", fullname:"Item Tag", itemCode:"t", noEdit:true},
        B:{itemName:"barrel01", fullname:"Barrel", itemCode:"B", ht:20, wt:1000, isPushable:true, blockView:true, canStandOn:true}
       };
    
    var itemFactory = new PerspectiveItemFactory(0, 25, 15, itemTemplates, baseSummary);
   
    var coverLayer = document.getElementById("persCoverLayer");
    var persModel = new PerspectiveGridModel(itemFactory);

	var playArea = wrapElementById("persPlayArea");
    var persView = new PerspectiveGridView(persModel, itemFactory, 16, 26, 0, 0, 25, 15);
	playArea.appendChild(persView);
   
    gController = new GameController(background, itemFactory, persModel, persView);

    updateLayout();
    gWindow.onresize = updateLayout;

	gController.start();
}

function updateLayout()
{
    var bbox = document.getElementById("baseBG").getBBox();
    gController.editLayer.childConstraints = bbox;
    
    // Game board - centre and scale
    var boardWidth = 375; 
    var boardHeight = 330;
    var boardAreaWidth = bbox.width;
    var boardAreaHeight = bbox.height;
    
    var scaleX = boardAreaWidth / boardWidth;
    var scaleY = boardAreaHeight / boardHeight;
    
    var scale = (scaleX < scaleY) ? scaleX : scaleY;
    var xOffset = (boardAreaWidth - boardWidth * scale) / 2;
    var yOffset = (boardAreaHeight - boardHeight * scale) / 2;
    
    gController.view.setBounds(bbox);

    // Set the login and logout areas
    gController.loginController.loginGroup.setPosition((bbox.width - 300) / 2, (bbox.height - 150) / 2);

    // Set the loading notification
    var loadingNotification = document.getElementById("loadingNotification");
    loadingNotification.children[0].setAttribute("x", bbox.width / 2 - 40);
    loadingNotification.children[0].setAttribute("y", bbox.height / 2 - 20);

    loadingNotification.children[1].setAttribute("x", bbox.width / 2 - 30);
    loadingNotification.children[1].setAttribute("y", bbox.height / 2);

}

