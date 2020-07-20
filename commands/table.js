const Sequelize = require('sequelize');

module.exports = {
    name: 'table',
    public: false,
    rmember(){
        let member = {
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
        let document = {

        };
        return document;
    },
    rtalk(){
        let rtalk = {
            a_id: {
                type: Sequelize.DataTypes.STRING
            },
            b_id: {
                type: Sequelize.DataTypes.STRING
            },
            t_prefix: {
                type: Sequelize.DataTypes.STRING,
                //unique: true
            }
        }
        return rtalk;
    }
};