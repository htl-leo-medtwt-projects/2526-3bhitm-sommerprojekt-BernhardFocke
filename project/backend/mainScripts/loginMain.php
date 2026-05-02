<?php
session_start();

require "../database.php";

if (isset($_POST["submit"])) {

    $_username = $_POST["username"];
    $_passwort = $_POST["password"];

    $stmt = $conn->prepare(
        "SELECT * FROM user WHERE username = ?"
    );

    $stmt->bind_param("s", $_username);
    $stmt->execute();

    $res = $stmt->get_result();

    if ($res->num_rows === 1) {
        $user = $res->fetch_assoc();

        /* Passwort prüfen */
        if (password_verify($_passwort, $user["password"])) {

            $_SESSION["login"] = 1;
            $_SESSION["user"]  = $user;

            /* last_login aktualisieren */
            $stmt = $conn->prepare(
                "UPDATE user SET lastLogin = NOW() WHERE id = ?"
            );
            $stmt->bind_param("i", $user["id"]);
            $stmt->execute();

            header("Location: ../sides/profileMainSide.php");
        } else {
            echo "Passwort falsch.<br>";
            include("../sides/login.php");
        }
    } else {
        echo "Benutzer nicht gefunden.";
        include("../sides/login.php");
    }
} else {
    include("../sides/login.php");
}

// close database
$conn->close();

/* Is user already logged in ??? */
if (is_array($_SESSION) && isset($_SESSION["login"]) && $_SESSION["login"] == 1) {

    // Todo: Add program code for logged in user !!
    header("Location: ../sides/profileMainSide.php");
}
