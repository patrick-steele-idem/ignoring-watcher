var Watcher = require('./Watcher');

exports.createWatcher = function createWatcher(options) {
    return new Watcher(options);
};