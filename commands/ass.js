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
        })
        .catch(err => {
            message.reply(`something went wrong`);
            console.error(err);
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
                if(attachment.length > 1){
                    message.reply('too many attachments');
                    return;
                }

                let url, name;
                if(attachment.length == 0 && args[2] != undefined && args[3] != undefined){
                    name = args[2];
                    url = args[3];
                }
                else if(attachment.length ==0 && (args[2] == undefined || args[3] == undefined)){
                    message.reply(`you didn't give an attachment or a url`);
                    return;
                }
                else{
                    name = attachment[0].name;
                    url = attachment[0].url;
                }
                if(args.length < 2){
                    message.reply(`you need to provide some infomations split by ~`);
                }
                
                try{
                    (async () => {
                        const newdocument = await document.create({
                            author_id: message.author.id,
                            message_id: message.id,
                            document_name: name,
                            document_description: args[0],
                            document_type: args[1],
                            document_link: url
                        }).catch( err => {console.error(err);});

                        return newdocument;
                    })().then(result => {
                        if(result != undefined && result != null){
                            message.react('👌')
                            .catch(err => {
                                console.error(err);
                            });
                        }
                        else{
                            message.reply(`something went wrong`);
                        }
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
                            if(res.get('document_link').includes(`cdn.discordapp.com/attachments`)){
                                const mattach = new Discord.MessageAttachment(res.get('document_link'));
                                message.reply(`your wished thing: \nDescription: ${res.get('document_description')}\nType: ${res.get('document_type')}\nId: ${res.get('message_id')}`, mattach)
                                .catch(err => { console.error(err); });
                            }
                            else{
                                message.reply(`your wished thing: \nDescription: ${res.get('document_description')}\nType: ${res.get('document_type')}\nId: ${res.get('message_id')}\nLink: ${res.get('document_link')}`)
                                .catch(err => { console.error(err); });
                            }
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