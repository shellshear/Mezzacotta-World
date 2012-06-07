// Overall opacity of the shadows - if this is less than 1, shadows aren't as dark.
var gOpacityScaleFactor = 1.0;

// ShadowElement holds the element and its shadow (an svg element, usually the 
// boundary of the element with a black fill).
// Note that this is distinct from an item: an item may contain many
// shadowElements (eg. the perspective base element has two verticals, 
// each with their own shadow)
// The showInvisible parameter determines whether the element is hidden
// or merely darkened when it is not visible due to lighting conditions.
function ShadowElement(base, shadow, showInvisible)
{
    ShadowElement.baseConstructor.call(this, "g");

    this.setBaseElement(base);
    this.setShadowElement(shadow);
    this.showInvisible = showInvisible;
    if (!this.showInvisible)
        this.hide();
    
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

ShadowElement.prototype.setShadowElement = function(shadow)
{
    if (this.shadow != null)
        this.shadow.detach();

    this.shadow = shadow;
    if (this.shadow != null)
    {
        this.prependChild(this.shadow);
    }
}

ShadowElement.prototype.setShadow = function(opacity)
{
    this.opacity = opacity;

    if (this.isVisible)
    {
        this.setOpacity(this.opacity);
    }
}

// If the shadow element isn't visible, either hide it or
// show it as dark no matter what the light level
ShadowElement.prototype.setVisible = function(isVisible)
{
    this.isVisible = isVisible;
    
    if (this.isVisible)
    {
        this.show();
        this.setOpacity(this.opacity);
    }
    else if (this.showInvisible)
    {
        this.show();
        this.setOpacity(1.0);
    }
    else
        this.hide();
}

ShadowElement.prototype.setOpacity = function(opacity)
{
    opacity *= gOpacityScaleFactor;
    
    if (this.base != null)
    {
        this.base.setAttribute("opacity", 1.0 - opacity);
    }
    if (this.base != null)
    {
        if (opacity == 1.0)
        {
            // We can hide the base because the shadow is fully covering it anyway.
            // If there's no shadow element, we hide it anyway 'cause otherwise
            // it'll show up as fully lit even though it can't be seen.
            this.base.hide();
        }
        else
        {
            this.base.show();
        }
    }
}