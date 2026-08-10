// ── CONFIG ── (uses window.API_BASE from config.js)
const AUTH_API = `${window.API_BASE}/auth`;

async function loadProfile() {
    try {
        const res = await fetch(`${AUTH_API}/me`, { credentials: "include" });
        const data = await res.json();

        if (!res.ok || !data.success) {
            // not logged in — send to login page
            window.location.href = "Adminpanel.html";
            return;
        }

        const user = data.user;

        document.getElementById("profileName").textContent = user.name;
        document.getElementById("profileEmail").textContent = user.email;
        document.getElementById("profileRoleBadge").textContent = user.role;

        if (user.createdAt) {
            document.getElementById("profileJoined").textContent = new Date(user.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        }

        if (user.avatar && user.avatar.url) {
            document.getElementById("profileAvatar").src = user.avatar.url;
        }

        if (user.role === "Admin") {
            document.getElementById("adminLink").style.display = "block";
        }
    } catch (err) {
        console.error(err);
        window.location.href = "Adminpanel.html";
    }
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
        await fetch(`${AUTH_API}/logout`, { credentials: "include" });
    } catch (err) {
        console.error(err);
    }
    window.location.href = "home.html";
});

document.addEventListener("DOMContentLoaded", loadProfile);