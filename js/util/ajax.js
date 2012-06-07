// Ajax functions.
function ajax_get(myurl, myCallback) 
{
    var xmlRequest = null;
    
    if (window.XMLHttpRequest) 
    {
        xmlRequest = new XMLHttpRequest();
    }
    else
    {
        xmlRequest = new ActiveXObject("Microsoft.XMLHTTP");
    }
    
    if (xmlRequest != null)
    {
        function XMLHttpRequestCallback() 
        {
            if (xmlRequest.readyState == 4) 
            {
                if (xmlRequest.status == 200) 
                {
                    myCallback(xmlRequest.responseXML.documentElement, xmlRequest.responseXML);
                }
            }
        }
        
        xmlRequest.open("GET", myurl, true);
        xmlRequest.onreadystatechange = XMLHttpRequestCallback;
        xmlRequest.send(null);

    }
}


function ajax_post(myurl, myCallback, params) 
{ 
    if (window.XMLHttpRequest) 
    {
        var xmlRequest = new XMLHttpRequest();

        function XMLHttpRequestCallback() 
        {
            if (xmlRequest.readyState == 4) 
            {
                if (xmlRequest.status == 200) 
                {
                    myCallback(xmlRequest.responseXML.documentElement, xmlRequest.responseXML);
                }
            }
        }        

        xmlRequest.open("POST", myurl, true);

        //Send the proper header information along with the request
        xmlRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        
        if (params != null)
            xmlRequest.setRequestHeader("Content-length", params.length);
        xmlRequest.setRequestHeader("Connection", "close");

        xmlRequest.onreadystatechange = XMLHttpRequestCallback;
        xmlRequest.send(params);

    }
}
