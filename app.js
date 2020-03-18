var createError = require('http-errors');
var express = require('express');

var leaderboardRouter = require('./routes/leaderboard');

var app = express();

// middleware parsing body of the post form data
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

//catch all calls to ldb and send them to leaderboard router!!
app.use('/ldb', leaderboardRouter);

// catch everything not catched before as a 404 and forward to error handler
app.use(function(req, res, next) {
  console.log('404');
  next(createError(404,"The requested resource is non existent!!"));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error message (500 defaults to internal error)
  res.status(err.status || 500);
  res.json({
    "MESSAGE": err.message,
    "STATUS": "KO"
  });
  res.end();
  
});

module.exports = app;
