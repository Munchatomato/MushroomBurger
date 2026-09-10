const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const db = require("./db");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());


// =====================================================
// BASIC API TEST
// =====================================================

app.get("/", (req, res) => {
    res.json({
        message: "Mushroom Factory API is running!"
    });
});


// =====================================================
// TEST DATABASE CONNECTION
// =====================================================

app.get("/api/test-db", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 AS test");

        res.json({
            success: true,
            message: "MySQL connection successful!",
            data: rows
        });
    } catch (error) {
        console.error("Database error:", error.message);

        res.status(500).json({
            success: false,
            message: "MySQL connection failed",
            error: error.message
        });
    }
});


// =====================================================
// GET PRODUCTS
// =====================================================

app.get("/api/products", async (req, res) => {
    try {
        const [products] = await db.query(
            "SELECT * FROM products ORDER BY id_product ASC"
        );

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error("Product error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve products",
            error: error.message
        });
    }
});
// =====================================================
// DEBUG USERS TABLE
// =====================================================

app.get("/api/debug-users", async (req, res) => {
    try {
        const [database] = await db.query(
            "SELECT DATABASE() AS database_name"
        );

        const [columns] = await db.query(
            "DESCRIBE users"
        );

        res.json({
            success: true,
            database: database[0].database_name,
            columns: columns
        });

    } catch (error) {
        console.error("Debug error:", error.message);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// =====================================================
// REGISTER USER
// =====================================================

app.post("/api/register", async (req, res) => {
    try {
        const {
            full_name,
            username,
            password,
            role
        } = req.body;

        // Check required fields
        if (!full_name || !username || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        // Validate role
        if (!["CASHIER", "MANAGER"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid account role."
            });
        }

        // Check if username already exists
        const [existingUsers] = await db.query(
            "SELECT id_user FROM users WHERE username = ?",
            [username]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Username already exists."
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await db.query(
            `INSERT INTO users
            (username, password_hash, role, full_name, status)
            VALUES (?, ?, ?, ?, 'ACTIVE')`,
            [
                username,
                passwordHash,
                role,
                full_name
            ]
        );

        res.status(201).json({
            success: true,
            message: "Account registered successfully.",
            user: {
                id_user: result.insertId,
                username,
                full_name,
                role
            }
        });

    } catch (error) {
        console.error("Registration error:", error.message);

        res.status(500).json({
            success: false,
            message: "Registration failed.",
            error: error.message
        });
    }
});


// =====================================================
// LOGIN USER
// =====================================================

app.post("/api/login", async (req, res) => {
    try {
        const {
            username,
            password
        } = req.body;

        // Check required fields
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required."
            });
        }

        // Find user
        const [users] = await db.query(
            `SELECT
                id_user,
                username,
                password_hash,
                role,
                full_name,
                status
             FROM users
             WHERE username = ?
             LIMIT 1`,
            [username]
        );

        // User doesn't exist
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }

        const user = users[0];

        // Check account status
        if (user.status !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                message: "This account is inactive."
            });
        }

        // Compare password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }

        // Login successful
        res.json({
            success: true,
            message: "Login successful.",
            user: {
                id_user: user.id_user,
                username: user.username,
                full_name: user.full_name,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            success: false,
            message: "Login failed.",
            error: error.message
        });
    }
});
// =====================================================
// CREATE ORDER
// =====================================================

app.post("/api/orders", async (req, res) => {
    let connection;

    try {
        const {
            cashier_id,
            order_type,
            total_amount,
            items
        } = req.body;

        // ---------------------------------------------
        // VALIDATION
        // ---------------------------------------------

        if (
            !cashier_id ||
            !order_type ||
            total_amount === undefined ||
            !Array.isArray(items) ||
            items.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Incomplete order information."
            });
        }

        if (!["DINE_IN", "TAKE_OUT"].includes(order_type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order type."
            });
        }

        // ---------------------------------------------
        // GET DATABASE CONNECTION
        // ---------------------------------------------

        connection = await db.getConnection();

        // Start transaction
        await connection.beginTransaction();

        // ---------------------------------------------
        // GET NEXT SERVING NUMBER
        // ---------------------------------------------
        //
        // This makes serving numbers:
        // 1
        // 2
        // 3
        // 4
        // etc.
        //
        // Instead of random numbers.
        // ---------------------------------------------

        const [servingRows] = await connection.query(
            `SELECT COALESCE(MAX(serving_number), 0) + 1
             AS next_serving_number
             FROM orders`
        );

        const servingNumber =
            Number(servingRows[0].next_serving_number);

        // ---------------------------------------------
        // GENERATE NUMERIC ORDER NUMBER
        // ---------------------------------------------
        //
        // Your database uses INT(11), so this must
        // remain a number.
        // ---------------------------------------------

        const orderNumber =
            Number(
                Date.now().toString().slice(-6)
            );

        // ---------------------------------------------
        // INSERT ORDER
        // ---------------------------------------------

        const [orderResult] = await connection.query(
            `INSERT INTO orders
            (
                order_number,
                serving_number,
                order_type,
                order_status,
                total_amount,
                cashier_id
            )
            VALUES (?, ?, ?, 'PENDING', ?, ?)`,
            [
                orderNumber,
                servingNumber,
                order_type,
                Number(total_amount),
                cashier_id
            ]
        );

        const orderId = orderResult.insertId;

        // ---------------------------------------------
        // INSERT ORDER ITEMS
        // ---------------------------------------------

        for (const item of items) {

            const quantity =
                Number(item.quantity);

            const unitPrice =
                Number(item.unit_price);

            const subtotal =
                quantity * unitPrice;

            await connection.query(
                `INSERT INTO order_items
                (
                    order_id,
                    product_id,
                    quantity,
                    unit_price,
                    subtotal
                )
                VALUES (?, ?, ?, ?, ?)`,
                [
                    orderId,
                    item.product_id,
                    quantity,
                    unitPrice,
                    subtotal
                ]
            );
        }

        // ---------------------------------------------
        // MARK ORDER AS COMPLETED
        // ---------------------------------------------

        await connection.query(
            `UPDATE orders
             SET order_status = 'COMPLETED',
                 updated_at = CURRENT_TIMESTAMP
             WHERE order_id = ?`,
            [orderId]
        );

        // ---------------------------------------------
        // COMMIT
        // ---------------------------------------------

        await connection.commit();

        // ---------------------------------------------
        // SUCCESS RESPONSE
        // ---------------------------------------------

        res.status(201).json({
            success: true,
            message: "Order completed successfully.",
            order: {
                order_id: orderId,
                order_number: orderNumber,
                serving_number: servingNumber,
                order_type,
                order_status: "COMPLETED",
                total_amount: Number(total_amount)
            }
        });

    } catch (error) {

        // Rollback if something failed
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error(
                    "Rollback error:",
                    rollbackError.message
                );
            }
        }

        console.error(
            "Order error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to save order.",
            error: error.message
        });

    } finally {

        if (connection) {
            connection.release();
        }
    }
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});