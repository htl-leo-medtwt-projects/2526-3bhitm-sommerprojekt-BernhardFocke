// ════════════════════════════════════════════════════════
//  STATE
// ════════════════════════════════════════════════════════
let songs            = [];
let currentTrack     = null;
let currentIndex     = null;
let isPlaying        = false;
let currentVolume    = 1.0;
let currentRate      = 1.0;
let sliderOffset     = 0;
const CARD_WIDTH     = 216;   // px (card 200px + gap 16px)

// ════════════════════════════════════════════════════════
//  BOOT
// ════════════════════════════════════════════════════════
loadSongs();

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
//  SONG SELECTION
// ════════════════════════════════════════════════════════
function selectSong(index) {
  stopSong();
  clearLoop();                          
  currentIndex = index;
  const song = songs[index];
  if (!song) return;

  currentTrack              = new Audio(song.path);
  currentTrack.volume       = currentVolume;
  currentTrack.playbackRate = currentRate;
  currentTrack.addEventListener('ended', onTrackEnded);
  currentTrack.addEventListener('timeupdate', updateProgressUI);    
  currentTrack.addEventListener('loadedmetadata', onTrackLoaded);     

  playSong();
  updateNowPlaying(song);
  highlightCard(index);
}

function onTrackEnded() {
  isPlaying = false;
  updatePlayStopIcon();
  document.getElementById('npAnimIcon')?.classList.remove('playing');
  document.getElementById('recordWrapper')?.classList.remove('spinning');
}

// ════════════════════════════════════════════════════════
//  PLAYBACK
// ════════════════════════════════════════════════════════
function playSong() {
  if (!currentTrack) return;
  currentTrack.play().catch(e => console.warn('[MusicMixer] play():', e));
  isPlaying = true;
  updatePlayStopIcon();
  document.getElementById('npAnimIcon')?.classList.add('playing');
  document.getElementById('recordWrapper')?.classList.add('spinning');
}

function stopSong() {
  if (currentTrack) {
    currentTrack.pause();
    currentTrack.currentTime = 0;
  }
  isPlaying = false;
  updatePlayStopIcon();
  document.getElementById('npAnimIcon')?.classList.remove('playing');
  document.getElementById('recordWrapper')?.classList.remove('spinning');
  updateProgressUI();   // ← NEU
}

function togglePlayStop() {
  if (!currentTrack && currentIndex === null) {
    playRndSong();
    return;
  }
  isPlaying ? stopSong() : playSong();
}

function rndSongNum() {
  return Math.floor(Math.random() * songs.length);
}

function playRndSong() {
  if (!songs.length) return;
  selectSong(rndSongNum());
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
  const slider   = document.getElementById('songSlider');
  const maxScroll = slider.scrollWidth - slider.clientWidth;
  sliderOffset   = Math.min(sliderOffset + CARD_WIDTH, maxScroll);
  slider.scrollTo({ left: sliderOffset, behavior: 'smooth' });
}

function slideLeft() {
  sliderOffset = Math.max(sliderOffset - CARD_WIDTH, 0);
  document.getElementById('songSlider')
    .scrollTo({ left: sliderOffset, behavior: 'smooth' });
}

// ════════════════════════════════════════════════════════
//  GENERIC FADER FACTORY
//  Handles both Volume and Speed fader with the same logic.
// ════════════════════════════════════════════════════════
function createFader({ trackId, knobId, fillId, outputId, min, max, startCenter, format, onChange }) {
  const track  = document.getElementById(trackId);
  const knob   = document.getElementById(knobId);
  const fill   = fillId  ? document.getElementById(fillId)  : null;
  const output = outputId ? document.getElementById(outputId) : null;
  if (!track || !knob) return;

  let isDragging = false;

  function getTrackHeight() {
    return track.getBoundingClientRect().height;
  }

  function valueToRelY(value) {
    const h   = getTrackHeight();
    const pct = 1 - ((value - min) / (max - min));   // invert: top = max
    return pct * h;
  }

  function relYToValue(clientY) {
    const rect = track.getBoundingClientRect();
    let   rel  = clientY - rect.top;
    rel = Math.max(0, Math.min(rect.height, rel));
    return max - (rel / rect.height) * (max - min);
  }

  function applyValue(value) {
    value = Math.max(min, Math.min(max, value));
    const y = valueToRelY(value);

    knob.style.top = `${y}px`;

    if (fill) {
      const pct = (value - min) / (max - min);
      fill.style.height = `${pct * 100}%`;
    }

    if (output) output.textContent = format(value);
    onChange(value);
  }

  function onMove(clientY) {
    applyValue(relYToValue(clientY));
  }

  // Mouse
  knob.addEventListener('mousedown',   e => { isDragging = true; e.preventDefault(); });
  track.addEventListener('mousedown',  e => { isDragging = true; onMove(e.clientY); });
  window.addEventListener('mousemove', e => { if (isDragging) onMove(e.clientY); });
  window.addEventListener('mouseup',   ()  => { isDragging = false; });

  // Touch
  knob.addEventListener('touchstart',   e => { isDragging = true; e.preventDefault(); }, { passive: false });
  window.addEventListener('touchmove',  e => { if (isDragging) onMove(e.touches[0].clientY); }, { passive: true });
  window.addEventListener('touchend',   ()  => { isDragging = false; });

  // Set initial position once the DOM is fully painted
  window.addEventListener('load', () => {
    const initVal = startCenter ? (min + max) / 2 : max;
    applyValue(initVal);
  });
}

// ════════════════════════════════════════════════════════
//  VOLUME FADER   (0.0 → 1.0,  starts at top = 1.0)
//  IDs müssen mit dem HTML übereinstimmen:
//    fader-track / fader-knob / vol-fill / volume-output
// ════════════════════════════════════════════════════════
createFader({
  trackId:     'fader-track',
  knobId:      'fader-knob',
  fillId:      'vol-fill',
  outputId:    'volume-output',
  min:         0,
  max:         1,
  startCenter: false,               // startet oben (volle Lautstärke)
  format:      v => v.toFixed(2),
  onChange:    v => {
    currentVolume = v;
    if (currentTrack) currentTrack.volume = v;
  }
});

// ════════════════════════════════════════════════════════
//  SPEED FADER   (0.25× → 2.0×, startet in der Mitte = 1.0×)
//  IDs: spd-track / spd-knob / spd-fill / spd-output
// ════════════════════════════════════════════════════════
createFader({
  trackId:     'spd-track',
  knobId:      'spd-knob',
  fillId:      'spd-fill',
  outputId:    'spd-output',
  min:         0.25,
  max:         2.0,
  startCenter: true,               // Knopf startet in der Mitte (= 1.0×)
  format:      v => v.toFixed(2) + '×',
  onChange:    v => {
    currentRate = v;
    if (currentTrack) currentTrack.playbackRate = v;
  }
});

// ════════════════════════════════════════════════════════
//  PROGRESS / SEEK STATE
// ════════════════════════════════════════════════════════
let loopA = null;   // in Sekunden
let loopB = null;
let loopActive = false;
let isSeeking = false;

// ════════════════════════════════════════════════════════
//  TIME FORMAT HELPER
// ════════════════════════════════════════════════════════
function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ════════════════════════════════════════════════════════
//  PROGRESS BAR UPDATE (called on timeupdate)
// ════════════════════════════════════════════════════════
function updateProgressUI() {
  if (!currentTrack || isSeeking) return;

  const cur = currentTrack.currentTime;
  const dur = currentTrack.duration || 0;
  const pct = dur > 0 ? (cur / dur) * 100 : 0;

  const fill = document.getElementById('progressFill');
  const knob = document.getElementById('progressKnob');
  const tCur = document.getElementById('timeCurrent');
  const tDur = document.getElementById('timeDuration');

  if (fill) fill.style.width = pct + '%';
  if (knob) knob.style.left = pct + '%';
  if (tCur) tCur.textContent = formatTime(cur);
  if (tDur) tDur.textContent = formatTime(dur);

  // Loop-Station: zurückspringen wenn Loop B erreicht
  if (loopActive && loopB !== null && cur >= loopB) {
    currentTrack.currentTime = loopA !== null ? loopA : 0;
  }
}

function onTrackLoaded() {
  const tDur = document.getElementById('timeDuration');
  if (tDur) tDur.textContent = formatTime(currentTrack.duration);
}

// ════════════════════════════════════════════════════════
//  SEEK BY CLICKING THE PROGRESS BAR
// ════════════════════════════════════════════════════════
function seekToPosition(clientX) {
  if (!currentTrack || !currentTrack.duration) return;

  const bar  = document.getElementById('progressBar');
  const rect = bar.getBoundingClientRect();
  let pct = (clientX - rect.left) / rect.width;
  pct = Math.max(0, Math.min(1, pct));

  currentTrack.currentTime = pct * currentTrack.duration;
  updateProgressUI();
}

function initProgressBarEvents() {
  const wrapper = document.getElementById('progressBarWrapper');
  if (!wrapper) return;

  wrapper.addEventListener('mousedown', e => {
    isSeeking = true;
    seekToPosition(e.clientX);
  });
  window.addEventListener('mousemove', e => {
    if (isSeeking) seekToPosition(e.clientX);
  });
  window.addEventListener('mouseup', () => { isSeeking = false; });

  // Touch
  wrapper.addEventListener('touchstart', e => {
    isSeeking = true;
    seekToPosition(e.touches[0].clientX);
  }, { passive: true });
  window.addEventListener('touchmove', e => {
    if (isSeeking) seekToPosition(e.touches[0].clientX);
  }, { passive: true });
  window.addEventListener('touchend', () => { isSeeking = false; });
}

// ════════════════════════════════════════════════════════
//  TRANSPORT: REWIND / FORWARD
// ════════════════════════════════════════════════════════
function seekBy(seconds) {
  if (!currentTrack) return;
  const newTime = currentTrack.currentTime + seconds;
  currentTrack.currentTime = Math.max(0, Math.min(currentTrack.duration || 0, newTime));
  updateProgressUI();
}

// ════════════════════════════════════════════════════════
//  LOOP STATION  (A/B Marker)
// ════════════════════════════════════════════════════════
function setLoopPoint(point) {
  if (!currentTrack || !currentTrack.duration) return;

  const time = currentTrack.currentTime;
  const dur  = currentTrack.duration;
  const pct  = (time / dur) * 100;

  if (point === 'A') {
    loopA = time;
    document.getElementById('btnLoopA')?.classList.add('set');
    const markerA = document.getElementById('loopMarkerA');
    if (markerA) {
      markerA.style.left = pct + '%';
      markerA.classList.add('active');
    }
  } else {
    loopB = time;
    document.getElementById('btnLoopB')?.classList.add('set');
    const markerB = document.getElementById('loopMarkerB');
    if (markerB) {
      markerB.style.left = pct + '%';
      markerB.classList.add('active');
    }
  }

  updateLoopRegion();

  // Falls beide Punkte gesetzt sind: Reihenfolge sicherstellen
  if (loopA !== null && loopB !== null && loopA > loopB) {
    [loopA, loopB] = [loopB, loopA];
    // Marker neu zeichnen mit korrekten Werten
    redrawLoopMarkers();
  }
}

function redrawLoopMarkers() {
  if (!currentTrack || !currentTrack.duration) return;
  const dur = currentTrack.duration;

  const markerA = document.getElementById('loopMarkerA');
  const markerB = document.getElementById('loopMarkerB');

  if (loopA !== null && markerA) {
    markerA.style.left = ((loopA / dur) * 100) + '%';
  }
  if (loopB !== null && markerB) {
    markerB.style.left = ((loopB / dur) * 100) + '%';
  }
  updateLoopRegion();
}

function updateLoopRegion() {
  const region = document.getElementById('loopRegion');
  if (!region || !currentTrack || !currentTrack.duration) return;

  if (loopA !== null && loopB !== null) {
    const dur = currentTrack.duration;
    const left  = (loopA / dur) * 100;
    const width = ((loopB - loopA) / dur) * 100;
    region.style.left  = left + '%';
    region.style.width = width + '%';
    region.classList.add('active');
  } else {
    region.classList.remove('active');
  }
}

function toggleLoop() {
  if (loopA === null || loopB === null) return; // Beide Punkte nötig
  loopActive = !loopActive;
  document.getElementById('btnLoopToggle')?.classList.toggle('active', loopActive);
}

function clearLoop() {
  loopA = null;
  loopB = null;
  loopActive = false;

  document.getElementById('btnLoopA')?.classList.remove('set');
  document.getElementById('btnLoopB')?.classList.remove('set');
  document.getElementById('btnLoopToggle')?.classList.remove('active');
  document.getElementById('loopMarkerA')?.classList.remove('active');
  document.getElementById('loopMarkerB')?.classList.remove('active');
  document.getElementById('loopRegion')?.classList.remove('active');
}

// ════════════════════════════════════════════════════════
//  INIT (am Ende der Datei aufrufen)
// ════════════════════════════════════════════════════════
initProgressBarEvents();