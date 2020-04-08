var express = require('express');
var router = express.Router();
var createError = require('http-errors');
const { body, query, header, validationResult } = require('express-validator');
var validator = require('validator');


/* LOGOUT FROM APP */
router.get('/logout', function (req, res, next) {

  var hUsername = req.header('username');
  var hToken = req.header('x-ldb-token');

  var con = require('../app_modules/DBConnection');
  var sqlUpdate = "UPDATE `node_leaderboard_lite`.`user` SET `auth_token`= NULL, token_creation_date = NULL WHERE `username`= ? AND  `auth_token`= ?";

  con.query(sqlUpdate, [hUsername,hToken], function (query_err, result, fields) {

    if (query_err) {
      console.log("ERR")
      next(query_err);
    } else {
      console.log('affected ' + result.affectedRows + ' rows');

      var userResponse = {
        status: "OK",
        message: "User logged out successfully",
        code: "LEADERBOARD-USER-LOGOUT-SUCCESS",
        fields: fields
      }

      //write to result object
      res.writeHead(200, { 'Content-Type': 'text/json' });
      res.write(JSON.stringify(userResponse));
      res.end();
    }
  });

});

/* GET score listing. */
router.get('/',
  [ //express-validator rules stack
    query('limit')
      .customSanitizer((value, { req }) => { return (value !== undefined && value !== "") ? value : 50 })
      .isNumeric().withMessage('has to be numeric')
      .bail()
      .isInt({ min: 1, max: 150 }).withMessage('must be an integer (min:1, max:150)'),

    query('offset')
      .customSanitizer((value, { req }) => { return (value !== undefined && value !== "") ? value : 0 })
      .isNumeric().withMessage('has to be numeric')
      .bail()
      .isInt({ min: 0 }).withMessage('must be an integer (min:0)')
  ],
  function (req, res, next) {

    var con = require('../app_modules/DBConnection');

    //GET PARAM in query string
    var limit = req.query.limit;
    var offset = req.query.offset;
    var order = (req.query.order=='ASC')?'ASC':'DESC';

    //VALIDATION CHECK
    const errors = validationResult(req);

    if (!errors.isEmpty()) {

      console.log(JSON.stringify(errors));

      var errorString = "Errors: ";
      var isFirst = true;
      errors.array().forEach(element => {
        if (!isFirst) {
          errorString += " - ";
        }
        errorString += element.param + ": " + element.msg;
        isFirst = false;
      });

      //create 400 http error code: Bad Request
      next(createError(400, errorString));

    } else {

      //validation OK
      var sql = "SELECT u.username, l.score, l.save_date FROM leaderboard l LEFT OUTER JOIN user u on l.user_id = u.id WHERE l.is_deleted = 0 AND u.is_deleted = 0 ORDER BY score " + order + " LIMIT ?,?";
      con.query(sql, [parseInt(offset), parseInt(limit)], function (query_err, result, fields) {

        if (query_err) {
          console.log("ERR")
          next(query_err);
        } else {
          console.log("query executed");

          var leaderboardResponse = {
            status: "OK",
            message: "Leaderboard successfully retrieved",
            code: "LEADERBOARD-RETRIEVED-SUCCESS",
            payload: result
          }

          //write to result object
          res.writeHead(200, { 'Content-Type': 'text/json' });
          res.write(JSON.stringify(leaderboardResponse));
          res.end();
        }

      });
    }



  });

/* POST a new hiscore to the leaderboard */
router.post('/save',
  [ //express-validator rules stack
    body('score')
      .exists().withMessage('is required')
      .bail()
      .trim()
      .notEmpty().withMessage('is required')
      .bail()
      .isNumeric()
      .withMessage('has to be numeric')
      .isInt()
      .withMessage('must be an integer')
  ],
  function (req, res, next) {

    //VALIDATION CHECK
    const errors = validationResult(req);

    if (!errors.isEmpty()) {

      console.log(JSON.stringify(errors));

      var errorString = "Errors: ";
      var isFirst = true;
      errors.array().forEach(element => {
        if (!isFirst) {
          errorString += " - ";
        }
        errorString += element.param + ": " + element.msg;
        isFirst = false;
      });

      //create 400 http error code: Bad Request
      next(createError(400, errorString));

    } else {
      // GETTING THE USER FROM HEADER DATA
      var hUsername = req.header('username');
      var hToken = req.header('x-ldb-token');

      // SAVING HISCORE
      console.log("saving score");

      var score = req.body.score;

      var con = require('../app_modules/DBConnection');
      var sql = "INSERT INTO `leaderboard` (`user_id`, `score`) VALUES ((SELECT id FROM user WHERE username = ? AND auth_token = ?),?);";

      con.query(sql, [hUsername, hToken, score], function (query_err, result, fields) {

        if (query_err) {
          console.log("ERR")
          next(query_err);
        } else {
          console.log("hiscore inserted");

          var leaderboardResponse = {
            status: "OK",
            message: "Hiscore inserted",
            code: "LEADERBOARD-INSERTED-SUCCESS"
          }

          //write to result object
          res.writeHead(200, { 'Content-Type': 'text/json' });
          res.write(JSON.stringify(leaderboardResponse));
          res.end();
        }
      });
    }
  });

module.exports = router;
