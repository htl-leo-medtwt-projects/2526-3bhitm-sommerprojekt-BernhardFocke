<?php
session_start();
require "../database.php";

header('Content-Type: application/json');

if (!isset($_FILES["fileToUpload"])) {
    echo json_encode(["success" => false, "message" => "No file received."]);
    exit;
}

if (!isset($_SESSION['login']) || $_SESSION['login'] != 1) {
    echo json_encode(["success" => false, "message" => "Not authenticated."]);
    exit;
}

$target_dir = "../uploads/";
$target_file = $target_dir . basename($_FILES["fileToUpload"]["name"]);
$uploadOk = true;
$imageFileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

// Check if file already exists
if (file_exists($target_file)) {
    echo json_encode(["success" => false, "message" => "Sorry, file already exists."]);
    exit;
}

// Check file size
if ($_FILES["fileToUpload"]["size"] > 10000000) {
    echo json_encode(["success" => false, "message" => "Sorry, your file is too large."]);
    exit;
}

// Allow certain file formats
$allowedExt = ["mp3", "wav", "ogg", "m4a"];
if (!in_array($imageFileType, $allowedExt)) {
    echo json_encode(["success" => false, "message" => "Sorry, only mp3, wav, ogg & m4a files are allowed."]);
    exit;
}

// Try to upload file
if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {

    if ($conn->connect_error) {
        echo json_encode(["success" => false, "message" => "Database connection failed."]);
        exit;
    }

    $nameAndArtist = preg_split("/[_. ]/", $_FILES["fileToUpload"]["name"]);
    $title = $nameAndArtist[0] ?? "Unknown";
    $artist = $nameAndArtist[1] ?? "Unknown";
    $timestamp = date("Y-m-d H:i:s");
    $userID = $_SESSION['user']['id'];

    // Vorbereitete Statements gegen SQL-Injection
    $stmt = $conn->prepare("INSERT INTO songs (title, artist, createdAt, path, user_id) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssi", $title, $artist, $timestamp, $target_file, $userID);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "File uploaded and added to the database."]);
    } else {
        // Datei wieder löschen, wenn DB-Insert fehlschlägt
        unlink($target_file);
        echo json_encode(["success" => false, "message" => "Upload failed: database insertion error."]);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(["success" => false, "message" => "Sorry, your file was not uploaded."]);
}