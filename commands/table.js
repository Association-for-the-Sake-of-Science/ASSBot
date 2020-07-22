const Sequelize = require('sequelize');

module.exports = {
    name: 'table',
    public: false,

    rmember(){
        const member = {
            member_id: {
                type: Sequelize.DataTypes.STRING,
                unique: true
            },
            quiet: {
                type: Sequelize.DataTypes.BOOLEAN
            }
        };
        return member;
    },

    rdocument(){
        const document = {
            author_id: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
                unique: false
            },
            message_id: {
                unique: true,
                type: Sequelize.DataTypes.STRING
            },
            document_name: {
                unique: false,
                type: Sequelize.DataTypes.STRING
            },
            document_description: {
                unique: false,
                type: Sequelize.DataTypes.STRING
            },
            document_type: {
                unique: false,
                type: Sequelize.DataTypes.STRING
            },
            document_link: {
                unique: false,
                type: Sequelize.DataTypes.STRING
            }
        };
        return document;
    },

    rtalk(){
        const rtalk = {
            a_id: {
                type: Sequelize.DataTypes.STRING,
                unique: true
            },
            b_id: {
                type: Sequelize.DataTypes.STRING,
                unique: true
            },
            t_prefix: {
                type: Sequelize.DataTypes.STRING,
                //unique: true
            }
        }
        return rtalk;
    },
};