var request = require('request');
var fs = require('fs');
var exec = require('child_process').exec;

module.exports = {
    upload: (path) => {
        if (fs.existsSync(path)) {
            var req = request("https://s-ul.eu/upload.php", {
                method: "POST",
                formData: {
                    "Name": "s-ul",
                    "RequestType": "POST",
                    "FileFormName": "file",
                    "wizard": "true",
                    "file": fs.createReadStream(path),
                    "key": "H5nCfdM1ddvOfGNj9y3NDw77ojsQf2eGUZWUimsdbXCgCy13GD1zi3wIqEYS",
                    "gen": "3.2",
                    "ResponseType": "Text",
                    "RegexList": [
                        "\"protocol\":\"(.+?)\"",
                        "\"domain\":\"(.+?)\"",
                        "\"filename\":\"(.+?)\"",
                        "\"extension\":\"(.+?)\""
                    ],
                    "URL": "$1,1$$2,1$/$3,1$$4,1$",
                    "ThumbnailURL": "",
                    "DeletionURL": "https://s-ul.eu/delete.php?key=H5nCfdM1ddvOfGNj9y3NDw77ojsQf2eGUZWUimsdbXCgCy13GD1zi3wIqEYS&file=$3,1$"
                }
            }, function (err, resp, body) {
                if (err) {
                    console.log('Error!');
                    console.log(err);
                } else {
                    var body = JSON.parse(body);
                    var link = body.protocol + body.domain + '/' + body.filename + body.extension;
                    console.log('URL: ' + link);
                    return link;
                }
            });
        } else {
            console.log('Error: File not found');
        }
    }
}