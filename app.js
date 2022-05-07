var express = require('express')
var cors = require('cors')
var bodyParser = require('body-parser')
const mysql = require('mysql2');
var app = express()
var jsonParser = bodyParser.json()
const bcrypt = require('bcrypt');
const saltRounds = 10;
var jwt = require('jsonwebtoken');
const secret ="Fullstack-Login-2022"
const PORT = process.env.PORT || 5000

app.use(cors())

const connection = mysql.createConnection({
    host: 'l0ebsc9jituxzmts.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    port: "3306",
    user: 'rrf8p2adrhgk0v0i',
    password: "a2j813b16b121yt0",
    database: 'wnl1kmnobdugsgv8'
  });

 


//register
app.post('/register',jsonParser, function (req, res, next) {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        connection.execute(
            'INSERT INTO `users`(`email`, `password`, `fname`, `lname`) VALUES (?,?,?,?)',
            [req.body.email,hash,req.body.fname,req.body.lname],
            function(err, results, fields) {
                if(err){
                    res.json({status:"error",massage:err})
                    return
                }
                res.json({status:"Ok"})
            }
          );
    });
})

//login
app.post('/login',jsonParser, function (req, res, next) {
    connection.execute(
        'SELECT * FROM `users` WHERE email=?',
        [req.body.email],
        function(err, results, fields) {
            if(err){
                res.json({status:"error",massage:err})
                return
            }
            if(results.length == 0){
                res.json({status:"error",massage:"no user found"})
                return
            }

            bcrypt.compare(req.body.password, results[0].password, function(err, islogin) {
                if(islogin){
                    var token = jwt.sign({ email: results[0].email }, secret,{ expiresIn: '1h' });
                    res.json({status:"Ok",massage:"login success",token})
                }else{
                    res.json({status:"error",massage:"login failed"})
                }
            });
        }
      );
})

//authen
app.post('/authen',jsonParser, function (req, res, next) {
    try{
        const token = req.headers.authorization.split('Bearer ')[1]
    var decoded = jwt.verify(token, secret);
    res.json({status:"Ok",decoded})
    } catch(err){
        res.json({status:"error",massage:"failed"})
    }
    
})

app.listen(PORT, function () {
    console.log('CORS-enabled web server listening on port '+PORT)
  })