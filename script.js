/**
 * SeizGuard - Authentication System
 * Login and Register Form Handler
 */

// ===========================
// DOM Elements
// ===========================

// Login Form Elements
const loginForm = document.getElementById('loginForm');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const loginErrorAlert = document.getElementById('loginErrorAlert');
const loginErrorMessage = document.getElementById('loginErrorMessage');
const loginSubmitBtn = document.getElementById('loginSubmitBtn');
const loginBtnText = document.getElementById('loginBtnText');

// Register Form Elements
const registerForm = document.getElementById('registerForm');
const registerUsername = document.getElementById('registerUsername');
const registerPassword = document.getElementById('registerPassword');
const registerConfirmPassword = document.getElementById('registerConfirmPassword');
const registerErrorAlert = document.getElementById('registerErrorAlert');
const registerSuccessAlert = document.getElementById('registerSuccessAlert');
const registerErrorMessage = document.getElementById('registerErrorMessage');
const registerSubmitBtn = document.getElementById('registerSubmitBtn');
const registerBtnText = document.getElementById('registerBtnText');

// Section Toggle Elements
const loginSection = document.getElementById('loginSection');
const registerSection = document.getElementById('registerSection');
const showRegisterLink = document.getElementById('showRegisterLink');
const showLoginLink = document.getElementById('showLoginLink');

// ===========================
// Configuration
// ===========================

const API_BASE_URL = 'http://localhost:3000/api/trpc'; // Change this to your API endpoint

// ===========================
// Event Listeners - Form Toggle
// ===========================

showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginSection.style.display = 'none';
    registerSection.style.display = 'block';
    loginForm.reset();
    loginErrorAlert.classList.remove('show');
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerSection.style.display = 'none';
    loginSection.style.display = 'block';
    registerForm.reset();
    registerErrorAlert.classList.remove('show');
    registerSuccessAlert.classList.remove('show');
});

// ===========================
// Event Listeners - Login Form
// ===========================

// Hide error alert on input
loginUsername.addEventListener('input', () => {
    loginErrorAlert.classList.remove('show');
});

loginPassword.addEventListener('input', () => {
    loginErrorAlert.classList.remove('show');
});

// Handle login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = loginUsername.value.trim();
    const password = loginPassword.value;

    // Validation
    if (!username) {
        showLoginError('กรุณากรอกชื่อผู้ใช้');
        return;
    }

    if (!password) {
        showLoginError('กรุณากรอกรหัสผ่าน');
        return;
    }

    // Disable button and show loading state
    loginSubmitBtn.disabled = true;
    loginSubmitBtn.innerHTML = '<span class="spinner"></span><span>กำลังเข้าสู่ระบบ...</span>';

    try {
        const response = await fetch(`${API_BASE_URL}/auth.login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                password,
            }),
        });

        const data = await response.json();

        if (response.ok && data.result?.data?.success) {
            // Success - redirect to home page
            window.location.href = '/';
        } else {
            // Error response
            const errorMsg = data.result?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
            showLoginError(errorMsg);
            resetLoginButton();
        }
    } catch (error) {
        console.error('Login error:', error);
        showLoginError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
        resetLoginButton();
    }
});

// ===========================
// Event Listeners - Register Form
// ===========================

// Hide alerts on input
registerUsername.addEventListener('input', () => {
    registerErrorAlert.classList.remove('show');
    registerSuccessAlert.classList.remove('show');
});

registerPassword.addEventListener('input', () => {
    registerErrorAlert.classList.remove('show');
    registerSuccessAlert.classList.remove('show');
});

registerConfirmPassword.addEventListener('input', () => {
    registerErrorAlert.classList.remove('show');
    registerSuccessAlert.classList.remove('show');
});

// Handle register form submission
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = registerUsername.value.trim();
    const password = registerPassword.value;
    const confirmPassword = registerConfirmPassword.value;

    // Validation
    if (!username) {
        showRegisterError('กรุณากรอกชื่อผู้ใช้');
        return;
    }

    if (!password) {
        showRegisterError('กรุณากรอกรหัสผ่าน');
        return;
    }

    if (!confirmPassword) {
        showRegisterError('กรุณายืนยันรหัสผ่าน');
        return;
    }

    if (password !== confirmPassword) {
        showRegisterError('รหัสผ่านไม่ตรงกัน');
        return;
    }

    // Disable button and show loading state
    registerSubmitBtn.disabled = true;
    registerSubmitBtn.innerHTML = '<span class="spinner"></span><span>กำลังสร้างบัญชี...</span>';

    try {
        const response = await fetch(`${API_BASE_URL}/auth.register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                password,
                confirmPassword,
            }),
        });

        const data = await response.json();

        if (response.ok && data.result?.data?.success) {
            // Success
            registerSuccessAlert.classList.add('show');
            registerForm.reset();

            // Redirect to login after 2 seconds
            setTimeout(() => {
                registerSection.style.display = 'none';
                loginSection.style.display = 'block';
                registerSuccessAlert.classList.remove('show');
                resetRegisterButton();
            }, 2000);
        } else {
            // Error response
            const errorMsg = data.result?.data?.message || 'เกิดข้อผิดพลาดในการลงทะเบียน';
            showRegisterError(errorMsg);
            resetRegisterButton();
        }
    } catch (error) {
        console.error('Register error:', error);
        showRegisterError('เกิดข้อผิดพลาดในการลงทะเบียน');
        resetRegisterButton();
    }
});

// ===========================
// Helper Functions - Login
// ===========================

function showLoginError(message) {
    loginErrorMessage.textContent = message;
    loginErrorAlert.classList.add('show');
}

function resetLoginButton() {
    loginSubmitBtn.disabled = false;
    loginSubmitBtn.innerHTML = '<span id="loginBtnText">เข้าสู่ระบบ</span>';
}

// ===========================
// Helper Functions - Register
// ===========================

function showRegisterError(message) {
    registerErrorMessage.textContent = message;
    registerErrorAlert.classList.add('show');
}

function resetRegisterButton() {
    registerSubmitBtn.disabled = false;
    registerSubmitBtn.innerHTML = '<span id="registerBtnText">สร้างบัญชี</span>';
}

// ===========================
// Initialization
// ===========================

console.log('SeizGuard Authentication System Loaded');
console.log('API Endpoint:', API_BASE_URL);
