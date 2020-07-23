const Sequelize = require('sequelize');
const Discord = require('discord.js');
const config = require('./../config.json');
const table = require('./table.js');

const Op = Sequelize.Op;


module.exports = {
    id: 3,
    name: 'ass',
    usage: '<search|new|edit|delete> <what|<description, type>|<id, new description>|<id>>',
    arg: true,
    guildOnly: false,
    description: 'only for learning',
    category: config.Learning,

    async search(name, document){
        const result = await document.findAll({
            where: {
                [Op.or]: [
                    {
                        document_name: {
                            [Op.like]: "%"+name+"%"
                        }
                    },
                    {
                        document_description: {
                            [Op.like]: "%"+name+"%"
                        }
                    },
                    {
                        document_type: {
                            [Op.like]: "%"+name+"%"
                        }
                    }
                ]
            }
        });
        
        return result.map( res => {
            return res;
        });
    },

    async edit(args, document){
        const result = await document.update({ document_description: args[1], document_type: args[2] }, {
            where: {
                message_id: args[0]
            }
        });
        if(result > 1){
            throw 'unique error';
        }
        else{
            return result;
        }
    },

    async destroy(args, document){
        const result = await document.destroy({where: {message_id: args[0]}});
        if(result < 2){
            return result;
        }
        else {
            throw `unique error`;
        }
    },

    execute(message, args, sequelize){
        const document = sequelize.define('document', table.rdocument());
        const commandArg = args.shift().toLowerCase();
        
        switch(commandArg){
            case 'new':
                const attachment = message.attachments.map(attachment => {
                    return attachment;
                });
                if(attachment.length == 0){
                    message.reply(`you didn't give an attachment`);
                    return;
                }
                
                if(args.length > 2){
                    message.reply(`you need to provide some infos split by ~`);
                    return;
                }
                
                try{
                    (async () => {
                        for(attach of attachment){
                            const newdocument = await document.create({
                                author_id: message.author.id,
                                message_id: message.id,
                                document_name: attach.name,
                                document_description: args[0],
                                document_type: args[1],
                                document_link: attach.url
                            }).catch( err => {console.error(err);});
                        }
                        return attachment.length;
                    })().then(result => {
                        message.reply(`susccesfully storaged ${result} files.`);
                    })
                    .catch(err => {
                        console.error(err);
                    });
                    
                } catch(err){
                    console.error(err);
                }
                break;

            case 'search':
                this.search(args.toString(), document)
                .then(result => {
                    if(result.length > 0){
                        for(res of result){
                            const mattach = new Discord.MessageAttachment(res.get('document_link'));
                            message.reply(`your wished thing: \nDescription: ${res.get('document_description')}\nType: ${res.get('document_type')}\nId: ${res.get('message_id')}`, mattach);
                        }
                    }
                    else {
                        message.reply(`found nothing you needed, please never try again.`);
                    }
                })
                .catch(err => {
                    console.error(err);
                });               
                break;

            case 'edit':
                this.edit(args, document)
                .then(result => {
                    if(result != 0){
                        message.react('👌')
                        .catch(err => {
                            console.error(err);
                        });
                    }
                    else{
                        message.reply(`nothing to change found`);
                    }
                })
                .catch(err => {
                    console.error(err);
                });
                break;

            case 'delete':
                this.destroy(args, document)
                .then(result => {
                    if(result > 0){
                        message.react('👌')
                        .catch(err => {
                            console.error(err);
                        });
                    }
                    else {
                        message.reply(`nothing to delete found`);
                    }
                })
                .catch(err => {
                    console.error(err);
                });
                break;

            default:
                message.reply(`you didn't tell me what to do with it!`);
                return;
        }
    }
};