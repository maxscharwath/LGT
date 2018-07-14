let countdown;
$(document).ready(function() {
  function getThumbnail(url, width, height) {
    url = url.replace("{width}", width);
    url = url.replace("{height}", height);
    console.log(url);
    return url;
  }

  function checkStreamPopup() {
    chrome.storage.local.get('streamData', function(result) {
      var data = result.streamData;
      var $iframe = $("<iframe src='http://player.twitch.tv/?channel=lesgrossestanches&amp;muted=true&controls=false' height='100%' width='100%' frameborder='0' scrolling='no' allowfullscreen='false'></iframe>");
      if (data.channel != null) {
        $(".data-stream").show();
				$("#btn-planning").show();
        $(".countdown").hide();
				checkBtnPlanning();
        $(".data-stream #data-title span").text(data.channel.title);
        $(".data-stream #data-viewer span").text(data.channel.viewer_count);
        $(".data-stream #data-game span").text(data.game.name);
        $(".data-stream #data-timeago time").attr("datetime", data.channel.started_at);
        $("div.top img").attr("src", "libs/img/popup-logo-on.png");
        $("body").css("background-image", "url('libs/img/bg.png')");
        $("#preview").css("background-image", "url('" + getThumbnail(data.channel.thumbnail_url, 480, 270) + "')");
        $("#preview").html($iframe);
        $("div.top p").css("color", "#131313");
        jQuery("time.timeago").timeago();
      } else {
        $(".countdown").show();
				$("#btn-planning").hide();
				checkBtnPlanning();
        $(".data-stream").hide();
        $("body").css("background-image", "");
        $("div.top img").attr("src", "libs/img/popup-logo-off.png");
        $("body").css("background-image", "url('libs/img/bg-dark.png')");
        $("div.top p").css("color", "#FFF");
      }
    });
  }
	function checkBtnPlanning(){
		if ($(".countdown").is(":hidden")) {
      $("#btn-planning").html("afficher le planning <i class='fa fa-chevron-down'></i>");
    } else {
      $("#btn-planning").html("masquer le planning <i class='fa fa-chevron-up'></i>");
    }
	}
  checkStreamPopup();
  countdown = new Countdown("https://api.studimax.ch/countdown/index.php");
  $("#btn-planning").click(function() {
    $(".countdown").toggle();
    checkBtnPlanning();
  })
});
