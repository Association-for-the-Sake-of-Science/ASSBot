const fs = require('fs');
const Discord = require('discord.js');
const config = require('./config.json');
const Sequelize = require('sequelize');

//const sqlite3 = require('sqlite3').verbose();


const ass = new Discord.Client({disableEveryone: false});
ass.login(config.token);
//console.log(ass);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './db/database.sqlite'
});
const memory = new Sequelize('sqlite::memory');


ass.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
//const { send } = require('process');
for(const file of commandFiles) {
  const command = require(`./commands/${file}`);
  ass.commands.set(command.name, command);
}
ass.once('ready', () => {

  const mservers = ass.guilds.cache.map(guild => {
    return guild;
  });
  for(mguild of mservers){
    if(mguild.systemChannel != undefined){
      mguild.systemChannel.send(`Hi @everyone, the stupid Bot of ASS (<@${ass.user.id}>) is now available!`);
    }
  }
  ass.user.setActivity('scientia');

  console.log(`I am ${ass.user.tag}`);
});

ass.on('guildCreate', guild => {
  if(guild.systemChannel != undefined){
    guild.systemChannel.send(`Hi @everyone, I am the stupid Bot of ASS, developing by <@594604652876660756>.\nSo please don't ask me anything to do.`);
  }
});

ass.on('message', async message => {

  const mcheck = ass.commands.get('quiet');
  mcheck.check(message, message.author.id, memory);

  if(!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(/~+/);
  const commandName = args.shift().toLowerCase();

  if(!ass.commands.has(commandName)) return;
  
  const command = ass.commands.get(commandName);

  if(command.arg && args.length == 0){
    let reply = `You didn't provide any argument.`;
    if(command.usage){
      reply += `\nThe proper usage would be ${config.prefix}${commandName} ${command.usage}`;
    }
    return message.reply(reply);
  }
  if(command.guildOnly && message.channel.type != 'text'){
    return message.reply(`${commandName} only available in a Server`);
  }

  try{
    await command.execute(message, args, sequelize, memory);
  } catch(error){
    console.error(error);
    message.reply(`There was an Error: ${error}`);
  }
});