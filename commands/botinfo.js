const config = require('./../config.json');

module.exports = {
    id: 6,
    name: 'botinfo',
    arg: false,
    guildOnly: false,
    description: 'Informations of this discord bot',
    category: config.Utility,

    execute(message, args, sequelize){
        let m = `\nBot Name: ${config.name}\n`;
        m += `Bot ID: ${message.client.user.id}\n`;
        m += `Bot Description: ${config.description}\n`;
        m += `Bot Github Link: https://github.com/Association-for-the-Sake-of-Science/ASSBot\n`;
        m += `Bot Version: V${config.version}\n`;
        m += `Bot Developer: <@${config.developer}>\n`;

        message.reply(m);
    }
};