// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================
function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// ============================================
// FUNCTION TO FETCH AND DISPLAY BLOGS
// ============================================
async function fetchAndDisplayBlogs() {
    const container = document.getElementById('blog-list');
    if (!container) return;

    try {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <div class="spinner" style="width: 40px; height: 40px; border-width: 4px; margin: 0 auto;"></div>
                <p style="margin-top: 1rem; color: #666;">Loading amazing stories...</p>
            </div>
        `;

        const response = await fetch('/api/blogs');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blogs = await response.json();

        if (blogs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="icon">📝</span>
                    <h2>No stories yet</h2>
                    <p>Be the first to share your thoughts with the world!</p>
                    <a href="add-blog.html">✏️ Write a Story</a>
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
                    <small>📅 ${new Date(blog.createdAt).toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</small>
                    <div class="actions">
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
            <div style="text-align: center; padding: 3rem; background: rgba(255,255,255,0.7); border-radius: 20px;">
                <p style="color: #f5576c; font-size: 1.2rem;">❌ Oops! Something went wrong</p>
                <p style="color: #666; margin-top: 0.5rem;">Make sure the server is running at <code>http://localhost:3000</code></p>
                <button onclick="fetchAndDisplayBlogs()" style="margin-top: 1rem;">🔄 Try Again</button>
            </div>
        `;
    }
}

// ============================================
// HELPER FUNCTION TO PREVENT XSS ATTACKS
// ============================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// FORM VALIDATION & SUBMISSION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    
    if (document.getElementById('blog-list')) {
        fetchAndDisplayBlogs();
    }

    const form = document.getElementById('blog-form');
    if (!form) return;

    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const errorDiv = document.getElementById('error-message');

    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.style.color = '#f5576c';
    }

    function showSuccess(message) {
        errorDiv.textContent = message;
        errorDiv.style.color = '#4facfe';
    }

    function clearMessage() {
        errorDiv.textContent = '';
    }

    if (titleInput) {
        titleInput.addEventListener('input', function() {
            clearMessage();
            if (this.value.trim().length < 3 && this.value.length > 0) {
                this.classList.add('error');
                this.classList.remove('success');
            } else if (this.value.trim().length >= 3) {
                this.classList.remove('error');
                this.classList.add('success');
            } else {
                this.classList.remove('error', 'success');
            }
        });
    }
    
    if (contentInput) {
        contentInput.addEventListener('input', function() {
            clearMessage();
            if (this.value.trim().length < 10 && this.value.length > 0) {
                this.classList.add('error');
                this.classList.remove('success');
            } else if (this.value.trim().length >= 10) {
                this.classList.remove('error');
                this.classList.add('success');
            } else {
                this.classList.remove('error', 'success');
            }
        });
    }

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

        clearMessage();
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.innerHTML = '<span class="spinner"></span> Publishing...';
        submitButton.disabled = true;

        try {
            const response = await fetch('/api/blogs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });

            if (response.ok) {
                const newBlog = await response.json();
                showSuccess('✅ Blog published successfully!');
                titleInput.classList.add('success');
                contentInput.classList.add('success');
                form.reset();

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);

            } else {
                const errorData = await response.json();
                showError('❌ ' + (errorData.error || 'Failed to publish'));
                submitButton.innerHTML = '🚀 Publish Story';
                submitButton.disabled = false;
            }

        } catch (error) {
            console.error('Fetch error:', error);
            showError('❌ Network error: Could not connect to the server.');
            submitButton.innerHTML = '🚀 Publish Story';
            submitButton.disabled = false;
        }
    });
});

// ============================================
// EDIT & DELETE BUTTON HANDLERS
// ============================================
document.addEventListener('click', async function(e) {
    
    // EDIT BUTTON
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
            showToast('❌ Title and content cannot be empty!', 'error');
            return;
        }

        const editButton = e.target;
        const originalText = editButton.textContent;
        editButton.innerHTML = '<span class="spinner"></span> Updating...';
        editButton.disabled = true;

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
                showToast('✅ Blog updated successfully!', 'success');
                fetchAndDisplayBlogs();
            } else {
                const errorData = await response.json();
                showToast('❌ ' + (errorData.error || 'Failed to update'), 'error');
            }
        } catch (error) {
            console.error('Error updating blog:', error);
            showToast('❌ Network error: Could not update the blog.', 'error');
        } finally {
            editButton.innerHTML = originalText;
            editButton.disabled = false;
        }
    }

    // DELETE BUTTON
    if (e.target.classList.contains('delete-btn')) {
        const id = e.target.dataset.id;
        
        const card = e.target.closest('.blog-card');
        const titleElement = card.querySelector('h2');
        const blogTitle = titleElement.textContent.trim();

        const confirmDelete = confirm(`⚠️ Are you sure you want to delete "${blogTitle}"?\n\nThis action cannot be undone!`);

        if (!confirmDelete) {
            return;
        }

        const deleteButton = e.target;
        const originalText = deleteButton.textContent;
        deleteButton.innerHTML = '<span class="spinner"></span> Deleting...';
        deleteButton.disabled = true;

        try {
            const response = await fetch(`/api/blogs/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showToast('✅ Blog deleted successfully!', 'success');
                fetchAndDisplayBlogs();
            } else if (response.status === 404) {
                showToast('❌ Blog not found. It may have already been deleted.', 'error');
            } else {
                showToast('❌ Failed to delete the blog. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error deleting blog:', error);
            showToast('❌ Network error: Could not delete the blog.', 'error');
        } finally {
            deleteButton.innerHTML = originalText;
            deleteButton.disabled = false;
        }
    }
});

// ============================================
// AUTO-REFRESH BLOGS EVERY 30 SECONDS
// ============================================
if (document.getElementById('blog-list')) {
    setInterval(() => {
        fetchAndDisplayBlogs();
    }, 30000);
}