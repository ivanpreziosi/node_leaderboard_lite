const envConfig = require('dotenv').config();

var createError = require('http-errors');
var express = require('express');

var port = process.env.PORT || 8080;

var Auth = require('./app_modules/AuthModule');

var leaderboardRouter = require('./routes/leaderboard');
var userRouter = require('./routes/user');

var app = express();

// middleware parsing body of the post form data
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


app.use(function(req, res, next) {
    if (envConfig.error) {
        next(createError(500, envConfig.error));
    }
    next();
});

app.use(['/ldb', '/usr/logout'], Auth.checkAuth);

//catch all calls to ldb and send them to leaderboard router!!
app.use('/ldb', leaderboardRouter);

//routing delle funzioni per gli endpoint di usr
app.use('/usr', userRouter);

app.use(function(req, res, next) {
    //__dirname is an environment variable that tells you the absolute path of the directory containing the currently executing file!
    var dirPath = __dirname;
    res.sendFile(dirPath + '/views/doc.html');
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error message (500 defaults to internal error)
    res.status(err.status || 500);
    res.json({
        "status": "KO",
        "message": err.message,
        "code": "ERROR-HANDLE-" + (err.status || 500)
    });
    res.end();

});

app.listen(port, function() {
    console.log('HI! The leaderboard server is listening on ' + port);
});