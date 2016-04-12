var fs = require('fs');

function normalizeIgnorePatterns(lines) {
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

function _loadIgnoreFile(ignoreFile, helper) {
    var lines = fs.readFileSync(ignoreFile, {encoding:'utf8'}).split(/\s*\r?\n\s*/);
    helper.addIgnorePatterns(lines);
}

function _loadIgnoreFiles(ignoreFiles, helper) {
    ignoreFiles.forEach(function(ignoreFile) {
        _loadIgnoreFile(ignoreFile, helper);
    });
}

function _selectAndLoadIgnoreFile(ignoreFiles, helper) {
    for (var i=0; i<ignoreFiles.length; i++) {
        var ignoreFile = ignoreFiles[i];
        if (fs.existsSync(ignoreFile)) {
            // We found a file that contains ignore patterns.
            // We only load patterns from the first file that exists
            _loadIgnoreFile(ignoreFile, helper);
            return true;
        }
    }

    // No ignore files found... just return the input patterns
    return false;
}

function loadIgnorePatterns(options) {
    var ignorePatterns = [];

    function addIgnorePatterns(lines) {
        if (!lines) {
            return;
        }

        lines.forEach(function(line) {
            if (line.trim() === '') {
                return;
            }

            ignorePatterns.push(line);
        });
    }

    var helper = {
        addIgnorePatterns: addIgnorePatterns
    };


    var loadDefaults = true;

    if (options.ignorePatterns && options.ignorePatterns.length) {
        loadDefaults = false;
        addIgnorePatterns(options.ignorePatterns);
    }

    if (options.ignoreFiles && options.ignoreFiles.length) {
        loadDefaults = false;
        _loadIgnoreFiles(options.ignoreFiles, helper);
    }

    if (options.ignoreFile && options.ignoreFile.length) {
        loadDefaults = false;
        _loadIgnoreFile(options.ignoreFile, helper);
    }


    // load ignore patterns that might exist in standard files such as .gitignore
    if (options.selectIgnoreFile && options.selectIgnoreFile.length) {
        var found = _selectAndLoadIgnoreFile(options.selectIgnoreFile, helper);
        if (found) {
            loadDefaults = false;
        }
    }

    if (loadDefaults && options.defaultIgnorePatterns) {
        addIgnorePatterns(options.defaultIgnorePatterns);
    }

    if (options.ignoreAlwaysPatterns && options.ignoreAlwaysPatterns.length) {
        addIgnorePatterns(options.ignoreAlwaysPatterns);
    }

    return ignorePatterns;
}

exports.loadIgnorePatterns = loadIgnorePatterns;
exports.normalizeIgnorePatterns = normalizeIgnorePatterns;