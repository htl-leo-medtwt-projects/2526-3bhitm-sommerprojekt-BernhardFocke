<?php
session_start();

require "../database.php";

function showSongs()
{
    global $conn;

    $userID = $_SESSION['user']['id'];

    $songSql = "SELECT * FROM songs WHERE user_id = $userID";

    $result = $conn->query($songSql);
    $songs = mysqli_fetch_all($result, MYSQLI_ASSOC);

    for ($i = 0; $i < sizeof($songs); $i++) {
        $time = date($songs[$i]['createdAt']);

        echo "<div class='songItem'>
            <p> {$songs[$i]['title']} </p>
            <p> {$songs[$i]['artist']} </p>
            <p> {$time} </p>
          </div>";
    }
}

function showUserProfile()
{
    if ($_SESSION['login'] && $_SESSION['login'] == 1) {
        $user = $_SESSION['user'];

        echo "<div class='profile-card'>
                <div class='profile-header'></div>
                <div class='profile-body'>
                    <div class='avatar-wrapper'>
                     <div class='avatar-placeholder'></div>
            </div>
                <div class='profile-info'>
                     <h2 class='username'>{$user['username']}</h2>
                 <div class='status-badge'>Aktiv</div>
                 <p class='login-meta'>
                     Zuletzt angemeldet: <span class='timestamp'>{$user['lastLogin']}</span>
                </p>
            </div>
        </div>
        </div>
              ";
    }
}
