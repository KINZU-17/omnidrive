// ==============================
// LOGIN PAGE FUNCTIONALITY
// ==============================

let selectedUserType = null;

// DOM Elements
const userTypeSection = document.getElementById('userTypeSection');
const loginForm = document.getElementById('loginForm');
const signUpForm = document.getElementById('signUpForm');
const forgetPasswordForm = document.getElementById('forgetPasswordForm');

// User data storage
function getUsers() {
    return JSON.parse(localStorage.getItem('omnidrive_users')) || [];
}

function saveUsers(users) {
    localStorage.setItem('omnidrive_users', JSON.stringify(users));
}

// Create floating particles
function createLoginParticles() {
    const container = document.getElementById('loginParticles');
    if (!container) return;
    
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'login-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.width = Math.random() * 4 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDuration = (Math.random() * 8 + 8) + 's';
        particle.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(particle);
    }
}

// Initialize particles on load
document.addEventListener('DOMContentLoaded', createLoginParticles);

// USER TYPE SELECTION
function selectUserType(type) {
    selectedUserType = type;
    const typeNames = {
        client: 'Client',
        dealer: 'Dealer',
        liaison: 'Technical Liaison',
        admin: 'Admin'
    };
    
    document.getElementById('loginFormTitle').textContent = `LOGIN - ${typeNames[type]}`;
    showSection('loginForm');
}

// SECTION SWITCHING
function showSection(sectionId) {
    document.querySelectorAll('.login-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

function backToUserType() {
    selectedUserType = null;
    showSection('userTypeSection');
}

// FORM SWITCHING HANDLERS
function showLogin(e) {
    e.preventDefault();
    showSection('loginForm');
}

function showSignup(e) {
    e.preventDefault();
    showSection('signUpForm');
}

function showForgetPassword(e) {
    e.preventDefault();
    showSection('forgetPasswordForm');
}

// LOGIN FORM SUBMIT
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const warning = document.getElementById('loginWarning');
    
    warning.textContent = '';
    
    if (!username || !password) {
        warning.textContent = 'Please fill all fields';
        return;
    }
    
    const users = getUsers();
    const user = users.find(u => 
        u.username === username && 
        u.password === password && 
        u.userType === selectedUserType
    );
    
    if (user) {
        // Store user session
        sessionStorage.setItem('omnidrive_user', JSON.stringify(user));
        showNotification(`Welcome back, ${username}!`, 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        warning.textContent = 'Invalid username or password for this account type';
    }
});

// SIGN UP FORM SUBMIT
document.getElementById('signUpForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('signUpEmail').value.trim();
    const username = document.getElementById('signUpUsername').value.trim();
    const password = document.getElementById('signUpPassword').value.trim();
    const confirmPassword = document.getElementById('signUpConfirmPassword').value.trim();
    const warning = document.getElementById('signUpWarning');
    
    warning.textContent = '';
    
    if (!email || !username || !password || !confirmPassword) {
        warning.textContent = 'Please fill all fields';
        return;
    }
    
    if (password !== confirmPassword) {
        warning.textContent = 'Passwords do not match';
        return;
    }
    
    if (password.length < 6) {
        warning.textContent = 'Password must be at least 6 characters';
        return;
    }
    
    if (!selectedUserType) {
        warning.textContent = 'Please select a user type';
        return;
    }
    
    const users = getUsers();
    
    // Check if username or email already exists
    if (users.some(u => u.username === username)) {
        warning.textContent = 'Username already exists';
        return;
    }
    
    if (users.some(u => u.email === email)) {
        warning.textContent = 'Email already registered';
        return;
    }
    
    // Add new user
    users.push({ 
        email, 
        username, 
        password,
        userType: selectedUserType,
        createdAt: new Date().toISOString()
    });
    saveUsers(users);
    
    showNotification('Account created successfully! Please login.', 'success');
    setTimeout(() => {
        document.getElementById('signUpEmail').value = '';
        document.getElementById('signUpUsername').value = '';
        document.getElementById('signUpPassword').value = '';
        document.getElementById('signUpConfirmPassword').value = '';
        showSection('loginForm');
    }, 1000);
});

// FORGET PASSWORD FORM SUBMIT
document.getElementById('forgetPasswordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('forgetEmail').value.trim();
    const warning = document.getElementById('forgetWarning');
    
    warning.textContent = '';
    
    if (!email) {
        warning.textContent = 'Please enter your email';
        return;
    }
    
    const users = getUsers();
    const user = users.find(u => u.email === email && u.userType === selectedUserType);
    
    if (user) {
        showNotification(`Password reset link sent to ${email}`, 'success');
        setTimeout(() => {
            document.getElementById('forgetEmail').value = '';
            showSection('loginForm');
        }, 1500);
    } else {
        warning.textContent = 'Email not found for this account type';
    }
});

// NOTIFICATION HELPER
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(33, 150, 243, 0.9)'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        backdrop-filter: blur(12px);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add slide animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { 
            transform: translateX(400px);
            opacity: 0;
        }
        to { 
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from { 
            transform: translateX(0);
            opacity: 1;
        }
        to { 
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);