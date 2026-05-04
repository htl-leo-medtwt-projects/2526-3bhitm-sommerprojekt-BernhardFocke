<?php
require "../mainScripts/profileMain.php";
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Profile</title>

    <link rel="stylesheet" href="../css/profileStyle.css">
    <script src="../js/profile.js" defer></script>
</head>

<body>
    <div id="userOverlav">
        <div id="headline">
            <?php
            if (isset($_SESSION['login']) && $_SESSION['login'] == 1) {
                $user = $_SESSION['user']['username'];
                echo "<h1> Welcome {$user} </h1>";
            }
            ?>
        </div>

    </div>

    <div id="dropHead">
        <div id="dropzone">
            <p>Drop your File here</p>
        </div>
    </div>

    <div id="songContainer">
        <?php
            showSongs();
        ?>
    </div>
</body>

</html>