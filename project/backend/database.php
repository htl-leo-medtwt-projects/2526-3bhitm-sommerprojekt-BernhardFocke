<?php
$_db_host = "db_server";
$_db_username = "musicUser";
$_db_password = "music-password";
$_db_datenbank = "musicUser";

$conn = new mysqli($_db_host,
                   $_db_username,
                   $_db_password,
                   $_db_datenbank);


if($conn -> connect_error) {
    echo "DB Error";
    die("Connection failed" . $conn -> connect_error);
}

?>