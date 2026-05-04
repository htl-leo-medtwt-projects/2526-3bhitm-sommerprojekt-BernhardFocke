<?php
session_start();

require "../database.php";

function showSongs() {
    global $conn;

    $userID = $_SESSION['user']['id'];

    $songSql = "SELECT * FROM songs WHERE user_id = $userID";

    $result = $conn -> query($songSql);
    $songs = mysqli_fetch_all($result, MYSQLI_ASSOC);

    for($i = 0; $i < sizeof($songs); $i++) {
        $time = date($songs[$i]['createdAt']);

        echo "<div class='songItem'>
            <p> {$songs[$i]['title']} </p>
            <p> {$songs[$i]['artist']} </p>
            <p> {$time} </p>
          </div>";
    }
}
?>