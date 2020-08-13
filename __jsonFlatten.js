/* jslint utility2:true */
(function () {
    "use strict";
    let cnt;
    let fs;
    let list;
    fs = require("fs");
    function objectDeepCopyWithKeysSorted(obj) {
    /*
     * this function will recursively deep-copy <obj> with keys sorted
     */
        let sorted;
        if (typeof obj !== "object" || !obj) {
            return obj;
        }
        // recursively deep-copy list with child-keys sorted
        if (Array.isArray(obj)) {
            return obj.map(objectDeepCopyWithKeysSorted);
        }
        // recursively deep-copy obj with keys sorted
        sorted = {};
        Object.keys(obj).sort().forEach(function (key) {
            sorted[key] = objectDeepCopyWithKeysSorted(obj[key]);
        });
        return sorted;
    }
    function readFile(file) {
        cnt += 1;
        fs.readFile(file, "utf8", function (err, data) {
            if (err) {
                throw err;
            }
            try {
                data = JSON.parse(data.replace((
                    /\r/g
                ), "").replace((
                    /\s\/\*[\S\s]*?\*\//g
                ), "").replace((
                    /\s\/\/.*/g
                ), "").replace((
                    /,\s*?([\]}])/g
                ), "$1").trim());
            } catch (errCaught) {
                console.error(file);
                console.error(data);
                console.error(errCaught);
                process.exit();
            }
            fs.writeFile(".json/" + file.slice(2).replace((
                /\//g
            ), ".").replace((
                /[^0-9A-Za-z\-._]/g
            ), "_").toLowerCase().trim(), JSON.stringify(
                objectDeepCopyWithKeysSorted(data),
                undefined,
                4
            ) + "\n", function (err) {
                if (err) {
                    throw err;
                }
                cnt -= 1;
            });
        });
    }
    cnt = 0;
    list = require("child_process").spawnSync((
        "find | grep -v \"^...json\" | grep -i \"\\.json$\""
    ), {
        encoding: "utf8",
        shell: true,
        stdio: [
            "ignore", "pipe", 2
        ]
    }).stdout.trim().split("\n");
    setInterval(function () {
        if (!cnt && !list.length) {
            process.exit();
        }
        while (list.length && cnt < 100) {
            readFile(list.shift());
        }
    });
}());
