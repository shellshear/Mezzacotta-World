// StateDirectionShadowElement handles svg from a graphics file that has the following layout:
// <g id="itemId">
//     <g [myTag=""] [parentTag=""]>
//         <g direction="f"> // direction can be any of fblr, or combinations thereof.
//             [graphics describing default state, with default direction]
//         </g>
//         <g direction="b"/>
//         <g direction="l"/>
//         <g direction="r"/>
//     </g>
//     <g [myTag=""] [parentTag=""]/>
//         <g direction="fblr"/>
//     </g>
// </g>
// 
// The default state used is the first grandchild of the itemId group.
// If a direction is provided, find the corresponding direction.
// If tags and/or parentTags are provided, find the first match 
// 
// The myTag and parentTag attributes indicate states that should be used if those
// tags are set for the item and its parent. Their rule for use is:
// - if this.ta
function StateDirectionShadowElement(base, showInvisible, showInvisibleHidden)
{
    StateDirectionShadowElement.baseConstructor.call
        (this, base, showInvisible, showInvisibleHidden);   

	this.itemStates = []; // List of all item states, and directions
	
	this.itemState = null; // Current item state
	this.itemStateDirection = null; // Current item direction
	this.directionName = null; // Initial item direction name
	
	for (var i = 0; i < this.base.childNodes.length; ++i)
    {
        var currState = this.base.childNodes[i];

    	currState.removeAttribute("style"); // Hack - Inkscape will include "display=none" in the style attribute, so we need to remove it.
		currState.hide();
		
		var stateInfo = {};
		stateInfo.state = currState;
		
		if (currState.hasAttribute("parentTag"))
		{
			stateInfo.parentTag = currState.getAttribute("parentTag");
		}

		if (currState.hasAttribute("myTag"))
		{
			stateInfo.myTag = currState.getAttribute("myTag");
		}

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
		stateInfo.directions = directionSet;
		this.itemStates.push(stateInfo);
	}
}

KevLinDev.extend(StateDirectionShadowElement, ShadowElement);

// Show the graphics corresponding to the state, and hide the others.
// If you don't specify directionName, the existing direction will be used.
StateDirectionShadowElement.prototype.setState = function(directionName, parentTags, myTags)
{
	// If a direction name isn't provided, use the current direction
	// If no current direction has been set, choose the default of "f"
	if (directionName == null)
	{
		if (this.directionName == null)
		{
			directionName = "f";
		}
		else
		{
			directionName = this.directionName;
		}
	}
		
	
	// Update the state based on myTags and parentTags.
	// Find a state whose parentTag is in our parentTags list, 
	// and whose myTags is in our myTags list (provided the parentTag matches)
	// If there's no parentTag requirement, try to find a match with myTags.
	// If there's no requirements, choose the first state with no requirements.
	var itemTagMatched = false;
	var parentTagMatched = false;
	var result = null;

	for (var i = 0; i < this.itemStates.length; ++i)
	{
		// Item state's parentTag and myTag must be matched.
		if (this.itemStates[i].parentTag == null && this.itemStates[i].myTag == null && result == null)
		{
			// This state has no requisite tag matches.
			// Only set the result if nothing else has claimed it.
			result = this.itemStates[i];
		}
		else if (this.itemStates[i].parentTag != null && this.itemStates[i].myTag == null && !parentTagMatched && parentTags != null && parentTags.indexOf(this.itemStates[i].parentTag) >= 0)
		{
			// This state requires a parentTag match, but no myTag match.
			parentTagMatched = true;
			itemTagMatched = false; // A previous match may have been made with just an item tag.
			result = this.itemStates[i];
		}
		else if (this.itemStates[i].parentTag == null && this.itemStates[i].myTag != null && !parentTagMatched && !itemTagMatched && myTags != null && myTags.indexOf(this.itemStates[i].myTag) >= 0)
		{
			// This state requires a myTag match, but no parentTag match.
			// Ignore this if there's already a parentTag match. ParentTags matches
			// are always preferable to myTag matches.
			itemTagMatched = true;
			result = this.itemStates[i];
		}
		else if (this.itemStates[i].parentTag != null && this.itemStates[i].myTag != null && !(parentTagMatched && itemTagMatched) && parentTags != null && myTags != null && parentTags.indexOf(this.itemStates[i].parentTag) >= 0 && myTags.indexOf(this.itemStates[i].myTag) >= 0)
		{
			// This state requires both a parentTag and a myTag match.
			itemTagMatched = true;
			parentTagMatched = true;
			result = this.itemStates[i];
		}
	}
	
	// Update the state
	if (this.itemState != result) 
	{
		if (this.itemState != null)
		{
			// We're going to change states, so hide the current one.
			this.itemState.state.hide();
			
			if (this.itemDirection != null)
				this.itemDirection.hide();
		}
		
	    this.itemState = result;    
	    if (this.itemState != null)
	    {
	    	this.itemState.state.show();
	    }
	
		// Clear the existing direction
		this.setDirection(null);
	}

	this.setDirection(directionName);
}

StateDirectionShadowElement.prototype.stateMatchesTags = function(currTag, tagList)
{
	if (currTag != null && tagList != null)
	{
		for (var i = 0; i < tagList.length; ++i)
		{
			if (tagList[i] == currTag)
			{
				// Found a perfect match
				return true;
			}
		}
	}
	return false;
}

// Show the graphics corresponding to the direction, and hide the others.
// Show the first direction that is contained in the direction string.
// The intention is that if the direction requested is "f" for forward, 
// a graphic with direction "fb" (eg. a door) would match.
StateDirectionShadowElement.prototype.setDirection = function(directionName)
{
	if (this.directionName == directionName && this.directionName != null)
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


