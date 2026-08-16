// ── CONFIG ── (uses window.API_BASE from config.js)
const AUTH_API = `${window.API_BASE}/auth`;

// ── ELEMENTS ──
const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authMessage = document.getElementById("authMessage");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

// ── TAB SWITCHING ──
tabLogin.addEventListener("click", () => {
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
    loginForm.style.display = "block";
    registerForm.style.display = "none";
    hideMessage();
});

tabRegister.addEventListener("click", () => {
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");
    registerForm.style.display = "block";
    loginForm.style.display = "none";
    hideMessage();
});

// ── MESSAGE HELPERS ──
function showMessage(text, isError = true) {
    authMessage.textContent = text;
    authMessage.style.display = "block";
    authMessage.className = "auth-message " + (isError ? "auth-error" : "auth-success");
}

function hideMessage() {
    authMessage.style.display = "none";
}

// ── REGISTER ──
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideMessage();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    registerBtn.disabled = true;
    registerBtn.textContent = "Registering...";

    try {
        const res = await fetch(`${AUTH_API}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Registration failed");
        }

        showMessage("Account created! Redirecting...", false);
        setTimeout(() => {
            window.location.href = "home.html";
        }, 1000);
    } catch (err) {
        showMessage(err.message || "Something went wrong. Is the backend running?");
    } finally {
        registerBtn.disabled = false;
        registerBtn.textContent = "Register";
    }
});

// ── LOGIN ──
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideMessage();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {
        const res = await fetch(`${AUTH_API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Login failed");
        }

        showMessage("Logged in! Redirecting...", false);
        setTimeout(() => {
            // Admins go to the add-book panel, regular users go to their profile
            window.location.href = data.user && data.user.role === "Admin" ? "Addbook.html" : "profile.html";
        }, 800);
    } catch (err) {
        showMessage(err.message || "Something went wrong. Is the backend running?");
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = "Login";
    }
});
