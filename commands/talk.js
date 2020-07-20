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
        (async () => {
            const affectedTalk = await mtalk.findOne({
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
            return affectedTalk;
        })()
        .then(aTalk => {
            if(aTalk != null){
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
                    //message.reply(`successfully sended`);
                    message.react('👌')
                    .catch(err => {
                        console.error(err);
                    });
                })
                .catch(err => {
                    message.reply(`you can't send message to him/her`);
                });
            }
            else{
                return;
            }
        })
        .catch(err => {
            console.error(err);
        });
    },

    async rtalk(memory){
        const talk = await memory.define('talk', table.rtalk());
        return talk;
    },

    execute(message, args, sequelize, memory){
        const r_id = args.shift();
        
        const tk_prefix = '$1';

        (async () => {
            const mtalk = await this.rtalk(memory);

            if(r_id == 'break'){
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
                throw `connection broke`;
            }

            const a_exist = await this.exists(message.author.id, mtalk);
            const b_exist = await this.exists(r_id, mtalk);
            
            if(a_exist == true || b_exist == true){
                message.reply(`you can't build a connection, because either you or he/she already got one!!!`);
                throw 'connection alredy exists';
            }
            else{
                return mtalk;
            }
        })()
        .then(mtalk => {
            try {
                (async () => {
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
                })()
                .then(mtalk => {
                    try{
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
                                (async () => {
                                    const affectedTalk = await mtalk.destroy({
                                        where: {
                                            a_id: message.author.id,
                                            b_id: r_id
                                        }
                                    });
                                    return affectedTalk;
                                })()
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
                    } catch(err){
                        console.error(err);
                    }
                })
                .catch(err => {
                    console.error(err);
                })
            } catch(err){
                console.error(err);
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