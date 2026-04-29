<?php
    session_start();
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>

    <link rel="stylesheet" href="../css/loginStyle.css">
</head>

<body>
    <div class="glass-card">
        <h2>Register</h2>
        <p class="subtitle">Sign up a new Account</p>

        <form method="POST" action="../mainScripts/signUpMain.php">
            <div class="input-group">
                <input type="text" placeholder="User Name" required name="username" id="username">
                <i class="fa-regular fa-user"></i>
            </div>

            <div class="input-group">
                <input type="password" placeholder="Password" required name="password" id="password">
                <i class="fa-regular fa-eye-slash"></i>
            </div>

            <div class="input-group">
                <input type="password" placeholder="Repeat password" required name="passwordNew" id="password">
                <i class="fa-regular fa-eye-slash"></i>
            </div>

            <div class="options">
                <input type="checkbox" id="remember">
                <label for="remember">Remember me</label>
            </div>

            <div id="feetback">
                <?php
                    if (isset($_SESSION['feetback'])) {
                        echo $_SESSION['feetback'];
                    }
                 ?>
            </div>

            <button type="submit" name="submit" class="btn-login">Login</button>
        </form>

        <p class="footer-text">Already have a Account? <a href="./login.php">Login</a></p>
    </div>
</body>

</html>


