$.fn.queueAddClass = function (className) {
    this.queue('fx', function (next) {
        $(this).addClass(className);
        next();
    });
    return this;
};

function Countdown(url) {
    let days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    let interval;
    this.url = url
    this.data;
    this.streamerSelected = -1;

    this.init = function () {
        $(".countdown").append("<div class='countdown_timer'></div>")
            .append("<ul class='countdown_dates'></ul>")
            .append("<ul class='countdown_streamers'></ul>");
    }

    this.loadData = function (url = this.url) {
        $.ajax({
            url: url,
            beforeSend: () => {
                this.restart();
            }
        })
            .done((data) => {
                data = JSON.parse(data);
                console.log(data);
                this.setData(data);
            })
            .always(() => {
                this.restart();
            });
        return this;
    }

    this.setData = function (data) {
        this.data = data;
        return this;
    }

    this.start = function () {
        this.stop();
        this.refresh();
        interval = setInterval(() => {
            this.refresh();
        }, 1000);
        this.createDates(this.data);
        this.createStreamers(this.data);
        return this;
    }

    this.stop = function () {
        clearInterval(interval);
        return this;
    }

    this.restart = function (animation = false) {
        return this.stop().start();
    }

    this.getAllPlanning = function () {
        let planning = {};
        for (let streamerId in this.data.streamer) {
            if(this.isInBreak(streamerId))continue;
            let streamer = this.data.streamer[streamerId];
            for (let day in streamer.planning) {
                if (!planning[day]) planning[day] = {
                    active: true,
                    time: []
                };
                if (!streamer.planning[day].active) continue;
                for (let time of streamer.planning[day].time) {
                    time = Object.assign({
                        streamerId: streamerId
                    }, time);
                    planning[day].time.push(time);
                }
            }
        }
        return planning;
    }

    this.getTime = function (planning) {
        let array = [];
        for (let day in planning) {
            if (!planning[day].active) continue;
            for (let time of planning[day].time) {
                let d = new Date();
                d.setHours(time.hours);
                d.setMinutes(time.minutes);
                d.setSeconds(0);
                d.setMilliseconds(0);
                let diff = days.indexOf(day) - new Date().getDay();
                if (diff < 0) diff += 7;
                d.setDate(d.getDate() + diff);
                if (d - new Date() < 0)
                    d.setDate(d.getDate() + 7);
                array.push(d);
            }
        }
        array.sort(function (a, b) {
            return a - b;
        });
        return array;
    }

    this.isInBreak = function (id = this.streamerSelected) {
        if (!this.data.streamer[id]) return false;
        if (!this.data.streamer[id].break.active) return false;
        let start = true;
        let end = true;
        if (this.data.streamer[id].break.start) start = new Date(this.data.streamer[id].break.start) - new Date() <= 0;
        if (this.data.streamer[id].break.end) end = new Date(this.data.streamer[id].break.end) - new Date() >= 0;
        return (start && end);
    }

    this.getPlanning = function (id = this.streamerSelected) {
        if (this.data.streamer[id]) return this.data.streamer[id].planning;
        else return this.getAllPlanning();
    }

    this.refresh = function () {
        if (!this.data) {
            $(".countdown_timer").empty().append(
                $("<div class='countdown_timer-none'></div>").text("no data")
            );
            return false;
        }
        if (this.isInBreak()) {
            let message = "";
            if (this.data.streamer[this.streamerSelected].break.message)
                message = this.data.streamer[this.streamerSelected].break.message;
            $(".countdown_timer").empty().append(
                $("<div class='countdown_timer-none'></div>").text(this.data.settings.text.break),
                $("<div class='countdown_timer-break-message'></div>").text(message)
            );
            $(".countdown_dates").empty();
            return false;
        }

        let time = this.getTime(this.getPlanning())[0];
        if (!time) {
            $(".countdown_timer").html($("<div class='countdown_timer-none'></div>").text(this.data.settings.text.noPlaning));
            return false;
        }
        $(".countdown_timer").html("<span class='countdown_timer-days'></span>:<span class='countdown_timer-hours'></span>:<span class='countdown_timer-mins'></span>:<span class='countdown_timer-secs'></span>");

        let now = new Date().getTime();
        let countDownDate = time;
        let distance = countDownDate - now;
        let days = Math.floor(distance / (1000 * 60 * 60 * 24));
        let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);
        $(".countdown_timer-days").attr("name", this.data.settings.text.days).text(days.toString().replace(/^(\d)$/, '0$1'));
        $(".countdown_timer-hours").attr("name", this.data.settings.text.hours).text(hours.toString().replace(/^(\d)$/, '0$1'));
        $(".countdown_timer-mins").attr("name", this.data.settings.text.minutes).text(minutes.toString().replace(/^(\d)$/, '0$1'));
        $(".countdown_timer-secs").attr("name", this.data.settings.text.seconds).text(seconds.toString().replace(/^(\d)$/, '0$1'));
        return true;
    }

    this.createStreamers = function () {
        if (!this.data) return;
        if (this.isInBreak()) return;
        $(".countdown_streamers").empty();
        for (let streamerId in this.data.streamer) {
            let streamer = this.data.streamer[streamerId];
            $streamer = $("<li></li>");
            $streamer.attr("data-name", streamer.name);
            $streamer.attr("id", "streamer_" + streamerId);
            if (this.streamerSelected == streamerId)
                $streamer.addClass("active");
            $avatar = $("<div></div>");
            $avatarImage = $("<img>");
            $avatarImage.attr("src", streamer.image);
            $streamer.append($avatar.append($avatarImage));
            $streamer.css("background-color", streamer.color);
            $(".countdown_streamers").append($streamer);

            $streamer.click(() => {
                if (this.streamerSelected != streamerId) this.streamerSelected = streamerId;
                else
                    this.streamerSelected = -1;
                this.restart(true);
            });
        }
    }

    this.createDates = function () {
        if (!this.data) return;
        if (this.isInBreak()) return;
        $(".countdown_dates").empty();
        let planning = this.getPlanning();
        for (let day in planning)
            this.createDate(day);
    }

    this.createDate = function (dayId) {
        let planning = this.getPlanning();

        let dayData = planning[dayId];
        let timeData = dayData.time;

        if (!dayData.active) return;
        if (timeData.length < 1) return;

        let dates = $("<li></li>");
        if (dayId == days[new Date().getDay()])
            dates.addClass("today");
        let day = $("<p class='countdown_dates-day'></p>").text(this.data.settings.short[dayId]);
        let times = $("<ul class='countdown_dates-time'></ul>");
        timeData.sort(function (a, b) {
            let t1 = new Date()
            t1.setHours(a.hours);
            t1.setMinutes(a.minutes);
            let t2 = new Date()
            t2.setHours(b.hours);
            t2.setMinutes(b.minutes);
            return t1 - t2;
        });
        for (let time of timeData) {
            let $time = $("<li></li>");
            $time.text(time.hours.toString().replace(/^(\d)$/, '0$1') + ":" + time.minutes.toString().replace(/^(\d)$/, '0$1'));
            if (time.streamerId) {
                let streamer = this.data.streamer[time.streamerId];
                $time.css("color", streamer.color);
                $time.css("cursor", "help");
                $time.hover(function () {
                    $("#streamer_" + time.streamerId).delay(250).queueAddClass("hover");
                }, function () {
                    $("#streamer_" + time.streamerId).dequeue().removeClass("hover");
                });
            }
            times.append($time);
        }
        dates.append(day, times);
        $(".countdown_dates").append(dates);
    }

    this.init();
    this.loadData(url);
}
