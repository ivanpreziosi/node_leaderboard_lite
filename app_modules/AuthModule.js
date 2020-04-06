var createError = require('http-errors');


exports.checkAuth = async function (request, response, next) {

    var hUsername = request.header('username');
    var hToken = request.header('x-ldb-token');

    var con = require('../app_modules/DBConnection');
    var sql = "SELECT id FROM `user` WHERE username = ? AND auth_token = ? LIMIT 1";

    con.query(sql, [hUsername, hToken], function (query_err, result, fields) {

        if (query_err) {
          console.log("ERR")
          return next(query_err);
        } else {

          if (result.length != 1) {
            return next(createError(403,'Authentication error.'))
          } else {

            return next();
            
          }
        }
      });

}