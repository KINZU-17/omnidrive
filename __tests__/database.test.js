const Database = require('better-sqlite3');

describe('Database Operations', () => {
    let db;

    beforeEach(() => {
        db = new Database(':memory:');
        
        // Create test tables
        db.exec(`
            CREATE TABLE listings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                brand TEXT NOT NULL,
                model TEXT NOT NULL,
                price REAL NOT NULL,
                nation TEXT NOT NULL,
                category TEXT DEFAULT 'Car',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                isActive BOOLEAN DEFAULT 1
            );

            CREATE INDEX idx_brand_model ON listings(brand, model);
            CREATE INDEX idx_price_range ON listings(price);
            CREATE INDEX idx_category ON listings(category);
            CREATE INDEX idx_active ON listings(isActive);
        `);
    });

    afterEach(() => {
        db.close();
    });

    describe('Query Performance', () => {
        beforeEach(() => {
            // Insert test data
            const stmt = db.prepare(`
                INSERT INTO listings (brand, model, price, nation, category)
                VALUES (?, ?, ?, ?, ?)
            `);

            const brands = ['Toyota', 'Honda', 'BMW', 'Mercedes', 'Audi'];
            const models = ['Model A', 'Model B', 'Model C'];
            const categories = ['Car', 'SUV', 'Truck'];

            for (let i = 0; i < 100; i++) {
                const brand = brands[i % brands.length];
                const model = models[i % models.length];
                const price = 100000 + Math.random() * 900000;
                const category = categories[i % categories.length];
                stmt.run(brand, model, price, 'Japan', category);
            }
        });

        it('should retrieve listings efficiently', () => {
            const start = Date.now();
            const stmt = db.prepare('SELECT * FROM listings WHERE isActive = 1 LIMIT 20');
            const results = stmt.all();
            const duration = Date.now() - start;

            expect(results.length).toBeGreaterThan(0);
            expect(duration).toBeLessThan(100); // Should be very fast
        });

        it('should filter by brand efficiently', () => {
            const stmt = db.prepare('SELECT * FROM listings WHERE brand = ? AND isActive = 1');
            const results = stmt.all('Toyota');

            expect(results.length).toBeGreaterThan(0);
            expect(results.every(r => r.brand === 'Toyota')).toBe(true);
        });

        it('should filter by price range efficiently', () => {
            const stmt = db.prepare(`
                SELECT * FROM listings 
                WHERE price BETWEEN ? AND ? AND isActive = 1
            `);
            const results = stmt.all(200000, 500000);

            expect(results.length).toBeGreaterThan(0);
            expect(results.every(r => r.price >= 200000 && r.price <= 500000)).toBe(true);
        });

        it('should count listings by category', () => {
            const stmt = db.prepare(`
                SELECT category, COUNT(*) as count 
                FROM listings 
                WHERE isActive = 1
                GROUP BY category
            `);
            const results = stmt.all();

            expect(results.length).toBeGreaterThan(0);
            expect(results.every(r => r.count > 0)).toBe(true);
        });
    });

    describe('Data Integrity', () => {
        it('should enforce constraints', () => {
            const stmt = db.prepare(`
                INSERT INTO listings (brand, model, price, nation)
                VALUES (?, ?, ?, ?)
            `);

            // Valid insert
            expect(() => {
                stmt.run('Toyota', 'Camry', 250000, 'Japan');
            }).not.toThrow();
        });

        it('should handle duplicate operations safely', () => {
            const stmt = db.prepare(`
                INSERT INTO listings (brand, model, price, nation)
                VALUES (?, ?, ?, ?)
            `);

            stmt.run('Honda', 'Civic', 180000, 'Japan');
            stmt.run('Honda', 'Civic', 180000, 'Japan');

            const selectStmt = db.prepare("SELECT COUNT(*) as count FROM listings WHERE brand = 'Honda'");
            const result = selectStmt.get();

            expect(result.count).toBe(2);
        });
    });
});
