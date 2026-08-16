// ── AUTHOR PAGE LOGIC ──

let allBooks = [];

async function initAuthorPage() {
    const cardsContainer = document.getElementById("cards");
    const authorSelect = document.getElementById("authorSelect");
    const authorTitle = document.getElementById("authorTitle");

    if (!cardsContainer || !authorSelect) return;

    try {
        const res = await fetch(`${window.API_BASE}/book/all`);
        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to load books");
        }

        allBooks = data.books || [];

        if (allBooks.length === 0) {
            cardsContainer.innerHTML = `<p class="no-books-message">No books available.</p>`;
            return;
        }

        // Extract unique authors
        const authors = Array.from(
            new Set(allBooks.map((b) => b.author).filter(Boolean))
        ).sort();

        // Populate dropdown options
        authors.forEach((author) => {
            const opt = document.createElement("option");
            opt.value = author;
            opt.textContent = author;
            authorSelect.appendChild(opt);
        });

        // Display initial books (random selection)
        renderRandomBooks();

        // Handle selection change
        authorSelect.addEventListener("change", (e) => {
            const selectedAuthor = e.target.value;

            if (!selectedAuthor) {
                authorTitle.textContent = "Explore Books (Random Selection)";
                renderRandomBooks();
            } else {
                authorTitle.textContent = `Books by ${selectedAuthor}`;
                const filtered = allBooks.filter(
                    (b) => b.author.toLowerCase() === selectedAuthor.toLowerCase()
                );

                if (filtered.length === 0) {
                    cardsContainer.innerHTML = `<p class="no-books-message">No books found for this author.</p>`;
                } else {
                    cardsContainer.innerHTML = filtered.map(bookCardHTML).join("");
                }
            }
        });
    } catch (err) {
        console.error(err);
        cardsContainer.innerHTML = `<p class="error-books-message">Could not load authors. Is the backend running?</p>`;
    }
}

function renderRandomBooks() {
    const cardsContainer = document.getElementById("cards");
    const shuffled = [...allBooks].sort(() => 0.5 - Math.random());
    const randomBooks = shuffled.slice(0, 6);
    cardsContainer.innerHTML = randomBooks.map(bookCardHTML).join("");
}

document.addEventListener("DOMContentLoaded", initAuthorPage);
