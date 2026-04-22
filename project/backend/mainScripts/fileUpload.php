<?php

require "../database.php";

if(!isset($_FILES["fileToUpload"])){ exit;}
 
$target_dir = "../uploads/";
$target_file = $target_dir . basename($_FILES["fileToUpload"]["name"]);
$uploadOk = 1;
 
$imageFileType = pathinfo($target_file, PATHINFO_EXTENSION);
 
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($target_file);


$allowedMimeTypes = [
    'audio/mpeg',  // Standard für MP3
    'audio/mp3',   // Alternative für MP3
    'audio/wav',   // Standard für WAV
    'audio/x-wav'  // Alternative für WAV
];

// Check if image file is a actual image or fake image
if(!isset($_FILES["fileToUpload"])) {
    if(in_array($mimeType, $allowedMimeTypes)) {
        $uploadOk = 1;
    } else {
        $uploadOk = 0;
    }
}
 
// Check if file already exists
if (file_exists($target_file)) {
    echo "Sorry, file already exists.";
    $uploadOk = 0;
}
 
// Check file size
if ($_FILES["fileToUpload"]["size"] > 1000000) {
    echo "Sorry, your file is too large.";
    $uploadOk = 0;
}
 
// Allow certain file formats
if($imageFileType != "mp3" && $imageFileType != "wav" && $imageFileType != "ogg"
&& $imageFileType != "m4a" ) {
    echo "Sorry, only mp3, wav, ogg & m4a files are allowed.";
    $uploadOk = 0;
}

// Check if $uploadOk is set to 0 by an error
if ($uploadOk == 0) {
    echo "Sorry, your file was not uploaded.";
// if everything is ok, try to upload file
} else {
    if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
        echo "The file " . basename($_FILES["fileToUpload"]["name"]) . " has been uploaded.";
 
        // Check connection
        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
        }

        $timestamp = date("Y-m-d H:i:s");
 
        $insertStatement = "INSERT INTO songs (id, title, artist, createdAt, path) VALUES ('0', 'temp', 'temp', '$timestamp', '$target_file');";
        if($_res = $conn->query($insertStatement)) {
            echo "<br>mp3 $target_file has been added to the database.";
        } else {
            echo "<br>NO insertion into database";
        }
 
        # close database
        $conn->close();
    }
}

?>