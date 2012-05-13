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
    for (var i in this.actionListeners)
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
    for (var i in this.actionListeners)
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
    for (var i in this.resizeListeners)
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
    for (var i in this.resizeListeners)
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
    for (var i in this.childNodes)
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

    for (var i in this.childNodes)
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

// getBBox
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

function SVGRoot(x, y, width, height)
{
    SVGComponent.baseConstructor.call(this, "svg", {x:x, y:y, width:width, height:height});
}

KevLinDev.extend(SVGRoot, SVGElement);

SVGRoot.prototype.setPosition = function(x, y)
{
    if (x == null)
       x = 0;

    if (y == null)
       y = 0;

    this.svg.setAttribute("x", x);
    this.svg.setAttribute("y", y);
}

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
    
    for (var i in this.auxiliaryComponents)
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
    
    for (var i in this.auxiliaryComponents)
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
    for (var i in this.focusListeners)
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
    for (var i in this.focusListeners)
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
    for (var i in this.actionListeners)
    {
     str += "<listener src='" + this.actionListeners[i].src + "'/>";
    }
    str += "</base>";

    return str;
};

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
		var normalButton = new SVGElement("rect", {width:10, height:10, rx:2, stroke:"black", fill:"none"});
		var normalMouseoverButton = new SVGElement("rect", {width:10, height:10, rx:2, stroke:"red", fill:"none"});
		var normalCoverButton = new SVGElement("rect", {width:10, height:10, rx:2, stroke:"none", fill:"white", opacity:0});

		this.params.normalElements = {normal:normalButton, mouseover:normalMouseoverButton, cover:normalCoverButton};
	}

	// Default selected apperance
	if (this.params.selectedElements == null)
	{
		var selectedButton = new SVGElement("rect", {width:10, height:10, rx:2, stroke:"black", fill:"none"});
		var selectedMouseoverButton = new SVGElement("rect", {width:10, height:10, rx:2, stroke:"red", fill:"none"});
		var selectedCoverButton = new SVGElement("rect", {width:10, height:10, rx:2, stroke:"none", fill:"white", opacity:0});

 		this.params.selectedElements = {normal:selectedButton, mouseover:selectedMouseoverButton, cover:selectedCoverButton};
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
    if (this.appearance)
        this.appearance.detach();

    if (!newAppearance)
        return;        
    
    this.appearance = newAppearance;
    this.prependChild(this.appearance);
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
            switch (this.layoutParams.direction)
            {
            case "left":
            case "right":
                this.maxOrthogonal = Math.max(this.maxOrthogonal, this.childNodes[i].getBBox().height);
                break;
            case "up":
            case "down":
                this.maxOrthogonal = Math.max(this.maxOrthogonal, this.childNodes[i].getBBox().width);
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
            switch (this.layoutParams.direction)
            {
            case "left":
            case "right":
                sumLength += this.childNodes[i].getBBox().width;
                break;
            case "up":
            case "down":
                sumLength += this.childNodes[icurrentX].getBBox().height;
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
   
	this.setSliderPosition(this.params.startPosition * this.params.sliderLength);
}

KevLinDev.extend(Slider, SVGComponent);

Slider.prototype.setDragPosition = function(x, y)
{
    this.setSliderPosition(this.params.orientation == "h" ? x : y);
}

Slider.prototype.setDragEnd = function()
{
}

// Set the Slider position
Slider.prototype.setSliderPosition = function(position)
{
    this.position = position < 0 ? 0 : (position > (this.params.sliderLength - this.params.draggerWidth) ? (this.params.sliderLength - this.params.draggerWidth) : position);
    
    if (this.params.orientation == "h")
    {
        this.scrollTop.setPosition(this.position, 0);
    }
    else
    {
        this.scrollTop.setPosition(0, this.position);
    }

    this.tellActionListeners(this, {type:"dragSlider", position:this.position / (this.params.sliderLength - this.params.draggerWidth)});
    
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
	    
		this.setSliderPosition(currPos);
	}
}


// Scrollbar
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
    
    this.position = 0;
    this.scrollbarLength = 0;
    this.dragbarLength = 0;
    this.dragbarProportion = 0;
}

KevLinDev.extend(Scrollbar, FlowLayout);

Scrollbar.prototype.update = function(scrollbarLength, dragbarProportion)
{
    this.scrollbarLength = scrollbarLength;
    this.dragbarProportion = dragbarProportion < 0 ? 0 : (dragbarProportion > 1 ? 1 : dragbarProportion);
    this.dragbarLength = this.dragbarProportion * scrollbarLength;
   
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
   
    this.scrollTop.refreshLayout();
    this.refreshLayout();
}

Scrollbar.prototype.setDragPosition = function(x, y)
{
    this.setScrollbarPosition(this.params.orientation == "h" ? x : y);
}

Scrollbar.prototype.setDragEnd = function()
{
}

// Set the scrollbar position, as a number between 0 and 1
Scrollbar.prototype.setScrollbarPosition = function(position)
{
    this.position = position < 0 ? 0 : (position > (this.scrollbarLength - this.dragbarLength) ? (this.scrollbarLength - this.dragbarLength) : position);
    
    if (this.params.orientation == "h")
    {
        this.scrollTop.setPosition(this.position, 0);
    }
    else
    {
        this.scrollTop.setPosition(0, this.position);
    }

    this.tellActionListeners(this, {type:"dragScrollbar", position:this.position / (this.scrollbarLength - this.dragbarLength)});
    
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
        }
        else if (src.src == "fwdButton")
        {            
            this.setScrollbarPosition(this.position + this.dragbarLength / 2);
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

    this.mask = new SVGRoot(0, 0, params.width, params.height);
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

ScrollbarRegion.prototype.refreshLayout = function()
{
    var bbox = this.contents.getBBox();
    this.xExtent = bbox.x + bbox.width;
    this.yExtent = bbox.y + bbox.height;
   
    var showH = (this.xExtent > this.params.width);
    
    var scrollSpace = this.params.scrollbarWidth + this.params.scrollbarGap;
    
    // showV may be required if we just had to showH
    var showV = (this.yExtent > (showH ? this.params.height - scrollSpace : this.params.height));
    // showH needs to be recalculated - it may be required if we just had to showV
    showH = (this.xExtent > (showV ? this.params.width - scrollSpace : this.params.width));
    
    this.effectiveWidth = showV ? this.params.width - scrollSpace : this.params.width;
    this.effectiveHeight = showH ? this.params.height - scrollSpace : this.params.height;

    var scrollbarWidth = this.effectiveWidth - 2 * this.params.scrollbarWidth;
    var hProportion = this.effectiveWidth / this.xExtent;
    this.hBar.update(scrollbarWidth, hProportion);
    this.hBar.setPosition(0, this.effectiveHeight + this.params.scrollbarGap);

    var scrollbarHeight = this.effectiveHeight - 2 * this.params.scrollbarWidth;
    var vProportion = this.effectiveHeight / this.yExtent;
    this.vBar.update(scrollbarHeight, vProportion);
    this.vBar.setPosition(this.effectiveWidth + this.params.scrollbarGap, 0);

    if (showH)
    {
       this.mask.setAttribute("height", this.params.height - scrollSpace);
       this.hBar.show();
    }
    else
    {
        this.contents.setPosition(this.contents.x, 0);
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
        this.contents.setPosition(this.contents.x, 0);
        this.mask.setAttribute("width", this.params.width);
        this.vBar.hide();
    }
}

ScrollbarRegion.prototype.doAction = function(src, evt)
{
    if (evt.type == "dragScrollbar")
    {
       if (src.params.orientation == "h")
       {
           this.contents.setPosition(-(this.xExtent - this.effectiveWidth) * evt.position, this.contents.y);
       }
       else
       {
           this.contents.setPosition(this.contents.x, -(this.yExtent - this.effectiveHeight) * evt.position);
       }
    }
}

ScrollbarRegion.prototype.notifyResize = function(src)
{
    ScrollbarRegion.superClass.notifyResize.call(this, src);
	this.refreshLayout();
}

// We need to override the getBBox, because as far as other elements are concerned, we're
// always the same size.
ScrollbarRegion.prototype.getBBox = function()
{
	return {x:this.x, y:this.y, width:this.params.width, height:this.params.height};
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
        if (x == null)
            x = 0;

        y = localStorage.getItem(this.windowParams.storePrefix + "_y");
        if (y == null)
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
}