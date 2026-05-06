<?php
    require "../database.php";
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign Up</title>

    <link rel="stylesheet" href="../css/loginStyle.css">
</head>
<body>
    <div class="glass-card">
        <h2>Login</h2>
        <p class="subtitle">Welcome back please login to your account</p>
        
        <form method="POST" action="../mainScripts/loginMain.php">
            <div class="input-group">
                <input type="text" placeholder="User Name" required name="username" id="username">
                <i class="fa-regular fa-user"></i>
            </div>
            
            <div class="input-group">
                <input type="password" placeholder="Password" required name="password" id="password">
                <i class="fa-regular fa-eye-slash"></i>
            </div>
            
            <div class="options">
                <input type="checkbox" id="remember">
                <label for="remember">Remember me</label>
            </div>

            <div id="feetback">
                <?php
                    if(isset($_SESSION['logFeetback'])) {
                        echo $_SESSION['logFeetback'];
                    }
                ?>
            </div>
            
            <button type="submit" name="submit" class="btn-login">Login</button>
        </form>

        <p class="footer-text">Don't have an account? <a href="./signUp.php">Signup</a></p>
    </div>
</body>
</html>