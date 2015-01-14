var chokidar = require('chokidar');
var EventEmitter = require('events').EventEmitter;
var ignore = require('./ignore');

require('raptor-polyfill/string/startsWith');

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

    var ignorePatterns = ignore.loadIgnorePatterns(options);

    function watchDir(dir) {
        var ignoredFilter = ignore.createIgnoredFilter(ignorePatterns, dir);

        var watcher = chokidar.watch(
            dir,
            {
                ignored: ignoredFilter,
                persistent: options.persistent !== false,
                ignoreInitial: true
            });

        events.forEach(function(event) {
            watcher.on(event, function(path) {
                var eventArgs = {
                    type: event,
                    path: path,
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