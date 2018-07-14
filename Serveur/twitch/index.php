<?php
//https://api.twitch.tv/kraken/users?login=lesgrossestanches
//https://api.twitch.tv/kraken/channels/157081665
$channel_id = "157081665";
$filePath = "stream_".$channel_id.".json";
$json = @file_get_contents($filePath, true);
if($json !== false){
  $data = json_decode($json);
  if(time() - $data->timestamp < 20){
    $data->fromServer = true;
    exit(json_encode($data));
  }
}

$return = [];
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.twitch.tv/helix/streams?user_id=".$channel_id);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
$headers = array();
$headers[] = "Accept: application/vnd.twitchtv.v5+json";
$headers[] = "Client-Id: ocylm6d8604d4ur4ftintrv4dfnr0q";
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
$data = json_decode(curl_exec($ch));
$channel = $data->data[0];
if(!isset($data->data)){
  exit(json_encode($data));
}
curl_close ($ch);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.twitch.tv/helix/games?id=".$channel->game_id);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
$headers = array();
$headers[] = "Accept: application/vnd.twitchtv.v5+json";
$headers[] = "Client-Id: ocylm6d8604d4ur4ftintrv4dfnr0q";
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
$game = json_decode(curl_exec($ch))->data[0];
curl_close ($ch);

$return["channel"] = $channel;
$return["game"] = $game;
$return["fromServer"] = false;
$return["timestamp"] = time();

$myfile = fopen($filePath, "w");
fwrite($myfile, json_encode($return));
fclose($myfile);

print json_encode($return);
?>
