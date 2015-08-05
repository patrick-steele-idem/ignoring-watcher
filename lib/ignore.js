var fs = require('fs');

function loadIgnoreFile(ignoreFile) {
    var lines = fs.readFileSync(
        ignoreFile,
        'utf8')
        .split(/\s*\r?\n\s*/);


    return lines.map(function(line) {
        line = line.trim();

        if (line.length === 0) {
            // empty line
            return line;
        }

        var slashPos = line.indexOf('/');
        if (slashPos === -1) {
            // something like "*.js" which we need to interpret as "**/*.js"
            return '**/' + line;
        }

        if (slashPos === 0) {
            // something like "/node_modules" so we need to remove
            // the leading slash
            line = line.substring(1);
        }

        return line;
    });
}

function loadIgnoreFiles(ignoreFiles, ignorePatterns) {
    return ignorePatterns.concat(ignoreFiles.map(loadIgnoreFile));
}

function selectAndLoadIgnoreFile(ignoreFiles, ignorePatterns) {
    for (var i=0; i<ignoreFiles.length; i++) {
        var ignoreFile = ignoreFiles[i];
        if (fs.existsSync(ignoreFile)) {
            // We found a file that contains ignore patterns.
            // We only load patterns from the first file that exists
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

    // load ignore patterns that might exist in standard files such as .gitignore
    if (options.selectIgnoreFile && options.selectIgnoreFile.length) {
        ignorePatterns = selectAndLoadIgnoreFile(options.selectIgnoreFile, ignorePatterns);
    }

    // if no patterns were loaded from file then use the defaults
    if (ignorePatterns.length === 0 && options.defaultIgnorePatterns) {
        ignorePatterns = options.defaultIgnorePatterns;
    }

    // remove zero-length patterns...
    ignorePatterns = ignorePatterns.filter(function(pattern) {
        return pattern.trim().length > 0;
    });

    return ignorePatterns;
}

exports.loadIgnorePatterns = loadIgnorePatterns;