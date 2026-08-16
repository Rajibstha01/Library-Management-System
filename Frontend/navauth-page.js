// Updates the nav's "Admin" button/link based on login state.
// Requires the nav markup to have: <a id="navAuthLink"><button id="navbutton">...</button></a>

(async function () {
    const link = document.getElementById("navAuthLink");
    const btn = document.getElementById("navbutton");
    if (!link || !btn) return;

    try {
        const res = await fetch(`${window.API_BASE}/auth/me`, { credentials: "include" });
        const data = await res.json();

        if (res.ok && data.success && data.user) {
            link.href = "profile.html";
            btn.textContent = data.user.name ? data.user.name.split(" ")[0] : "Profile";
        }
        // if not logged in, leave the default "Admin" → Adminpanel.html as-is
    } catch (err) {
        // backend unreachable — leave default nav alone, fail silently
    }
})();
