<?php
    session_start();

    $_SESSION['feetback'] = "";

    require "../database.php";

    if (isset($_POST["submit"])) {
        createUser();
    } else {
        include("../sides/signUp.php");
    }

    function createUser()
    {
        global $conn;

        $username = $conn->real_escape_string($_POST["username"]);
        $password = $conn->real_escape_string($_POST["password"]);

        if (strcmp($password, $conn->real_escape_string($_POST["passwordNew"])) != 0) {
            include('../sides/signUp.php');
            exit;
        }

        $passwordHash = password_hash($password, PASSWORD_BCRYPT);

        $insertStatement = "INSERT INTO user (username, password, lastLogin)
                            VALUES ('$username', '$passwordHash', NOW());";

        if ($_res = $conn->query($insertStatement)) {
            $_SESSION['feetback'] = "User $username has been added to the database.<br>Try to log in.";
            
        } else {
            $_SESSION['feetback'] = "<br>NO insertion. User could not be added. Maybe user $username already exists.";
            
        }

        header("Location: ../sides/signUp.php");
    }


?>