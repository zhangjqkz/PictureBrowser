<?php
header("Content-type: text/html; charset=utf-8");

include('pdo.php');

$file_array = [];

$sql = "select name, votes from imagelist order by votes desc, date;";
$rs=$db->query($sql);
$rows=$rs->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($rows);
