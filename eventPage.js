var lastNotificationValue = null;

chrome.runtime.onInstalled.addListener(() => {
    showNotification('Extension got installed successfully');
    console.log('onInstalled....');
    fetchBatteryData();
    chrome.alarms.create('refresh22', {
        periodInMinutes: 1
    });


});

chrome.runtime.onStartup.addListener(() => {
    showNotification('Extension got started successfully');
    chrome.alarms.create('refresh', {
        periodInMinutes: 1
    });
});


chrome.alarms.onAlarm.addListener(alarm => {
    fetchBatteryData();
});

function fetchBatteryData() {
    var bRange = [30, 20, 15, 10, 7, 5, 3];
    fetch('http://jiofi.local.html/cgi-bin/en-jio/mStatus.html')
        .then(function(response) {
            //console.log(response.json())
            return response.text();
        })
        .then(function(data) {
            var currentVal = parseHTML(data);
            if (currentVal <= bRange[0]) {
                chrome.storage.local.get('lastNotification', function(result) {
                    var lastNotificationAt = result.lastNotification;
                    // firt time notification
                    var obj = {};
                    var key = "lastNotification";
                    obj[key] = currentVal;
                    if (lastNotificationAt == null) {
                        showNotification(currentVal + ' NULL');
                        setDataToLocalStorage(obj);
                    } else {
                        var rangeLN = findRange(lastNotificationAt);
                        var rangeCV = findRange(currentVal);
                        if (rangeCV > rangeLN) {
                            showNotification(currentVal);
                            setDataToLocalStorage(obj);
                        } else if (rangeCV < rangeLN) {
                            // this block should be execute in case of charging
                            setDataToLocalStorage(obj);
                        }
                    }
                });
            }
        });
}

function showNotification(batteryPercentage) {
    var opt = {
        iconUrl: "icon.png",
        type: 'basic',
        title: 'JioFi Battery Down',
        message: 'Battery remaining ' + batteryPercentage
    };
    chrome.notifications.create(makeid(25), opt, function() {
        console.log('Notification Created!');
    });
}

function parseHTML(data) {
    var len = data.search("lDashBatteryQuantity") + 22;
    var battery = data.substring(len, len + 3);
    return parseInt(battery.replace(/\D/g, ""));
}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function fetchDataFromLocalStorage(channel) {
    //var val = null;
    //console.log(channel);
    //chrome.storage.local.get(channel, function(result) {
    //	if(result.channel) {
    //		val = result.channel;
    //	}
    //});
    //return val;
    return lastNotificationValue;
}

function setDataToLocalStorage(obj) {
    chrome.storage.local.set(obj, function() {
        if (chrome.extension.lastError) {
            alert('An error occurred: ' + chrome.extension.lastError.message);
        } else {
            console.log('data saved');
        }
    });
}

function findRange(val) {
    if (val > 31)
        return 0;
    if (val <= 30 && val > 20)
        return 1;
    if (val <= 20 && val > 15)
        return 2;
    if (val <= 15 && val > 10)
        return 3;
    if (val <= 10 && val > 7)
        return 4;
    if (val <= 7 && val > 5)
        return 5;
    if (val <= 5 && val > 3)
        return 6;
    if (val <= 3)
        return 7;
}