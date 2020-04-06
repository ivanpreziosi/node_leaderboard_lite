var express = require('express');
var router = express.Router();
var createError = require('http-errors');
const { body, validationResult } = require('express-validator');
var md5 = require('js-md5');


/* POST user registration */
router.post('/save',
  [ //express-validator rules stack

    //username
    body('username')
      .exists().withMessage('is required')
      .bail()
      .trim()
      .notEmpty().withMessage('is required')
      .bail()
      .isLength({ min: 3, max: 50 })
      .withMessage('must be at least 3 chars long and not longer than 50 chars'),

    //password
    body('password')
      .exists().withMessage('is required')
      .bail()
      .notEmpty().withMessage('is required')
      .bail()
      .isLength({ min: 6, max: 50 })
      .withMessage('must be at least 6 chars long and not longer than 50 chars'),

    //password_repeat
    body('password_repeat')      
      .exists().withMessage('is required')
      .bail()
      .notEmpty().withMessage('is required')
      .bail()
      .custom((value, { req }) => value === req.body.password)
      .withMessage('needs to match your password'),

    //email
    body('email')
      .exists().withMessage('is required')
      .bail()
      .trim()
      .notEmpty().withMessage('is required')
      .bail()
      .normalizeEmail()
      .isEmail()
      .withMessage('needs to be a valid email address'),

    //email
    body('email_repeat')
      .exists().withMessage('is required')
      .bail()
      .trim()
      .notEmpty().withMessage('is required')
      .bail()
      .normalizeEmail()
      .custom((value, { req }) => value === req.body.email)
      .withMessage('needs to match your email'),

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
      // SAVING NEW USER
      console.log("saving NEW USER: "+req.body.username);

      var username = req.body.username;
      var password = req.body.password;
      var email = req.body.email;

      var con = require('../app_modules/DBConnection');
      var sql = "INSERT INTO `user` (`username`, `password`, `email`) VALUES (?,?,?);";

      con.query(sql, [username, md5(password), email], function (query_err, result, fields) {

        if (query_err) {
          console.log("ERR")
          next(query_err);
        } else {
          console.log("new user saved");

          var leaderboardResponse = {
            status: "OK",
            message: "User registered successfully",
            code: "LEADERBOARD-NEW-USER-SAVED-SUCCESS"
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
