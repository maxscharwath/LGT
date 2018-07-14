function doNotification(data) {
  var msg = message.replace(/@game/gi, data.game.name);
  chrome.notifications.create('notifyON' + chaine, { type: "basic", title: title, message: msg, iconUrl: "icons/logo256.png" }, function(id) { });
}

function setIconON(on) {
    chrome.browserAction.setIcon({path:(on ? "icon_on.png" : "icon_off.png")});
}

function saveData(data){
  chrome.storage.local.set({streamData: data}, function() {
    console.log('Settings saved');
  });
}

chrome.notifications.onClicked.addListener(function(){
    chrome.tabs.create({ url:redirectUrl});
});

setInterval(updateIcon,10000);
updateIcon();
