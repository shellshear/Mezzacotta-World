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

