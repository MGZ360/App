document.getElementById("logout-button").addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    document.location.href = '/login';
});