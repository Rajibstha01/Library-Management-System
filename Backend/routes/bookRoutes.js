import express from "express";
import {
    addBook,
    getAllBooks,
    deleteBook,
    buyBook,
    borrowBook,
} from "../controllers/bookController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/admin/add", isAuthenticated, isAuthorized("Admin"), addBook);
router.get("/all", getAllBooks);
router.delete("/delete/:id", isAuthenticated, isAuthorized("Admin"), deleteBook);

router.put("/buy/:id", isAuthenticated, buyBook);
router.put("/borrow/:id", isAuthenticated, borrowBook);

export default router;