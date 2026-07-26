const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'affirmation_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
            // ✅ SSL disable kiya: 'HANDSHAKE_NO_SSL_SUPPORT' error ab nahi aayega
            ssl: false,
            connectTimeout: 60000
        },
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            // ✅ Nodemon restart par connection drop hone se bachane ke liye idle timeout
            idle: 10000
        }
    }
);

const connectDB = async () => {
    let retries = 5;
    while (retries > 0) {
        try {
            await sequelize.authenticate();
            console.log('✅ [DB Connected] Local MySQL Database se connection successful!');

            // 🔄 sync() — naye tables banata hai, existing tables ko touch nahi karta
            // alter: true avoid kiya — MySQL "Too many keys" error deta tha
            await sequelize.sync();
            console.log('✨ [DB Synced] Saari MySQL tables synced ho gayi!');

            // ✅ isPremium column manually add karo agar exist nahi karta
            // (alter: true ki jagah safe approach — existing data safe rahega)
            try {
                await sequelize.query(
                    "ALTER TABLE `Users` ADD COLUMN `isPremium` TINYINT(1) NOT NULL DEFAULT 0;"
                );
                console.log('✅ [DB Migration] isPremium column Users table mein add ho gaya!');
            } catch (colErr) {
                // Column pehle se exist karta hai — ignore karo (yeh normal hai)
                if (colErr.message && colErr.message.includes('Duplicate column name')) {
                    console.log('ℹ️  [DB Migration] isPremium column already exists — skipping.');
                } else {
                    console.warn('⚠️  [DB Migration Warning]:', colErr.message);
                }
            }

            // ✅ Migration for user_journeys new columns
            try {
                await sequelize.query(
                    "ALTER TABLE `user_journeys` ADD COLUMN `afternoon_choice_today` VARCHAR(255) NULL;"
                );
                console.log('✅ [DB Migration] afternoon_choice_today column user_journeys table mein add ho gaya!');
            } catch (colErr) {
                if (colErr.message && colErr.message.includes('Duplicate column name')) {
                    console.log('ℹ️  [DB Migration] afternoon_choice_today column already exists — skipping.');
                } else {
                    console.warn('⚠️  [DB Migration Warning]:', colErr.message);
                }
            }

            try {
                await sequelize.query(
                    "ALTER TABLE `user_journeys` ADD COLUMN `last_afternoon_interaction` DATETIME NULL;"
                );
                console.log('✅ [DB Migration] last_afternoon_interaction column user_journeys table mein add ho gaya!');
            } catch (colErr) {
                if (colErr.message && colErr.message.includes('Duplicate column name')) {
                    console.log('ℹ️  [DB Migration] last_afternoon_interaction column already exists — skipping.');
                } else {
                    console.warn('⚠️  [DB Migration Warning]:', colErr.message);
                }
            }

            return; // Success — loop se bahar niklo
        } catch (error) {
            retries -= 1;
            console.error(`❌ [DB Error] Connection attempt failed: ${error.message}`);
            if (retries === 0) {
                console.error('🚨 [DB Fatal] Saari retries khatam ho gayi. Server start nahi ho sakta.');
                process.exit(1);
            }
            console.log(`🔁 [DB Retry] ${retries} attempts baaki hain. 3 seconds mein dobara try karenge...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
};

module.exports = { sequelize, connectDB };
