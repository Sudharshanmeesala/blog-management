const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // IMPORTANT for Render

app.use(express.json());
app.use(express.static('.'));

let blogs = [];

app.get('/api/blogs', (req, res) => {
    res.json(blogs);
});

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

app.delete('/api/blogs/:id', (req, res) => {
    const { id } = req.params;
    const index = blogs.findIndex(b => b.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Blog not found' });
    }
    blogs.splice(index, 1);
    res.status(204).send();
});

app.listen(port, () => {
    console.log(`✅ Server running on port ${port}`);
});