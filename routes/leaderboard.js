var express = require('express');
var router = express.Router();
var createError = require('http-errors');
const { check, validationResult } = require('express-validator');


/* GET users listing. */
router.get('/', function (req, res, next) {

  var con = require('../app_modules/DBConnection');

  //GET PARAM in query string
  var limit = req.param("limit");

  console.log("limit: "+limit);
  
  if(limit === undefined ){
    limit = 50;
  }

  console.log("limit: "+limit);

  var sql = "SELECT l.username, l.score, l.save_date FROM leaderboard l WHERE is_deleted = 0 ORDER BY score DESC LIMIT ?";
  con.query(sql,[parseInt(limit)], function (query_err, result, fields) {

    if (query_err) {
      console.log("ERR")
      next(query_err);
    } else {
      console.log("query executed");
      //write to result object
      res.writeHead(200, { 'Content-Type': 'text/json' });
      res.write(JSON.stringify(result));
      res.end();
    }

  });
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
        if(!isFirst){
          errorString += " - ";          
        }
        errorString += element.param + ": " + element.msg;
        isFirst = false;
      });

      //create 400 http error code: Bad Request
      next(createError(400,errorString));

    } else {
      // SAVING HISCORE
      console.log("saving score");

      var username = req.body.username;
      var score = req.body.score;

      var con = require('../app_modules/DBConnection');
      var sql = "INSERT INTO `leaderboard` (`username`, `score`) VALUES (?, ?);";

      con.query(sql, [username,score], function (query_err, result, fields) {

        if (query_err) {
          console.log("ERR")
          next(query_err);
        } else {
          console.log("hiscore inserted");
          //adding custom data
          result.MESSAGE = "Hiscore inserted";
          result.STATUS = "OK";
          //write to result object
          res.writeHead(200, { 'Content-Type': 'text/json' });
          res.write(JSON.stringify(result));
          res.end();
        }
    
      });
    }
  });

module.exports = router;
