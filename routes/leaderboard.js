var express = require('express');
var router = express.Router();
var createError = require('http-errors');
const { check, validationResult } = require('express-validator');
var validator = require('validator');


/* GET users listing. */
router.get('/', function (req, res, next) {

  var con = require('../app_modules/DBConnection');

  //GET PARAM in query string
  var limit = req.query.limit;
  var offset = req.query.offset;
  var order = req.query.order;


  var validationErrString = "";


  //validate limit//////////////////////////
  if (limit === undefined) {

    limit = 50;

  } else {

    if (validator.isNumeric("limit") || validator.isInt("limit", { min: 1, max: 150 })) {
      validationErrString += "limit must be an integer: min 1, max 150 \n";
    }
  }
  ////////////////////////////////////////

  //validate offset//////////////////////
  if (offset === undefined) {

    offset = 0;

  } else {

    if (validator.isNumeric("offset") || validator.isInt("offset", { min: 0 })) {
      validationErrString += "offset must be an integer: min 0 \n";
    }

  }
  /////////////////////////////////////

  //validate order//////////////////////
  if (order !== "ASC") {
    //order può avere solo due valori: ASC o DESC.
    order = "DESC";

  }
  /////////////////////////////////////



  if (validationErrString !== "") {

    //validation KO
    //create 400 http error code: Bad Request
    next(createError(400, validationErrString));

  } else {

    //validation OK
    var sql = "SELECT l.username, l.score, l.save_date FROM leaderboard l WHERE is_deleted = 0 ORDER BY score " + order + " LIMIT ?,?";
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
    check('username').notEmpty().withMessage('is required').isLength({ min: 3, max: 50 }).withMessage('must be at least 3 chars long and not longer than 50 chars'),
    check('score').notEmpty().withMessage('is required').isNumeric().withMessage('must be numeric').isInt().withMessage('must be an integer')
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
      // SAVING HISCORE
      console.log("saving score");

      var username = req.body.username;
      var score = req.body.score;

      var con = require('../app_modules/DBConnection');
      var sql = "INSERT INTO `leaderboard` (`username`, `score`) VALUES (?,?);";

      con.query(sql, [username, score], function (query_err, result, fields) {

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
