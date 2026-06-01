<?php
    session_start();

    require "../database.php";

    if(!isset($_SESSION['login'])) {
        echo "Login first";
        exit;
    }
?>