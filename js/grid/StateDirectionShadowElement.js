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


