<?php

/*
 * Update interface
 *
 * _POST:
 *     addworld=mapname&owner_id=id // add a world with the specified map name for the specified owner
 *     load=map_id // load the specified map
 *     saveitems
 *     adduser
 *     save
 *     changemapname=newmapname&old_id=id // change the name of the map with the specified id
 */

include("dbinfo.inc.php");
require "access.php";

header('Expires: Fri, 25 Dec 1980 00:00:00 GMT'); // time in the past
header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . 'GMT');
header('Cache-Control: no-cache, must-revalidate');
header('Pragma: no-cache');
header('Content-Type: text/xml');

mysql_connect($dbhost, $username, $password);
@mysql_select_db($database) or die("<?xml version='1.0'?><result status='0'>Unable to select database</result>");

$xmlOutput = new DOMDocument();
$xmlOutput->appendChild($xmlOutput->createElement('result'));

$mtg_access = new LoginAccess();
$mtg_error = "";

/*
if (isset($_COOKIE["mtg_login"]) && isset($_COOKIE['mtg_password']))
{
    // Cookies have already been set, so grab the username and password off them.
    $mtg_login = $_COOKIE["mtg_login"];
    $mtg_password = $_COOKIE['mtg_password'];
    
    $mtg_access->updateHash($_COOKIE["mtg_login"], $_COOKIE['mtg_password']);
    $mtg_access->check();
}
*/

// Requests that don't require login go here
if (isset($_REQUEST['loginStatus']))
{
    if ($mtg_access->login_status > 0)
    {
        $xmlOutput->firstChild->setAttribute("status", "1");
        $xmlOutput->firstChild->setAttribute("login", $mtg_access->login);
        $xmlOutput->firstChild->setAttribute("password", $mtg_access->passwordhash);
        $xmlOutput->firstChild->setAttribute("user_id", $mtg_access->user_id);
        $xmlOutput->firstChild->setAttribute("curr_map", $mtg_access->curr_map);
        echo $xmlOutput->saveXML();
        return;
    }

    // Error
    set_error_status($xmlOutput, "Not logged in");
    echo $xmlOutput->saveXML();
    return;
}

// From here on down, requests require a correct login.
if ($mtg_access->login_status <= 0)
{
    if (isset($_REQUEST['login']) && isset($_REQUEST['password'])) 
    {
        $mtg_access->updatePlain($_REQUEST['login'], $_REQUEST['password']);
        if (!$mtg_access->check())
        {
            set_error_status($xmlOutput, "Login incorrect");
            echo $xmlOutput->saveXML();
            return;
        }
    }
    else
    {
        set_error_status($xmlOutput, "Need to provide login details");
        echo $xmlOutput->saveXML();
        return;
    }
}

if (isset($_REQUEST['addworld']))
{
    // Create a user world with the specified name that belongs to the specified user
    // ?addworld=mapname&owner_id=id
    if ($mtg_access->user_status > 0)
    {
        $mapname = mysql_real_escape_string($_REQUEST['addworld']);
        $owner_id = mysql_real_escape_string($_REQUEST['owner_id']);

        $query = "INSERT INTO map (owner_id, mapname) VALUES ('$owner_id', '$mapname')";
        $result = mysql_query($query);

        if (!$result)
        {
            set_error_status($xmlOutput, cleanXML(mysql_error(), ENT_NOQUOTES));
            echo $xmlOutput->saveXML();
            return;
        }
        
        // Return map_id of the new map
        $new_map_id = mysql_insert_id();
        $xmlOutput->firstChild->setAttribute("map_id", $new_map_id);

		// Also add to the list of visited maps for that user
		set_visited_world($owner_id, $new_map_id);

        $xmlOutput->firstChild->setAttribute("status", "1");
        echo $xmlOutput->saveXML();  
        return;
    }
    else
    {
        set_error_status($xmlOutput, "Only admins can create new worlds.");
        echo $xmlOutput->saveXML();
        return;
    }
}
else if (isset($_REQUEST['changemapname']))
{
	$newmapname = mysql_real_escape_string($_REQUEST['changemapname']);
	$map_id = mysql_real_escape_string($_REQUEST['map_id']);

	$query = "SELECT owner_id FROM map WHERE map_id='$map_id'";
    $result = mysql_query($query);

    if (!$result)
    {
        set_error_status($xmlOutput, "Couldn't find world with id $map_id");
        echo $xmlOutput->saveXML();
        return;
    }

	$owner_id = mysql_result($result, 0, "owner_id");
    if ($owner_id == $mtg_access->user_id || $mtg_access->user_status > 0)
    {
		$query = "UPDATE map SET mapname='$newmapname' WHERE map_id='$map_id'";
	    $result = mysql_query($query);
		
        if (!$result)
        {
            set_error_status($xmlOutput, cleanXML(mysql_error(), ENT_NOQUOTES));
            echo $xmlOutput->saveXML();
            return;
        }
        
		$xmlOutput->firstChild->setAttribute("status", "1");
		$xmlOutput->firstChild->setAttribute("map_id", $map_id);
		$xmlOutput->firstChild->setAttribute("map_name", $newmapname);
        echo $xmlOutput->saveXML();  
        return;
	}
	else
	{
        set_error_status($xmlOutput, "You're not allowed to update the name of that world.");
        echo $xmlOutput->saveXML();
        return;
	}
}
else if (isset($_REQUEST['load']))
{
    $map_id = $_REQUEST['load'];

	$query = "SELECT map, owner_id, mapname FROM map WHERE map_id='$map_id'";
    $result = mysql_query($query);
    
    if ($result && mysql_numrows($result) == 1)
    {
		$result_status = 0;
        $owner_id = mysql_result($result, 0, "owner_id");
        $editable = 0;
        if ($owner_id == $mtg_access->user_id || $mtg_access->user_status > 0)
            $editable = 1;

		// If the user has specified to save progress, save the new start map id.
		if (isset($_REQUEST['save_level']) && $_REQUEST['save_level'] > 0)
		{
		    $query = "UPDATE user SET curr_map='$map_id' WHERE id='" . $mtg_access->user_id . "' AND can_update='1'";
		    $save_level_result = mysql_query($query);
			if (!$save_level_result)
			{
				// TODO: Some way of reporting this
			}
			else
			{
				// Save the level on the list of visited maps
				set_visited_world($mtg_access->user_id, $map_id);
			}
		}
		
		$items_result = null;
		// Get all the saved items if requested
		if (isset($_REQUEST['get_items']) && $_REQUEST['get_items'] == "1")
		{
			$query = "SELECT map_id, avatar_index, item_id, item_xml FROM map_item WHERE user_id='" . $mtg_access->user_id . "'";
			$items_result = mysql_query($query);
		}
		
		// Get all the visitable levels if requested
		$visit_result = null;
		if (isset($_REQUEST['get_visit']) && $_REQUEST['get_visit'] == "1")
		{
			if ($mtg_access->user_status > 0)
			{
				// Admin can visit any world
				$query = "SELECT map.map_id, map.owner_id, map.mapname, user.username FROM map INNER JOIN user ON map.owner_id=user.id";
			}
			else
			{
				$query = "SELECT map.map_id, map.owner_id, map.mapname, map.public, user.username FROM (SELECT map_id FROM visited_map WHERE user_id='" . $mtg_access->user_id . "') AS visited INNER JOIN map ON visited.map_id=map.map_id INNER JOIN user ON map.owner_id=user.id";
			}
			$visit_result = mysql_query($query);
		}
		
        echo "<?xml version='1.0'?><result status='1' owner_id='$owner_id' map_id='$map_id' map_name='" . stripslashes(mysql_result($result, 0, "mapname")) . "' editable='$editable'>" . stripslashes(mysql_result($result, 0, "map"));

		if ($items_result)
		{
			echo "<items>";
			for ($i = 0; $i < mysql_num_rows($items_result); $i++)
			{
				$item_id = mysql_result($items_result, $i, "item_id");
				$avatar_index = mysql_result($items_result, $i, "avatar_index");
				$map_id = mysql_result($items_result, $i, "map_id");
				$item_xml = stripslashes(mysql_result($items_result, $i, "item_xml"));
				
				echo "<item item_id='$item_id' avatar_index='$avatar_index' map_id='$map_id'>$item_xml</item>";
				
			}
			echo "</items>";
		}

		if ($visit_result)
		{
			echo "<worlds>";
			for ($i = 0; $i < mysql_num_rows($visit_result); $i++)
			{
				$map_id = mysql_result($visit_result, $i, "map_id");
				$mapname = mysql_result($visit_result, $i, "mapname");
				$owner_id = mysql_result($visit_result, $i, "owner_id");
				$owner_name = mysql_result($visit_result, $i, "user.username");
				$is_accessable = mysql_result($visit_result, $i, "public");
				if ($owner_id == $mtg_access->user_id)
				{
					$is_accessable = "1";
				}
				
				echo "<visit map_id='$map_id' map_name='$mapname' owner_id='$owner_id' owner_name='$owner_name' access='$is_accessable'/>";
			}
			echo "</worlds>";
		}

		echo "</result>";  

        return;
    }
    else if (mysql_numrows($result) == 0)
    {
        set_error_status($xmlOutput, "No saved map");
        echo $xmlOutput->saveXML();
        return;
    }
    else
    {
        set_error_status($xmlOutput, cleanXML(mysql_error(), ENT_NOQUOTES));
        echo $xmlOutput->saveXML();
        return;
    }
}
else if (isset($_REQUEST['saveitems']))
{
	// Save the requested items.
	
	if ($mtg_access->can_update != "1")
	{
        set_error_status($xmlOutput, cleanXML("This user is not allowed to save items.", ENT_NOQUOTES));
        echo $xmlOutput->saveXML();
        return;
	}

	$map_id = $mtg_access->curr_map;
	$items_added = 0;
	$items_deleted = 0;
	$items_updated = 0;
	$items_skipped = 0;
	
	for ($i = 0; isset($_REQUEST["itemId_" . $i]); $i++)
	{
		$save_item_id = mysql_real_escape_string($_REQUEST["itemId_" . $i]);
		$save_avatar_index = mysql_real_escape_string($_REQUEST["avatarIndex_" . $i]);

		// Does the user have this item already?
		$query = "SELECT 1 FROM map_item WHERE map_id='$map_id' AND user_id='" . $mtg_access->user_id . "' AND item_id='$save_item_id' AND avatar_index='$save_avatar_index'";
		$has_items_result = mysql_query($query);
	
		if ($has_items_result && mysql_num_rows($has_items_result) > 0)
		{
			if (isset($_REQUEST["itemXML_" . $i]))
			{
				// Update
				$save_item_xml = mysql_real_escape_string($_REQUEST["itemXML_" . $i]);
				$query = "UPDATE map_item SET item_xml='$save_item_xml' WHERE user_id='" . $mtg_access->user_id . "' AND map_id='$map_id' AND item_id='$save_item_id' AND avatar_index='$save_avatar_index'";
				$update_item_result = mysql_query($query);
				
				if ($update_item_result)
				{
					$items_updated++;
					$curr_update_xml = $xmlOutput->createElement('update');
					$curr_update_xml->setAttribute("item_id", $save_item_id);
					$curr_update_xml->setAttribute("avatar_index", $save_avatar_index);
					$xmlOutput->firstChild->appendChild($curr_update_xml);
				}
			}
		    else
			{
				// delete
				$query = "DELETE FROM map_item WHERE user_id='" . $mtg_access->user_id . "' AND map_id='$map_id' AND item_id='$save_item_id' AND avatar_index='$save_avatar_index'";
				$delete_item_result = mysql_query($query);

				if ($delete_item_result)
				{
					$items_deleted++;
					$curr_update_xml = $xmlOutput->createElement('delete');
					$curr_update_xml->setAttribute("item_id", $save_item_id);
					$curr_update_xml->setAttribute("avatar_index", $save_avatar_index);
					$xmlOutput->firstChild->appendChild($curr_update_xml);
				}
			}
		}
		else
		{
			if (isset($_REQUEST["itemXML_" . $i]))
			{
				// create new
				$save_item_xml = mysql_real_escape_string($_REQUEST["itemXML_" . $i]);
				$query = "INSERT INTO map_item (user_id, map_id, avatar_index, item_id, item_xml) VALUES ('" . $mtg_access->user_id . "', '$map_id', '$save_avatar_index', '$save_item_id', '$save_item_xml')";
				$insert_item_result = mysql_query($query);

				if ($insert_item_result)
				{
					$items_added++;
					$curr_update_xml = $xmlOutput->createElement('new');
					$curr_update_xml->setAttribute("item_id", $save_item_id);
					$curr_update_xml->setAttribute("avatar_index", $save_avatar_index);
					$xmlOutput->firstChild->appendChild($curr_update_xml);
				}
			}
		    else
			{
				// insert request, but no value - skip it.
				$items_skipped++;
			}
		}
	}
	
	$xmlOutput->firstChild->setAttribute("added", $items_added);
    $xmlOutput->firstChild->setAttribute("deleted", $items_deleted);
    $xmlOutput->firstChild->setAttribute("updated", $items_updated);
    $xmlOutput->firstChild->setAttribute("skipped", $items_skipped);
    $xmlOutput->firstChild->setAttribute("status", "1");
    echo $xmlOutput->saveXML();  
    return;
}
else if (isset($_REQUEST['adduser']))
{
    if ($mtg_access->user_status > 0)
    {
        $new_username = mysql_real_escape_string($_REQUEST['adduser']);
        $new_password = $_REQUEST['newpassword'];
        $newpasswordhash = sha1($new_username . $new_password);
        
        // Check if the username is taken
        $query = "SELECT id FROM user WHERE username='$new_username'";
        $result = mysql_query($query);
        
        if (!$result)
        {
            set_error_status($xmlOutput, cleanXML(mysql_error(), ENT_NOQUOTES));
            echo $xmlOutput->saveXML();
            return;
        }
        
        if (mysql_numrows($result) >= 1)
        {
            set_error_status($xmlOutput, "Already a user with that name");
            echo $xmlOutput->saveXML();
            return;
        }
        
        // Add the new user
        $query = "INSERT INTO user (username, password) VALUES ('$new_username', '$newpasswordhash')";
        $result = mysql_query($query);
        
        if (!$result)
        {
            set_error_status($xmlOutput, cleanXML(mysql_error(), ENT_NOQUOTES));
            echo $xmlOutput->saveXML();
            return;
        }
        
        // Return user_id of the new user
        $new_user_id = mysql_insert_id();
        $xmlOutput->firstChild->setAttribute("user_id", $new_user_id);
        $xmlOutput->firstChild->setAttribute("status", "1");
        echo $xmlOutput->saveXML();  
        return;
    }
    else
    {
        set_error_status($xmlOutput, "Users can't add other users!");
        echo $xmlOutput->saveXML();
        return;
    }
}
else if (isset($_REQUEST['save']))
{
    $map_id = $_REQUEST['save'];
    $map = mysql_real_escape_string($_REQUEST['map']);

    $query = "SELECT map,owner_id FROM map WHERE map_id='$map_id'";
    $result = mysql_query($query);
    
    if (!$result)
    {
        set_error_status($xmlOutput, cleanXML(mysql_error(), ENT_NOQUOTES));
        echo $xmlOutput->saveXML();
        return;
    }

    if (mysql_numrows($result) == 1)
    {
        $maps_owner_id = mysql_result($result, 0, "owner_id");
        
        if ($maps_owner_id == $mtg_access->user_id || $mtg_access->user_status > 0)
        {
            $query = "UPDATE map SET map='$map' WHERE map_id='$map_id'";
            $result = mysql_query($query);
        }
        else
        {
            set_error_status($xmlOutput, "You are not authorised to update this map.");
            echo $xmlOutput->saveXML();
            return;
        }
    }
    else if (mysql_numrows($result) == 0)
    {
        if ($mtg_access->user_status > 0)
        {
            $query = "INSERT INTO map (owner_id, map) VALUES ('" . $mtg_access->user_id . "', '$map')";
            $result = mysql_query($query);

            if ($result)
            {
                // Also return the newly minted map id
                $new_map_id = mysql_insert_id();
                $xmlOutput->firstChild->setAttribute("map_id", $new_map_id);
            }
        }
        else
        {
            // Can't create a new map unless you are admin
            set_error_status($xmlOutput, "Users can't create new maps! Naughty.");
            echo $xmlOutput->saveXML();
            return;
        }
    }
    
    if ($result)
    {
        $xmlOutput->firstChild->setAttribute("status", "1");
        echo $xmlOutput->saveXML();  
        return;
    }
    else
    {
        set_error_status($xmlOutput, cleanXML(mysql_error(), ENT_NOQUOTES));
        echo $xmlOutput->saveXML();
        return;
    }
}
else if (isset($_REQUEST['login']) && isset($_REQUEST['password'])) 
{
    $mtg_access->updatePlain($_REQUEST['login'], $_REQUEST['password']);

    if ($mtg_access->check())
    {
        $xmlOutput->firstChild->setAttribute("status", "1");
        $xmlOutput->firstChild->setAttribute("login", $mtg_access->login);
        $xmlOutput->firstChild->setAttribute("password", $mtg_access->passwordhash);
        $xmlOutput->firstChild->setAttribute("user_id", $mtg_access->user_id);
        $xmlOutput->firstChild->setAttribute("curr_map", $mtg_access->curr_map);
        echo $xmlOutput->saveXML();
    
        return;
    }
    else
    {
        set_error_status($xmlOutput, "Login incorrect");
        echo $xmlOutput->saveXML();
        return;
    }
}

function set_error_status($xmlOutput, $message)
{
    $xmlOutput->firstChild->setAttribute("status", "0");
    $xmlOutput->firstChild->appendChild(
        $xmlOutput->createTextNode($message));
}

function cleanXML($str) 
{
    $result = null;

    for ($i = 0; $i < strlen($str); $i++) 
    {
        $ord = ord($str[$i]);

        if (($ord > 0 && $ord < 32) || ($ord >= 127)) 
        {
            $result .= "&amp;#{$ord};";
        }
        else 
        {
            switch ($str[$i]) 
            {
                case '<':
                    $result .= '&lt;';
                    break;
                case '>':
                    $result .= '&gt;';
                    break;
                case '&':
                    $result .= '&amp;';
                    break;
                case '"':
                    $result .= '&quot;';
                    break;
                default:
                    $result .= $str[$i];
            }
        }
    }

    return $result;
}

function set_visited_world($owner_id, $map_id) 
{
	$query = "SELECT 1 FROM visited_map WHERE user_id='$owner_id' AND map_id='$map_id'";
	$visited_result = mysql_query($query);

	if ($visited_result && mysql_numrows($visited_result) == 0)
	{
		$query = "INSERT INTO visited_map (user_id, map_id) VALUES ('$owner_id', '$map_id')";
		$new_visited_result = mysql_query($query);
	}
}

?>
