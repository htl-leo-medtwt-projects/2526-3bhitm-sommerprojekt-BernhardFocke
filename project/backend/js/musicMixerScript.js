// ════════════════════════════════════════════════════════
//  IMPORTS  —  Tone.js via CDN (add to <head> in PHP):
//  <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
// ════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════
//  STATE
// ════════════════════════════════════════════════════════
let songs         = [];
let currentIndex  = null;
let isPlaying     = false;
let currentVolume = 1.0;
let currentRate   = 1.0;
let sliderOffset  = 0;
const CARD_WIDTH  = 216;

// ── Tone.js Audio Objects ────────────────────────────────
let player   = null;   // Tone.Player
let gainNode = null;   // Tone.Gain

// ── Zuverlässige Zeitberechnung ──────────────────────────
// Statt Tone.now() zu berechnen nutzen wir den echten
// AudioContext der unter Tone.js liegt — dieser gibt uns
// currentTime in Echtzeit ohne Drift.
let _audioStartTime   = 0;   // AudioContext.currentTime beim Start/Seek
let _audioStartOffset = 0;   // Song-Position in Sekunden beim Start/Seek
let _songDuration     = 0;   // Gesamtlänge des aktuellen Songs

// ── Progress / Loop State ────────────────────────────────
let loopA         = null;
let loopB         = null;
let loopActive    = false;
let isSeeking     = false;
let progressRafId = null;

// ════════════════════════════════════════════════════════
//  BOOT
// ════════════════════════════════════════════════════════
loadSongs();
initProgressBarEvents();

// ════════════════════════════════════════════════════════
//  DATA
// ════════════════════════════════════════════════════════
async function loadSongs() {
    try {
        const response = await fetch('.././mainScripts/loadSongJSON.php');
        if (!response.ok) throw new Error('HTTP ' + response.status);
        songs = await response.json();
        console.log('[MusicMixer] Loaded', songs.length, 'songs');
    } catch (err) {
        console.error('[MusicMixer] loadSongs failed:', err);
    }
}

// ════════════════════════════════════════════════════════
//  CURRENT TIME  — einzige, zuverlässige Implementierung
//
//  Formel:
//    currentTime = startOffset + (audioCtx.currentTime - audioStartTime) * rate
//
//  Beide Variablen werden bei jedem Start/Seek neu gesetzt,
//  dadurch ist die Berechnung immer korrekt — egal ob
//  Rate sich ändert oder mehrfach geseekt wird.
// ════════════════════════════════════════════════════════
function getCurrentTime() {
    if (!isPlaying || !Tone.getContext()) return _audioStartOffset;
    const ctx     = Tone.getContext().rawContext;
    const elapsed = (ctx.currentTime - _audioStartTime) * currentRate;
    return Math.min(_audioStartOffset + elapsed, _songDuration);
}

// ════════════════════════════════════════════════════════
//  TONE.JS SETUP
// ════════════════════════════════════════════════════════
async function setupTonePlayer(url) {
    if (player) {
        try { player.stop(); } catch (_) {}
        player.disconnect();
        player.dispose();
        player = null;
    }
    if (gainNode) {
        gainNode.disconnect();
        gainNode.dispose();
        gainNode = null;
    }

    await Tone.start();
    gainNode = new Tone.Gain(currentVolume).toDestination();

    return new Promise((resolve, reject) => {
        player = new Tone.Player({
            url,
            onload: () => {
                _songDuration        = player.buffer.duration;
                player.playbackRate  = currentRate;
                player.connect(gainNode);
                setProgressUI(0, _songDuration);
                resolve();
            },
            onerror: (err) => {
                console.error('[MusicMixer] Tone.Player load error:', err);
                reject(err);
            }
        });
    });
}

// ════════════════════════════════════════════════════════
//  SONG SELECTION
// ════════════════════════════════════════════════════════
async function selectSong(index) {
    stopSong();
    clearLoop();

    currentIndex = index;
    const song   = songs[index];
    if (!song) return;

    try {
        await setupTonePlayer(song.path);
        playSong();
        updateNowPlaying(song);
        highlightCard(index);
    } catch (err) {
        console.error('[MusicMixer] selectSong failed:', err);
    }
}

// ════════════════════════════════════════════════════════
//  PLAYBACK
// ════════════════════════════════════════════════════════
function playSong() {
    if (!player || player.state === 'started') return;

    // AudioContext-Startzeit und Song-Offset merken
    const ctx          = Tone.getContext().rawContext;
    _audioStartTime    = ctx.currentTime;
    _audioStartOffset  = _audioStartOffset || 0;   // gesetzt durch seekTo oder 0

    player.start(Tone.now(), _audioStartOffset);
    isPlaying = true;

    updatePlayStopIcon();
    document.getElementById('npAnimIcon')?.classList.add('playing');
    document.getElementById('recordWrapper')?.classList.add('spinning');
    highlightCard(currentIndex);

    startProgressLoop();
    scheduleEndedTimeout();
}

function stopSong() {
    clearTimeout(window._endedTimeout);
    stopProgressLoop();

    // Aktuelle Position merken damit Resume möglich wäre
    _audioStartOffset = getCurrentTime();

    if (player && player.state === 'started') {
        try { player.stop(); } catch (_) {}
    }

    isPlaying = false;
    updatePlayStopIcon();
    document.getElementById('npAnimIcon')?.classList.remove('playing');
    document.getElementById('recordWrapper')?.classList.remove('spinning');
    highlightCard(null);

    // Progress auf 0 zurücksetzen und Offset auch
    _audioStartOffset = 0;
    setProgressUI(0, _songDuration);
}

function togglePlayStop() {
    if (!player && currentIndex === null) { playRndSong(); return; }
    if (!player) return;
    isPlaying ? stopSong() : playSong();
}

function onTrackEnded() {
    stopProgressLoop();
    isPlaying         = false;
    _audioStartOffset = 0;
    updatePlayStopIcon();
    document.getElementById('npAnimIcon')?.classList.remove('playing');
    document.getElementById('recordWrapper')?.classList.remove('spinning');
    highlightCard(null);
    setProgressUI(0, _songDuration);
}

function playRndSong() {
    if (!songs.length) return;
    selectSong(Math.floor(Math.random() * songs.length));
}

// ════════════════════════════════════════════════════════
//  ENDED TIMEOUT
//  Tone.Player hat kein 'ended'-Event, daher Timeout.
//  Wird bei Rate-Änderung und Seek neu berechnet.
// ════════════════════════════════════════════════════════
function scheduleEndedTimeout() {
    clearTimeout(window._endedTimeout);
    if (!_songDuration) return;
    const remaining = (_songDuration - getCurrentTime()) / currentRate;
    window._endedTimeout = setTimeout(() => {
        if (isPlaying) onTrackEnded();
    }, remaining * 1000 + 300);
}

// ════════════════════════════════════════════════════════
//  VOLUME
// ════════════════════════════════════════════════════════
function setVolume(value) {
    currentVolume = Math.max(0, Math.min(1, value));
    if (gainNode) gainNode.gain.rampTo(currentVolume, 0.02);
}

// ════════════════════════════════════════════════════════
//  SPEED
//  Nach Rate-Änderung: AudioContext-Clock neu kalibrieren
//  damit getCurrentTime() weiterhin korrekt rechnet.
// ════════════════════════════════════════════════════════
function setSpeed(value) {
    if (!isPlaying) {
        currentRate = Math.max(0.25, Math.min(2.0, value));
        if (player) player.playbackRate = currentRate;
        return;
    }

    // Aktuelle Position VOR der Rate-Änderung sichern
    const currentPos    = getCurrentTime();
    currentRate         = Math.max(0.25, Math.min(2.0, value));

    // Clock neu kalibrieren: neuer Startpunkt = jetzt, Offset = aktuelle Position
    const ctx           = Tone.getContext().rawContext;
    _audioStartTime     = ctx.currentTime;
    _audioStartOffset   = currentPos;

    if (player) player.playbackRate = currentRate;

    // Ended-Timeout mit neuer Rate neu planen
    scheduleEndedTimeout();
}

// ════════════════════════════════════════════════════════
//  SEEK
// ════════════════════════════════════════════════════════
function seekTo(time) {
    time = Math.max(0, Math.min(_songDuration || 0, time));

    if (player && player.state === 'started') {
        try { player.stop(); } catch (_) {}
    }

    // Offset für playSong setzen
    _audioStartOffset = time;

    if (isPlaying) {
        // Neu starten an neuer Position
        const ctx       = Tone.getContext().rawContext;
        _audioStartTime = ctx.currentTime;
        player.start(Tone.now(), time);
        scheduleEndedTimeout();
    }

    setProgressUI(time, _songDuration);
}

function seekBy(seconds) {
    seekTo(getCurrentTime() + seconds);
}

function seekToPosition(clientX) {
    if (!_songDuration) return;
    const bar  = document.getElementById('progressBar');
    const rect = bar.getBoundingClientRect();
    let pct    = (clientX - rect.left) / rect.width;
    pct        = Math.max(0, Math.min(1, pct));
    seekTo(pct * _songDuration);
}

// ════════════════════════════════════════════════════════
//  PROGRESS LOOP  (rAF — läuft ~60fps)
// ════════════════════════════════════════════════════════
function startProgressLoop() {
    stopProgressLoop();
    function tick() {
        if (!isPlaying) return;
        const cur = getCurrentTime();
        setProgressUI(cur, _songDuration);

        // Loop A/B check
        if (loopActive && loopB !== null && cur >= loopB) {
            seekTo(loopA !== null ? loopA : 0);
        }

        progressRafId = requestAnimationFrame(tick);
    }
    progressRafId = requestAnimationFrame(tick);
}

function stopProgressLoop() {
    if (progressRafId) {
        cancelAnimationFrame(progressRafId);
        progressRafId = null;
    }
}

// ════════════════════════════════════════════════════════
//  PROGRESS UI
// ════════════════════════════════════════════════════════
function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) seconds = 0;
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function setProgressUI(cur, dur) {
    if (isSeeking) return;
    const pct  = dur > 0 ? Math.min((cur / dur) * 100, 100) : 0;
    const fill  = document.getElementById('progressFill');
    const knob  = document.getElementById('progressKnob');
    const tCur  = document.getElementById('timeCurrent');
    const tDur  = document.getElementById('timeDuration');

    if (fill) fill.style.width  = pct + '%';
    if (knob) knob.style.left   = pct + '%';
    if (tCur) tCur.textContent  = formatTime(cur);
    if (tDur) tDur.textContent  = formatTime(dur);
}

function initProgressBarEvents() {
    const wrapper = document.getElementById('progressBarWrapper');
    if (!wrapper) return;

    wrapper.addEventListener('mousedown', e => { isSeeking = true; seekToPosition(e.clientX); });
    window.addEventListener('mousemove',  e => { if (isSeeking) seekToPosition(e.clientX); });
    window.addEventListener('mouseup',    ()  => { isSeeking = false; });

    wrapper.addEventListener('touchstart', e => { isSeeking = true; seekToPosition(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('touchmove',   e => { if (isSeeking) seekToPosition(e.touches[0].clientX); },   { passive: true });
    window.addEventListener('touchend',    ()  => { isSeeking = false; });
}

// ════════════════════════════════════════════════════════
//  LOOP STATION
// ════════════════════════════════════════════════════════
function setLoopPoint(point) {
    if (!_songDuration) return;
    const time = getCurrentTime();
    const pct  = (time / _songDuration) * 100;

    if (point === 'A') {
        loopA = time;
        document.getElementById('btnLoopA')?.classList.add('set');
        const mA = document.getElementById('loopMarkerA');
        if (mA) { mA.style.left = pct + '%'; mA.classList.add('active'); }
    } else {
        loopB = time;
        document.getElementById('btnLoopB')?.classList.add('set');
        const mB = document.getElementById('loopMarkerB');
        if (mB) { mB.style.left = pct + '%'; mB.classList.add('active'); }
    }

    if (loopA !== null && loopB !== null && loopA > loopB) {
        [loopA, loopB] = [loopB, loopA];
        redrawLoopMarkers();
    }

    updateLoopRegion();
}

function redrawLoopMarkers() {
    if (!_songDuration) return;
    const mA = document.getElementById('loopMarkerA');
    const mB = document.getElementById('loopMarkerB');
    if (loopA !== null && mA) mA.style.left = ((loopA / _songDuration) * 100) + '%';
    if (loopB !== null && mB) mB.style.left = ((loopB / _songDuration) * 100) + '%';
    updateLoopRegion();
}

function updateLoopRegion() {
    const region = document.getElementById('loopRegion');
    if (!region || !_songDuration) return;
    if (loopA !== null && loopB !== null) {
        region.style.left  = ((loopA / _songDuration) * 100) + '%';
        region.style.width = (((loopB - loopA) / _songDuration) * 100) + '%';
        region.classList.add('active');
    } else {
        region.classList.remove('active');
    }
}

function toggleLoop() {
    if (loopA === null || loopB === null) return;
    loopActive = !loopActive;
    document.getElementById('btnLoopToggle')?.classList.toggle('active', loopActive);
}

function clearLoop() {
    loopA = null; loopB = null; loopActive = false;
    ['btnLoopA','btnLoopB','btnLoopToggle'].forEach(id =>
        document.getElementById(id)?.classList.remove('set','active')
    );
    ['loopMarkerA','loopMarkerB','loopRegion'].forEach(id =>
        document.getElementById(id)?.classList.remove('active')
    );
}

// ════════════════════════════════════════════════════════
//  UI HELPERS
// ════════════════════════════════════════════════════════
function updatePlayStopIcon() {
    const p = document.getElementById('iconPlay');
    const s = document.getElementById('iconStop');
    if (!p || !s) return;
    p.style.display = isPlaying ? 'none'  : 'block';
    s.style.display = isPlaying ? 'block' : 'none';
}

function updateNowPlaying(song) {
    const t = document.getElementById('npTitle');
    const a = document.getElementById('npArtist');
    if (t) t.textContent = song.title  || 'Unknown Title';
    if (a) a.textContent = song.artist || '—';
}

function highlightCard(activeIndex) {
    document.querySelectorAll('.songCard').forEach((c, i) =>
        c.classList.toggle('active', i === activeIndex)
    );
}

// ════════════════════════════════════════════════════════
//  SLIDER NAVIGATION
// ════════════════════════════════════════════════════════
function slideRight() {
    const slider    = document.getElementById('songSlider');
    const maxScroll = slider.scrollWidth - slider.clientWidth;
    sliderOffset    = Math.min(sliderOffset + CARD_WIDTH, maxScroll);
    slider.scrollTo({ left: sliderOffset, behavior: 'smooth' });
}

function slideLeft() {
    sliderOffset = Math.max(sliderOffset - CARD_WIDTH, 0);
    document.getElementById('songSlider')
        .scrollTo({ left: sliderOffset, behavior: 'smooth' });
}

// ════════════════════════════════════════════════════════
//  FADER FACTORY
// ════════════════════════════════════════════════════════
function createFader({ trackId, knobId, fillId, outputId, min, max, initValue, format, onChange }) {
    const track  = document.getElementById(trackId);
    const knob   = document.getElementById(knobId);
    const fill   = fillId   ? document.getElementById(fillId)   : null;
    const output = outputId ? document.getElementById(outputId) : null;
    if (!track || !knob) return;

    let isDragging = false;

    function getTrackHeight() { return track.getBoundingClientRect().height; }

    function valueToRelY(value) {
        const pct = 1 - ((value - min) / (max - min));
        return pct * getTrackHeight();
    }

    function relYToValue(clientY) {
        const rect = track.getBoundingClientRect();
        let rel    = Math.max(0, Math.min(rect.height, clientY - rect.top));
        return max - (rel / rect.height) * (max - min);
    }

    function applyValue(value) {
        value = Math.max(min, Math.min(max, value));
        knob.style.top = `${valueToRelY(value)}px`;
        if (fill)   fill.style.height   = `${((value - min) / (max - min)) * 100}%`;
        if (output) output.textContent  = format(value);
        onChange(value);
    }

    function onMove(clientY) { applyValue(relYToValue(clientY)); }

    knob.addEventListener('mousedown',   e => { isDragging = true; e.preventDefault(); });
    track.addEventListener('mousedown',  e => { isDragging = true; onMove(e.clientY); });
    window.addEventListener('mousemove', e => { if (isDragging) onMove(e.clientY); });
    window.addEventListener('mouseup',   ()  => { isDragging = false; });

    knob.addEventListener('touchstart',  e => { isDragging = true; e.preventDefault(); }, { passive: false });
    window.addEventListener('touchmove', e => { if (isDragging) onMove(e.touches[0].clientY); }, { passive: true });
    window.addEventListener('touchend',  ()  => { isDragging = false; });

    window.addEventListener('load', () => {
        requestAnimationFrame(() => requestAnimationFrame(() => applyValue(initValue)));
    });
}

// ════════════════════════════════════════════════════════
//  VOLUME FADER
// ════════════════════════════════════════════════════════
createFader({
    trackId:   'fader-track',
    knobId:    'fader-knob',
    fillId:    'vol-fill',
    outputId:  'volume-output',
    min:       0,
    max:       1,
    initValue: 1.0,
    format:    v => v.toFixed(2),
    onChange:  v => setVolume(v)
});

// ════════════════════════════════════════════════════════
//  SPEED FADER  — startet bei exakt 1.00×
// ════════════════════════════════════════════════════════
createFader({
    trackId:   'spd-track',
    knobId:    'spd-knob',
    fillId:    'spd-fill',
    outputId:  'spd-output',
    min:       0.25,
    max:       2.0,
    initValue: 1.0,
    format:    v => v.toFixed(2) + '×',
    onChange:  v => setSpeed(v)
});