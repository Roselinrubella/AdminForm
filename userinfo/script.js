document.getElementById('feedbackForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const feedback = document.getElementById('feedback').value;

    const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, feedback })
    });

    if (response.ok) {
        alert('Feedback submitted successfully!');
        document.getElementById('feedbackForm').reset();
    } else {
        alert('Failed to submit feedback. Please try again.');
    }
});