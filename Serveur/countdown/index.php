<?php
function defaultCountdown(){
 $week = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
 $obj = (object)[];
 $obj->lastChange = date("Y-m-d H:i:s");
 $obj->streamer = [];
 $obj->break = (object)[];
 $obj->settings = (object)[];
 $obj->settings->short = ["sunday"=>"dim","monday"=>"lun","tuesday"=>"mar","wednesday"=>"mer","thursday"=>"jeu","friday"=>"ven","saturday"=>"sam"];
 $obj->settings->text = ["days"=>"jours","hours"=>"heures","minutes"=>"minutes","seconds"=>"secondes","noPlaning"=>"pas de planning","break"=>"en pause"];
 return $obj;
}

function sortByTime($a, $b){
  $a = strtotime($a->hours.":".$a->minutes);
  $b = strtotime($b->hours.":".$b->minutes);
  return $a - $b;
}

$channel_id = "157081665";
$filePath = "counter_".$channel_id.".json";
$json = @file_get_contents($filePath, true);

if(!empty($_POST["data"] || !$json)){
  if(!$json)
    $data = defaultCountdown();
  else
    $data = json_decode($json);

  if(!empty($_POST["data"])){
    $json = json_decode($_POST["data"]);
    $data->streamer = $json->streamer;
    $data->break = $json->break;
  }

  foreach ($data->streamer as &$streamer) {
    foreach ($streamer->planning as &$day) {
      if($day->time)
        usort($day->time, 'sortByTime');
    }
  }

  $data->lastChange = date("Y-m-d H:i:s");
  $data->lastChange = date("Y-m-d H:i:s");
  $myfile = fopen($filePath, "w");
  fwrite($myfile, json_encode($data));
  fclose($myfile);
  $result = json_encode($data);
}else{
  $result = $json;
}
$size = mb_strlen($result, '8bit');
header('Access-Control-Allow-Origin: *');
header('Content-Length: '.$size);
exit($result);
?>
