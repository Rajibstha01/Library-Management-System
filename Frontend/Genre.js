// Depends on window.API_BASE (config.js) and bookCardHTML/escapeHTML (books.js)

async function loadGenres() {
    const container = document.getElementById("genreContent");
    if (!container) return;

    try {
        const res = await fetch(`${window.API_BASE}/book/all`);
        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to load books");
        }

        const books = data.books || [];

        if (books.length === 0) {
            container.innerHTML = `<p style="text-align:center; color:#888; padding: 3rem 0;">No books available yet.</p>`;
            return;
        }

        // Group books by genre (books with no genre fall under "Uncategorized")
        const genreMap = {};
        books.forEach((book) => {
            const tags = Array.isArray(book.genre) && book.genre.length > 0 ? book.genre : ["Uncategorized"];
            tags.forEach((genre) => {
                if (!genreMap[genre]) genreMap[genre] = [];
                genreMap[genre].push(book);
            });
        });

        const sortedGenres = Object.keys(genreMap).sort();

        container.innerHTML = sortedGenres
            .map(
                (genre) => `
            <section class="genre-section">
                <h2 class="genre-heading">${escapeHTML(genre)}</h2>
                <div class="genre-cards">
                    ${genreMap[genre].map(bookCardHTML).join("")}
                </div>
            </section>`
            )
            .join("");
    } catch (err) {
        console.error(err);
        container.innerHTML = `<p style="text-align:center; color:#b32c24; padding: 3rem 0;">Could not load genres. Is the backend running?</p>`;
    }
}

document.addEventListener("DOMContentLoaded", loadGenres);