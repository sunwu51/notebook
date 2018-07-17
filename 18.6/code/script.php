<?php
$res=[];
foreach(explode("\n",file_get_contents('a.js')) as $sentence){
    foreach(explode(" ",$sentence) as $word){
        $res[$word]++;
    }
}
var_dump($res);
