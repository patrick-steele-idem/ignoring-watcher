var Minimatch = require('minimatch').Minimatch;
var fs = require('fs');

var MINIMATCH_OPTIONS = {
    matchBase: true,
    dot: true,
    flipNegate: true
};

function loadIgnoreFile(ignoreFile) {
    var lines = fs.readFileSync(
        ignoreFile,
        'utf8')
        .split(/\s*\r?\n\s*/);

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if ((line.indexOf('/') !== -1) && (line.charAt(0) !== '/')) {
            lines[i] = '/' + line;
        }
    }
    return lines;
}

function loadIgnoreFiles(ignoreFiles, ignorePatterns) {
    return ignorePatterns.concat(ignoreFiles.map(loadIgnoreFile));
}

function selectAndLoadIgnoreFile(ignoreFiles, ignorePatterns) {
    for (var i=0; i<ignoreFiles.length; i++) {
        var ignoreFile = ignoreFiles[i];
        if (fs.existsSync(ignoreFile)) {
            return ignorePatterns.concat(loadIgnoreFile(ignoreFile));
        }
    }

    // No ignore files found... just return the input patterns
    return ignorePatterns;
}

function loadIgnorePatterns(options) {
    var ignorePatterns = options.ignorePatterns || [];

    if (options.ignoreFiles && options.ignoreFiles.length) {
        ignorePatterns = loadIgnoreFiles(options.ignoreFiles, ignorePatterns);
    }

    if (options.ignoreFile && options.ignoreFile.length) {
        ignorePatterns = ignorePatterns.concat(loadIgnoreFile(options.ignoreFile));
    }

    if (options.selectIgnoreFile && options.selectIgnoreFile.length) {
        ignorePatterns = selectAndLoadIgnoreFile(options.selectIgnoreFile, ignorePatterns);
    }

    if (ignorePatterns.length === 0 && options.defaultIgnorePatterns) {
        ignorePatterns = options.defaultIgnorePatterns;
    }

    ignorePatterns = ignorePatterns.filter(function(pattern) {
        return pattern.trim().length > 0;
    });

    return ignorePatterns;
}

function createIgnoredFilter(ignorePatterns, dir) {
    var ignorePatternsLength = ignorePatterns.length;

    if (!ignorePatternsLength) {
        return function(path) {
            return false; // Everything is included
        };
    } else {
        var ignoreMatchers = ignorePatterns.map(function (pattern) {
            return new Minimatch(pattern, MINIMATCH_OPTIONS);
        });

        return function(path) {
            if (path.startsWith(dir)) {
                path = path.substring(dir.length);
            }

            path = path.replace(/\\/g, '/');

            var ignore = false;

            for (var i=0; i<ignorePatternsLength; i++) {
                var matcher = ignoreMatchers[i];

                var match = matcher.match(path);

                if (!match) {
                    match = matcher.match(path + '/');
                }

                if (match) {
                    if (matcher.negate) {
                        ignore = false;
                    } else {
                        ignore = true;
                    }
                }
            }

            return ignore;
        };
    }
}

exports.loadIgnorePatterns = loadIgnorePatterns;
exports.createIgnoredFilter = createIgnoredFilter;
