const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// ============================================
// CORS - Allow GitHub Pages to access this API
// ============================================
app.use(cors({
    origin: 'https://sudharshanmeesala.github.io'
}));

// ============================================
// Serve static files from 'public' folder
// ============================================
app.use(express.static('public'));

// ============================================
// Parse JSON request bodies
// ============================================
app.use(express.json());

// ============================================
// In-Memory Database
// ============================================
let blogs = [];

// ============================================
// API ROUTES
// ============================================

// GET - Fetch all blogs
app.get('/api/blogs', (req, res) => {
    res.json(blogs);
});

// POST - Add a new blog
app.post('/api/blogs', (req, res) => {
    const { title, content } = req.body;
    
    // Validation
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required.' });
    }
    
    const newBlog = {
        id: Date.now().toString(),
        title: title.trim(),
        content: content.trim(),
        createdAt: new Date().toISOString()
    };
    
    blogs.push(newBlog);
    res.status(201).json(newBlog);
});

// PUT - Update a blog
app.put('/api/blogs/:id', (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    
    const blog = blogs.find(b => b.id === id);
    if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
    }
    
    if (title) blog.title = title.trim();
    if (content) blog.content = content.trim();
    
    res.json(blog);
});

// DELETE - Remove a blog
app.delete('/api/blogs/:id', (req, res) => {
    const { id } = req.params;
    const index = blogs.findIndex(b => b.id === id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Blog not found' });
    }
    
    blogs.splice(index, 1);
    res.status(204).send();
});

// ============================================
// Catch-all route - Serves index.html for any unknown routes
// ============================================
app.get('*', (req, res) => {
    res.sendFile('index.html', { root: 'public' });
});

// ============================================
// Start the server
// ============================================
app.listen(port, () => {
    console.log(`✅ Server running on port ${port}`);
    console.log(`🌐 http://localhost:${port}`);
    console.log(`📡 http://localhost:${port}/api/blogs`);
});