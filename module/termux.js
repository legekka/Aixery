// termux.js
// location information

var api = require('termux-api').default;

module.exports = {
    location: () => {
        var result = api.createCommand()
            .location()
            .fromGPSProvider()
            .requestOnce()
            .build()
            .run();

        result.getOutputObject()
            .then(function (location) {
                console.log('Last known location: ', location);
            });

    }
}