document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.querySelector('.auth-card form');

    if (!signupForm) return;

    // Grab Form Inputs
    const fullNameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    const termsCheckbox = document.getElementById('terms');
    const submitBtn = signupForm.querySelector('button[type="submit"]');

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Stop normal form submission

        // Clear previous error styles
        resetFormErrors([fullNameInput, emailInput, passwordInput, termsCheckbox]);

        let isValid = true;
        let firstInvalid = null;

        function fail(input, message) {
            showInputError(input, message);
            isValid = false;
            if (!firstInvalid) firstInvalid = input;
        }

        // 1. Full Name Validation
        if (!fullNameInput.value.trim()) {
            fail(fullNameInput, 'Please enter your full name');
        }

        // 2. Email Validation
        if (!emailInput.value.trim() || !isValidEmail(emailInput.value)) {
            fail(emailInput, 'Please enter a valid email address');
        }

        // 3. Password rules — checked independently of the email result
        const password = passwordInput.value;

        if (!password || password.length < 8) {
            fail(passwordInput, 'Password must be at least 8 characters long');
        } else if (!/[A-Z]/.test(password)) {
            fail(passwordInput, 'Password must include an uppercase letter');
        } else if (!/[0-9]/.test(password)) {
            fail(passwordInput, 'Password must include a number');
        } else if (!/[^A-Za-z0-9]/.test(password)) {
            fail(passwordInput, 'Password must include a symbol, for example _ or @');
        }

        // 4. Terms Checkbox Check
        if (!termsCheckbox.checked) {
            fail(termsCheckbox,
                'Please accept the Terms of Service and Privacy Policy to continue');
        }

        if (!isValid) {
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        handleSuccessfulSignup({
            fullName: fullNameInput.value.trim(),
            email: emailInput.value.trim()
        });
    });

    // Helper: Simple email format checker
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Helper: Display red border and error message under input
    function showInputError(inputElement, message) {
        inputElement.setAttribute('aria-invalid', 'true');

        if (inputElement.type !== 'checkbox') {
            inputElement.classList.add('input-error');
        }

        // Check if an error message element already exists, otherwise create it
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

    // Helper: Reset borders and clear error messages
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

    // Helper: Simulate signup completion & UI feedback
    // NOTE: This is front-end feedback only. No account is created and the
    // password is never sent anywhere — see the notes on wiring up a real
    // signup endpoint.
    function handleSuccessfulSignup(userData) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';

        setTimeout(() => {
            // Save mock user session in localStorage
            localStorage.setItem('currentUser', JSON.stringify({
                name: userData.fullName,
                email: userData.email,
                isLoggedIn: true
            }));

            // Alert feedback & redirection
            alert(`Welcome aboard, ${userData.fullName}! Your account has been created.`);
            window.location.href = '../index.html'; // Redirect to home page
        }, 1200);
    }
});