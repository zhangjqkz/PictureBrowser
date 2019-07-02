<?php
header("Content-type: text/html; charset=utf-8");
include('pdo.php');
$name = $_POST['name'];

$sql = "UPDATE imagelist set votes=votes+1 where name='{$name}'";
$count = $db->exec($sql);

$sql = "select votes from imagelist where name='{$name}'";
$rs=$db->query($sql);
$rows=$rs->fetchAll(PDO::FETCH_ASSOC);
echo $rows[0]['votes'];

?>