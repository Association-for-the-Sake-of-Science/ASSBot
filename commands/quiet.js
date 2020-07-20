const Sequelize = require('sequelize');
const config = require('./../config.json');
const table = require('./table.js');

module.exports = {
    id: 5,
    name: 'quiet',
    usage: '<@someone>',
    arg: true,
    guildOnly: true,
    description: 'quiet someone',
    category: config.Moderation,

    async rmember(memory){
        const member = await memory.define('member', table.rmember());
        
        //await member.sync();
        return member;
    },

    check(message, user_id, memory){
        (async () =>{
            const member = await this.rmember(memory);
            const affectMember = await member.findOne({where: 
                { 
                    member_id: user_id
                }
            });
            return affectMember;
        })()
        .then(res => {
            if(res != null){
                if(res.get('quiet') == true){
                    message.delete();
                }
            }
        })
        .catch(err => {
            console.log('zhuzhu');
            console.error(err);
        })
    },

    answer(message, user_id, setbool, res, err){
        if(res == true){
            message.reply(`successfully set <@${user_id}>'s mouth ${setbool}`);
        }
        else if(res == false){
            message.reply(`something wrong`);
            console.error(err);
        }
    },

    create(message, user, member, bool, memory){
        try{
            (async () => {
                const newuser = await member.create({
                    member_id: user.id,
                    quiet: bool
                });
                return newuser;
            })()
            .then(result => {
                if(result != undefined){
                    this.answer(message, user.id, bool, true);
                }
            })
            .catch(err => {
                this.answer(message, user.id, bool, false, err);
            });
        } catch(err) {
            console.error(err);
        }
    },

    real(message, user, member, bool, memory){
        //console.log('1');
        (async () => {
            const affectMember = await member.findOne({where: 
                { 
                    member_id: user.id
                }
            });
            if(affectMember != undefined){
                const affectedMember = await member.update({quiet: bool}, { where: { member_id: user.id} });
                if(affectedMember > 0){
                    this.answer(message, user.id, bool, true);
                }
                else{
                    this.answer(message, user.id, bool, false, undefined);
                }
            }
            else {
                await this.create(message, user, member, bool, memory);
            }
        })()
        .then(() => {
        })
        .catch(err => {
            this.answer(message, null, null, false, err);
        });
    },

    execute(message, args, sequelize, memory){
        if(message.author.id != '594604652876660756'){
            message.reply(`you are not smart enough to use this command!`);
            return;
        }
        (async () => {
            const member = await this.rmember(memory);
            return member;
        })()
        .then(member => {
            const user = message.mentions.users.first();
            //const info = args.toString().split(/~+/);
            switch(args[0]){
                case 'true':
                    this.real(message, user, member, true, memory);
                    break;
                case 'false':
                    this.real(message, user, member, false, memory);
                    break;
                default:
                    message.reply(`what the hell are you doing????`);
            }
        })
        .catch(err => {
            console.log('Error');
            console.error(err);
        });
    }
};