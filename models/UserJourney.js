const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserJourney = sequelize.define('UserJourney', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    whatsapp_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        references: {
            model: 'Users',
            key: 'whatsapp_number'
        }
    },
    // 30-Day Morning Journey Tracking
    current_day: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        validate: {
            min: 1,
            max: 30
        }
    },
    journey_start_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    last_morning_interaction: {
        type: DataTypes.DATE,
        allowNull: true
    },
    morning_choice_today: {
        type: DataTypes.STRING,
        allowNull: true
    },
    afternoon_choice_today: {
        type: DataTypes.STRING,
        allowNull: true
    },
    last_afternoon_interaction: {
        type: DataTypes.DATE,
        allowNull: true
    },
    
    // User Preferences
    preferred_categories: {
        type: DataTypes.JSON,
        defaultValue: ['HEALTH', 'LIFE'], // Default categories
        comment: 'Array of preferred affirmation categories'
    },
    companion_name: {
        type: DataTypes.STRING,
        defaultValue: 'Care Buddy'
    },
    user_address_name: {
        type: DataTypes.STRING,
        defaultValue: 'Friend'
    },
    
    // Delivery Settings
    morning_time: {
        type: DataTypes.STRING,
        defaultValue: '08:00',
        comment: 'Time for morning affirmation (HH:MM format)'
    },
    afternoon_time: {
        type: DataTypes.STRING,
        defaultValue: '13:00'
    },
    evening_time: {
        type: DataTypes.STRING,
        defaultValue: '20:00'
    },
    
    // Engagement Tracking
    total_interactions: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    morning_response_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'How many times user responded to morning questions'
    },
    mood_patterns: {
        type: DataTypes.JSON,
        defaultValue: {},
        comment: 'Track mood choices: {Peace: 5, Happiness: 3, etc.}'
    },
    
    // Message Delivery Tracking
    last_health_msg_index: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    last_relationship_msg_index: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    last_money_msg_index: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    last_career_msg_index: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    last_loneliness_msg_index: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    last_pregnancy_msg_index: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    last_lowenergy_msg_index: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    last_painbody_msg_index: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    last_menopause_msg_index: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    last_life_msg_index: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    
    // Status
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true,
    tableName: 'user_journeys'
});

module.exports = UserJourney;
