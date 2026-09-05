// Login form handling
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.auth-form') ||
        document.querySelector('.auth-card form');

    if (!loginForm) return;

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    if (!emailInput || !passwordInput) return;

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevents page reload

        resetFormErrors([emailInput, passwordInput]);

        let isValid = true;
        let firstInvalid = null;

        function fail(input, message) {
            showInputError(input, message);
            isValid = false;
            if (!firstInvalid) firstInvalid = input;
        }

        if (!emailInput.value.trim() || !isValidEmail(emailInput.value)) {
            fail(emailInput, 'Please enter a valid email address');
        }

        // Login only checks that a password was entered. Composition rules
        // belong on signup — re-checking them here just blocks people and
        // advertises the password policy to anyone guessing.
        if (!passwordInput.value) {
            fail(passwordInput, 'Please enter your password');
        }

        if (!isValid) {
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        handleSuccessfulLogin(emailInput.value.trim());
    });

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showInputError(inputElement, message) {
        inputElement.setAttribute('aria-invalid', 'true');
        inputElement.classList.add('input-error');

        let errorMessage = inputElement.parentElement.querySelector('.error-msg');
        if (!errorMessage) {
            errorMessage = document.createElement('small');
            errorMessage.className = 'error-msg';
            errorMessage.setAttribute('role', 'alert');
            errorMessage.id = (inputElement.id || 'field') + '-error';
            inputElement.parentElement.appendChild(errorMessage);
        }

        errorMessage.textContent = message;
        inputElement.setAttribute('aria-describedby', errorMessage.id);
    }

    function resetFormErrors(inputs) {
        inputs.forEach(input => {
            if (!input) return;

            input.classList.remove('input-error');
            input.removeAttribute('aria-invalid');
            input.removeAttribute('aria-describedby');

            const errorMessage = input.parentElement.querySelector('.error-msg');
            if (errorMessage) {
                errorMessage.remove();
            }
        });
    }

    // NOTE: Front-end feedback only. No credentials are checked and nothing
    // is sent to a server — the password is discarded. See the notes on
    // wiring this to a real auth endpoint.
    function handleSuccessfulLogin(email) {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Signing In...';
        }

        setTimeout(() => {
            // Reuse the stored name if this email signed up on this device,
            // so the profile menu doesn't switch to a different label.
            let name = email.split('@')[0];

            try {
                const existing = JSON.parse(localStorage.getItem('currentUser'));
                if (existing && existing.email === email && existing.name) {
                    name = existing.name;
                }
            } catch (err) {
                // Ignore malformed stored data and fall back to the email name.
            }

            localStorage.setItem('currentUser', JSON.stringify({
                name: name,
                email: email,
                isLoggedIn: true
            }));

            window.location.href = '../index.html';
        }, 1200);
    }
});