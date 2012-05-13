<?php

class LoginAccess
{
    var $fullname;
    var $initials;
    var $login;
    var $passwordhash;
    var $message;
    var $user_id;
    var $user_status;
    var $login_status; // 0 = not logged in, 1 = login failed, 2 = login ok.
    var $curr_map;
    var $can_update;

    function LoginAccess()
    {
        $this->fullname = "";
        $this->initials = "";
        $this->login = "";
        $this->passwordhash = "";
        $this->message = "";
        $this->user_id = 0;
        $this->user_status = 0;
        $this->login_status = 0;
        $this->curr_map = 0;
        $this->can_update = 0;
    }

    function updatePlain($login, $password)
    {
        $this->login = $login;
        $this->passwordhash = sha1($login . $password);
        $this->message = "";
        $this->user_id = 0;
        $this->user_status = 0;
        $this->login_status = 0;
        $this->curr_map = 0;
        $this->can_update = 0;
    }

    function updateHash($login, $passwordhash)
    {
        $this->login = $login;
        $this->passwordhash = $passwordhash;
        $this->message = "";
        $this->user_id = 0;
        $this->user_status = 0;
        $this->login_status = 0;
        $this->curr_map = 0;
        $this->can_update = 0;
     }

    // Check that the username and password are OK
    function check()
    {
        $query =
            "SELECT id, status, fullname, initials, curr_map, can_update FROM user WHERE username='" .
            mysql_real_escape_string($this->login) .
            "' AND password='" .
            mysql_real_escape_string($this->passwordhash) .
            "'";

        $result = mysql_query($query);

        if ($result != null && mysql_numrows($result) == 1)
        {
            $this->message = "Login successful";
            $this->user_id = mysql_result($result, 0, "id");
            $this->user_status = mysql_result($result, 0, "status");
            $this->fullname = mysql_result($result, 0, "fullname");
            $this->initials = mysql_result($result, 0, "initials");
            $this->curr_map = mysql_result($result, 0, "curr_map");
            $this->can_update = mysql_result($result, 0, "can_update");
            $this->login_status = 2;
            return $this->user_id;
        }
        else
        {
            $this->message = "Login unsuccessful: " . $query;
            $this->login_status = 1;
            return 0;
        }
    }
    
    function isLoggedIn()
    {
        if ($this->login_status == 0)
           $this->check();
            
        if ($this->login_status == 2)
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    function setNewPassword($newpassword)
    {
        $newpasswordhash = sha1($this->login . $newpassword);
        $query = "UPDATE user SET password='" . mysql_real_escape_string($newpasswordhash) . "' WHERE id=" . $this->user_id . " AND username='" . mysql_real_escape_string($this->login) . "' AND password='" .
            mysql_real_escape_string($this->passwordhash) .
            "'";
        $result = mysql_query($query);
        echo report_result($result, "Changing password");
    }

    function print_message()
    {
        echo "<p>" . $this->message . "</p>";
    }
}

?>