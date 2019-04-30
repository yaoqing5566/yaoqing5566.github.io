
//IOS注册
function setupWebViewJavascriptBridge(callback) {
    if (window.WebViewJavascriptBridge) { return callback(WebViewJavascriptBridge); }
    if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback); }
    window.WVJBCallbacks = [callback];
    var WVJBIframe = document.createElement('iframe');
    WVJBIframe.style.display = 'none';
    WVJBIframe.src = 'https://__bridge_loaded__';
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function() { document.documentElement.removeChild(WVJBIframe) }, 0)
}


//native回调H5方法
function applyCallback(callbackName, params) {
    if (callbackMap.hasOwnProperty(callbackName)) {
        console.log(callbackMap)
        callbackMap[callbackName](params);
    }
}
/**
 * 调用native
 * @param api
 * @param version
 * @param param
 * @param callback
 * @param ignoreType 0:不可忽略, 1:android, 2:ios, 3:android&ios
 */

var callbackMap = {};
var callbackSeq = 0;
function callNative(api, version, param, callback) {
    try {
        var callbackId = null;
        if (callback) {
            callbackId = "callback" + (callbackSeq++);
            callbackMap[callbackId] = callback;
        }
        HztUtil.callFun(api, version, param, callbackId);
    } catch (e) {
        console.warn(e);
    }

    ///IOS
    setupWebViewJavascriptBridge(function(bridge) {
        bridge.registerHandler('IosJs', function(data, responseCallback) {
            responseCallback(data)
        })
        bridge.callHandler(api, param, callback)
    })
}

var HztUtil = {
    callFun: function (api, version, param, callbackId) {
        var test = {
            authInfo: "Basic NWJhMWZmM2QzY2ZmYTYxN2YxYTQwMjRiOjAzNjQ3YTFjNjgwNWI1MWE5ZGE3ODY3MWY2OGNjNGE3",
            // authInfo:'Basic NWNjMmMwMmQ3NzU4NmIyZTVkMzNkZDk1OjY1OTE3NzVkMmFjNjY3MGQyMGNkYzM4ZDc5NzVhNGZj',
            headerVersion: "x86_64;12.1;5.8.6;dev;1.1"
        };
        applyCallback(callbackId, test);
    }
}




var hztInfo = {};

function checkToken(url, callback, method, userData) {
    if(!hztInfo.hasOwnProperty("authInfo") || !hztInfo.hasOwnProperty("headerVersion")) {
        callNative("auth", 1, JSON.stringify({}), function (params) {
            if(typeof params=='string'){
                params=JSON.parse(params)
            }
            hztInfo.authInfo =decodeURI(params.authInfo);
            hztInfo.headerVersion = decodeURI(params.headerVersion);
            console.log("request token !!", params);
            request(url, callback, method, userData);
        });
    } else {
        request(url, callback, method, userData);
    }
}

function request(url, callback, method, userData) {
    var req = {
        url: url,
        type: method,
        dataType: "text",
        headers: {
            "Authorization": hztInfo.authInfo,
            "X-Kmx-Version": hztInfo.headerVersion
        },
        success: function (data) {
            var result;
            try {
                result = JSON.parse(data);
            } catch (e) {
                result = data;
            }
            callback(result);
        },
        error: function (e, status) {
            console.log(e,status)
            if (e.status == 401) {
                callNative('tokenExpire', 1, '');
            }
        }
    };

    if (userData) {
        req.data = userData;
    }

    $.ajax(req);
}


var httpHzt={
    get:function (url,callback) {
        checkToken(url, callback, 'GET');
    },
    post:function (url,data,callback, dataType) {
        checkToken(url, callback, 'POST', data, dataType);
    },
}

// $(document).on("click","body",function () {
//     saveOrder();
// })


function currentMonth() {
   global.currentMonth();
}


function showPage(time) {
    global.showPage(time)
}



