const express = require("express");
const mysql = require('mysql');
const app = express();
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
dotenv.config({ path: './.env'});
const bcrypt = require("bcryptjs");
app.use(express.urlencoded({extended: 'false'}))
app.use(express.json());


//npm run mark-1
app.use("/css",express.static(path.join(__dirname, "node_modules/bootstrap/dist/css")));
app.use("/js", express.static(path.join(__dirname, "/node_modules/bootstrap/dist/js")));
app.use("/js", express.static(path.join(__dirname, "/node_modules/jquery/dist")));
// console.log(__dirname);
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
// /usr/local/mysql/bin/mysql -u root -p      
const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'newuser',
    password : 'Hazim0505',
    database : 'userDB' //use userDB
});

db.connect((err) => {
    if (err){
        throw err;
        console.log(error);
    }
    console.log(db.connect);
});
db.on('error', function(err) {
    console.log("[mysql error]",err);
  });
//request response
app.get('/', (req, res) => {
    res.render("index.ejs")
});
app.get('/login', (req, res) => {
    if(req.session.loggedin == true) {
        res.redirect("/home");
    } else {
        res.render("login.ejs");
    }
});
app.get('/register', (req, res) => {
    res.render("register.ejs");
});
app.get('/home', (req, res) => {
    if (req.session.loggedin) {
		// Output username
		// res.send('Welcome back, ' + req.session.username + '!');
        res.render("home.ejs");

	} else {
		// Not logged in
		res.send('Please login to view this page!');
	}
	res.end();
});
app.get('/logout',  function (req, res, next)  {
    // If the user is loggedin
    if (req.session.loggedin) {
          req.session.loggedin = false;
          res.redirect('/');
    }else{
        // Not logged in
        res.redirect('/');
    }
});


app.post("/register", async (req, resp) => {    
    const { username, password } = req.body;
    // db.query() code goes here 
    //SELECT * FROM user;
    console.log(username);
    var result = db.query('SELECT username FROM user WHERE username = ?', [username]);
    db.query('SELECT username FROM user WHERE username = ?', [username], async (error, ress) => {
        // remaining code goes here 
        // resp.redirect("/register");
        if(error){
            console.log(error);
        }
        if( ress.length > 0 ) {
            console.log("Username already exists");
            resp.send("User Already exist");
        } else {   
            let hashedPassword = await bcrypt.hash(password, 8);
            var sql = 'INSERT INTO user (username, password) VALUES ?';
            var values = [[username, password]];
            db.query(sql,[values], function (err, res) {
                if (err) throw err;
                console.log("1 record inserted");
                    resp.redirect("/login");
                    console.log(ress.length > 0);
            });
        }
    });

});

app.post('/login', function(request, response) {
	let username = request.body.username;
	let password = request.body.password;
	if (username && password) {
		db.query('SELECT * FROM user WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (error) throw error;
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				// Redirect to home page
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.listen(3000);