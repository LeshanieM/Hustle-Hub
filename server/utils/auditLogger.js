const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const Store = require('../models/Store');

/**
 * Creates a new discrete audit log.
 * @param {Object} param0 
 */
const logAction = async ({ action, type, target, admin = 'System', icon = 'info', metadata = {} }) => {
    try {
        await AuditLog.create({
            action,
            type,
            target,
            admin,
            icon,
            metadata
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
    }
};

/**
 * Sweeps existing users and stores to generate historical audit logs.
 * Ensure it doesn't duplicate if already run.
 */
const performHistoricalMigration = async () => {
    try {
        const count = await AuditLog.countDocuments();
        if (count > 0) {
            return;
        }

        console.log('[AuditLogger] Starting historical data migration to AuditLogs...');
        let migratedCount = 0;

        // 1. Migrate Users
        const users = await User.find({});
        for (const u of users) {
            // Need to insert raw to bypass Mongoose's auto-createdAt overriding if we want to preserve old dates
            // But actually Mongoose respects timestamps if provided directly during create()
            await AuditLog.create({
                action: `${u.role || 'USER'} Registered`,
                type: 'USER',
                target: u.username || u.email || 'Unknown User',
                admin: 'System',
                icon: 'person_add',
                createdAt: u.createdAt,
                updatedAt: u.createdAt
            });
            migratedCount++;
        }

        // 2. Migrate Stores
        const stores = await Store.find({});
        for (const s of stores) {
            await AuditLog.create({
                action: `Store ${s.status}`,
                type: 'STORE',
                target: s.storeName || 'Unknown Store',
                admin: 'System',
                icon: 'storefront',
                createdAt: s.updatedAt || s.createdAt,
                updatedAt: s.updatedAt || s.createdAt
            });
            migratedCount++;
        }

        console.log(`[AuditLogger] Historical migration complete. ${migratedCount} logs generated.`);
    } catch (error) {
        console.error('Failed historical migration:', error);
    }
};

module.exports = {
    logAction,
    performHistoricalMigration
};
