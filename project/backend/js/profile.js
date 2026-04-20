const dropzone = document.getElementById("dropzone");

dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
});

dropzone.addEventListener("drop", (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    const formData = new FormData();

    formData.append("fileToUpload", file);

    fetch("../mainScripts/profileMain.php", {
        method: "POST",
        body: formData
    });

    dropzone.innerHTML = 'File is uploaded';
});