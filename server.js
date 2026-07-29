const express = require('express');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// In-memory storage
let blogs = [];

// GET route - fetch all blogs
app.get('/api/blogs', (req, res) => {
    res.json(blogs);
});

// POST route - add a new blog
app.post('/api/blogs', (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required.' });
    }
    const newBlog = {
        id: Date.now().toString(),
        title,
        content,
        createdAt: new Date().toISOString()
    };
    blogs.push(newBlog);
    res.status(201).json(newBlog);
});

app.get('/', (req, res) => {
    res.send('Hello World from Express! API is running at /api/blogs');
});
// PUT route - Update an existing blog
app.put('/api/blogs/:id', (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    // Find the blog by its ID
    const blog = blogs.find(b => b.id === id);

    // If blog not found, return 404
    if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
    }

    // Update the fields if they are provided
    if (title) blog.title = title;
    if (content) blog.content = content;

    // Send back the updated blog
    res.json(blog);
});
app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
});