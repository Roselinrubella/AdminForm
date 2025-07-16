document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('/api/feedback');
    if (response.ok) {
        const feedbackData = await response.json();
        const tableBody = document.querySelector('#feedbackTable tbody');
        feedbackData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.email}</td>
                <td>${item.feedback}</td>
                <td>${new Date(item.date).toLocaleString()}</td>
            `;
            tableBody.appendChild(row);
        });
    } else {
        window.location.href = '/login.html';
    }
});

document.getElementById('exportBtn').addEventListener('click', () => {
    window.location.href = '/api/feedback/export';
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    window.location.href = '/api/logout';
});