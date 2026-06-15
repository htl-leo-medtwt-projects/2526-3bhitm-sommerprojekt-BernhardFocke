<?php
//require "../mainScripts/musicMixerMain.php";
require "../database.php";



$songs = [];

function loadSongs()
{
    global $conn;
    global $songs;

    $sql = "SELECT * FROM songs";

    $result = $conn->query($sql);

    $songs = mysqli_fetch_all($result, MYSQLI_ASSOC);
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Music Mixer</title>

    <link rel="stylesheet" href="../css/musicMixerStyle.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
    <script src="../js/musicMixerScript.js" defer></script>
</head>

<body>
    <nav>
        <div id="navBar">
            <a href="../../frontend/index.html">
                <div class="navItem">
                    <img src="../../frontend/img/startpage/logoWhite.png" alt="whiteLogo">
                </div>
            </a>

            <a href="./profileMainSide.php">
                <div class="navItem" id="login">
                    <p>Pofile</p>
                </div>
            </a>
        </div>
    </nav>


    <div id="songSliderSection">
        <?php
        loadSongs();
        ?>

        <div id="sliderHeader">
            <span class="sliderLabel">YOUR TRACKS</span>
            <span class="trackCounter">
                <?php echo count($songs) ?> SONGS
            </span>
        </div>

        <div id="songSliderWrapper">
            <!-- Prev Arrow -->
            <button class="sliderArrow" id="arrowLeft" onclick="slideLeft()">&#9664;</button>

            <!-- Song Cards -->
            <div id="songSlider">
                <?php
                for ($i = 0; $i < sizeof($songs); $i++) {
                    $song = $songs[$i];
                    $indexPad = str_pad($i + 1, 2, '0', STR_PAD_LEFT);
                    $title = htmlspecialchars($song['title']);
                    $artist = htmlspecialchars($song['artist'] ?? 'Unknown Artist');


                    $duration = !empty($song['duration']) ? ' &nbsp;·&nbsp; ' . htmlspecialchars($song['duration']) : '';

                    echo "<div class='songCard' data-index='{$i}' onclick='selectSong({$i})'>
                            <div class='songCardInner'>
                                <div class='songCardGlow'></div>
                                  <div class='songIndex'>{$indexPad}</div>
                                 <div class='songWaveIcon'>
                                    <span></span><span></span><span></span><span></span><span></span>
                                 </div>
                                <div class='songCardInfo'>
                                   <p class='songTitle'>{$title}</p>
                                   <p class='songMeta'>{$artist}{$duration}</p>
                           </div>
                             <div class='songPlayIndicator'>
                                 <svg viewBox='0 0 24 24' fill='currentColor'>
                                 <path d='M8 5v14l11-7z' />
                           </svg>
                        </div>
                    </div>
               </div>";
                }
                ?>
            </div>

            <!-- Next Arrow -->
            <button class="sliderArrow" id="arrowRight" onclick="slideRight()">&#9654;</button>
        </div>

        <!-- Now Playing Bar -->
        <!-- Now Playing Bar -->
        <div id="nowPlayingBar">
            <div id="npTop">
                <div id="npLeft">
                    <div id="npAnimIcon">
                        <span></span><span></span><span></span><span></span>
                    </div>
                    <div id="npInfo">
                        <p id="npTitle">No track selected</p>
                        <p id="npArtist">—</p>
                    </div>
                </div>
                <div id="npControls">
                    <button id="btnPlayStop" onclick="togglePlayStop()">
                        <svg id="iconPlay" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        <svg id="iconStop" viewBox="0 0 24 24" fill="currentColor" style="display:none">
                            <path d="M6 6h12v12H6z" />
                        </svg>
                    </button>
                    <button id="btnRnd" onclick="playRndSong()" title="Shuffle">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04z" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Progress / Seek Bar -->
            <div id="progressRow">
                <span id="timeCurrent">0:00</span>
                <div id="progressBarWrapper">
                    <div id="progressBar">
                        <div id="progressFill"></div>
                        <div id="loopRegion"></div>
                        <div id="loopMarkerA" class="loopMarker" title="Loop Start"></div>
                        <div id="loopMarkerB" class="loopMarker" title="Loop End"></div>
                        <div id="progressKnob"></div>
                    </div>
                </div>
                <span id="timeDuration">0:00</span>
            </div>

            <!-- Transport + Loop Station -->
            <div id="npExtra">
                <div id="transportControls">
                    <button id="btnRewind" onclick="seekBy(-10)" title="-10s">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11 18V6l-8.5 6 8.5 6zm0.5-6 8.5 6V6l-8.5 6z" />
                        </svg>
                    </button>
                    <button id="btnForward" onclick="seekBy(10)" title="+10s">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M13 6v12l8.5-6L13 6zM12.5 12 4 18V6l8.5 6z" />
                        </svg>
                    </button>
                </div>

                <div id="loopStation">
                    <span id="loopLabel">LOOP</span>
                    <button id="btnLoopA" onclick="setLoopPoint('A')" title="Set Loop Start">A</button>
                    <button id="btnLoopB" onclick="setLoopPoint('B')" title="Set Loop End">B</button>
                    <button id="btnLoopToggle" onclick="toggleLoop()" title="Toggle Loop">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
                        </svg>
                    </button>
                    <button id="btnLoopClear" onclick="clearLoop()" title="Clear Loop">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>


        <div id="mixer">
            <div id="mixerTable">
                <div id="table">
                    <div class="tableItems">
                        <div id="recordWrapper" onclick="playRndSong()">
                            <img src="../img/recordPng.png" alt="record" id="recordImg">
                            <div id="recordRing"></div>
                        </div>
                    </div>
                    <div class="tableItems">
                        <div class="tableItems">
                            <div class="fader-panel-duo">

                                <!-- ══ LAUTSTÄRKE-FADER ══ -->
                                <div class="fader-col vol">
                                    <div class="fader-label">Volume</div>
                                    <div class="fader-area">
                                        <div class="ticks left">
                                            <span></span><span></span><span></span><span></span><span></span>
                                            <span></span><span></span><span></span><span></span>
                                        </div>
                                        <div class="fader-track" id="fader-track">
                                            <div class="fader-track-bg"></div>
                                            <div class="fader-track-fill" id="vol-fill"></div>
                                            <div class="fader-knob" id="fader-knob"></div>
                                        </div>
                                        <div class="ticks right">
                                            <span></span><span></span><span></span><span></span><span></span>
                                            <span></span><span></span><span></span><span></span>
                                        </div>
                                    </div>
                                    <div class="fader-readout">
                                        <span class="readout-label">VOL</span>
                                        <span class="readout-value" id="volume-output">1.00</span>
                                    </div>
                                </div>

                                <!-- ══ GESCHWINDIGKEITS-FADER ══ -->
                                <div class="fader-col spd">
                                    <div class="fader-label">Speed</div>
                                    <div class="fader-area">
                                        <div class="ticks left">
                                            <span></span><span></span><span></span><span></span><span></span>
                                            <span></span><span></span><span></span><span></span>
                                        </div>
                                        <div class="fader-track" id="spd-track">
                                            <div class="fader-track-bg"></div>
                                            <div class="speed-center-line"></div>
                                            <div class="fader-track-fill" id="spd-fill"></div>
                                            <div class="fader-knob" id="spd-knob"></div>
                                        </div>
                                        <div class="ticks right">
                                            <span></span><span></span><span></span><span></span><span></span>
                                            <span></span><span></span><span></span><span></span>
                                        </div>
                                    </div>
                                    <div class="fader-readout">
                                        <span class="readout-label">RATE</span>
                                        <span class="readout-value" id="spd-output">1.00×</span>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>




</body>

</html>