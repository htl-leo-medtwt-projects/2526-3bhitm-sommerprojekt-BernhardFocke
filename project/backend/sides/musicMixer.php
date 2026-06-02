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
    <script src="../js/musicMixerScript.js" defer></script>
</head>

<body>
    <nav>
        <div id="navBar">
            <div class="navItem">
                <img src="../../frontend/img/startpage/logoWhite.png" alt="whiteLogo">
            </div>

            <div class="navItem">
                <p>Music Mixer</p>
            </div>

            <div class="navItem">
                <p>Placeholder</p>
            </div>

            <div class="navItem">
                <p>Placeholder</p>
            </div>

            <div class="navItem" id="login">
                <p>Login</p>
            </div>
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

                    // Ersetzt das "if/endif" für die Spieldauer
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
        <div id="nowPlayingBar">
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
                <button id="btnRnd" onclick="playRndSong()" title="Random Song">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17 17h-2l-4-4-4 4H5v-2l4-4-4-4V5h2l4 4 4-4h2v2l-4 4 4 4v2z" />
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
                    <div class="dj-fader-panel">
                        <div class="fader-area">
                            <div class="ticks-container left">
                                <span></span><span></span><span></span><span></span><span></span>
                                <span></span><span></span><span></span><span></span><span></span>
                            </div>
                            <div class="fader-track" id="fader-track">
                                <div class="fader-knob" id="fader-knob"></div>
                            </div>
                            <div class="ticks-container right">
                                <span></span><span></span><span></span><span></span><span></span>
                                <span></span><span></span><span></span><span></span><span></span>
                            </div>
                        </div>
                        <div class="value-display">
                            VOLUME: <span id="volume-output">1.00</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>




</body>

</html>