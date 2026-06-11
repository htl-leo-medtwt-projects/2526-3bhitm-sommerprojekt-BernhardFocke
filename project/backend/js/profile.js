const dropzone = document.getElementById("dropzone");

dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
});

dropzone.addEventListener("drop", (event) => {
    
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    const formData = new FormData();

    formData.append("fileToUpload", file);

    fetch("../mainScripts/fileUpload.php", {
        method: "POST",
        body: formData
    });

    dropzone.innerHTML = 'File is uploaded';
});

function switchToMixer(id) {
    if(id != null) {
        window.location.href = `./musicMixer.php?id=${id}`;
    } else {
        window.location.href = `./musicMixer.php`;
    }
}

function deleteSong(songId) {
    fetch('../mainScripts/profileMain.php?action=deleteSong', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: songId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Entferne das Song-Element aus dem DOM
            const songItems = document.querySelectorAll('.songItem');
            songItems.forEach(item => {
                if (item.getAttribute('onclick')?.includes(songId)) {
                    item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    item.style.opacity = '0';
                    item.style.transform = 'translateX(2vw)';
                    setTimeout(() => item.remove(), 300);
                }
            });
        }
    })
    .catch(err => console.error('Fehler beim Löschen:', err));
}