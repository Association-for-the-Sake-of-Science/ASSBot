const config = require('./../config.json');
//const Sequelize = require('sequelize');
const Op = require('sequelize').Op;

const Discord = require('discord.js');
const table = require('./table.js');

module.exports = {
    id: 7,
    name: 'talk',
    arg: true,
    guildOnly: false,
    description: 'talk to someone',
    category: config.Utility,

    async exists(user_id, mtalk){
        const one = await mtalk.findAll({
            where: {
                [Op.or]: [{
                    a_id: user_id
                }, {
                    b_id: user_id
                }]
            }
        });
        if(one.length > 0){
            return true;
        }
        else{
            return false;
        }
    },

    async destroy(mtalk, user_id){
        const affectedTalk = await mtalk.destroy({
            where: {
                [Op.or]: [
                    {
                        a_id: user_id
                    },
                    {
                        b_id: user_id
                    }
                ]
            }
        });
        return affectedTalk;
    },

    check(message, args, mtalk, t_prefix){
        this.find(message, mtalk, t_prefix)
        .then(res => {
            if(res.length != 0){
                const aTalk = res[0];

                let r_id;
                if(message.author.id == aTalk.get('a_id')){
                    r_id = aTalk.get('b_id');
                }
                else if(message.author.id == aTalk.get('b_id')){
                    r_id = aTalk.get('a_id');
                }
                else {
                    console.error('something wrong');
                    return;
                }

                const user = new Discord.User(message.client, {
                    id: r_id
                });
                user.send(`<@${message.author.id}>: ${args.toString()}`)
                .then(() => {
                    message.react('👌')
                    .catch(err => {
                        console.error(err);
                    });
                })
                .catch(err => {
                    if(err.code == 50007){
                        message.reply(`you can't send message to him/her`);
                    }
                    else{
                        message.reply(`something went wrong`);
                    }
                    console.error(err);
                });
            }
            else{
                message.reply(`have you built a connection?`);
                return;
            }
        })
        .catch(err => {
            message.reply(`something went wrong`);
            console.error(err);
        });
    },
    
    async find(message, mtalk, t_prefix){
        const affectedTalk = await mtalk.findAll({
            where: {
                [Op.or]: [{
                    a_id: message.author.id,
                    t_prefix: t_prefix
                },{
                    b_id: message.author.id,
                    t_prefix: t_prefix
                }]
            }
        });
        if(affectedTalk.length < 2){
            return affectedTalk;
        }
        else{
            throw `unique error`;
        }
    },

    async rtalk(memory){
        const talk = await memory.define('talk', table.rtalk());
        return talk;
    },

    break(message, mtalk){
        this.destroy(mtalk, message.author.id)
        .then(res => {
            if(res != undefined && res != null){
                message.reply(`connection broke`);
            }
            else{
                message.reply(`there was none`);
                throw 'there was none';
            }
        })
        .catch(err => {
            console.error(err);
            message.reply(`can't break connection: ${err.code}`);
        });
        return true;
    },

    async createConnection(memory){
        const mtalk = await this.rtalk(memory);
        return mtalk;
    },

    async buildTo(message, r_id, tk_prefix, mtalk){
        const affectedTalk = await mtalk.create({
            a_id: message.author.id,
            b_id: r_id,
            t_prefix: tk_prefix
        });
        if(affectedTalk != undefined && affectedTalk != null){
            return mtalk;
        }
        else{
            throw `can't create`;
            return;
        }
    },

    newTalkRespond(message, r_id,tk_prefix, mtalk){
        const r = new Discord.User(message.client, {
            id: r_id
        });
        r.send(`connection build with <@${message.author.id}>, prefix: ${tk_prefix}`)
        .then(() => {
            message.reply('successfully created a connection');
        })
        .catch(err => {
            if(err.code == 50007){
                message.reply(`you can't send messages to him/her`);
                this.destroy(mtalk, message.author.id)
                .then(res => {
                    if(res != undefined && res != null){
                        message.reply(`connection broke`);
                    }
                    else{
                        return;
                    }
                })
                .catch(err => {
                    console.error(err);
                    message.reply(`can't break connection: ${err.code}`);
                });
            }
            else{
                message.reply(`something went wrong: ${err.code}`);
            }
            console.error(err);
        });
    },

    execute(message, args, sequelize, memory){
        const command = args.shift();
        
        const tk_prefix = '$1';

        this.createConnection(memory)
        .then(mtalk => {
            switch(command){
                case 'to':
                    const r_id = args.shift();

                    (async () => {
                        const a_exist = await this.exists(message.author.id, mtalk);
                        const b_exist = await this.exists(r_id, mtalk);
    
                        if(a_exist == true || b_exist == true){
                            //message.reply(`you can't build a connection, because either you or he/she already got one!!!`);
                            throw 'connection alredy exists';
                        }
                    })()
                    .then(() => {
                        this.buildTo(message, r_id, tk_prefix, mtalk)
                        .then(() => {
                            this.newTalkRespond(message, r_id, tk_prefix, mtalk);
                        })
                        .catch(err => {
                            if(err.code != undefined){
                                message.reply(`something went wrong: ${err.code}`);
                            }
                            else {
                                message.reply(`something went wrong: ${err}`);
                            }
                            console.error(err);
                        });
                    })
                    .catch(err => {
                        if(err.code != undefined){
                            message.reply(`something went wrong: ${err.code}`);
                        }
                        else {
                            message.reply(`something went wrong: ${err}`);
                        }
                        console.error(err);
                        return;
                    });

                    break;

                case 'break':
                    this.break(message, mtalk);
                    break;

                case 'check':
                    this.find(message, mtalk, tk_prefix)
                    .then(res => {
                        if(res.length != 0){
                            let p_id;
                            if(res[0].get('a_id') == message.author.id){
                                p_id = res[0].get('b_id');
                            }
                            else{
                                p_id = res[0].get('a_id');
                            }
                            message.reply(`there is a connection betwenn you and <@${p_id}>`);
                        }
                        else{
                            message.reply(`you don't have a talk connection yet`);
                        }
                    })
                    .catch(err => {
                        if(err.code != undefined){
                            message.reply(`something went wrong: ${err.code}`);
                        }
                        else {
                            message.reply(`something went wrong: ${err}`);
                        }
                        console.error(err);
                    });
                    break;

                default:
                    return;
            }
        })
        .catch(err => {
            if(err.code != undefined){
                message.reply(`something went wrong: ${err.code}`);
            }
            console.error(err);
        });
    }
}