ignoring-watcher
===============
This module allows you to create a directory tree watcher while ignoring specific directories/files based on [.gitignore rules](http://git-scm.com/docs/gitignore). Instead of specifying which files/directories to watch it is often more convenient to specify which files/directories to _not_ watch.

Internally, this module uses [chokidar](https://github.com/paulmillr/chokidar) for crowss-OS file watching and the [minimatch](https://www.npmjs.com/package/minimatch) module is used to filter out ignored files.

# Usage

```javascript
var ignoringWatcher = require('ignoring-watcher').createWatcher({
    dir: __dirname, // defaults to process.cwd()
    dirs: ['some/dir', 'another/dir'], // Watch multiple directories
    ignorePatterns: [ // One or more ignore patterns
        '/node_modules',
        '*.marko.js'
    ],
    ignoreFiles: [ // The ignore patterns from these ignore files will all
                   // be loaded and joined together
        '.gitignore',
        '.npmignore'
    ],
    selectIgnoreFile: [ // Only the first existing ignore file (if any) will be loaded and merged
        '.gitignore',
        '.npmignore'
    ],
    defaultIgnorePatterns: [ // If no ignore patterns were found via the other properties
                             // then these ignore patterns will be used
        '.*'
    ]
});

ignoringWatcher
    .on('modified', function(eventArgs) { // Fired for any change event (add, delete, etc.)
        var type = eventArgs.type; // add | addDir | change | unlink | unlinkDir
        var path = eventArgs.path; // The full file system path of the modified file
    });


ignoringWatcher.startWatching(); // Don't forget to start the file watching service
```

# Maintainers

* Patrick Steele-Idem ([Github: @patrick-steele-idem](http://github.com/patrick-steele-idem)) ([Twitter: @psteeleidem](http://twitter.com/psteeleidem))

# Contribute

Pull requests, bug reports and feature requests welcome.

# License

ISC
