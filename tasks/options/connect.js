module.exports = {
  server: {},

  options: {
    hostname: '0.0.0.0',
    port: (process.env.PORT || 8000),
    base: '.',
    middleware: function(connect, options) {
      return [
        require('connect-redirection')(),
        function(req, res, next) {
          if (req.url === '/') {
            res.redirect('/test');
          } else {
            next();
          }
        },
        connect.static(options.base)
      ];
    }

  }
};
