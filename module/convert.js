var fs = require('fs');
var exec = require('child_process').execSync;
var md5 = require('md5');

var waifu2xcaffe = 'waifu2xcaffe.bat';
var curl = 'L:\\Programs\\curl\\curl.exe';

var path1 = 'I:\\Munka\\Aixery\\waifu2xCache\\input\\';
var path2 = 'I:\\Munka\\Aixery\\waifu2xCache\\output\\';

module.exports = {
    convert: (url) => {
        var ext = url.split('.')[url.split('.').length - 1];
        var name = md5(url);
        var fname = name + '.' + ext
        exec(curl + ' "' + url + '" > "' + path1 + fname + '"');
        if (!fs.existsSync(path1 + fname)) {
            throw err; // curl image download failed
        }
        //multi(UpRGB)(noise_scale)(Level3)(x4.000000)
        //.\waifu2x-caffe.exe -i "I:\Munka\Aixery\waifu2xCache\input\26226b4f76d6c3706bf63406cd7e691e.png" -o "I:\Munka\Aixery\waifu2xCache\output\" -m noise_scale -s 4 -n 3

        exec(waifu2xcaffe + ' "' + path1 + fname + '" "' + path2 + name + '.png"');
        if (!fs.existsSync(path2 + name + '.png')) {
            console.log('ajjaj.');
        }
        var link = require('./upload.js').upload(path2 + name + '.png');
        return link;
    }
}