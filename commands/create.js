// Dependencies
const { MessageEmbed, Message } = require('discord.js');
const fs = require('fs');
const config = require('../config.json');
const CatLoggr = require('cat-loggr');

// Functions
const log = new CatLoggr();

module.exports = {
	name: 'create', // Command name
	description: 'Yeni bir hizmet oluşturun.', // Command description

    /**
     * Command exetute
     * @param {Message} message The message sent by user
     * @param {Array[]} args Arguments splitted by spaces after the command name
     */
	execute(message, args) {
        // Parameters
        const service = args[0];

        // If the "service" parameter is missing
        if (!service) {
            return message.channel.send(
                new MessageEmbed()
                .setColor(config.color.red)
                .setTitle('Eksik parametreler!')
                .setDescription('Bir hizmet adı vermeniz gerekiyor!')
                .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                .setTimestamp()
            );
        };

        // File path where create the new service file
        const filePath = `${__dirname}/../stock/${args[0]}.txt`;

        // Create new file
        fs.writeFile(filePath, '', function (error) {
            if (error) return log.error(error); // If an error occured, log to console

            message.channel.send(
                new MessageEmbed()
                .setColor(config.color.green)
                .setTitle('Hizmet oluşturuldu!')
                .setDescription(`Yeni ${args[0]} hizmet oluşturuldu!`)
                .setFooter(message.author.tag, message.author.displayAvatarURL())
                .setTimestamp()
            );
        });
    }
};
