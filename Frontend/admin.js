const AUTH_API = `${window.API_BASE}/auth`;
const BOOK_API = `${window.API_BASE}/book`;

const bookForm = document.getElementById("bookForm");
const bookList = document.getElementById("bookList");
const bookCount = document.getElementById("bookCount");

const authorSelect = document.getElementById("authorSelect");
const authorNew = document.getElementById("authorNew");
const genreCheckboxList = document.getElementById("genreCheckboxList");
const genreNew = document.getElementById("genreNew");

if (authorSelect) {
    authorSelect.addEventListener("change", () => {
        if (authorSelect.value === "__new__") {
            authorNew.classList.remove("hidden");
            authorNew.required = true;
            authorNew.focus();
        } else {
            authorNew.classList.add("hidden");
            authorNew.required = false;
        }
    });
}

async function checkAdminAccess() {
    try {
        const res = await fetch(`${AUTH_API}/me`, { credentials: "include" });
        const data = await res.json();

        if (!res.ok || !data.success || data.user.role !== "Admin") {
            alert("You need to be logged in as an Admin to view this page.");
            window.location.href = "Adminpanel.html";
            return false;
        }
        return true;
    } catch (err) {
        console.error(err);
        alert("Could not verify your login. Is the backend running?");
        window.location.href = "Adminpanel.html";
        return false;
    }
}

function populateDropdownsAndGenres(books) {
    if (!authorSelect || !genreCheckboxList) return;

    // Authors Dropdown
    const authors = Array.from(
        new Set(books.map((b) => b.author).filter(Boolean))
    ).sort();

    let authorOptions = `<option value="">-- Select Author --</option>`;
    authors.forEach((a) => {
        authorOptions += `<option value="${escapeHTML(a)}">${escapeHTML(a)}</option>`;
    });
    authorOptions += `<option value="__new__">+ Add New Author</option>`;
    authorSelect.innerHTML = authorOptions;

    // Genres Multi-Checkbox List
    const genreSet = new Set();
    books.forEach((b) => {
        if (Array.isArray(b.genre)) {
            b.genre.forEach((g) => g && genreSet.add(g.trim()));
        } else if (typeof b.genre === "string") {
            b.genre.split(",").forEach((g) => g && genreSet.add(g.trim()));
        }
    });
    const genres = Array.from(genreSet).sort();

    if (genres.length === 0) {
        genreCheckboxList.innerHTML = `<span class="no-genres-text">No existing genres. Add one below!</span>`;
        return;
    }

    genreCheckboxList.innerHTML = genres
        .map(
            (g) => `
        <label class="genre-checkbox-item">
            <input type="checkbox" class="genre-cb" value="${escapeHTML(g)}">
            ${escapeHTML(g)}
        </label>`
        )
        .join("");
}

async function loadBooks() {
    try {
        const res = await fetch(`${BOOK_API}/all`);
        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to load books");
        }

        const books = data.books || [];
        bookCount.textContent = `${books.length} Book${books.length === 1 ? "" : "s"}`;

        populateDropdownsAndGenres(books);

        if (books.length === 0) {
            bookList.innerHTML = `<p class="empty-message">No books added yet.</p>`;
            return;
        }

        bookList.innerHTML = books.map(renderBookItem).join("");

        bookList.querySelectorAll(".delete-button").forEach((btn) => {
            btn.addEventListener("click", () => handleDelete(btn.dataset.id));
        });
    } catch (err) {
        console.error(err);
        bookList.innerHTML = `<p class="empty-message">Could not load books. Is the backend running?</p>`;
    }
}

function renderBookItem(book) {
    const cover = book.coverImage && book.coverImage.trim() !== "" ? book.coverImage : "";
    const genreText = Array.isArray(book.genre) ? book.genre.join(", ") : book.genre || "";
    const isLowStock = book.availableCopies < 10;
    const numPrice = Number(book.price) || 0;

    return `
        <div class="book-item">
            ${cover ? `<img src="${cover}" alt="${escapeHTML(book.title)}">` : `<div class="book-cover-placeholder"></div>`}
            <div class="book-info">
                <h3>${escapeHTML(book.title)}</h3>
                <p>${escapeHTML(book.author)}${genreText ? " · " + escapeHTML(genreText) : ""} | <strong>$${numPrice.toFixed(2)}</strong></p>
                <span class="stock ${isLowStock ? "low-stock-red" : ""}">${book.availableCopies} available (Total: ${book.quantity})</span>
            </div>
            <div class="book-actions">
                <button class="delete-button" data-id="${book._id}">✕</button>
            </div>
        </div>`;
}

function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
}

bookForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();

    const authorVal = authorSelect.value === "__new__" 
        ? authorNew.value.trim() 
        : authorSelect.value.trim();

    // 1. Gather all checked checkboxes
    const checkedGenres = Array.from(document.querySelectorAll(".genre-cb:checked")).map(
        (cb) => cb.value
    );

    // 2. Gather comma-separated custom genres
    const customGenreInput = genreNew.value.trim();
    const customGenres = customGenreInput
        ? customGenreInput.split(",").map((g) => g.trim()).filter(Boolean)
        : [];

    // Combine and remove duplicate genres
    const combinedGenres = Array.from(new Set([...checkedGenres, ...customGenres]));

    const price = Number(document.getElementById("price").value) || 0;
    const quantity = Number(document.getElementById("stock").value) || 0;
    const coverImage = document.getElementById("cover").value.trim();

    if (!authorVal) {
        alert("Please select or enter an author.");
        return;
    }

    if (combinedGenres.length === 0) {
        alert("Please select at least one genre or enter a new one.");
        return;
    }

    try {
        const res = await fetch(`${BOOK_API}/admin/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ 
                title, 
                author: authorVal, 
                genre: combinedGenres,
                price,
                quantity, 
                coverImage 
            }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to add book");
        }

        bookForm.reset();
        authorNew.classList.add("hidden");
        authorNew.required = false;

        loadBooks();
    } catch (err) {
        alert(err.message || "Something went wrong adding the book.");
        console.error(err);
    }
});

async function handleDelete(id) {
    if (!confirm("Delete this book?")) return;

    try {
        const res = await fetch(`${BOOK_API}/delete/${id}`, {
            method: "DELETE",
            credentials: "include",
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to delete book");
        }

        loadBooks();
    } catch (err) {
        alert(err.message || "Something went wrong deleting the book.");
        console.error(err);
    }
}

(async () => {
    const ok = await checkAdminAccess();
    if (ok) loadBooks();
})();