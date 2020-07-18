const config = require('./../config.json');

module.exports = {
    id: 4,
    name: 'sinfo',
    arg: false,
    guildOnly: true,
    description: 'Informations of the server',
    category: config.Utility,

    execute(message, args, sequelize){
        let m = `\nServer Name: ${message.guild.name}\n`
        m += `Server ID: ${message.guild.id}\n`
        if(message.guild.description){
            m += `Server Description: ${message.guild.description}\n`
        }
        if(message.guild.icon){
            m += `Server Icon(Hash): ${message.guild.icon}\n`
        }
        m += `Number of Servermember: ${message.guild.memberCount}\n`
        m += `Server Owner: <@${message.guild.ownerID}>`

        message.reply(m);
    }
};