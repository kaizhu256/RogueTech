/* jslint utility2:true */
(function () {
    "use strict";
    let rowList;
    let colDict;
    function csvFromJson(csvRowList, header) {
    /*
     * this function will convert json csvRowList to csv text
     */
/*
https://tools.ietf.org/html/rfc4180#section-2
Definition of the CSV Format
    While there are various specifications and implementations for the
    CSV format (for ex. [4], [5], [6] and [7]), there is no formal
    specification in existence, which allows for a wide variety of
    interpretations of CSV files.  This section documents the format that
    seems to be followed by most implementations:
1.  Each record is located on a separate line, delimited by a line
    break (CRLF).  For example:
    aaa,bbb,ccc CRLF
    zzz,yyy,xxx CRLF
2.  The last record in the file may or may not have an ending line
    break.  For example:
    aaa,bbb,ccc CRLF
    zzz,yyy,xxx
3.  There maybe an optional header line appearing as the first line
    of the file with the same format as normal record lines.  This
    header will contain names corresponding to the fields in the file
    and should contain the same number of fields as the records in
    the rest of the file (the presence or absence of the header line
    should be indicated via the optional "header" parameter of this
    MIME type).  For example:
    field_name,field_name,field_name CRLF
    aaa,bbb,ccc CRLF
    zzz,yyy,xxx CRLF
4.  Within the header and each record, there may be one or more
    fields, separated by commas.  Each line should contain the same
    number of fields throughout the file.  Spaces are considered part
    of a field and should not be ignored.  The last field in the
    record must not be followed by a comma.  For example:
    aaa,bbb,ccc
5.  Each field may or may not be enclosed in double quotes (however
    some programs, such as Microsoft Excel, do not use double quotes
    at all).  If fields are not enclosed with double quotes, then
    double quotes may not appear inside the fields.  For example:
    "aaa","bbb","ccc" CRLF
    zzz,yyy,xxx
6.  Fields containing line breaks (CRLF), double quotes, and commas
    should be enclosed in double-quotes.  For example:
    "aaa","b CRLF
    bb","ccc" CRLF
    zzz,yyy,xxx
7.  If double-quotes are used to enclose fields, then a double-quote
    appearing inside a field must be escaped by preceding it with
    another double quote.  For example:
    "aaa","b""bb","ccc"
*/
        if (!csvRowList.length) {
            return "";
        }
        // convert list-of-dict to list-of-list
        if (!Array.isArray(csvRowList[0])) {
            header = header || Object.keys(csvRowList);
            csvRowList = [
                header
            ].concat(csvRowList.map(function (row) {
                return header.map(function (key) {
                    return row[key];
                });
            }));
        }
        return csvRowList.map(function (row) {
            return row.map(function (val) {
                if (val === undefined || val === null) {
                    return "";
                }
                if (typeof val === "string") {
/*
    7.  If double-quotes are used to enclose fields, then a double-quote
    appearing inside a field must be escaped by preceding it with
    another double quote.  For example:
    "aaa","b""bb","ccc"
*/
                    val = val.replace((
                        /"/gu
                    ), "\"\"");
/*
6.  Fields containing line breaks (CRLF), double quotes, and commas
    should be enclosed in double-quotes.  For example:
    "aaa","b CRLF
    bb","ccc" CRLF
    zzz,yyy,xxx
*/
                    if ((
                        /[\r\n",]/
                    ).test(val)) {
                        val = "\"" + val + "\"";
                    }
                    return val;
                }
                return String(val);
/*
4.  Within the header and each record, there may be one or more
    fields, separated by commas.  Each line should contain the same
    number of fields throughout the file.  Spaces are considered part
    of a field and should not be ignored.  The last field in the
    record must not be followed by a comma.  For example:
    aaa,bbb,ccc
*/
/*
1.  Each record is located on a separate line, delimited by a line
    break (CRLF).  For example:
    aaa,bbb,ccc CRLF
    zzz,yyy,xxx CRLF
*/
/*
2.  The last record in the file may or may not have an ending line
    break.  For example:
    aaa,bbb,ccc CRLF
    zzz,yyy,xxx
*/
            }).join(",") + "\r\n";
        }).join("");
    }
    rowList = JSON.parse(require("fs").readFileSync(process.argv[2], "utf8"));
    colDict = {};
    rowList.forEach(function (row) {
        let hardpoints;
        // init hardpoints
        Array.from(row.Locations || []).forEach(function (elem) {
            Array.from(elem.Hardpoints || []).forEach(function (elem) {
                hardpoints = hardpoints || {
                    all: 0,
                    ballistic: 0,
                    energy: 0,
                    missile: 0,
                    antipersonnel: 0
                };
                switch (elem.Omni || elem.WeaponMount) {
                case "AntiPersonnel":
                    hardpoints.all += 1;
                    hardpoints.antipersonnel += 1;
                    break;
                case "Ballistic":
                    hardpoints.all += 1;
                    hardpoints.ballistic += 1;
                    break;
                case "Energy":
                    hardpoints.all += 1;
                    hardpoints.energy += 1;
                    break;
                case "Missile":
                    hardpoints.all += 1;
                    hardpoints.missile += 1;
                    break;
                case true:
                    hardpoints.all += 1;
                    hardpoints.ballistic += 1;
                    hardpoints.energy += 1;
                    hardpoints.missile += 1;
                    hardpoints.antipersonnel += 1;
                    break;
                }
            });
        });
        if (hardpoints) {
            row.hardpoints = hardpoints;
        }
        Object.entries(row).forEach(function ([
            key, val
        ]) {
            if (!(val && typeof val === "object")) {
                colDict[key] = true;
                return;
            }
            if (Array.isArray(val)) {
                colDict[key] = true;
                row[key] = JSON.stringify(val);
                return;
            }
            Object.entries(val).forEach(function ([
                key2, val2
            ]) {
                key2 = key + "." + key2;
                colDict[key2] = true;
                row[key2] = (
                    typeof val2 === "string"
                    ? val2
                    : JSON.stringify(val2)
                );
            });
        });
    });
    require("fs").writeFileSync(process.argv[3], csvFromJson(
        rowList,
        Object.keys(colDict)
    ));
}());
