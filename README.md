ignoring-watcher
===============
This module allows you to create a directory tree watcher while ignoring specific directories/files based on [.gitignore rules](http://git-scm.com/docs/gitignore). Instead of specifying which files/directories to watch it is often more convenient to specify which files/directories to _not_ watch.

Internally, this module uses [chokidar](https://github.com/paulmillr/chokidar) for cross-OS file watching. Also, the [chokidar](https://github.com/paulmillr/chokidar) module internally uses [anymatch](https://github.com/es128/anymatch) to handle ignore rules.

# Usage

```javascript
var ignoringWatcher = require('ignoring-watcher').createWatcher({
    // Directory to watch. Defaults to process.cwd()
    dir: __dirname,

    // Watch multiple directories instead of a single dir
    dirs: ['some/dir', 'another/dir'],

    // One or more ignore patterns
    ignorePatterns: [
        '/node_modules',
        '*.marko.js'
    ],

    // The ignore patterns from these ignore files will all
    // be loaded and joined together
    ignoreFiles: [
        '.gitignore',
        '.npmignore'
    ],

    // Only the first existing ignore file (if any) will be loaded and merged
    selectIgnoreFile: [
        '.gitignore',
        '.npmignore'
    ],

    // If no ignore patterns were found via the other properties
    // then these ignore patterns will be used
    defaultIgnorePatterns: [
        '.*'
    ],

    // The following patterns will always be loaded and not impact
    // the loading of the `defaultIgnorePatterns`
    ignoreAlwaysPatterns: [
        'output-file.txt'
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
