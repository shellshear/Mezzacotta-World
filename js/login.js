function submitLogin(event)
{
    // Erase any existing (potentially wrong) cookies just in case.
    eraseCookie("mtg_login");
    eraseCookie("mtg_password");

    var uploadRoot = getUploadRoot(event.target);
    if (!uploadRoot)
        return;
        
    var http_string = "update.php";
    var params = getServerParams(uploadRoot);
    
    // Replace the update node with an updating message
    document.getElementById('passwordArea').style.display = "none";
    document.getElementById('passwordStatusArea').style.display = "";
    
    ajax_post(http_string, 
    function(xml) 
    {
        receiveLoginFromServer(uploadRoot, xml);
    }, 
    params);
}

// Receive xml from the server, and apply it to syncNode.
function receiveLoginFromServer(syncNode, xml)
{
    // We have received info from the server, so need to update
    // Expect everything to be wrapped in a "result" element.
    if (xml.nodeName != "result" || xml.childNodes == null)
    {
        alert(xmlToString(xml));
        return;
    }
       
    if (xml.getAttribute('status') == 1)
    {
        // login successful
        createCookie("mtg_login", xml.getAttribute('login'), 30);
        createCookie("mtg_password", xml.getAttribute('password'), 30);
        
        document.getElementById('loggedInArea').style.display = "";
        document.getElementById('passwordArea').style.display = "none";
        document.getElementById('passwordStatusArea').style.display = "none";
        document.getElementById('loginFailArea').innerHTML = "";
        document.getElementById('usernameArea').innerHTML = xml.getAttribute('login');

        document.getElementById('loggedInArea').setAttribute("user_id", xml.getAttribute('user_id'));
    }
    else
    {
        document.getElementById('loggedInArea').style.display = "none";
        document.getElementById('passwordArea').style.display = "";
        document.getElementById('passwordStatusArea').style.display = "none";
        document.getElementById('loginFailArea').innerHTML = "Login failed";

        document.getElementById('loggedInArea').removeAttribute("user_id");
    }
}

function user_logout()
{
    eraseCookie("mtg_login");
    eraseCookie("mtg_password");
    document.getElementById('loggedInArea').style.display = "none";
    document.getElementById('passwordArea').style.display = "";
    document.getElementById('passwordStatusArea').style.display = "none";
    document.getElementById('loginFailArea').innerHTML = "";
    document.getElementById('usernameArea').innerHTML = "";
    document.getElementById('loginInputArea').value = "";
    document.getElementById('passwordInputArea').value = "";
    
    document.getElementById('loggedInArea').removeAttribute("user_id");
}