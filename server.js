const express = require('express');
const app = express();
const port = 3000;

// ---------- MIDDLEWARE ----------
// 1. Allows Express to parse JSON data sent in the request body (for POST)
app.use(express.json());

// 2. Serves your static HTML/CSS/JS files from the 'public' folder
app.use(express.static('public'));

// ---------- IN-MEMORY DATABASE (Array) ----------
// This will hold our blog posts for now (resets when server restarts)
let blogs = [];

// ---------- ROUTES ----------

// 1. GET route: Fetch all blogs
app.get('/api/blogs', (req, res) => {
    res.json(blogs); // Send the entire array as JSON
});

// 2. POST route: Add a new blog
app.post('/api/blogs', (req, res) => {
    // Extract title and content from the request body
    const { title, content } = req.body;

    // Validation: Check if fields are missing
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required.' });
    }

    // Create a new blog object with a unique ID (using timestamp)
    const newBlog = {
        id: Date.now().toString(),
        title: title,
        content: content,
        createdAt: new Date().toISOString()
    };

    // Push it into our "database" (array)
    blogs.push(newBlog);

    // Send back the created blog with a 201 (Created) status
    res.status(201).json(newBlog);
});

// 3. (BONUS) Root route to show a message - keep this so the browser works
app.get('/', (req, res) => {
    res.send('Hello World from Express! API is running at /api/blogs');
});

// ---------- START THE SERVER ----------
app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
    console.log(`📝 Test GET:  http://localhost:${port}/api/blogs`);
    console.log(`📝 Test POST: http://localhost:${port}/api/blogs (Use Postman)`);
});