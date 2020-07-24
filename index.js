
//Load Node's native file system module.
const fs = require('fs');
//Load discord.js Module 
const Discord = require('discord.js');
//Load configuration 
const config = require('./config.json');
//Load Sequelize, an object-relational-mapper(ORM) for database usage
const Sequelize = require('sequelize');


//create ass Discord client 
const ass = new Discord.Client({ disableEveryone: false });
//bot login
ass.login(config.token);
//create a extend JS's native Map class for better mapping of commands 
ass.commands = new Discord.Collection();
//
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

/*-----------------------------Database-----------------------------*/
//Init sqlite3 database 
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db/database.sqlite'
});
//Init sqlite3 local memory db
const memory = new Sequelize('sqlite::memory');


//Read fils from /commands folder
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    ass.commands.set(command.name, command);
}

//db start and sync
const mtable = ass.commands.get('table').rmember();
const mtalk = ass.commands.get('table').rtalk();

(async () => {
    const table = await memory.define('member', mtable);
    await table.sync();

    const ttalk = await memory.define('talk', mtalk);
    await ttalk.sync();

    const document = await sequelize.define('document', ass.commands.get('table').rdocument());
    await document.sync();
})()
.then(() => {
     console.log('Successfully synced');
})
.catch(err => {
    console.error(err);
});


/*-----------------------------Startup-----------------------------*/
ass.once('ready', () => {
    //Send hello message to all servers 
    const mservers = ass.guilds.cache.map(guild => {
        return guild;
    });
    for (mguild of mservers) {
        if (mguild.systemChannel != undefined) {
            mguild.systemChannel.send(`Hi @everyone, the stupid Bot of ASS (<@${ass.user.id}>) is now available!`);
        }
    }
    //set activity bot
    ass.user.setActivity('scientia');

    //hello message 
    console.log(`I am ${ass.user.tag}`);
});
//send hellomessage to new servers 
ass.on('guildCreate', guild => {
    if (guild.systemChannel != undefined) {
        guild.systemChannel.send(`Hi @everyone, I am the stupid Bot of ASS, developing by <@594604652876660756>.\nSo please don't ask me anything to do.`);
    }
});
/*########_Main_Programm_#########*/
ass.on('message', async message => {
    /*-----------------------------DirectReaction-----------------------------*/
    //check quiet 
    if (message.channel.type != 'dm') {
        const mcheck = ass.commands.get('quiet');
        mcheck.check(message, message.author.id, memory);
    }

    /*-----------------------------dynamic_Prefix Commands-----------------------------*/

    if (!message.content.startsWith(config.prefix) || message.author.bot) return;
    //Trim prefix out of message content, removes the leading and trailing white space and line terminator characters from a string and put it into an array for optimisation
    const args = message.content.slice(config.prefix.length).trim().split(/~+/);
    const commandName = args.shift().toLowerCase();

    //simpler prefix for talk command
    if (commandName == '1') {
        ass.commands.get('talk').check(message, args, memory.define('talk', ass.commands.get('table').rtalk()), `$${commandName}`);
    }

    //Exit early if no command is used 
    if (!ass.commands.has(commandName)) return;
    
   //find the requested command in the command 
    const command = ass.commands.get(commandName);

    //Exit early if argument is used 
    if (command.arg && args.length == 0) {
        let reply = `You didn't provide any argument.`;
        if (command.usage) {
            reply += `\nThe proper usage would be ${config.prefix}${commandName}~${command.usage}`;
        }
        return message.reply(reply);
    }
    //check if command is server only 
    if (command.guildOnly && message.channel.type != 'text') {
        return message.reply(`${commandName} only available in a Server`);
    }
    //run the matching command 
    try {
        if (command.public == false) {
            return;
        }
        else {
            await command.execute(message, args, sequelize, memory);
        }
    }
    catch (error) {
        console.error(error);
        message.reply(`There was an Error: ${error}`);
    }
});