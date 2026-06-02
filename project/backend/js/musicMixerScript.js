/* ══════════════════════════════════════════════════════════════
   musicMixerScript.js  –  vollständige neue Version
   ══════════════════════════════════════════════════════════════ */

// ── DOM refs ──────────────────────────────────────────────────
const track  = document.getElementById('fader-track');
const knob   = document.getElementById('fader-knob');
const output = document.getElementById('volume-output');

// ── State ─────────────────────────────────────────────────────
let songs        = [];
let currentTrack = null;   // Audio object
let currentIndex = null;   // which song is loaded
let isPlaying    = false;
let isDragging   = false;
let currentVolume = 1.0;   // 0.0 – 1.0
let sliderOffset  = 0;     // how many cards we have scrolled
const CARD_WIDTH  = 216;   // card width + gap in px (adjust if needed)

// ── Boot ──────────────────────────────────────────────────────
loadSongs();

// ═════════════════════════════════════════════════════════════
//  DATA
// ═════════════════════════════════════════════════════════════
async function loadSongs() {
  try {
    const response = await fetch('.././mainScripts/loadSongJSON.php');
    if (!response.ok) throw new Error('Network error ' + response.status);
    songs = await response.json();
    console.log('[MusicMixer] Loaded', songs.length, 'songs');
  } catch (error) {
    console.error('[MusicMixer] Could not load songs:', error);
  }
}

// ═════════════════════════════════════════════════════════════
//  SONG SELECTION  (called by PHP-rendered onclick)
// ═════════════════════════════════════════════════════════════
function selectSong(index) {
  // Stop whatever is running
  stopSong();

  currentIndex = index;
  const song = songs[index];
  if (!song) return;

  // Build Audio object
  currentTrack = new Audio(song.path);
  currentTrack.volume = currentVolume;

  // Auto-play when card is clicked
  playSong();

  // UI
  updateNowPlaying(song);
  highlightCard(index);
}

// ═════════════════════════════════════════════════════════════
//  PLAYBACK
// ═════════════════════════════════════════════════════════════
function playSong() {
  if (!currentTrack) return;
  currentTrack.play();
  isPlaying = true;
  updatePlayStopIcon();
  document.getElementById('npAnimIcon').classList.add('playing');
  document.getElementById('recordWrapper').classList.add('spinning');
}

function stopSong() {
  if (currentTrack) {
    currentTrack.pause();
    currentTrack.currentTime = 0;
  }
  isPlaying = false;
  updatePlayStopIcon();
  document.getElementById('npAnimIcon').classList.remove('playing');
  document.getElementById('recordWrapper').classList.remove('spinning');
}

function togglePlayStop() {
  if (!currentTrack) {
    // Nothing loaded → play random
    playRndSong();
    return;
  }
  if (isPlaying) {
    stopSong();
  } else {
    playSong();
  }
}

// ── Play a specific song by its songs[] index ─────────────────
function playSongById(id) {
  selectSong(id);
}

// ── Random song ───────────────────────────────────────────────
function rndSongNum() {
  if (!songs.length) return 0;
  return Math.floor(Math.random() * songs.length);
}

function playRndSong() {
  if (!songs.length) return;
  const rnd = rndSongNum();
  selectSong(rnd);
}

// ═════════════════════════════════════════════════════════════
//  UI HELPERS
// ═════════════════════════════════════════════════════════════
function updatePlayStopIcon() {
  const iconPlay = document.getElementById('iconPlay');
  const iconStop = document.getElementById('iconStop');
  if (!iconPlay || !iconStop) return;
  iconPlay.style.display = isPlaying ? 'none' : 'block';
  iconStop.style.display = isPlaying ? 'block' : 'none';
}

function updateNowPlaying(song) {
  const titleEl  = document.getElementById('npTitle');
  const artistEl = document.getElementById('npArtist');
  if (titleEl)  titleEl.textContent  = song.title  || 'Unknown Title';
  if (artistEl) artistEl.textContent = song.artist || '—';
}

function highlightCard(activeIndex) {
  document.querySelectorAll('.songCard').forEach((card, i) => {
    card.classList.toggle('active', i === activeIndex);
  });
}

// ═════════════════════════════════════════════════════════════
//  SLIDER NAVIGATION
// ═════════════════════════════════════════════════════════════
function slideRight() {
  const slider   = document.getElementById('songSlider');
  const maxScroll = slider.scrollWidth - slider.clientWidth;
  sliderOffset = Math.min(sliderOffset + CARD_WIDTH, maxScroll);
  slider.scrollTo({ left: sliderOffset, behavior: 'smooth' });
}

function slideLeft() {
  sliderOffset = Math.max(sliderOffset - CARD_WIDTH, 0);
  const slider  = document.getElementById('songSlider');
  slider.scrollTo({ left: sliderOffset, behavior: 'smooth' });
}

// ═════════════════════════════════════════════════════════════
//  FADER / VOLUME
// ═════════════════════════════════════════════════════════════
function moveFader(clientY) {
  const trackRect = track.getBoundingClientRect();

  let relativeY = clientY - trackRect.top;
  if (relativeY < 0)                relativeY = 0;
  if (relativeY > trackRect.height) relativeY = trackRect.height;

  const volumeValue = 1 - (relativeY / trackRect.height);
  currentVolume = volumeValue;

  // Update knob position + display
  knob.style.top = `${relativeY}px`;
  output.textContent = volumeValue.toFixed(2);

  // Apply to currently playing track
  if (currentTrack) {
    currentTrack.volume = currentVolume;
  }
}

// Drag events
knob.addEventListener('mousedown', (e) => {
  isDragging = true;
  e.preventDefault();
});

track.addEventListener('mousedown', (e) => {
  isDragging = true;
  moveFader(e.clientY);
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  moveFader(e.clientY);
});

window.addEventListener('mouseup', () => {
  isDragging = false;
});

// Touch support for fader
knob.addEventListener('touchstart', (e) => {
  isDragging = true;
  e.preventDefault();
}, { passive: false });

window.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  moveFader(e.touches[0].clientY);
}, { passive: true });

window.addEventListener('touchend', () => {
  isDragging = false;
});

// Initial fader position = top (volume 1.0)
window.addEventListener('load', () => {
  moveFader(track.getBoundingClientRect().top);
});