const Sequelize = require('sequelize');
const Discord = require('discord.js');
const config = require('./../config.json');

const Op = Sequelize.Op;


module.exports = {
    id: 3,
    name: 'ass',
    usage: '',
    arg: true,
    guildOnly: true,
    description: 'only for learning',
    category: config.Learning,

    execute(message, args, sequelize){
        const document = sequelize.define('document',{
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
        });


        document.sync(/*{force: true}*/);
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
                //console.log(args.toString());
                /*const result = document.findAll({
                    where: {
                        [Op.or]: [{
                            document_description : {
                                [Op.like]: args.toString()
                            }
                        }, {
                            document_description:{
                                [Op.like]: args.toString()
                            }
                        }]
                    }
                });*/
                try{
                    (async () => {
                        const result = await document.findAll({
                            where: {
                                //document_name: args.toString()
                                [Op.or]: [
                                    {
                                        document_name: {
                                            [Op.like]: "%"+args.toString()+"%"
                                        }
                                    },
                                    {
                                        document_description: {
                                            [Op.like]: "%"+args.toString()+"%"
                                        }
                                    },
                                    {
                                        document_type: {
                                            [Op.like]: "%"+args.toString()+"%"
                                        }
                                    }
                                ]
                            }
                        });
                        return result.map( res => {
                            return res;
                        });
                    })().then(result => {
                        if(result.length > 0){
                            for(res of result){
                                const mattach = new Discord.MessageAttachment(res.get('document_link'));
                                message.reply("your wished thing:\nDescription: "+res.get('document_description')+"\nType: "+res.get('document_type'), mattach);
                            }
                        }
                        else {
                            message.reply(`found nothing you needed, please never try again.`);
                        }
                    })
                    .catch(err => {
                        console.error(err);
                    })
                } catch(err){
                    console.error(err);
                }
                break;
            case 'edit':

                break;
            case 'delete':

                break;
            default:
                message.reply(`you didn't tell me what to do with it!`);
                return;
        }
    }
};