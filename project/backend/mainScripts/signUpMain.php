<?php
require "../database.php";

if (!empty($_POST["submit"])) {
    createUser();
} else {
    include('../sides/signUp.php');
}

function createUser()
{
    global $conn;

    $username = $conn->real_escape_string($_POST["username"]);
    $password = $conn->real_escape_string($_POST["password"]);

    if (strcmp($password, $conn->real_escape_string($_POST["passwordNew"])) != 0) {
        include('signUp.php');
        exit;
    }

    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    $insertStatement = "INSERT INTO login_username (id, username, password, last_login)
                        VALUES (0, '$username', '$passwortHash', NOW());";

    if ($_res = $conn->query($insertStatement)) {
        echo "<br>User $username has been added to the database.<br>Try to log in.";
        include("../sides/signUp.php");
    } else {
        echo "<br>NO insertion. User could not be added. Maybe user $username already exists.";
        include("../sides/signUp.php");
    }
}


?>