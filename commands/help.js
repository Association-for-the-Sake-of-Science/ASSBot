const config = require('./../config.json')

module.exports = {
    id: 2,
    name: 'help',
    usage: '[commandName]',
    arg: false,
    guildOnly: false,
    description: `A command which helps.`,
    category: 2,
    
    ncategory(l){
        switch(l){
            case config.Moderation:
                return 'Moderation';
                break;
            case config.Utility:
                return 'Utility';
                break;
            case config.Learning:
                return 'Learning';
                break;
        }
    },
    execute(message, args){
        const ass = message.client;

        const commands = ass.commands.map(command => {
            return command;
        });

        let data;

        let categories = new Array();
        if(args.length == 0){
            data = `**Commandlist:**\n`;
            for(l = 0; (ass.commands.filter(command => command.category == (l+1)).map(command => {return command})).length > 0 ;l++){
                data += `\n**${l+1}. ${this.ncategory(l+1)}**\n`;
                categories[l] = ass.commands.filter(command => command.category == (l+1)).map(command => {return command});
                for(command of categories[l]){
                    if(command.public == false){
                        continue;
                    }
                    data += `*${command.name}* - ${command.description}\n`;
                }
            }
        }
        else{
            data = 'You are stupid';
        }
        return message.author.send(data, {split: true})
            .then(() => {
                if(message.channel.type == 'dm') return;
                else message.reply(`check your DM!`);
            })
            .catch(error => {
                message.reply('Have you stupidly disabled DM?????');
            });
    }
};