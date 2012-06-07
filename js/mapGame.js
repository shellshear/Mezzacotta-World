var gController;
var gWindow = this;

function init()
{
    var background = new Background();
    
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
    
    // itemName, itemCode, ht, wt, lightStrength, lightRadius, povRange, blockView, canStandOn, isPushable, isTakeable, isVisible

    var itemTemplates = {
        x:{itemName:"boulder01", fullname:"Large Boulder", itemCode:"x", ht:20, wt:1000, isPushable:true, blockView:true},
        X:{itemName:"tree01", fullname:"Palm Tree", itemCode:"X", ht:30, wt:400},
        ".":{itemName:"pebbles01", fullname:"Pebbles", itemCode:".", canStandOn:true},
        z:{itemName:"brazier01", fullname:"Brazier", itemCode:"z", ht:10, wt:20, lightStrength:1, lightRadius:3},
        i:{itemName:"coin01", fullname:"Coin", itemCode:"i", wt:0.1, canStandOn:true, isTakeable:true, isSaveable:true},
        k:{itemName:"key01", fullname:"Key", itemCode:"k", wt:0.1, canStandOn:true, isTakeable:true, isSaveable:true},
        j:{itemName:"ghost01", fullname:"Ghost", itemCode:"j", ht:10, povRange:4},
        G:{itemName:"golem01", fullname:"Golem", itemCode:"G", ht:20, wt:500, povRange:4, climbHeight:0},
        L:{itemName:"goblin01", fullname:"Goblin", itemCode:"L", ht:10, wt:30, povRange:4, climbHeight:5, moveTowards:["b"], scaredOf:["b"]},
        Z:{itemName:"zombie01", fullname:"Zombie", itemCode:"Z", ht:20, wt:100, povRange:4, climbHeight:0, moveTowards:["b"]},
        T:{itemName:"teleport01", fullname:"Teleport", itemCode:"T", canStandOn:true, doesTeleport:true},
        S:{itemName:"start01", fullname:"Start Square", itemCode:"S", canStandOn:true, isInvisible:true},
        b:{itemName:"avatar02", fullname:"Avatar", itemCode:"b", ht:20, wt:100, lightStrength:1, lightRadius:4, povRange:9, climbHeight:10, dropHeight:20, noEdit:true},
        B:{itemName:"barrel01", fullname:"Barrel", itemCode:"B", ht:20, wt:1000, isPushable:true, blockView:true, canStandOn:true}
       };
    
    var itemFactory = new PerspectiveItemFactory(0, 25, 15, itemTemplates, baseSummary);
    var persIDMap = makeDefaultIdMap("pers");     
   
    var coverLayer = document.getElementById(persIDMap.coverLayer);
    var persModel = new PerspectiveGridModel(itemFactory);
    var persView = new PerspectiveGridView(persModel, persIDMap, itemFactory, 16, 26, 0, 0, 25, 15);
   
    gController = new GameController(background, itemFactory, persModel, persView, persIDMap);

    updateLayout();
    gWindow.onresize = updateLayout;
}

function makeDefaultIdMap(prefix)
{
    var result = {};
   
    result.playArea = prefix + "PlayArea";
    result.updateArea = prefix + "UpdateArea";
    result.editArea = prefix + "EditArea";
    result.templateArea = prefix + "TemplateArea";
    result.buttonName = prefix + "View";
    result.buttonOutline = "images/" + prefix + "MapView.svg#" + prefix + "Outline";
    result.buttonMouseover = "images/" + prefix + "MapView.svg#" + prefix + "Mouseover";
    result.buttonSelect = "images/" + prefix + "MapView.svg#" + prefix + "Select";
    result.buttonCover = "images/" + prefix + "MapView.svg#" + prefix + "Cover";
    result.coverLayer = prefix + "CoverLayer";
    result.objectLayer = prefix + "ObjectLayer";
   
    return result;
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
    
    var playArea = document.getElementById(gController.idMap.playArea);
    playArea.setAttribute("transform", "translate(" + xOffset + "," + yOffset + ") scale(" + scale + ")");

    // Position the edit button
    //gController.editMapButton.setPosition(boardAreaWidth - 40, 5);

    // Set the login and logout areas
    gController.loginController.loginGroup.setPosition((bbox.width - 300) / 2, (bbox.height - 150) / 2);

    // Set the loading notification
    var loadingNotification = document.getElementById("loadingNotification");
    loadingNotification.children[0].setAttribute("x", bbox.width / 2 - 40);
    loadingNotification.children[0].setAttribute("y", bbox.height / 2 - 20);

    loadingNotification.children[1].setAttribute("x", bbox.width / 2 - 30);
    loadingNotification.children[1].setAttribute("y", bbox.height / 2);

}


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

   

