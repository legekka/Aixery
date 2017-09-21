var fs = require('fs');
var execSync = require('child_process').execSync;
var exec = require('child_process').exec;
var md5 = require('md5');

var waifu2xcaffe = 'waifu2xcaffe.bat';
var curl = 'curl';

var path1 = 'D:\\CudaPower\\waifu2xCache\\input\\';
var path2 = 'D:\\waifucloud\\images\\waifu2x\\';
var path3 = 'http://boltzmann.cf:7007/images/waifu2x/';

module.exports = {
    convert: (url, callback) => {
        var ext = url.split('.')[url.split('.').length - 1];
        var name = md5(url);
        var fname = name + '.' + ext
        var download = exec(curl + ' "' + url + '" > "' + path1 + fname + '"');
        download.on('exit', () => {
            if (!fs.existsSync(path1 + fname)) {
                throw Error("curl image download failed");
            }
            console.log("Download complete.");
            console.log("Starting waifu2x-caffe...");
            var w2c = exec(waifu2xcaffe + ' "' + path1 + fname + '" "' + path2 + name + '.png"');
            w2c.on('exit', () => {
                if (!fs.existsSync(path2 + name + '.png')) {
                    throw Error("waifu2x-caffe conversion failed");
                }
                console.log("Conversion complete.")
                fs.unlinkSync(path1 + fname);
                return callback(path3 + name + '.png');
            })
        });
    }
}