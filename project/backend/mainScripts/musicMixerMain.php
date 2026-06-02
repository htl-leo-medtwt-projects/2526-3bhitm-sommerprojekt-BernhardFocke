<?php
    session_start();

    require "../database.php";

    if(!isset($_SESSION['login'])) {
        echo "Login first";
        exit;
    }

    $songs = [];


    function loadSongs() {
        global $conn;
        global $songs;

        $sql = "SELECT * FROM songs";

        $result = $conn -> query($sql);

        $songs = mysqli_fetch_all($result, MYSQLI_ASSOC);
    }
?>