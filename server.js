const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');

// ✅ CORS for GitHub Pages and Render
app.use(cors({
    origin: ['https://sudharshanmeesala.github.io', 'https://blog-management-duid.onrender.com', 'http://localhost:3000']
}));

// ✅ Serve static files from the public folder using an absolute path
app.use(express.static(publicDir));

app.use(express.json());

// In-memory storage
let blogs = [];

// GET - Fetch all blogs
app.get('/api/blogs', (req, res) => {
    res.json(blogs);
});

// POST - Add a new blog
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

// PUT - Update a blog
app.put('/api/blogs/:id', (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const blog = blogs.find(b => b.id === id);
    if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
    }
    if (title) blog.title = title;
    if (content) blog.content = content;
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

// ✅ Serve the homepage explicitly
app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/add-blog', (req, res) => {
    res.sendFile(path.join(publicDir, 'add-blog.html'));
});

// ✅ Catch-all route for client-side routes
app.get('*', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

// Start server
const server = app.listen(port, () => {
    console.log(`✅ Server running on port ${port}`);
    console.log(`🌐 http://localhost:${port}`);
    console.log(`📡 http://localhost:${port}/api/blogs`);
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`⚠️ Port ${port} is already in use. Please stop the other process or use a different port.`);
    } else {
        console.error('❌ Server error:', error);
    }
    process.exit(1);
});