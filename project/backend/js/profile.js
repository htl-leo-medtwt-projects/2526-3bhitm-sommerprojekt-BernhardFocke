const dropzone = document.getElementById("dropzone");

dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropzone.classList.add("dragover");
});

dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragover");
});

dropzone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropzone.classList.remove("dragover");

    const file = event.dataTransfer.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("fileToUpload", file);

    setDropzoneState("loading", "Uploading...");

    fetch("../mainScripts/fileUpload.php", {
        method: "POST",
        body: formData
    })
    .then(res => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
    })
    .then(data => {
        if (data.success) {
            setDropzoneState("success", "File uploaded");
        } else {
            setDropzoneState("error", data.message || "Upload failed");
        }
    })
    .catch(err => {
        console.error("Fehler beim Upload:", err);
        setDropzoneState("error", "Upload failed");
    });
});

function setDropzoneState(state, message) {
    dropzone.classList.remove("dragover", "success", "error", "loading");
    dropzone.classList.add(state);
    dropzone.innerHTML = `<p>${message}</p>`;

    if (state === "success" || state === "error") {
        setTimeout(() => {
            dropzone.classList.remove("success", "error");
            dropzone.innerHTML = `<p>Upload your Songs</p>`;
        }, 3000);
    }
}

function switchToMixer(id) {
    if (id != null) {
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