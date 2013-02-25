var glob = require('glob');
var _ = require('underscore');

glob(__dirname + '/**/*.js', function(err, files) {
  if (err) {
    throw err;
  }
  _.each(files, function(file) {
    require(file);
  });
});
