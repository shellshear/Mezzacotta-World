// Overall opacity of the shadows - if this is less than 1, shadows aren't as dark.
var gLightLevelScaleFactor = 1.0;

// Keep a list of id indexes, so that we can uniquely light each ShadowElement.
var gShadowElementIdIndex = 0;

// ShadowElement 
// The showInvisible parameter determines whether the element is hidden
// or merely darkened when it is not visible due to lighting conditions.
function ShadowElement(base, showInvisible)
{
    ShadowElement.baseConstructor.call(this, "g");

    this.setBaseElement(base);
    this.showInvisible = showInvisible;
    if (!this.showInvisible)
        this.hide();
    
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
    else if (this.showInvisible)
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
}