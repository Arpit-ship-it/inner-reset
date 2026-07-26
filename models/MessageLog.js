// models/MessageLog.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MessageLog = sequelize.define('MessageLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    whatsapp_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sender: {
        type: DataTypes.ENUM('user', 'ai'),
        allowNull: false
    },
    message_text: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    timestamps: true // Isse 'createdAt' se chat ka real time save hota rahega
});

module.exports = MessageLog;