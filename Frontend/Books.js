const BOOKS_API = `${window.API_BASE}/book/all`;

let allFetchedBooks = [];

function bookCardHTML(book) {
    const cover =
        book.coverImage && book.coverImage.trim() !== ""
            ? book.coverImage
            : "https://placehold.co/200x280?text=No+Cover";

    const genres =
        Array.isArray(book.genre) && book.genre.length > 0
            ? book.genre.map((g) => `<span class="book-genre">${escapeHTML(g)}</span>`).join("")
            : typeof book.genre === "string" && book.genre.trim() !== ""
            ? `<span class="book-genre">${escapeHTML(book.genre)}</span>`
            : "";

    const availableCopies = Number(book.availableCopies);
    const totalQuantity = Number(book.quantity);
    const isLowStock = availableCopies < 10;

    const stockLabel = availableCopies > 0
        ? `${availableCopies} of ${totalQuantity} available`
        : "Out of stock";

    return `
        <div class="card" onclick="openBookModal('${book._id}')">
            <div class="coverpage">
                <img src="${cover}" alt="${escapeHTML(book.title)}">
                <div class="titles">
                    <p class="book-title">${escapeHTML(book.title)}</p>
                    <p class="bookauther">${escapeHTML(book.author)}</p>
                    <div class="genre">${genres}</div>
                    <p class="book-stock ${isLowStock ? "low-stock-red" : ""}">${stockLabel}</p>
                </div>
            </div>
        </div>`;
}

function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
}

function renderFilteredBooks() {
    const container = document.getElementById("cards");
    if (!container) return;

    const searchbar = document.getElementById("searchbar");
    const query = searchbar ? searchbar.value.trim().toLowerCase() : "";

    let booksToDisplay = allFetchedBooks;

    if (query) {
        booksToDisplay = allFetchedBooks.filter((book) => {
            const title = (book.title || "").toLowerCase();
            const author = (book.author || "").toLowerCase();
            const genre = Array.isArray(book.genre)
                ? book.genre.join(" ").toLowerCase()
                : (book.genre || "").toLowerCase();

            return title.includes(query) || author.includes(query) || genre.includes(query);
        });
    }

    if (typeof window.BOOK_LIMIT === "number" && !query) {
        booksToDisplay = booksToDisplay.slice(0, window.BOOK_LIMIT);
    }

    if (booksToDisplay.length === 0) {
        container.innerHTML = `<p class="no-books-message">No books match your search.</p>`;
        return;
    }

    container.innerHTML = booksToDisplay.map(bookCardHTML).join("");
}

async function loadBooks() {
    const container = document.getElementById("cards");
    const searchbar = document.getElementById("searchbar");

    try {
        const res = await fetch(BOOKS_API);
        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to load books");
        }

        allFetchedBooks = data.books || [];

        const urlParams = new URLSearchParams(window.location.search);
        const queryParam = urlParams.get("search") || urlParams.get("q") || "";

        if (searchbar && queryParam) {
            searchbar.value = queryParam;
        }

        renderFilteredBooks();
    } catch (err) {
        console.error(err);
        if (container) {
            container.innerHTML = `<p class="error-books-message">Could not load books. Is the backend running?</p>`;
        }
    }
}

function setupSearchbar() {
    const searchbar = document.getElementById("searchbar");
    if (!searchbar) return;

    searchbar.addEventListener("input", () => {
        const isBrowsePage = window.location.pathname.includes("browsebook.html");
        if (isBrowsePage) {
            renderFilteredBooks();
        }
    });

    searchbar.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const query = searchbar.value.trim();
            const isBrowsePage = window.location.pathname.includes("browsebook.html");

            if (!isBrowsePage) {
                if (query) {
                    window.location.href = `browsebook.html?search=${encodeURIComponent(query)}`;
                } else {
                    window.location.href = "browsebook.html";
                }
            } else {
                renderFilteredBooks();
            }
        }
    });
}

function injectModalContainer() {
    if (document.getElementById("bookModalOverlay")) return;

    const modalHTML = `
        <div id="bookModalOverlay" class="modal-overlay hidden">
            <div class="modal-box">
                <button class="modal-close" onclick="closeBookModal()">&times;</button>
                <div class="modal-body">
                    <img id="modalCover" src="" alt="Book Cover">
                    <div class="modal-details">
                        <h2 id="modalTitle"></h2>
                        <p id="modalAuthor" class="modal-author"></p>
                        <div id="modalGenre" class="genre"></div>
                        <p id="modalPrice" class="modal-price"></p>
                        <p id="modalStock" class="modal-stock"></p>
                        <div id="modalMsg" class="modal-message hidden"></div>
                        <div class="modal-actions">
                            <button id="modalBuyBtn" class="btn-buy">Buy Book</button>
                            <button id="modalBorrowBtn" class="btn-borrow">Borrow Book</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    document.body.insertAdjacentHTML("beforeend", modalHTML);
}

function openBookModal(bookId) {
    const book = allFetchedBooks.find((b) => b._id === bookId);
    if (!book) return;

    const overlay = document.getElementById("bookModalOverlay");
    const cover = document.getElementById("modalCover");
    const title = document.getElementById("modalTitle");
    const author = document.getElementById("modalAuthor");
    const genre = document.getElementById("modalGenre");
    const price = document.getElementById("modalPrice");
    const stock = document.getElementById("modalStock");
    const buyBtn = document.getElementById("modalBuyBtn");
    const borrowBtn = document.getElementById("modalBorrowBtn");
    const msg = document.getElementById("modalMsg");

    msg.classList.add("hidden");
    msg.textContent = "";

    cover.src = book.coverImage || "https://placehold.co/200x280?text=No+Cover";
    title.textContent = book.title;
    author.textContent = `By ${book.author}`;

    const genreArray = Array.isArray(book.genre) ? book.genre : [book.genre];
    genre.innerHTML = genreArray.map((g) => `<span class="book-genre">${escapeHTML(g)}</span>`).join("");

    const numPrice = Number(book.price) || 0;
    price.textContent = `Price: $${numPrice.toFixed(2)}`;

    const isLowStock = book.availableCopies < 10;
    stock.className = `modal-stock ${isLowStock ? "low-stock-red" : ""}`;
    stock.textContent = `Available Copies: ${book.availableCopies} (Total Stock: ${book.quantity})`;

    buyBtn.onclick = () => handleAction(book._id, "buy");
    borrowBtn.onclick = () => handleAction(book._id, "borrow");

    overlay.classList.remove("hidden");
}

function closeBookModal() {
    const overlay = document.getElementById("bookModalOverlay");
    if (overlay) overlay.classList.add("hidden");
}

async function handleAction(bookId, actionType) {
    const msg = document.getElementById("modalMsg");
    msg.classList.add("hidden");

    try {
        const res = await fetch(`${window.API_BASE}/book/${actionType}/${bookId}`, {
            method: "PUT",
            credentials: "include",
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            msg.textContent = data.message || `Failed to ${actionType} book.`;
            msg.className = "modal-message modal-error";
            msg.classList.remove("hidden");
            return;
        }

        msg.textContent = data.message;
        msg.className = "modal-message modal-success";
        msg.classList.remove("hidden");

        await loadBooks();
        setTimeout(() => {
            openBookModal(bookId);
        }, 300);

    } catch (err) {
        msg.textContent = "Please log in to perform this action.";
        msg.className = "modal-message modal-error";
        msg.classList.remove("hidden");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setupSearchbar();
    injectModalContainer();
    loadBooks();
});