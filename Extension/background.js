var isON = false;
var doNotif = true;

function updateIcon() {
    var xmlhttp=new XMLHttpRequest();
    xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState==4 && xmlhttp.status==200){
            var data = JSON.parse(xmlhttp.responseText);

            var online = data.channel != null;

            saveData(data);

            if(online){
                if(doNotif) {
                    doNotif = false;
                    doNotification(data);
                }
                isON = true;
                chrome.browserAction.setTitle({title : title+" - Online"});
                setIconON(true);
            }else {
                if (!isON) {
                    doNotif = true;
                }
                chrome.browserAction.setTitle({title : title+" - Offline"});
                setIconON(false);
                isON = false;
            }
        }
    }

    var url = "https://api.studimax.ch/twitch/";
    xmlhttp.open("GET",url,true);
    xmlhttp.send();
}
