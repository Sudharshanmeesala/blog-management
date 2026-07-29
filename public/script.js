// Wait for the DOM to fully load before running the script
document.addEventListener('DOMContentLoaded', () => {
    
    // Get references to the form elements
    const form = document.getElementById('blog-form');
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const errorDiv = document.getElementById('error-message');

    // Function to display errors
    function showError(message) {
        errorDiv.textContent = message;
    }

    // Function to clear errors
    function clearError() {
        errorDiv.textContent = '';
    }

    // Real-time validation: Clear error when user starts typing
    if (titleInput) {
        titleInput.addEventListener('input', clearError);
    }
    if (contentInput) {
        contentInput.addEventListener('input', clearError);
    }
    // Live Character Counter for Title
if (titleInput) {
    const counterDiv = document.createElement('small');
    counterDiv.id = 'title-counter';
    titleInput.parentNode.insertBefore(counterDiv, titleInput.nextSibling);
    
    titleInput.addEventListener('input', function() {
        const count = this.value.length;
        counterDiv.textContent = `${count}/50 characters`;
        if (count > 50) {
            counterDiv.style.color = 'red';
        } else {
            counterDiv.style.color = '#555';
        }
    });
}
    // Handle form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            // Prevent the default page refresh
            e.preventDefault();

            // Trim whitespace from inputs
            const title = titleInput.value.trim();
            const content = contentInput.value.trim();

            // 1. Check if fields are empty
            if (title === '' || content === '') {
                showError('❌ Please fill in both Title and Content.');
                return; // Stop here
            }

            // 2. Check minimum character length for Title
            if (title.length < 3) {
                showError('❌ Title must be at least 3 characters long.');
                return;
            }

            // 3. Check minimum character length for Content
            if (content.length < 10) {
                showError('❌ Content must be at least 10 characters long.');
                return;
            }

            // If all validations pass:
clearError();
alert('✅ Form is valid! Blog post ready to be submitted.');

// 1. Highlight the fields in green to show success
titleInput.style.border = '2px solid green';
contentInput.style.border = '2px solid green';

// 2. Clear the input fields after submission
this.reset(); // <-- THIS clears the text fields

// 3. Remove the green border after 1.5 seconds (so user sees the success)
setTimeout(() => {
    titleInput.style.border = '';
    contentInput.style.border = '';
}, 1500);