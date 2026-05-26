const track = document.getElementById('fader-track');
const knob = document.getElementById('fader-knob');
const output = document.getElementById('volume-output');

let isDragging = false;

// Kernfunktion zur Berechnung und Aktualisierung des Faders
function moveFader(clientY) {
    const trackRect = track.getBoundingClientRect();
    
    // Relative Y-Position innerhalb der Spur berechnen
    let relativeY = clientY - trackRect.top;

    // Grenzen einhalten (0 bis Spurhöhe)
    if (relativeY < 0) relativeY = 0;
    if (relativeY > trackRect.height) relativeY = trackRect.height;

    // Da 0% unten und 100% oben ist, invertieren wir den Wert
    const volumeValue = 1 - (relativeY / trackRect.height);

    // UI aktualisieren
    knob.style.top = `${relativeY}px`;
    output.textContent = volumeValue.toFixed(2);

    // Tipp: Hier kannst du das Event für deine Audio-Elemente abfangen:
    // meinAudioElement.volume = volumeValue;
}

// Event-Aktivierung bei Klick auf den Fader-Knopf
knob.addEventListener('mousedown', (e) => {
    isDragging = true;
    e.preventDefault(); // Verhindert Textmarkierungen während des Ziehens
});

// Erlaubt auch das Klicken direkt auf die Spur, um dorthin zu springen
track.addEventListener('mousedown', (e) => {
    isDragging = true;
    moveFader(e.clientY);
});

// Registriert die Bewegung im gesamten Fenster (falls man beim Ziehen abrutscht)
window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    moveFader(e.clientY);
});

// Beendet das Ziehen
window.addEventListener('mouseup', () => {
    isDragging = false;
});

// Initiale Anzeige setzen, sobald die Seite vollständig geladen ist
window.addEventListener('load', () => {
    moveFader(track.getBoundingClientRect().top);
});