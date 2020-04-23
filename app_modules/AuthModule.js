var createError = require('http-errors');


exports.checkAuth = async function (request, response, next) {

  var hUsername = request.header('username');
  var hToken = request.header(process.env.TOKENNAME||"x-ldb-token");
  var sessionLifetime = (process.env.SESSLIFETIME||25); //session lifetime in minutes (defaults to 25)

  var con = require('../app_modules/DBConnection');
  var sql = "SELECT id FROM `user` WHERE username = ? AND auth_token = ? AND TIMESTAMPDIFF(MINUTE,token_creation_date,CURRENT_TIMESTAMP) < " + sessionLifetime + " AND is_deleted = 0 LIMIT 1";

  con.query(sql, [hUsername, hToken], function (query_err, result, fields) {

    if (query_err) {
      console.log("ERR")
      return next(query_err);
    } else {

      if (result.length != 1) {

        var sqlUpdate = "UPDATE `user` SET `auth_token`= NULL, token_creation_date = NULL WHERE `username`= ?";
        con.query(sqlUpdate, [hUsername], function (query_err, result, fields) {
          if (query_err) {
            console.log("ERR")
            next(query_err);
          } else {
            console.log('auth invalid reset token data for user: ' + JSON.stringify(result));
          }
        });
        
        return next(createError(403, 'Authentication error.'))
        
      } else {

        var sqlUpdate = "UPDATE `user` SET token_creation_date = CURRENT_TIMESTAMP WHERE `username`= ?";
        con.query(sqlUpdate, [hUsername], function (query_err, result, fields) {
          if (query_err) {
            console.log("ERR")
            next(query_err);
          } else {
            console.log('auth invalid reset token data for user: ' + JSON.stringify(result));
          }
        });

        return next();

      }
    }
  });

}