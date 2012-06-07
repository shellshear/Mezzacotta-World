// Game controller for the hex version
function HexGameController(background, templateButtons, model, view, idMap)
{
    HexGameController.baseConstructor.call(this, background, templateButtons, model, view, idMap);
}

KevLinDev.extend(HexGameController, GameController);

HexGameController.prototype.parseKeypress = function(charCode)
{
    switch (charCode)
    {
    case 97:
       // a
       this.moveCurrentChar(5);
       break;
   
    case 100:
       // d
       this.moveCurrentChar(2);
       break;
   
    case 119:
       // w
       this.moveCurrentChar(0);
       break;

    case 101:
       // e
       this.moveCurrentChar(1);
       break;

    case 122:
       // z
       this.moveCurrentChar(4);
       break;

    case 120:
       // x
       this.moveCurrentChar(3);
       break;
    }
}

   

