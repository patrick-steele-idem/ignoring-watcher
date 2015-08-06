var fs = require('fs');

function _normalizeIgnorePatterns(lines) {
    var newLines = [];

    lines.forEach(function(line) {
        line = line.trim();

        if (line.length === 0) {
            // empty line
            return;
        }

        var slashPos = line.indexOf('/');
        if (slashPos === -1) {
            // something like "*.js" which we need to interpret as [
            //  "**/*.js",
            //  "*.js/**", (in case it is a directory)
            //  "*.js"
            // ]
            newLines.push('**/' + line);
            newLines.push('**/' + line + '/**');
            newLines.push(line + '/**');
            // newLines.push(line + '/**');
            newLines.push(line);
            return;
            //
            // return '**/' + line;
        }

        if (slashPos === 0) {
            // something like "/node_modules" so we need to remove
            // the leading slash
            line = line.substring(1);
        }

        if (line.charAt(line.length - 1) === '/') {
            newLines.push(line.slice(0, -1));
            newLines.push(line + '**');
        } else {
            newLines.push(line);
        }
    });

    return newLines;
}

function _loadIgnoreFile(ignoreFile) {
    return _normalizeIgnorePatterns(
        fs.readFileSync(ignoreFile,{encoding:'utf8'}).split(/\s*\r?\n\s*/));
}

function _loadIgnoreFiles(ignoreFiles, ignorePatterns) {
    return ignorePatterns.concat(ignoreFiles.map(_loadIgnoreFile));
}

function _selectAndLoadIgnoreFile(ignoreFiles, ignorePatterns) {
    for (var i=0; i<ignoreFiles.length; i++) {
        var ignoreFile = ignoreFiles[i];
        if (fs.existsSync(ignoreFile)) {
            // We found a file that contains ignore patterns.
            // We only load patterns from the first file that exists
            return ignorePatterns.concat(_loadIgnoreFile(ignoreFile));
        }
    }

    // No ignore files found... just return the input patterns
    return ignorePatterns;
}

exports.loadIgnorePatterns = function loadIgnorePatterns(options) {
    var ignorePatterns = _normalizeIgnorePatterns(options.ignorePatterns || []);

    if (options.ignoreFiles && options.ignoreFiles.length) {
        ignorePatterns = _loadIgnoreFiles(options.ignoreFiles, ignorePatterns);
    }

    if (options.ignoreFile && options.ignoreFile.length) {
        ignorePatterns = ignorePatterns.concat(_loadIgnoreFile(options.ignoreFile));
    }

    // load ignore patterns that might exist in standard files such as .gitignore
    if (options.selectIgnoreFile && options.selectIgnoreFile.length) {
        ignorePatterns = _selectAndLoadIgnoreFile(options.selectIgnoreFile, ignorePatterns);
    }

    // if no patterns were loaded from file then use the defaults
    if (ignorePatterns.length === 0 && options.defaultIgnorePatterns) {
        ignorePatterns = _normalizeIgnorePatterns(options.defaultIgnorePatterns);
    }

    // remove zero-length patterns...
    ignorePatterns = ignorePatterns.filter(function(pattern) {
        return pattern.trim().length > 0;
    });

    return ignorePatterns;
};