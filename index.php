<?php
header('Content-Type: image/svg+xml');
echo "<?xml version='1.0' encoding='UTF-8'?>";
?>

<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" onload="init()" onmousemove="dragndrop_Move(evt)" onmouseup="dragndrop_End(evt)">
<title>Mezzacotta World</title>
<desc>
	A turn-based puzzle game
	by Andrew Shellshear
</desc>

<script type="text/ecmascript" xlink:href="js/mw.js"/>

<defs id="defs_external">
	<circle id="radioCover" cx="20" cy="20" r="20" fill="white" stroke="none" opacity="0"/>
	<g id="radioNormal">
		<circle cx="20" cy="20" r="20" fill="white" stroke="black" stroke-width="3"/>
	</g>
	<g id="radioNormalOver">
		<circle cx="20" cy="20" r="20" fill="white" stroke="red" stroke-width="3"/>
	</g>
	<g id="radioSelected">
		<circle cx="20" cy="20" r="20" fill="white" stroke="black" stroke-width="3"/>
		<circle cx="20" cy="20" r="13" fill="black"/>
	</g>
	<g id="radioSelectedOver">
		<circle cx="20" cy="20" r="20" fill="white" stroke="red" stroke-width="3"/>
		<circle cx="20" cy="20" r="13" fill="black"/>
	</g>
</defs>

<rect id="baseBG" x="0%" y="0%" width="100%" height="100%" fill="black"/>

<g id="persMapArea" display="none">
    <g id="persPlayArea">
        <svg x="0" y="0" width="375" height="330">
            <g id="persObjectLayer"/>
            <g id="persCoverLayer"/>
            <g id="coverLayer2"/>
        </svg>
    </g>
</g>
<g id="editLayer">
</g>
<g id="overLayer">
</g>
<g id="loadingNotification" display="none">
    <rect width="100" height="30" fill="lightGreen" stroke="white"/>
    <text font-size="20" fill="black">Loading...</text>
</g>

</svg>