<?php
// Simple PHP Upload Script:  http://coursesweb.net/php-mysql/

$uploadpath = './images/solarsystem/';      // directory to store the uploaded files
$max_size = 2000;          // maximum file size, in KiloBytes
$alwidth = 900;            // maximum allowed width, in pixels
$alheight = 800;           // maximum allowed height, in pixels
$allowtype = array('bmp', 'gif', 'jpg', 'jpeg', 'png');        // allowed extensions

if(isset($_FILES['file']) && strlen($_FILES['file']['name']) > 1) {
  $uploadpath = $uploadpath . basename( $_FILES['file']['name']);       // gets the file name
  $sepext = explode('.', strtolower($_FILES['file']['name']));

  // If no errors, upload the image, else, output the errors
  if(move_uploaded_file($_FILES['file']['tmp_name'], $uploadpath)) { 
    echo 'Success';
  } else echo 'Failed upload';
}
?> 
