import express from "express";
import bodyParser from "body-parser";
import fs from "fs"; // For storing data in a JSON file

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory storage for blog posts
const DATA_FILE = "./data/posts.json";

// Helper: Load posts from file
const loadPosts = () => {
  if (fs.existsSync(DATA_FILE)) {
    const rawData = fs.readFileSync(DATA_FILE);
    return JSON.parse(rawData);
  }
  return [];
};

// Helper: Save posts to file
const savePosts = (posts) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
};

// Home Route: Display all blog posts
app.get("/", (req, res) => {
  const posts = loadPosts().reverse();
  res.render("index.ejs", { posts });
});

// View Single Post Route
app.get("/post/:title", (req, res) => {
  const posts = loadPosts();
  const postTitle = decodeURIComponent(req.params.title); // Get the post title from the URL
  const post = posts.find(p => p.title === postTitle); // Find post by title
  if (post) {
    res.render("post.ejs", { post });
  } else {
    res.render("404.ejs");
  }
});

// Latest Post Route
app.get("/latest", (req, res) => {
  const posts = loadPosts();
  const latestPost = posts.length > 0 ? posts[posts.length - 1] : null;
  res.render("latest.ejs", { latestPost });
});

// New Post Form Route
app.get("/newpost", (req, res) => {
  res.render("newpost.ejs");
});

// Handle New Post Submission
app.post("/newpost", (req, res) => {
  const posts = loadPosts();
  const { title, body } = req.body;
  if (posts.some(p => p.title === title)) {
    return res.status(400).send("Post with the same title already exists. Please use a different title.");
  }
  const newPost = {
    title,
    body,
    date: new Date().toLocaleDateString(),
  };
  posts.push(newPost);
  savePosts(posts);
  res.redirect("/");
});

app.get("/post/:title/edit", (req, res) => {
  const posts = loadPosts();
  const post = posts.find(p => p.title === req.params.title);
  if (post) {
    res.render("edit.ejs", { post });
  } else {
    res.render("404.ejs");
  }
});

app.post("/post/:title/edit", (req, res) => {
  const posts = loadPosts();
  const postIndex = posts.findIndex(p => p.title === req.params.title);
  if (postIndex !== -1) {
    posts[postIndex].title = req.body.title;
    posts[postIndex].body = req.body.body;
    savePosts(posts);
    res.redirect(`/post/${encodeURIComponent(req.body.title)}`);
  } else {
    res.render("404.ejs");
  }
});

app.post("/post/:title/delete", (req, res) => {
  let posts = loadPosts();
  posts = posts.filter(p => p.title !== req.params.title); // Remove the matching post
  savePosts(posts);
  res.redirect("/"); 
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
