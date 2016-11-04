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
        $.ajax({
            type: "POST",
            url: "https://bosxixi.com/api/data/cookies",
            data: { email: name, cookies: JSON.stringify(value) },
            success: function () {
                console.log("post success");
                callback();
            },
            error: () => {
                console.log("fail");
            }
        });
    },
    get: function (name, callback) {
        $.ajax({
            type: "GET",
            url: "https://bosxixi.com/api/data/cookies?email=" + name,
            success: function (data) {
                console.log("get success");
                callback(JSON.parse(data));
            },
            error: () => {
                callback(null);
            }
        });
    },
    clear: function () {

    },
    showAll: function () {

    }
}
var repolocal = {
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
    $("#btn").on("click", () => {
        var email = $("#filter").val();
        changeCookieStore(email);
    });

    $("#get").on("click", () => {
        var email = $("#filter").val();
        repo.get(email, (data) => {
            clearCookies(() => {
                console.log("clearCookies.")
                for (var i = 0; i < data.length; i++) {
                    try {
                        chrome.cookies.set(makeCookie(data[i]), () => {
                            console.log("cookie seted." + i);
                        });
                    } catch (err) {
                        console.error("Error catched set cookie:\n" + err.description);
                    }
                };
                console.log("All cookies seted.");

                window.location.href = "https://www.easports.com/fifa/ultimate-team/web-app";
            });

        });
    });

    $("#set").on("click", () => {
        getCurrentEmail((currentEmail) => {
            updateRepo(currentEmail, () => {

            });
        });
    });

    $("#setCurrentMail").on("click", () => {
        var email = $("#filter").val();
        repolocal.set("currentEmail", email, () => { });
    });

    $("#getCurrentMail").on("click", () => {
        repolocal.get("currentEmail", (email) => {
            console.log("currentEmail:");
            console.log(email);
        });
    });

    $("#clear").on("click", () => {
        repolocal.clear();
    });
    $("#remove").on("click", () => {
        clearCookies(() => { });
    });
    // chrome.cookies.onChanged.addListener((changeInfo) => {
    //     console.log("on cookies changed.");
    //     chrome.cookies.getAll({ storeId: "0" }, (cookies) => {
    //         console.log("getAll");
    //         getCurrentEmail((cookie) => {
    //             repo.set(cookie.value, cookies, () => {
    //                 console.log("repo updated.");
    //                 repo.showAll();
    //             });
    //         })
    //     });
    // })

})

function updateRepo(email, callback) {
    chrome.cookies.getAll({ storeId: "0" }, (cookies) => {
        console.log("getAll");
        repo.set(email, cookies, () => {
            console.log("repo updated.");
            repo.showAll();
            callback();
        });
    });
}

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
            getCurrentEmailCookie((currentEmailCookie) => {
                if (currentEmailCookie == null) {
                    clearCookies(() => {
                        setCurrentEmailCookie(email, (currentEmailCookie) => { updateRepo(currentEmailCookie.value, () => { }); });
                    });
                }
                else {
                    updateRepo(currentEmailCookie.value, () => {
                        console.log("cookies do not exist on repo.");
                        clearCookies(() => {
                            setCurrentEmailCookie(email, (currentEmailCookie) => { updateRepo(currentEmailCookie.value, () => { }); });
                        });
                    })
                }

            })

        }
        else {
            chrome.cookies.getAll({ storeId: "0" }, (cookies) => {
                console.log("getAll");
                getCurrentEmailCookie((currentEmailCookie) => {
                    if (currentEmailCookie == null) {
                        console.log("currentemail is not seted.");
                        clearCookies(() => {
                            setCurrentEmailCookie(email, (currentEmailCookie) => { updateRepo(currentEmailCookie.value, () => { }); });
                        });
                    } else {
                        console.log("right here.");
                        updateRepo(currentEmailCookie.value, () => {
                            clearCookies(() => {
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
    repolocal.get("currentEmail", (email) => {
        callback(email);
    });
}

function setCurrentEmail(email, callback) {
    repolocal.set("currentEmail", email, () => {
        callback();
    });
}

function getCurrentEmailCookie(callback) {
    var filter = { url: "https://bosxixi.com", name: "currentEmail", storeId: "0" };
    console.log(filter);
    chrome.cookies.get(filter, (cookie) => {
        callback(cookie);
    });
}

function setCurrentEmailCookie(email, callback) {
    var newcookie = { url: "https://bosxixi.com", name: "currentEmail", value: email, domain: "bosxixi.com", storeId: "0" };
    console.log(newcookie);
    chrome.cookies.set(newcookie, (cookie) => {
        console.log("current email set to " + email);
        callback(cookie);
    });

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
            try {
                chrome.cookies.remove({ url: makeUrl(cookies[i]), name: cookies[i].name });
            } catch (err) {
                console.error("Error catched deleting cookie:\n" + err.description);
            }
        }
        console.log("ALl cookies cleared.");
    })

    chrome.cookies.getAll({ storeId: "0" }, (cookies) => {
        for (var i = 0; i < cookies.length; i++) {
            try {
                chrome.cookies.remove({ url: makeUrl(cookies[i]), name: cookies[i].name });
            } catch (err) {
                console.error("Error catched deleting cookie:\n" + err.description);
            }
        }
        console.log("ALl cookies cleared.");
        callback();
    })
};

