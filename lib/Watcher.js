var chokidar = require('chokidar');
var EventEmitter = require('events').EventEmitter;
var ignore = require('./ignore');
var fs = require('fs');
var nodePath = require('path');

var events = [
    'add',
    'addDir',
    'change',
    'unlink',
    'unlinkDir'
];

function Watcher(options) {
    Watcher.$super.call(this);

    options = options || {};
    var _this = this;

    var dirs = options.dir || options.dirs || [process.cwd()];

    if (!Array.isArray(dirs)) {
        dirs = [dirs];
    }

    // Remove trailing slashes on directories
    dirs = dirs.map(function(dir) {
        dir = fs.realpathSync(dir);

        if (dir.length > 1) {
            dir = dir.replace(/[/\\]$/, '');
        }

        return dir;
    });

    var ignorePatterns = ignore.loadIgnorePatterns(options);
    var normalizedIgnorePatterns = ignore.normalizeIgnorePatterns(ignorePatterns);

    function watchDir(dir) {
        var watcher = chokidar.watch(dir, {
            ignored: normalizedIgnorePatterns,
            cwd: dir,
            persistent: (options.persistent !== false),
            usePolling: options.usePolling != null ? options.usePolling : false,
            ignoreInitial: true
        });

        events.forEach(function(event) {
            watcher.on(event, function(path) {
                var eventArgs = {
                    type: event,
                    path: nodePath.resolve(dir, path),
                    baseDir: dir
                };

                _this.emit('modified', eventArgs);
            });
        });
    }

    function startWatching() {
        _this.emit('ready', {
            ignorePatterns: ignorePatterns,
            dirs: dirs
        });

        dirs.forEach(watchDir);
    }

    this.startWatching = startWatching;
}

require('raptor-util').inherit(Watcher, EventEmitter);

module.exports = Watcher;