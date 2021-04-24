var express = require('express');
var router = express.Router();
var createError = require('http-errors');
const { body, validationResult } = require('express-validator');
var md5 = require('js-md5');

var con = require('../app_modules/DBConnection');

/* LOGOUT FROM APP */
router.get('/logout', function(req, res, next) {

    var hUsername = req.header('username');
    var hToken = req.header(process.env.TOKENNAME || "x-ldb-token");


    var sqlUpdate = "UPDATE `node_leaderboard_lite`.`user` SET `auth_token`= NULL, token_creation_date = NULL WHERE `username`= ? AND  `auth_token`= ?";

    con.query(sqlUpdate, [hUsername, hToken], function(query_err, result, fields) {

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


/* POST user registration */
router.post('/save', [ //express-validator rules stack

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
    function(req, res, next) {

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
            console.log("saving NEW USER: " + req.body.username);

            var username = req.body.username;
            var password = req.body.password;
            var email = req.body.email;


            var sql = "INSERT INTO `user` (`username`, `password`, `email`) VALUES (?,?,?);";

            con.query(sql, [username, md5(password), email], function(query_err, result, fields) {

                if (query_err) {
                    console.log("ERR")
                    next(query_err);
                } else {
                    console.log("new user saved");

                    var userResponse = {
                        status: "OK",
                        message: "User registered successfully",
                        code: "LEADERBOARD-NEW-USER-SAVED-SUCCESS"
                    }

                    //write to result object
                    res.writeHead(200, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify(userResponse));
                    res.end();
                }

            });
        }
    });




/* POST user login */
router.post('/login', [ //express-validator rules stack

        //username
        body('username')
        .exists().withMessage('is required')
        .bail()
        .trim()
        .notEmpty().withMessage('is required')
        .bail()
        .isLength({ min: 3, max: 50 })
        .withMessage('Wrong login credentials'),

        //password
        body('password')
        .exists().withMessage('is required')
        .bail()
        .notEmpty().withMessage('is required')
        .bail()
        .isLength({ min: 6, max: 50 })
        .withMessage('Wrong login credentials'),

    ],
    function(req, res, next) {

        //VALIDATION CHECK
        const errors = validationResult(req);

        if (!errors.isEmpty()) {

            console.log(JSON.stringify(errors));

            var errorString = "Wrong login credentials";
            //create 400 http error code: Bad Request
            next(createError(400, errorString));

        } else {
            // logging in user
            console.log("logging in USER: " + req.body.username);

            var username = req.body.username;
            var password = req.body.password;


            var sql = "SELECT * FROM `user` WHERE username = ? AND password = ? AND is_deleted = 0 LIMIT 1";

            con.query(sql, [username, md5(password)], function(query_err, result, fields) {

                if (query_err) {
                    console.log("ERR")
                    next(query_err);
                } else {

                    if (result.length != 1) {
                        next(new Error('Wrong login credentials'))
                    } else {

                        var salt = process.env.HASHSALT || "default_sad_salt";
                        var token = md5(result[0].username + salt + result[0].password + salt + result[0].date_subscribed + Date());

                        var sqlUpdate = "UPDATE `node_leaderboard_lite`.`user` SET `auth_token`=? WHERE  `id`=" + result[0].id;

                        con.query(sqlUpdate, [token], function(query_err, result, fields) {

                            if (query_err) {
                                console.log("ERR")
                                next(query_err);
                            } else {

                                var userResponse = {
                                    status: "OK",
                                    message: "User logged in successfully",
                                    code: "LEADERBOARD-USER-LOGIN-SUCCESS",
                                    userData: {
                                        "username": username,
                                        "token": token
                                    }
                                }

                                //write to result object
                                res.writeHead(200, { 'Content-Type': 'text/json' });
                                res.write(JSON.stringify(userResponse));
                                res.end();
                            }
                        });
                    }
                }
            });
        }
    });





module.exports = router;