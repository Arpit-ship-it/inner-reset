// models/UserMood.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); // Isko curly braces {} me daal do

const UserMood = sequelize.define('UserMood', {
    whatsappId: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true // Har unique WhatsApp user ke liye ek entry
    },
    lastMood: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Neutral' // Shuruat mein status neutral rahega
    },
    interactionCount: {
        type: DataTypes.INTEGER,
        defaultValue: 1 // Pehle message par count 1 hoga, fir increment hota rahega
    }
}, {
    timestamps: true // Yeh automatically createdAt aur updatedAt fields handle karega
});

module.exports = UserMood;