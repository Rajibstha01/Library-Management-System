import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    genre: {
        type: [String],
        default: [],
    },
    description: {
        type: String,
        default: "",
    },
    price: {
        type: Number,
        default: 0,
    },
    coverImage: {
        type: String,
        default: "",
    },
    quantity: {
        type: Number,
        required: true,
    },
    availableCopies: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});

export const Book = mongoose.model("Book", bookSchema);