var express = require("express"),
    methodOveride = require("method-override"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local"),
    expressSanitizer = require("express-sanitizer"),
    Blog = require("./models/blog"),
    User = require("./models/user"),
    passportLocalMongoose = require("passport-local-mongoose");
    
mongoose.connect("mongodb://localhost/blog_app");

var app=express();

app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(require("express-session")({
    secret:"Puta Madrid",
    resave:false,
    saveUninitialized:false
}));
app.use(express.static("public"));
app.use(passport.initialize());
app.use(passport.session());
app.use(expressSanitizer());
app.use(methodOveride("_method"));
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//index

app.get("/blogs",function(req, res){
    Blog.find({},null,{sort:{created:-1}},function(err,blogs){
        if(err){
            console.log(err);
        }else{
            res.render("index",{blogs: blogs});
        }
    });
    
});

//new
 app.get("/secret",isLoggedIn,function(req, res){
      res.render("new");
  });


//show
app.get("/blogs/:id",function(req, res) {
   Blog.findById(req.params.id,function(err,foundBlog){
       if(err){
           res.redirect("/blogs");
       }else{
           res.render("show",{blog:foundBlog});
       }
   }) ;
});



//create
app.post("/blogs",function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog,function(err,newBlog){
        if(err){
            res.render("new");
        }else{
            res.redirect("/blogs");
        }
    });
});

//edit

app.get("/blogs/:id/edit",isLoggedIn,function(req, res) {
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.render("edit",{blog:foundBlog});
        }
    });
});


//update

app.put("/blogs/:id",function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

//delete

app.get("/blogs/:id/delete",isLoggedIn,function(req, res){
    Blog.findByIdAndRemove(req.params.id,function(err){
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs");
        }
    });
});


app.get("/register",function(req, res){
    
    res.render("secret");
    
});

app.post("/register",function(req, res){
    User.register(new User({username: req.body.username}),req.body.password,function(err, user){
        if(err){
            console.log(err);
            return res.render("secret");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/blogs");
        });
    });
});

app.get("/login",function(req, res) {
    if(req.isAuthenticated()){
        res.redirect("/blogs");
    }else{
        res.render("login");
    }
    
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/blogs",
    failureRedirect: "/login"
}) ,function(req, res){
});



app.get("/logout",function(req, res){
    req.logout();
    res.redirect("/blogs");
})

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }else{
    res.redirect("/login");
    }
}





app.listen(process.env.PORT, process.env.IP, function(){
    console.log("success");
});