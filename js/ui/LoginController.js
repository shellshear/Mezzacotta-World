// SVG Login controller.
// Checks update.php to see if user has cookies set for login.
// If not, brings up login box.
// Once logged in, replaces login boxes with login status and button to logout.
function LoginController(background, loginArea, username, password)
{
    LoginController.baseConstructor.call(this);

    this.background = background;

    this.listeningForResponse = false;
    this.loggedIn = false;
    this.loginArea = loginArea;
    
    // login textbox
    this.loginGroup = new SVGComponent(50, 50);
    
    var loginLabel = new SVGElement("text", {"font-size":20, fill:"white", y:20}, "username");
    this.loginGroup.appendChild(loginLabel);
    this.loginTextbox = new TextArea("login", this.background, {width:200, height:30, fill:"black", "stroke-width":3}, {"font-size":20, fill:"red", x:5, y:20}, 90, 0, {normal:{stroke:"white"}, focus:{stroke:"red"}});
    this.loginGroup.appendChild(this.loginTextbox);

    // password textbox
    var passwordLabel = new SVGElement("text", {"font-size":20, fill:"white", y:70}, "password");
    this.loginGroup.appendChild(passwordLabel);
    this.passwordTextbox = new TextArea("password", this.background, {width:200, height:30, fill:"black", "stroke-width":3}, {"font-size":20, fill:"red", x:5, y:20}, 90, 50, {normal:{stroke:"white"}, focus:{stroke:"red"}});
    this.passwordTextbox.setSecret();
    this.loginGroup.appendChild(this.passwordTextbox);
    
    // Login button
    this.loginButton = new SimpleButton("login", "rect", {width:70, height:30, rx:10, fill:"black", "stroke-width":3}, 30, 100, {normal:{stroke:"white"}, over:{stroke:"red"}, focus:{stroke:"red"}});
    this.loginButton.addSVG("text", {"font-size":20, fill:"white", x:15, y:20}, "login");
    this.loginButton.addActionListener(this);
    this.loginButton.setBackground(this.background);
    this.loginGroup.appendChild(this.loginButton);

    // "or" label
    var orLabel = new SVGElement("text", {"font-size":20, fill:"white", x:115, y:120}, "or");
    this.loginGroup.appendChild(orLabel);

    // Guest login button
    this.guestLoginButton = new SimpleButton("guestLogin", "rect", {width:140, height:30, rx:10, fill:"black", "stroke-width":3}, 150, 100, {normal:{stroke:"white"}, over:{stroke:"red"}, focus:{stroke:"red"}});
    this.guestLoginButton.addSVG("text", {"font-size":20, fill:"white", x:15, y:20}, "login as guest");
    this.guestLoginButton.addActionListener(this);
    this.guestLoginButton.setBackground(this.background);
    this.loginGroup.appendChild(this.guestLoginButton);
    

    // Status message
    this.statusLabel = new SVGElement("text", {"font-size":20, fill:"white", x:20, y:160}, "");
    this.loginGroup.appendChild(this.statusLabel);

    // Set focus listeners
    this.loginTextbox.addFocusListener(this.passwordTextbox);
    this.passwordTextbox.addFocusListener(this.loginTextbox);
    this.passwordTextbox.addFocusListener(this.loginButton);
    this.loginButton.addFocusListener(this.passwordTextbox);
    
    // Set focus ring
    this.loginTextbox.setNextFocus(this.passwordTextbox);
    this.passwordTextbox.setPreviousFocus(this.loginTextbox);
    this.passwordTextbox.setNextFocus(this.loginButton);
    this.loginButton.setPreviousFocus(this.passwordTextbox);
    
    this.loginArea.appendChild(this.loginGroup);

    // Logout group holds info on user, and a logout button
    this.logoutGroup = new FlowLayout(0, 0, {minSpacing:5});
    this.logoutGroup.appendChild(new SVGElement("text", {y:12, "font-size":12, fill:"black"}, "Logged in as:"));

    this.usernameLabel = new SVGElement("text", {y:12, "font-size":12, fill:"black"}, "");
    this.logoutGroup.appendChild(this.usernameLabel);

    this.logoutButton = new RectButton("logout", 0, 0, new SVGElement("text", {y:12, "font-size":12}, "Logout"), {fill:"lightblue", stroke:"black", rx:2}, {fill:"orange"}, {fill:"red"}, 2, false);
    this.logoutButton.addActionListener(this);
    this.logoutButton.setBackground(this.background);
    this.logoutGroup.appendChild(this.logoutButton);
    
    // Check whether we've got stored username and password
    this.login = null;
    this.password = null;
    if (window.localStorage)
    {
        this.login = localStorage.getItem('MW_Login');
        this.password = localStorage.getItem('MW_Password');
    }
    
    if (this.login != null && this.password != null)
    {
        this.submitLogin(this.login, this.password);
    }
    else
    {
        // The login and password may have been set externally by cookies,
        // so check that.
        this.checkLogin();
    }
}

KevLinDev.extend(LoginController, ActionObject);

LoginController.prototype.submitLogin = function(login, password)
{
    var http_string = "update.php";
    var params = "login=" + login + "&password=" + password;
    
    if (!this.listeningForResponse)
    {
        this.listeningForResponse = true;
    }
    
    // Give an updating message
    this.statusLabel.setValue("logging in...");
    
    var me = this;
    ajax_post(
            http_string, 
            function(xml) 
            {
                me.receiveLoginFromServer(xml);
            }, 
            params
        );
}

LoginController.prototype.checkLogin = function()
{
    var http_string = "update.php";
    var params = "loginStatus=1";
    
    // Give an updating message
    this.statusLabel.setValue("checking login status...");
    
    var me = this;
    ajax_post(
            http_string, 
            function(xml) 
            {
                me.receiveLoginFromServer(xml);
            }, 
            params
        );
}

LoginController.prototype.receiveLoginFromServer = function(xml)
{    
    if (xml.nodeName == "result" && xml.getAttribute("status") == "1")
    {
        this.user_id = xml.getAttribute("user_id");
        this.curr_map = xml.getAttribute("curr_map");
        this.usernameLabel.setValue(xml.getAttribute("login"));
        this.logoutGroup.refreshLayout();
        
        this.setLoginStatus(true);
    }
    else
    {
        // Not logged in
        this.statusLabel.setValue(xml.textContent);
        this.setLoginStatus(false);
    }
    
    this.listeningForResponse = false;
}

LoginController.prototype.doAction = function(src, evt)
{
    if (src.src == "login" && (evt.type == "click" || evt.type == "keypress"))
    {
        // Store login and password
        this.login = this.loginTextbox.textVal;
        this.password = this.passwordTextbox.secretVal;
        
        if (window.localStorage)
        {
            localStorage.setItem('MW_Login', this.login);
            localStorage.setItem('MW_Password', this.password);
        }
        
        this.submitLogin(this.login, this.password);
    }
    else if (src.src == "guestLogin" && (evt.type == "click" || evt.type == "keypress"))
    {
        this.login = "guest";
        this.password = "guest";

        this.submitLogin(this.login, this.password);
    }
    else if (src.src == "logout" && evt.type == "click")
    {
        this.statusLabel.setValue("");
        this.setLoginStatus(false);
        this.loginTextbox.setFocus(true);
    }
}  

LoginController.prototype.setLoginStatus = function(isLoggedIn)
{
    if (isLoggedIn)
    {
        this.loginGroup.hide();
        this.logoutGroup.show();
    }
    else
    {
        // Set logout
        this.user_id = null;
        this.tempLogin = null;
        this.login = null;
        this.tempPassword = null;
        this.password = null;
        localStorage.removeItem('MW_Login');
        localStorage.removeItem('MW_Password');
        this.loginTextbox.setValue("");
        this.passwordTextbox.setValue("");
        this.loginGroup.show();
        this.logoutGroup.hide();
    }

    if (isLoggedIn != this.loggedIn)
    {
        this.tellActionListeners(this, isLoggedIn ? {type:"loggedIn"} : {type:"loggedOut"});
    }
    this.loggedIn = isLoggedIn;
}
