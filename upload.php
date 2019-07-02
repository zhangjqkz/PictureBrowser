<?php
// 获取上传的图片
$pic = $_FILES['pic']['tmp_name'];
$upload_ret = false;
if($pic){
    $uploadDir = 'image'; 
    $uploadDir_L = 'image-l'; 
    // 创建文件夹  
    if(!file_exists($uploadDir)){        
        mkdir($uploadDir, 0777);    
    }    
    if(!file_exists($uploadDir_L)){        
        mkdir($uploadDir_L, 0777);    
    }    
    // 保存图片
    $filename = time() . $_FILES['pic']['name'];
    $targetFile = $uploadDir . '/' . $filename;
    $targetFile_L = $uploadDir_L . '/' . $filename;
    // 将临时文件移动到我们指定的路径
    if (move_uploaded_file($pic, $targetFile)) {
        include('pdo.php');
        $sql = "INSERT imagelist set name='{$filename}', votes=0,date=now()";
        $count = $db->exec($sql);
        // 使用ImageMagick处理图像
        exec("/usr/bin/convert -resize \"1024x683>\" -strip -quality 75%  {$targetFile} {$targetFile}");
        exec("/usr/bin/convert -resize \"57x86>\" -strip -quality 75%  {$targetFile} {$targetFile_L}");
    }
}
?>
