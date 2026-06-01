<?php
    require "../database.php";

    $sql = "SELECT * FROM songs";

    $result = $conn -> query($sql);

    $songs = mysqli_fetch_all($result, MYSQLI_ASSOC);

    header('Content-Type: application/json');
    echo json_encode($songs);
?>