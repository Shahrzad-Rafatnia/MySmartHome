<?php
  require_once 'User.php';

  // If the user is not logged in, redirect them to the login page.
  if (!User::GetSessionUser()) {
    header('Location: login.php');
    exit();
  }
?>

<div id="header">
  <span style="float:right"><a href="logout.php">Logout</a></span>
</div>
