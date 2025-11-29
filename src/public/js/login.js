document.getElementById("login-form").addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = e.target.querySelector('input[name="username"]').value;
    const password = e.target.querySelector('input[name="password"]').value;
    const resp = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password  })
        }
    )
    if (!resp.ok) {
        // MOTRARIA ALERTA PERO NO HAY XD
    }
    const resJson = await resp.json();
    if(resJson.redirect){
        window.location.href = resJson.redirect;
    }

})