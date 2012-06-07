// A grid model where the layout is hexagonal.
function HexGridModel(ambientLight, itemProperties)
{
    HexGridModel.baseConstructor.call(this, ambientLight, itemProperties);
}

KevLinDev.extend(HexGridModel, GridModel);

