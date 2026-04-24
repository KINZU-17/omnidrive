/**
 * OmniDrive Backend Server
 * Kenya's Premier Online Vehicle Marketplace
 * 
 * Integrated infrastructure:
 * - Winston structured logging
 * - Zod input validation
 * - Sentry error tracking
 * - Swagger API documentation
 * - Database optimization & indexing
 * - Comprehensive error handling
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const webpush = require('web-push');
const multer = require('multer');
const swaggerUi = require('swagger-ui-express');

// Config imports
const logger = require('./config/logger');
const {
    mpesaPurchaseSchema,
    listingQuerySchema,
    listingCreateSchema,
    listingUpdateSchema,
    dealerRegisterSchema,
    pendingListingSchema,
    adminActionSchema,
} = require('./config/validation');
const swaggerSpecs = require('./config/swagger');
const { initializeIndexes, optimizeDatabase, getDatabaseStats } = require('./config/database');
const { initSentry } = require('./config/sentry');

// Middleware imports
const { validateBody, validateQuery, validateParams } = require('./middleware/validation');
const { errorHandler, asyncHandler } = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const normalizeResponse = require('./middleware/responseNormalizer');
const { cacheMiddleware, queryCache, invalidateCache } = require('./middleware/cache');

// Redis configuration
const { connectRedis, cache } = require('./config/redis');
const { configureSessionStore } = require('./config/session');

// ─── INITIALIZE EXPRESS APP ─────────────────────────────────────────────────
const app = express();

// Sentry initialization (if configured)
initSentry(app);

// ─── MIDDLEWARE STACK ─────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static(path.join(__dirname)));

// Request logging and response normalization
app.use(requestLogger);
app.use(normalizeResponse);

// ─── SESSION STORE (Redis) ────────────────────────────────────────────────
try {
    app.use(configureSessionStore());
    logger.info('Session store initialized with Redis');
} catch (error) {
    logger.warn('Session store configuration failed, continuing without sessions', {
        error: error.message,
    });
}

// ─── API DOCUMENTATION ─────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
    swaggerOptions: {
        persistAuthorization: true,
    },
}));

// ─── RATE LIMITING ──────────────────────────────────────────────────────────
const mpesaLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    max: 5,
    message: { success: false, error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '60'),
    standardHeaders: true,
    legacyHeaders: false,
});

// ─── DATABASE INITIALIZATION ───────────────────────────────────────────────
const dbPath = process.env.DB_PATH || 'omnidrive.db';
const db = new Database(dbPath);

logger.info('Initializing database', { path: dbPath });

// Enable database optimizations
optimizeDatabase(db);

// Create tables
db.exec(`
    -- Active vehicle listings (publicly visible)
    CREATE TABLE IF NOT EXISTS listings (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        brand            TEXT NOT NULL,
        model            TEXT NOT NULL,
        price            REAL NOT NULL,
        nation           TEXT NOT NULL,
        category         TEXT DEFAULT 'Car',
        condition        TEXT DEFAULT 'Used',
        body_style       TEXT,
        fuel_type        TEXT,
        drivetrain       TEXT,
        color            TEXT,
        city             TEXT DEFAULT 'Nairobi',
        image            TEXT,
        badges           TEXT DEFAULT '[]',
        specs            TEXT DEFAULT '{}',
        rating           REAL DEFAULT 4.5,
        reviewCount      INTEGER DEFAULT 0,
        createdAt        DATETIME DEFAULT CURRENT_TIMESTAMP,
        isActive         BOOLEAN DEFAULT 1
    );

    -- Orders / Transactions
    CREATE TABLE IF NOT EXISTS orders (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        checkout_id      TEXT UNIQUE,
        merchant_id      TEXT,
        phone            TEXT,
        amount           REAL,
        vehicle_id       TEXT,
        vehicle_name     TEXT,
        status           TEXT DEFAULT 'pending',
        receipt          TEXT,
        customer_email   TEXT,
        created_at       TEXT DEFAULT (datetime('now')),
        updated_at       TEXT DEFAULT (datetime('now'))
    );

    -- Dealer applications
    CREATE TABLE IF NOT EXISTS dealer_applications (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT,
        owner       TEXT,
        phone       TEXT,
        email       TEXT,
        city        TEXT,
        address     TEXT,
        types       TEXT,
        plan        TEXT,
        about       TEXT,
        payment     TEXT,
        status      TEXT DEFAULT 'pending',
        created_at  TEXT DEFAULT (datetime('now'))
    );

    -- Pending listings
    CREATE TABLE IF NOT EXISTS pending_listings (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        listing_id  TEXT UNIQUE,
        brand       TEXT,
        model       TEXT,
        price       REAL,
        year        INTEGER,
        category    TEXT,
        condition   TEXT,
        mileage     INTEGER,
        fuel        TEXT,
        city        TEXT,
        description TEXT,
        img         TEXT,
        seller_name  TEXT,
        seller_phone TEXT,
        seller_email TEXT,
        status      TEXT DEFAULT 'pending',
        created_at  TEXT DEFAULT (datetime('now'))
    );

    -- Chat system
    CREATE TABLE IF NOT EXISTS chat_users (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT NOT NULL,
        email      TEXT UNIQUE NOT NULL,
        role       TEXT DEFAULT 'client',
        avatar     TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS chat_rooms (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT NOT NULL,
        type        TEXT DEFAULT 'direct',
        created_by  INTEGER,
        created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS chat_room_members (
        room_id INTEGER,
        user_id INTEGER,
        PRIMARY KEY (room_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id    INTEGER NOT NULL,
        sender_id  INTEGER NOT NULL,
        body       TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (room_id)   REFERENCES chat_rooms(id),
        FOREIGN KEY (sender_id) REFERENCES chat_users(id)
    );

    CREATE TABLE IF NOT EXISTS chat_reads (
        room_id    INTEGER,
        user_id    INTEGER,
        last_read  TEXT DEFAULT (datetime('now')),
        PRIMARY KEY (room_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS chat_presence (
        user_id    INTEGER PRIMARY KEY,
        last_seen  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS push_subscriptions (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id    INTEGER,
        endpoint   TEXT UNIQUE,
        p256dh     TEXT,
        auth       TEXT
    );

    CREATE TABLE IF NOT EXISTS msg_read_receipts (
        msg_id     INTEGER,
        user_id    INTEGER,
        read_at    TEXT DEFAULT (datetime('now')),
        PRIMARY KEY (msg_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS push_tokens (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        token      TEXT UNIQUE,
        user_email TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    );
`);

// Initialize database indexes
try {
    initializeIndexes(db);
    logger.info('Database initialized successfully');
} catch (error) {
    logger.error('Database initialization failed', { error: error.message });
    process.exit(1);
}

// ─── EMAIL CONFIGURATION ───────────────────────────────────────────────────
const mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
    }
});

async function sendConfirmationEmail(order) {
    if (!order.customer_email || !process.env.SMTP_USER) return;
    try {
        await mailer.sendMail({
            from: `"OmniDrive" <${process.env.SMTP_USER}>`,
            to: order.customer_email,
            subject: `✅ Payment Confirmed – ${order.vehicle_name}`,
            html: `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;border:1px solid #eee;border-radius:10px">
                    <h2 style="color:#e47911">🚗 OmniDrive – Payment Confirmed!</h2>
                    <p>Thank you for your purchase. Here are your order details:</p>
                    <table style="width:100%;border-collapse:collapse">
                        <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Vehicle</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${order.vehicle_name}</td></tr>
                        <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Amount Paid</strong></td><td style="padding:8px;border-bottom:1px solid #eee">KES ${order.amount}</td></tr>
                        <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>M-Pesa Receipt</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${order.receipt}</td></tr>
                        <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Phone</strong></td><td style="padding:8px;border-bottom:1px solid #eee">+${order.phone}</td></tr>
                        <tr><td style="padding:8px"><strong>Order ID</strong></td><td style="padding:8px">#${order.id}</td></tr>
                    </table>
                    <p style="margin-top:20px">Our team will contact you within 24 hours to arrange delivery.</p>
                    <p style="color:#888;font-size:0.85rem">OmniDrive.co.ke – Connecting you to the drive of your choice</p>
                </div>
            `
        });
        logger.info('Confirmation email sent', { to: order.customer_email });
    } catch (err) {
        logger.error('Email sending failed', { error: err.message, to: order.customer_email });
    }
}

// ─── MPESA CONFIGURATION ────────────────────────────────────────────────────
const {
    MPESA_CONSUMER_KEY,
    MPESA_CONSUMER_SECRET,
    MPESA_SHORTCODE,
    MPESA_PASSKEY,
    MPESA_CALLBACK_URL,
    PORT = 3000
} = process.env;

const MPESA_BASE = process.env.NODE_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

async function getAccessToken() {
    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
    const res = await fetch(`${MPESA_BASE}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: { Authorization: `Basic ${auth}` }
    });
    if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);
    const data = await res.json();
    return data.access_token;
}

// Pre-check MPesa connectivity
let MPESA_AVAILABLE = false;
(async () => {
    try {
        if (process.env.NODE_ENV === 'production' && MPESA_CONSUMER_KEY) {
            await getAccessToken();
            MPESA_AVAILABLE = true;
            logger.info('MPesa Daraja API connected');
        } else {
            logger.info('MPesa in sandbox mode');
        }
    } catch (err) {
        logger.warn('MPesa connection failed', { error: err.message });
    }
})();

// Admin authentication middleware
function adminAuth(req, res, next) {
    const key = req.headers['x-admin-key'];
    if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
        logger.warn('Unauthorized admin access attempt', { ip: req.ip });
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    next();
}

// ─── MPESA ENDPOINTS ────────────────────────────────────────────────────────

/**
 * POST /api/mpesa/purchase
 * Initiate STK Push for vehicle purchase
 */
app.post('/api/mpesa/purchase',
    mpesaLimiter,
    validateBody(mpesaPurchaseSchema),
    asyncHandler(async (req, res) => {
        const { phone, amount, vehicleName, vehicleId, email } = req.validated;
        const stkAmount = process.env.NODE_ENV === 'production' ? Math.ceil(amount) : 1;

        try {
            const token = await getAccessToken();
            const timestamp = new Date()
                .toISOString()
                .replace(/[-T:.Z]/g, '')
                .slice(0, 14);

            const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');

            const stkRes = await fetch(`${MPESA_BASE}/mpesa/stkpush/v1/processrequest`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    BusinessShortCode: MPESA_SHORTCODE,
                    Password: password,
                    Timestamp: timestamp,
                    TransactionType: 'CustomerPayBillOnline',
                    Amount: stkAmount,
                    PartyA: phone,
                    PartyB: MPESA_SHORTCODE,
                    PhoneNumber: phone,
                    CallBackURL: MPESA_CALLBACK_URL,
                    AccountReference: `OmniDrive-${vehicleId || 'ORDER'}`,
                    TransactionDesc: vehicleName ? `Purchase: ${vehicleName}` : 'Vehicle Purchase'
                })
            });

            const stkData = await stkRes.json();

            if (stkData.ResponseCode !== '0') {
                logger.warn('STK Push failed', { phone, responseCode: stkData.ResponseCode });
                return res.status(400).json({ success: false, error: stkData.ResponseDescription });
            }

            // Save order to DB
            db.prepare(`
                INSERT INTO orders (checkout_id, merchant_id, phone, amount, vehicle_id, vehicle_name, customer_email, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
            `).run(stkData.CheckoutRequestID, stkData.MerchantRequestID, phone, amount, vehicleId || '', vehicleName || '', email || '');

            logger.info('STK Push sent', {
                phone,
                amount,
                vehicleName,
                checkoutId: stkData.CheckoutRequestID
            });

            return res.json({
                success: true,
                checkoutRequestId: stkData.CheckoutRequestID,
                merchantRequestId: stkData.MerchantRequestID
            });

        } catch (err) {
            logger.error('STK Push error', { error: err.message, phone });
            return res.status(500).json({ success: false, error: err.message });
        }
    })
);

/**
 * POST /api/mpesa/callback
 * Handle M-Pesa payment callback
 */
app.post('/api/mpesa/callback', (req, res) => {
    const callback = req.body?.Body?.stkCallback;
    if (!callback) return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });

    const { CheckoutRequestID, ResultCode, CallbackMetadata } = callback;

    if (ResultCode === 0) {
        const items = CallbackMetadata?.Item || [];
        const receipt = items.find(i => i.Name === 'MpesaReceiptNumber')?.Value || '';
        const amount = items.find(i => i.Name === 'Amount')?.Value || 0;

        db.prepare(`
            UPDATE orders SET status='paid', receipt=?, amount=?, updated_at=datetime('now')
            WHERE checkout_id=?
        `).run(receipt, amount, CheckoutRequestID);

        // Send confirmation email
        const order = db.prepare('SELECT * FROM orders WHERE checkout_id=?').get(CheckoutRequestID);
        if (order) sendConfirmationEmail(order);

        logger.info('Payment confirmed', { receipt, checkoutId: CheckoutRequestID });
    } else {
        db.prepare(`UPDATE orders SET status='failed', updated_at=datetime('now') WHERE checkout_id=?`)
            .run(CheckoutRequestID);
        logger.warn('Payment failed', { resultCode: ResultCode, checkoutId: CheckoutRequestID });
    }

    return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

/**
 * GET /api/mpesa/status/:checkoutRequestId
 * Poll payment status
 */
app.get('/api/mpesa/status/:checkoutRequestId', (req, res) => {
    const order = db.prepare('SELECT status, receipt, amount FROM orders WHERE checkout_id=?')
        .get(req.params.checkoutRequestId);
    return res.json(order || { status: 'pending' });
});

// ─── LISTINGS ENDPOINTS ─────────────────────────────────────────────────────

/**
 * GET /api/listings
 * Get all active listings with filtering
 */
app.get('/api/listings',
    validateQuery(listingQuerySchema),
    asyncHandler((req, res) => {
        const { brand, category, nation, sort, order, page, limit } = req.validated;
        let query = 'SELECT * FROM listings WHERE isActive = 1';
        const params = [];

        if (brand) {
            query += ' AND brand LIKE ?';
            params.push(`%${brand}%`);
        }
        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }
        if (nation) {
            query += ' AND nation = ?';
            params.push(nation);
        }

        const sortColumn = ['price', 'rating', 'createdAt', 'brand', 'model'].includes(sort) ? sort : 'createdAt';
        query += ` ORDER BY ${sortColumn} ${order}`;

        // Pagination
        const offset = (page - 1) * limit;
        query += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const listings = db.prepare(query).all(...params);
        const totalCount = db.prepare('SELECT COUNT(*) as count FROM listings WHERE isActive = 1').get().count;

        logger.info('Listings fetched', { count: listings.length, filters: { brand, category, nation } });

        return res.json({
            success: true,
            data: listings,
            pagination: { page, limit, total: totalCount, pages: Math.ceil(totalCount / limit) }
        });
    })
);

/**
 * GET /api/listings/:id
 * Get single listing
 */
app.get('/api/listings/:id', asyncHandler((req, res) => {
    const listing = db.prepare('SELECT * FROM listings WHERE id = ? AND isActive = 1').get(req.params.id);
    if (!listing) {
        return res.status(404).json({ success: false, error: 'Listing not found' });
    }
    return res.json({ success: true, data: listing });
}));

/**
 * POST /api/listings
 * Create new listing (admin only)
 */
app.post('/api/listings',
    adminAuth,
    validateBody(listingCreateSchema),
    asyncHandler((req, res) => {
        const {
            brand, model, price, nation, category, condition,
            body_style, fuel_type, drivetrain, color, city,
            image, badges, specs, rating
        } = req.validated;

        const result = db.prepare(`
            INSERT INTO listings (
                brand, model, price, nation, category, condition,
                body_style, fuel_type, drivetrain, color, city,
                image, badges, specs, rating
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            brand, model, price, nation, category, condition,
            body_style, fuel_type, drivetrain, color, city,
            image ? JSON.stringify(image) : null,
            badges ? JSON.stringify(badges) : '[]',
            specs ? JSON.stringify(specs) : '{}',
            rating || 4.5
        );

        logger.info('Listing created', { id: result.lastInsertRowid, brand, model });

        return res.json({
            success: true,
            id: result.lastInsertRowid,
            message: 'Listing created successfully'
        });
    })
);

/**
 * PUT /api/listings/:id
 * Update listing (admin only)
 */
app.put('/api/listings/:id',
    adminAuth,
    validateBody(listingUpdateSchema),
    asyncHandler((req, res) => {
        const {
            brand, model, price, nation, category, condition,
            body_style, fuel_type, drivetrain, color, city,
            image, badges, specs, rating, isActive
        } = req.validated;

        db.prepare(`
            UPDATE listings SET
                brand = ?, model = ?, price = ?, nation = ?, category = ?,
                condition = ?, body_style = ?, fuel_type = ?, drivetrain = ?,
                color = ?, city = ?, image = ?, badges = ?, specs = ?,
                rating = ?, isActive = ?
            WHERE id = ?
        `).run(
            brand, model, price, nation, category, condition,
            body_style, fuel_type, drivetrain, color, city,
            image ? JSON.stringify(image) : null,
            badges ? JSON.stringify(badges) : '[]',
            specs ? JSON.stringify(specs) : '{}',
            rating || 4.5,
            isActive !== undefined ? (isActive ? 1 : 0) : 1,
            req.params.id
        );

        logger.info('Listing updated', { id: req.params.id });

        return res.json({ success: true, message: 'Listing updated' });
    })
);

/**
 * DELETE /api/listings/:id
 * Soft delete listing (admin only)
 */
app.delete('/api/listings/:id',
    adminAuth,
    asyncHandler((req, res) => {
        db.prepare('UPDATE listings SET isActive = 0 WHERE id = ?').run(req.params.id);
        logger.info('Listing deleted', { id: req.params.id });
        return res.json({ success: true, message: 'Listing deleted' });
    })
);

// ─── ADMIN ENDPOINTS ────────────────────────────────────────────────────────

/**
 * GET /api/admin/stats
 * Get dashboard statistics
 */
app.get('/api/admin/stats', adminAuth, asyncHandler((req, res) => {
    const stats = getDatabaseStats(db);
    logger.info('Admin stats retrieved');
    return res.json({ success: true, data: stats });
}));

/**
 * GET /api/admin/orders
 * Get all orders
 */
app.get('/api/admin/orders', adminAuth, asyncHandler((req, res) => {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    logger.info('Admin orders retrieved', { count: orders.length });
    return res.json({ success: true, data: orders });
}));

/**
 * GET /api/admin/orders/:id
 * Get single order
 */
app.get('/api/admin/orders/:id', adminAuth, asyncHandler((req, res) => {
    const order = db.prepare('SELECT * FROM orders WHERE id=?').get(req.params.id);
    if (!order) {
        return res.status(404).json({ success: false, error: 'Not found' });
    }
    return res.json({ success: true, data: order });
}));

// ─── DEALER MANAGEMENT ──────────────────────────────────────────────────────

/**
 * POST /api/dealer/register
 * Register as a dealer
 */
app.post('/api/dealer/register',
    apiLimiter,
    validateBody(dealerRegisterSchema),
    asyncHandler((req, res) => {
        const { name, owner, phone, email, city, address, types, plan, about, payment } = req.validated;

        db.prepare(`
            INSERT INTO dealer_applications (name, owner, phone, email, city, address, types, plan, about, payment)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(name, owner, phone, email, city, address || '', types || '', plan, about || '', payment || 'mpesa');

        logger.info('Dealer application submitted', { email, name });

        return res.json({ success: true, message: 'Application received' });
    })
);

/**
 * GET /api/admin/dealers
 * Get all dealer applications
 */
app.get('/api/admin/dealers', adminAuth, asyncHandler((req, res) => {
    const dealers = db.prepare('SELECT * FROM dealer_applications ORDER BY created_at DESC').all();
    logger.info('Dealer applications retrieved', { count: dealers.length });
    return res.json({ success: true, data: dealers });
}));

/**
 * PATCH /api/admin/dealers/:id
 * Approve/reject dealer application
 */
app.patch('/api/admin/dealers/:id',
    adminAuth,
    validateBody(adminActionSchema),
    asyncHandler(async (req, res) => {
        const { status } = req.validated;

        db.prepare('UPDATE dealer_applications SET status=? WHERE id=?').run(status, req.params.id);
        const dealer = db.prepare('SELECT * FROM dealer_applications WHERE id=?').get(req.params.id);

        if (dealer?.email && process.env.SMTP_USER) {
            const isApproved = status === 'approved';
            await mailer.sendMail({
                from: `"OmniDrive" <${process.env.SMTP_USER}>`,
                to: dealer.email,
                subject: isApproved ? '🎉 Welcome to OmniDrive — Your Dealership is Live!' : 'OmniDrive Application Update',
                html: isApproved ? `
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;border:1px solid #eee;border-radius:10px">
                        <h2 style="color:#e47911">🚗 Welcome to OmniDrive, ${dealer.name}!</h2>
                        <p>Your dealership application has been <strong>approved</strong>. You are now a verified OmniDrive partner.</p>
                        <p>Visit <a href="https://omnidrive.co.ke">omnidrive.co.ke</a> to start listing your vehicles.</p>
                    </div>` : `
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px">
                        <h2>OmniDrive Application Update</h2>
                        <p>Hi ${dealer.name}, unfortunately your dealership application was not approved.</p>
                    </div>`
            }).catch(e => logger.error('Dealer email failed', { error: e.message }));
        }

        logger.info('Dealer application updated', { id: req.params.id, status });

        return res.json({ success: true });
    })
);

// ─── PENDING LISTINGS ──────────────────────────────────────────────────────

/**
 * POST /api/listings/submit
 * Submit pending listing for approval
 */
app.post('/api/listings/submit',
    apiLimiter,
    validateBody(pendingListingSchema),
    asyncHandler((req, res) => {
        const { listing_id, brand, model, price, year, category, condition, mileage, fuel, city, description, img, seller } = req.validated;

        db.prepare(`
            INSERT OR IGNORE INTO pending_listings
            (listing_id, brand, model, price, year, category, condition, mileage, fuel, city, description, img, seller_name, seller_phone, seller_email)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            listing_id || ('PND' + Date.now()),
            brand, model, price, year, category, condition,
            mileage || 0, fuel, city || '', description || '', img || '',
            seller.name, seller.phone, seller.email || ''
        );

        logger.info('Pending listing submitted', { brand, model, email: seller.email });

        return res.json({ success: true });
    })
);

/**
 * GET /api/admin/listings
 * Get pending listings
 */
app.get('/api/admin/listings', adminAuth, asyncHandler((req, res) => {
    const listings = db.prepare('SELECT * FROM pending_listings ORDER BY created_at DESC').all();
    logger.info('Pending listings retrieved', { count: listings.length });
    return res.json({ success: true, data: listings });
}));

/**
 * PATCH /api/admin/listings/:id
 * Approve/reject pending listing
 */
app.patch('/api/admin/listings/:id',
    adminAuth,
    validateBody(adminActionSchema),
    asyncHandler(async (req, res) => {
        const { status } = req.validated;

        db.prepare('UPDATE pending_listings SET status=? WHERE id=?').run(status, req.params.id);
        const listing = db.prepare('SELECT * FROM pending_listings WHERE id=?').get(req.params.id);

        if (listing?.seller_email && process.env.SMTP_USER) {
            await mailer.sendMail({
                from: `"OmniDrive" <${process.env.SMTP_USER}>`,
                to: listing.seller_email,
                subject: status === 'approved' ? `✅ Your ${listing.brand} ${listing.model} is now live on OmniDrive!` : 'OmniDrive Listing Update',
                html: status === 'approved' ? `
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;border:1px solid #eee;border-radius:10px">
                        <h2 style="color:#e47911">🚗 Your listing is live!</h2>
                        <p>Your <strong>${listing.brand} ${listing.model}</strong> is now visible to thousands of buyers.</p>
                    </div>` : `
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px">
                        <p>Your listing for <strong>${listing.brand} ${listing.model}</strong> was not approved.</p>
                    </div>`
            }).catch(e => logger.error('Listing email failed', { error: e.message }));
        }

        logger.info('Pending listing updated', { id: req.params.id, status });

        return res.json({ success: true });
    })
);

// ─── CHAT SYSTEM ────────────────────────────────────────────────────────────

// Chat authentication
app.post('/api/chat/auth', apiLimiter, asyncHandler((req, res) => {
    const { name, email, role } = req.body;
    if (!name || !email) {
        return res.status(400).json({ success: false, error: 'name and email required' });
    }

    const userRole = ['client', 'dealer'].includes(role) ? role : 'client';
    let user = db.prepare('SELECT * FROM chat_users WHERE email=?').get(email);

    if (!user) {
        const info = db.prepare('INSERT INTO chat_users (name, email, role) VALUES (?,?,?)').run(name, email, userRole);
        user = db.prepare('SELECT * FROM chat_users WHERE id=?').get(info.lastInsertRowid);
    }

    return res.json(user);
}));

// Additional chat endpoints (kept from original for completeness)
app.post('/api/chat/admin-auth', (req, res) => {
    const key = req.headers['x-admin-key'];
    if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = db.prepare(`SELECT * FROM chat_users WHERE role='admin' LIMIT 1`).get();
    return res.json(user);
});

app.get('/api/chat/users', (req, res) => {
    const users = db.prepare(`SELECT id, name, email, role, avatar FROM chat_users ORDER BY role, name`).all();
    return res.json(users);
});

app.post('/api/chat/rooms/direct', apiLimiter, asyncHandler((req, res) => {
    const { user_a, user_b } = req.body;
    if (!user_a || !user_b) {
        return res.status(400).json({ success: false, error: 'user_a and user_b required' });
    }

    const existing = db.prepare(`
        SELECT r.* FROM chat_rooms r
        JOIN chat_room_members m1 ON m1.room_id=r.id AND m1.user_id=?
        JOIN chat_room_members m2 ON m2.room_id=r.id AND m2.user_id=?
        WHERE r.type='direct' LIMIT 1
    `).get(user_a, user_b);

    if (existing) return res.json(existing);

    const uA = db.prepare('SELECT name FROM chat_users WHERE id=?').get(user_a);
    const uB = db.prepare('SELECT name FROM chat_users WHERE id=?').get(user_b);
    const room = db.prepare(`INSERT INTO chat_rooms (name, type, created_by) VALUES (?,?,?)`)
        .run(`${uA?.name} & ${uB?.name}`, 'direct', user_a);

    const roomId = room.lastInsertRowid;
    db.prepare('INSERT OR IGNORE INTO chat_room_members (room_id, user_id) VALUES (?,?)').run(roomId, user_a);
    db.prepare('INSERT OR IGNORE INTO chat_room_members (room_id, user_id) VALUES (?,?)').run(roomId, user_b);

    return res.json(db.prepare('SELECT * FROM chat_rooms WHERE id=?').get(roomId));
}));

// ─── FILE UPLOADS ──────────────────────────────────────────────────────────

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const upload = multer({
    storage: multer.diskStorage({
        destination: (_, __, cb) => cb(null, uploadDir),
        filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`)
    }),
    limits: { fileSize: 10 * 1024 * 1024 }
});

app.use('/uploads', express.static(uploadDir));

app.post('/api/chat/upload', upload.single('file'), asyncHandler((req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    return res.json({
        success: true,
        url: `/uploads/${req.file.filename}`,
        name: req.file.originalname,
        isImage: req.file.mimetype.startsWith('image/')
    });
}));

// ─── HEALTH CHECK & SERVER START ────────────────────────────────────────────

app.get('/health', (_, res) => res.json({
    status: 'ok',
    env: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
}));

// 404 handler
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.path,
    });
});

// Global error handler
app.use(errorHandler);

// ─── START SERVER ───────────────────────────────────────────────────────────
async function startServer() {
    // Initialize Redis
    const redisConnected = await connectRedis();
    
    const server = app.listen(PORT, () => {
        logger.info('OmniDrive Backend Started', {
            port: PORT,
            environment: process.env.NODE_ENV || 'development',
            mpesaBase: MPESA_BASE,
            databasePath: dbPath,
            redis: redisConnected ? 'Connected' : 'Unavailable',
            apiDocs: `http://localhost:${PORT}/api-docs`,
        });

        console.log(`\n✅ OmniDrive backend running on http://localhost:${PORT}`);
        console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`💳 MPesa: ${MPESA_BASE}`);
        console.log(`💾 Database: ${dbPath}`);
        if (redisConnected) {
            console.log(`📊 Redis: Connected (Caching enabled)`);
        }
        console.log();
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        logger.info('SIGTERM signal received: closing HTTP server');
        server.close(() => {
            logger.info('HTTP server closed');
            db.close();
            if (redisConnected) {
                try {
                    const { redis } = require('./config/redis');
                    redis.quit();
                } catch (error) {
                    logger.warn('Error closing Redis', { error: error.message });
                }
            }
            process.exit(0);
        });
    });
}

// Start the server
startServer().catch(error => {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
});

module.exports = app;
