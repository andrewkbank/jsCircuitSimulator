const { Sequelize, DataTypes } = require('sequelize');

// Setup SQLite database connection
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
});

// Define a model for text entries
const TextEntry = sequelize.define('TextEntry', {
    text: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

// Synchronize the model with the database
sequelize.sync();

module.exports = { TextEntry };
