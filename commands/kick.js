const config = require('./../config.json');

module.exports = {
    id: 1,
    name: 'kick',
    usage: '<@someone>',
    arg: false,
    guildOnly: true,
    description: `kick sombody's ass`,
    category: config.Moderation,

    kick(user, message){
        if(user == undefined){
            message.reply(`You are so stupid that you didn't give a real name?????`);
        }
        else{
            const member = message.guild.member(user);
            if(member != undefined){
                member.kick('I am just a stupid Bot, I know nothing.')
                    .then(() => {
                        message.reply(`Successfully kicked ${user.username}'s ass`);
                    })
                    .catch(error => {
                        message.reply(`I am too stupid to kick ${user.username}'s ass`);
                        console.log(error);
                        return;
                    });
            }
            else{
                message.reply(`You can't kick him you silly`);
            }
        }
    },
	execute(message, args) {
        const Users = message.mentions.users.map(user => {
            return user;
        });
        if(Users.length == 0){
            message.reply(`You are so stupid that you didn't give a real name?????`);
        }
        for(user of Users){
            this.kick(user, message)
        }
        //console.log(message.guild);
    }
};