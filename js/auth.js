const authSubmit = document.getElementById('auth-submit');
const notify = document.getElementById('notify');

/**
 * Send Request
 *
 * Authorization
 *
 * @method POST
 * @param {Email} email
 * @param {Password} password
 * @returns json
 */
const login = async (email, password) => {
    return await fetch("https://reqres.in/api/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({email,password})
    })
        .then(response => response.json())
        .catch(error => error);
}



/**
 * Add Listen Button
 *
 * Inner send request login and check form validation if response from login method returned token then redirect to Users List page
 */
authSubmit.addEventListener('click', async (e) => {
    e.preventDefault();

    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    if (!(email && password)) {
        notify.classList.remove('d-none');
        notify.innerHTML = 'Email and Password required';
        return false;
    }

    const response = await login(email, password);

    if (response.error)
    {
        notify.classList.remove('d-none');
        notify.innerHTML = response.error;
    }
    else
    {
        localStorage.setItem('token', response.token);
        window.location.replace('index.html');
    }

    return false;
});