// StateDirectionShadowElement handles svg from a graphics file that has the following layout:
// <g id="itemId">
//     <g id="itemId_def" state="def">
//         <g id="itemId_def_def" [direction="dirn"]>
//             [graphics describing default state, with default direction]
//             <path id="itemId_def_def_shadow" d="" type="shadow"/>
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
function StateDirectionShadowElement(base, state, direction, showInvisible)
{
    StateDirectionShadowElement.baseConstructor.call
        (this, base, null, showInvisible);   

    this.setState(state);
    this.setDirection(direction);
}

KevLinDev.extend(StateDirectionShadowElement, ShadowElement);

// Show the graphics corresponding to the state, and hide the others.
StateDirectionShadowElement.prototype.setState = function(state)
{
    this.state = state;
    this.stateSVG = null;
    
    for (var i in this.base.childNodes)
    {
        var currState = this.base.childNodes[i];
        if (currState.hasAttribute("state") && currState.getAttribute("state") == state)
        {
        	currState.show();
        	currState.removeAttribute("style"); // Hack - Inkscape will include "display=none" in the style attribute, so we need to remove it.
            this.stateSVG = currState;
        }
        else
        {
            currState.hide();
        }
    }
}

// Show the graphics corresponding to the direction, and hide the others.
// Show the first direction that is contained in the direction string.
// The intention is that if the direction requested is "f" for forward, 
// a graphic with direction "fb" (eg. a door) would match.
StateDirectionShadowElement.prototype.setDirection = function(direction)
{
    this.direction = direction;
    this.directionSVG = null;
    
    if (this.stateSVG != null)
    {
        for (var i in this.stateSVG.childNodes)
        {
            var currDirn = this.stateSVG.childNodes[i];
            if (currDirn.hasAttribute("direction") && currDirn.getAttribute("direction").indexOf(direction) >= 0)
            {
            	currDirn.show();
            	currDirn.removeAttribute("style"); // Hack - Inkscape will include "display=none" in the style attribute, so we need to remove it.
                this.directionSVG = currDirn;
            }
            else
            {
                currDirn.hide();
            }
        }
    }
    
    if (this.directionSVG != null)
    {
        // Good, we've found a valid graphic. Look for a shadow.
        for (var i in this.directionSVG.childNodes)
        {
            var currGraphic = this.directionSVG.childNodes[i];
            if (currGraphic.hasAttribute("type") && currGraphic.getAttribute("type") == "shadow")
            {
                currGraphic.show();
                currGraphic.removeAttribute("style"); // Hack - Inkscape will include "display=none" in the style attribute, so we need to remove it.
                this.setShadowElement(currGraphic);
                break;
            }
        }
    }
}

StateDirectionShadowElement.prototype.setShadowElement = function(shadow)
{
    StateDirectionShadowElement.superClass.setShadowElement.call(this, shadow);   

    // If the direction element has any transforms, apply them to the shadow element
    // as well, because it's been moved from the direction group.
    // (It got separated because we sometimes want to show the shadow but not the element.)
    if (this.shadow != null && this.directionSVG != null)
    {
        // There may be some transforms on the base
        // that need to be applied to the shadow
        if (this.directionSVG.hasAttribute("transform"))
        {
            this.shadow.setAttribute("transform", this.directionSVG.getAttribute("transform"));
        }
    }
}

