'use strict';

module.exports = (sequelize, DataTypes) => {
    const Event = sequelize.define('Event', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        details: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    });

    Event.associate = function(models) {
        // Associating Event with User
        Event.belongsTo(models.User, {
            foreignKey: 'createdBy',
            as: 'creator',
        });
    };

    return Event;
};
