const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User'); // User table se connect karne ke liye

const Subscription = sequelize.define('Subscription', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'inactive'
    },
    razorpay_order_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    payment_date: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

// Relational Link: Ek Subscription ek hi User ka ho sakta hai
Subscription.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
User.hasOne(Subscription, { foreignKey: 'user_id' });

module.exports = Subscription;