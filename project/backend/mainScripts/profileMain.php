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
        echo "<div class='songItem' onclick='switchToMixer({$songs[$i]['id']});'>
                <p>{$songs[$i]['title']}</p>
                <p>{$songs[$i]['artist']}</p>
                <p>{$time}</p>
                <button class='delete-btn' onclick='event.stopPropagation(); deleteSong({$songs[$i]['id']});' title='Song löschen'>
                    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
                        <polyline points='3 6 5 6 21 6'/>
                        <path d='M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6'/>
                        <path d='M10 11v6'/>
                        <path d='M14 11v6'/>
                        <path d='M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2'/>
                    </svg>
                </button>
              </div>";
    }
}

function deleteSong()
{
    global $conn;
    $data = json_decode(file_get_contents('php://input'), true);
    $songId = $data['id'];
    $userID = $_SESSION['user']['id'];
    header('Content-Type: application/json');

    // Title und Artist vor dem Löschen aus DB holen
    $pathSql = "SELECT title, artist FROM songs WHERE id = $songId AND user_id = $userID";
    $pathResult = $conn->query($pathSql);
    $songRow = $pathResult ? $pathResult->fetch_assoc() : null;

    $sql = "DELETE FROM songs WHERE id = $songId AND user_id = $userID";
    $result = $conn->query($sql);

    // Datei nur löschen, wenn DB-Löschung erfolgreich war
    if ($result && $conn->affected_rows > 0 && $songRow) {
        $filename = $songRow['title'] . "_" . $songRow['artist'];
        $filePath = "../uploads/" . $filename . ".mp3";
        if (file_exists($filePath)) {
            unlink($filePath);
        }
    }

    echo json_encode(['success' => $result && $conn->affected_rows > 0]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_GET['action'] ?? '') === 'deleteSong') {
    deleteSong();
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
