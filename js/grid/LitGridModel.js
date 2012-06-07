// This class applies lighting effects to the GridModel base class.
// It allows ambient light levels to be set for each contents, and
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

