/*
 * @author christian.oetterli
 */

'use strict';

function fixFontUrls(grunt, cssFile) {
    var content = grunt.file.read(cssFile);
    content = content.replace(/(url\("\.\.\/fonts)/g, 'url("/fonts');
    grunt.file.write(cssFile, content);
}

function fixLinks(grunt, recurseFolder) {
    grunt.file.recurse(recurseFolder, function (file) {
        if (!file.endsWith('.html')) {
            return;
        }
        grunt.file.write(file,
            grunt.file
                .read(file)
                .replace(/(<link rel="stylesheet" )(href=")(\/styles\/.*\.css)">/g, '$1th:$2@{$3}">')
                .replace(/(<script )(src=")(\/scripts.*\.js)">/g, '$1th:$2@{$3}">'));
    });
}

function removeSourceMappingUrls(grunt) {
    // build server fails with NO_ENT when .js has source mapping url
    var sourceMappingURL = require('source-map-url');

    function remove(file) {

        if (!file.endsWith('.js')) {
            return;
        }

        var content = grunt.file.read(file);
        var newContent = sourceMappingURL.removeFrom(content);
        if (newContent !== content) {
            grunt.file.write(file, newContent);
        }
    }

    function removeAll(dep) {
        grunt.file.recurse('node_modules/' + dep, remove);
    }

    grunt.log.writeln('remove source map urls...');

    var packageJson = grunt.file.readJSON('./package.json');
    Object.keys(packageJson.dependencies || {}).forEach(removeAll);
    Object.keys(packageJson.optionalDependencies || {}).forEach(removeAll);
}

function inlineLazyFolders(grunt, recurseFolder) {
    var inlineResources = require('./inline').inlineResources;

    grunt.file.recurse(recurseFolder, function (file) {
        if (file.endsWith('.js')) {
            grunt.file.write(file, inlineResources(grunt.file.read(file), file));
        }
    });
}

module.exports = {
    fixFontUrls: fixFontUrls,
    fixLinks: fixLinks,
    removeSourceMappingUrls: removeSourceMappingUrls,
    inlineLazyFolders: inlineLazyFolders
};
