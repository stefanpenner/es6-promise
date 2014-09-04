'use strict';

var fs   = require('fs');
var path = require('path');

module.exports = function () {
  var packageVersion = require('../package.json').version;
  var output         = [packageVersion];
  var gitPath        = path.join(__dirname,'..','.git');
  var headFilePath   = path.join(gitPath, 'HEAD');

  if (packageVersion.indexOf('+') > -1) {
    try {
      if (fs.existsSync(headFilePath)) {
        var headFile = fs.readFileSync(headFilePath, {encoding: 'utf8'});
        var branchName = headFile.split('/').slice(-1)[0].trim();
        var refPath = headFile.split(' ')[1];
        var branchSHA;

        if (refPath) {
          var branchPath = path.join(gitPath, refPath.trim());
          branchSHA  = fs.readFileSync(branchPath);
        } else {
          branchSHA = branchName;
        }

        output.push(branchSHA.slice(0,10));
      }
    } catch (err) {
      console.error(err.stack);
    }
    return output.join('.');
  } else {
    return packageVersion;
  }
};
