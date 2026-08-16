import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { Book } from "../models/bookModel.js";

// Downloads an image from a URL and converts it into a Base64 Data URI string
async function downloadAndConvertToBase64(imageUrl) {
    try {
        const response = await fetch(imageUrl);
        if (!response.ok) return imageUrl;

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = response.headers.get("content-type") || "image/jpeg";

        return `data:${contentType};base64,${buffer.toString("base64")}`;
    } catch (error) {
        console.error("Error downloading image:", error.message);
        return imageUrl; // Fallback to original URL if download fails
    }
}

export const addBook = catchAsyncErrors(async (req, res, next) => {
    const { title, author, genre, description, price, quantity, coverImage } = req.body;

    if (!title || !author || !genre || quantity === undefined) {
        return next(new ErrorHandler("Please enter all required fields", 400));
    }

    const genreArray = Array.isArray(genre)
        ? genre
        : genre.split(",").map((g) => g.trim()).filter(Boolean);

    const numericPrice = Number(price) || 0;
    const stockQty = Number(quantity) || 0;

    // Download image from URL and convert to Base64 to store in database
    let storedCover = coverImage || "";
    if (storedCover.startsWith("http://") || storedCover.startsWith("https://")) {
        storedCover = await downloadAndConvertToBase64(storedCover);
    }

    const book = await Book.create({
        title,
        author,
        genre: genreArray,
        description: description || "",
        price: numericPrice,
        coverImage: storedCover,
        quantity: stockQty,
        availableCopies: stockQty,
    });

    res.status(201).json({ success: true, message: "Book added successfully", book });
});

export const getAllBooks = catchAsyncErrors(async (req, res, next) => {
    const books = await Book.find();
    res.status(200).json({ success: true, books });
});

export const deleteBook = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) {
        return next(new ErrorHandler("Book not found", 404));
    }
    await book.deleteOne();
    res.status(200).json({ success: true, message: "Book deleted successfully" });
});

// BUY BOOK: Decrements quantity & availableCopies by 1
export const buyBook = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const book = await Book.findById(id);

    if (!book) {
        return next(new ErrorHandler("Book not found", 404));
    }

    if (book.quantity <= 0 || book.availableCopies <= 0) {
        return next(new ErrorHandler("Book is out of stock", 400));
    }

    book.quantity -= 1;
    book.availableCopies -= 1;
    await book.save();

    res.status(200).json({
        success: true,
        message: `Successfully purchased "${book.title}"`,
        book,
    });
});

// BORROW BOOK: Decrements availableCopies by 1
export const borrowBook = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const book = await Book.findById(id);

    if (!book) {
        return next(new ErrorHandler("Book not found", 404));
    }

    if (book.availableCopies <= 0) {
        return next(new ErrorHandler("No copies currently available to borrow", 400));
    }

    book.availableCopies -= 1;
    await book.save();

    res.status(200).json({
        success: true,
        message: `Successfully borrowed "${book.title}"`,
        book,
    });
});