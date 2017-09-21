var fs = require('fs');
var exec = require('child_process').execSync;
var md5 = require('md5');

var waifu2xcaffe = 'waifu2xcaffe.bat';
var curl = 'D:\\Külső könyvtárak\\curl.exe';

var path1 = 'D:\\CudaPower\\waifu2xCache\\input\\';
var path2 = 'D:\\waifucloud\\images\\waifu2x\\';
var url = 'http://boltzmann.cf:7007/images/waifu2x/';

module.exports = {
    convert: (url, callback) => {
        var ext = url.split('.')[url.split('.').length - 1];
        var name = md5(url);
        var fname = name + '.' + ext
        exec(curl + ' "' + url + '" > "' + path1 + fname + '"');
        if (!fs.existsSync(path1 + fname)) {
            throw err; // curl image download failed
        }
        exec(waifu2xcaffe + ' "' + path1 + fname + '" "' + path2 + name + '.png"');
        if (!fs.existsSync(path2 + name + '.png')) {
            console.log('ajjaj.');
        }
        fs.unlinkSync(path1 + fname);
        return callback(url + name + '.png');
    }
}