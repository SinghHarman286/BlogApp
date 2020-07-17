var express = require("express"),
	mongoose = require("mongoose"),
	bodyParser = require("body-parser"),
	methodOverride = require("method-override"),
	expressSanitizer = require("express-sanitizer"),
	app = express();

// creates a DB named blog_app
mongoose.connect("mongodb://localhost/blog_app");

// setting up the app.
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

// Schema
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});

// Compiling
var Blog = mongoose.model("Blog", blogSchema);

// Homepage /
app.get("/", function(req, res) {
	res.redirect("/blogs");
})

// INDEX /blogs - GET
app.get("/blogs", function(req, res) {
	Blog.find({}, function(err, blogs) {
		if(err) {
			console.log("error sir - " + err);
		}
		else {
			res.render("index", {blogs: blogs});
		}
	})
})

// CREATE /blogs - POST
app.post("/blogs", function(req, res) {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, function(err, blogCreated) {
		if(err) {
			res.redirect("/blogs/new");
		}
		else {
			res.redirect("/blogs", {blogs: blogCreated});
		}
	})
})


//  NEW /blogs/new
app.get("/blogs/new", function(req, res) {
	res.render("new");
})

// Show - GET
app.get("/blogs/:id", function(req, res) {
	Blog.findById(req.params.id, function(err, foundBlog) {
		if(err) {
			res.redirect("/blogs");
		}
		else {
			res.render("show", {blog: foundBlog});
		}
	})
})

// Editing
app.get("/blogs/:id/edit", function(req, res) {
	Blog.findById(req.params.id, function(err, foundBlog) {
		if(err) {
			res.redirect("/blogs");
		}
		else {
			res.render("edit", {blog: foundBlog});
		}
	})
});

// Updating
app.put("/blogs/:id", function(req, res) {
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
		if(err) {
			res.redirect("/blogs");
		}
		else {
			var newURL = "/blogs/" + updatedBlog._id;
			res.redirect(newURL);
		}
	})
})


// Deleting
app.delete("/blogs/:id", function(req, res) {
	Blog.findByIdAndRemove(req.params.id, function(err) {
		res.redirect("/blogs");
	})
})

// Listening
app.listen(3000, function() {
console.log("==The server has started successfully!==")
});