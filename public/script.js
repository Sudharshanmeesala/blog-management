// ============================================
// 1. FUNCTION TO FETCH AND DISPLAY BLOGS
// ============================================
async function fetchAndDisplayBlogs() {
    const container = document.getElementById('blog-list');
    if (!container) return;

    try {
        container.innerHTML = '<p>⏳ Loading blogs...</p>';

        const response = await fetch('/api/blogs');
        const blogs = await response.json();

        if (blogs.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 8px;">
                    <p style="font-size: 1.2rem;">📭 No blogs yet.</p>
                    <p>Click <a href="add-blog.html" style="color: #1abc9c;">Add Blog</a> to create your first post!</p>
                </div>
            `;
            return;
        }

        let html = '';
        blogs.forEach(blog => {
            html += `
                <div class="blog-card" data-id="${blog.id}">
                    <h2>${escapeHtml(blog.title)}</h2>
                    <p>${escapeHtml(blog.content)}</p>
                    <small>📅 Posted on ${new Date(blog.createdAt).toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</small>
                    <div style="margin-top: 1rem;">
                        <button class="edit-btn" data-id="${blog.id}">✏️ Edit</button>
                        <button class="delete-btn" data-id="${blog.id}">🗑️ Delete</button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

    } catch (error) {
        console.error('Error fetching blogs:', error);
        container.innerHTML = `
            <p style="color: red;">❌ Failed to load blogs. Make sure the server is running.</p>
        `;
    }
}

// ============================================
// 2. HELPER FUNCTION TO PREVENT XSS ATTACKS
// ============================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// 3. FORM VALIDATION & SUBMISSION (Day 6)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    
    if (document.getElementById('blog-list')) {
        fetchAndDisplayBlogs();
    }

    const form = document.getElementById('blog-form');
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const errorDiv = document.getElementById('error-message');

    if (!form) return;

    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.style.color = 'red';
    }

    function clearError() {
        errorDiv.textContent = '';
    }

    if (titleInput) titleInput.addEventListener('input', clearError);
    if (contentInput) contentInput.addEventListener('input', clearError);

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (title === '' || content === '') {
            showError('❌ Please fill in both Title and Content.');
            return;
        }
        if (title.length < 3) {
            showError('❌ Title must be at least 3 characters long.');
            return;
        }
        if (content.length < 10) {
            showError('❌ Content must be at least 10 characters long.');
            return;
        }

        clearError();

        try {
            const response = await fetch('/api/blogs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });

            if (response.ok) {
                const newBlog = await response.json();
                errorDiv.style.color = 'green';
                errorDiv.textContent = '✅ Blog added successfully! Redirecting...';
                titleInput.style.border = '2px solid green';
                contentInput.style.border = '2px solid green';
                form.reset();

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);

            } else {
                const errorData = await response.json();
                showError('❌ Server error: ' + errorData.error);
            }

        } catch (error) {
            showError('❌ Network error: Could not connect to the server.');
            console.error('Fetch error:', error);
        }
    });
});

// ============================================
// 4. EDIT & DELETE BUTTON HANDLERS (Day 8 & 9)
// ============================================
document.addEventListener('click', async function(e) {
    
    // ---------- EDIT BUTTON (Day 8) ----------
    if (e.target.classList.contains('edit-btn')) {
        const id = e.target.dataset.id;
        
        const card = e.target.closest('.blog-card');
        const titleElement = card.querySelector('h2');
        const contentElement = card.querySelector('p');
        
        const currentTitle = titleElement.textContent.trim();
        const currentContent = contentElement.textContent.trim();

        const newTitle = prompt('✏️ Edit Title:', currentTitle);
        if (newTitle === null) return;

        const newContent = prompt('✏️ Edit Content:', currentContent);
        if (newContent === null) return;

        if (newTitle.trim() === '' || newContent.trim() === '') {
            alert('❌ Title and content cannot be empty!');
            return;
        }

        try {
            const response = await fetch(`/api/blogs/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    title: newTitle.trim(), 
                    content: newContent.trim() 
                })
            });

            if (response.ok) {
                const updatedBlog = await response.json();
                alert('✅ Blog updated successfully!');
                fetchAndDisplayBlogs();
            } else {
                const errorData = await response.json();
                alert('❌ Error: ' + errorData.error);
            }
        } catch (error) {
            console.error('Error updating blog:', error);
            alert('❌ Network error: Could not update the blog.');
        }
    }

    // ---------- DELETE BUTTON (Day 9 - Placeholder) ----------
    if (e.target.classList.contains('delete-btn')) {
        alert('🗑️ Delete feature will be added on Day 9!');
    }
});