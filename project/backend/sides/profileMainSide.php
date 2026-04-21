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


