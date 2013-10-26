function nameFor(path) {
  var result,  match;
  if (match = path.match(/^(?:lib|test|test\/tests)\/(.*?)(?:\.js)?$/)) {
    result = match[1];
  } else {
    result = path;
  }

  return path;
}

module.exports = function(grunt) {
  grunt.registerMultiTask('buildTests', 'Execute the tests', function() {
    var testFiles = grunt.file.expand('test/tests/**/*_test.js');

    this.files.forEach(function(f) {
      var output = ["(function(globals) {"];

      output.push.apply(output, f.src.map(grunt.file.read));

      testFiles.forEach(function(file) {
        var moduleName = nameFor(file);
        output.push('requireModule("' + nameFor(file) + '");');
      });

      output.push('})(window);');

      grunt.file.write(f.dest, output.join('\n'));
    });
  });
};
