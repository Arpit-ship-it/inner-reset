const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    whatsapp_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active', // Default me subscription active rahegi
        validate: {
            isIn: [['active', 'inactive']] // Only these two values allowed
        }
    },
    utr_number: {
        type: DataTypes.STRING,
        allowNull: true // Testing aur dynamic validation ko smooth rakhne ke liye true rakha hai
    },
    isPremium: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false // Default: free user. Payment success par true ho jayega.
    }
}, {
    timestamps: true // Isse 'createdAt' aur 'updatedAt' apne aap ban jayega
});

module.exports = User;