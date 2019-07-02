<?php
$dsn = 'mysql:dbname=image;host=localhost';
$user = 'root';
$password = '11111';


$db = new PDO($dsn, $user, $password, array(PDO::ATTR_PERSISTENT => true));
$db->query('set names utf8;');

?>

