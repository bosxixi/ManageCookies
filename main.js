console.log("hello world.");

if (!chrome.cookies) {
    chrome.cookies = chrome.experimental.cookies;
}
// Speed up calls to hasOwnProperty
var hasOwnProperty = Object.prototype.hasOwnProperty;
function isEmpty(obj) {

    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0) return false;
    if (obj.length === 0) return true;

    // If it isn't an object at this point
    // it is empty, but it can't be anything *but* empty
    // Is it empty?  Depends on your application.
    if (typeof obj !== "object") return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}

var repo = {
    set: function (name, value, callback) {
        chrome.storage.local.set({ [name]: JSON.stringify(value) }, function () {
            callback();
        });
    },
    get: function (name, callback) {
        chrome.storage.local.get(name, (data) => {
            console.log("get one item");
            console.log(data);
            if (isEmpty(data)) {
                callback(null);
            }
            else {
                callback(JSON.parse(data[name]));
            }

        });
    },
    clear: function () {
        chrome.storage.local.clear();
        console.log("all repo data is cleared.");
    },
    showAll: function () {
        chrome.storage.local.get(null, (data) => {
            console.log("this is all data on storage.");
            console.log(data);
        });
    }
}

// Entry
$(function () {
    repo.showAll();
    repo.clear();
    clearCookies(() => {});
    repo.showAll();
    $("#btn").on("click", () => {
        var email = $("#filter").val();
        changeCookieStore(email);
    });

    chrome.cookies.onChanged.addListener((changeInfo) => {
        console.log("on cookies changed.");
        if (changeInfo.removed == false) {
            chrome.cookies.getAll({ storeId: "0" }, (cookies) => {
                console.log("getAll");
                getCurrentEmail((cookie) => {
                    repo.set(cookie.value, cookies, () => {
                        console.log("repo updated.");
                        repo.showAll();
                    });
                })
            });
        }
    })

})

function changeCookieStore(email) {
    if (email == undefined | email == "") {
        alert("not store id provide.");
        return;
    }

    //repo.showAll();
    //repo.clear();
    //repo.showAll();

    //return;
    repo.get(email, (data) => {
        console.log(data);
        if (data == null) {
            console.log("cookies do not exist on repo.");
            clearCookies(() => {
                setCurrentEmail(email, () => { });
            });
        }
        else {
            chrome.cookies.getAll({ storeId: "0" }, (cookies) => {
                console.log("getAll");
                getCurrentEmail((cookie) => {
                    if (cookie == null) {
                        console.log("currentemail is not seted.");
                        clearCookies(() => {
                            setCurrentEmail(email, () => { });
                        });
                    } else {
                        clearCookies(() => {
                            repo.set(cookie.value, cookies, () => {
                                console.log("All cookies recevies.")
                                for (var i = 0; i < data.length; i++) {
                                    chrome.cookies.set(makeCookie(data[i]), () => {
                                        console.log("cookie seted." + i);
                                    });
                                };
                            });
                        });
                    }
                })

            });
        }
    });
};

function getCurrentEmail(callback) {
    var filter = { url: "https://bosxixi.com", name: "currentEmail", storeId: "0" };
    console.log(filter);
    chrome.cookies.get(filter, (cookie) => {
        callback(cookie);
    });
}

function setCurrentEmail(email, callback) {
    var newcookie = { url: "https://bosxixi.com", name: "currentEmail", value: email, domain: "bosxixi.com", storeId: "0" };
    console.log(newcookie);
    chrome.cookies.set(newcookie);
    console.log("current email set to " + email);
    callback();
}

function makeCookie(data) {
    return {
        url: makeUrl(data),
        name: data.name,
        value: data.value,
        domain: data.domain,
        path: data.path,
        secure: data.secure,
        httpOnly: data.httpOnly,
        sameSite: data.sameSite,
        expirationDate: data.expirationDate,
        storeId: data.storeId,
    };
}
function makeUrl(cookie) {
    var url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain +
        cookie.path;
    return url;
}

function clearCookies(callback) {
    console.log("clearCookies");
    chrome.cookies.getAll({ storeId: "0" }, (cookies) => {
        for (var i = 0; i < cookies.length; i++) {
            chrome.cookies.remove({ url: makeUrl(cookies[i]), name: cookies[i].name });
        }
        console.log("ALl cookies cleared.");
        callback();
    })

};

