<?php
require "../mainScripts/musicMixerMain.php";
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


    <div id="mixer">
        <div id="mixerTable">
            <div id="table">
                <div class="tableItems">
                    <img src="../img/recordPng.png" alt="record">
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