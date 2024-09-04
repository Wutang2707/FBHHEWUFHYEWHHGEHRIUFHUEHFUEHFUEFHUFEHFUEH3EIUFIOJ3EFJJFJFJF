// Dependencies
const { MessageEmbed, Message } = require('discord.js');
const fs = require('fs');
const config = require('../config.json');
const CatLoggr = require('cat-loggr');

// Functions
const log = new CatLoggr();
const generated = new Set();

module.exports = {
	name: 'gen', // Command name
	description: 'Stok varsa belirli bir hizmet oluşturun.', // Command description

    /**
     * Command exetute
     * @param {Message} message The message sent by user
     * @param {Array[]} args Arguments splitted by spaces after the command name
     */
	execute(message, args) {
        // If the generator channel is not given in config or invalid
        try {
            message.client.channels.cache.get(config.genChannel).id; // Try to get the channel's id
        } catch (error) {
            if (error) log.error(error); // If an error occured log to console

            // Send error messsage if the "error_message" field is "true" in the configuration
            if (config.command.error_message === true) {
                return message.channel.send(
                    new MessageEmbed()
                    .setColor(config.color.red)                    .setTitle('Hata oluştu!')
                    .setDescription('Geçerli bir gen kanalı belirtilmedi!')
                    .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                    .setTimestamp()
                );
            } else return;
        };

        // If the message channel id is the generator channel id in configuration
        if (message.channel.id === config.genChannel) {
            // If the user have cooldown on the command
            if (generated.has(message.author.id)) {
                return message.channel.send(
                    new MessageEmbed()
                    .setColor(config.color.red)
                    .setTitle('Sakin ol!')
                    .setDescription('Bu komutu tekrar çalıştırmadan önce lütfen bekleyin!')
                    .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                    .setTimestamp()
                );
            } else {
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
                
                // File path to find the given service
                const filePath = `${__dirname}/../stock/${args[0]}.txt`;

                // Read the service file
                fs.readFile(filePath, function (error, data) {
                    // If no error
                    if (!error) {
                        data = data.toString(); // Stringify the content

                        const position = data.toString().indexOf('\n'); // Get position
                        const firstLine = data.split('\n')[0]; // Get the first line

                        // If the service file is empty
                        if (position === -1) {
                            return message.channel.send(
                                new MessageEmbed()
                                .setColor(config.color.red)
                                .setTitle('Jeneratör hatası!')
                                .setDescription(`\`${args[0]}\` hizmetini stoğumda bulamıyorum!`)
                                .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                                .setTimestamp()
                            );
                        };

                        // Send messages to the user
                        message.author.send(
                            new MessageEmbed()
                            .setColor(config.color.green)
                            .setTitle('Oluşturulan hesap')
                            .addField('Hizmet', `\`\`\`${args[0][0].toUpperCase()}${args[0].slice(1).toLowerCase()}\`\`\``, true)
                            .addField('Hesap', `\`\`\`${firstLine}\`\`\``, true)
                            .setTimestamp()
                        )
                        .then(message.author.send('İşte kopyala+yapıştır işleminiz:'))
                        .then(message.author.send(`\`${firstLine}\``));

                        // Send message to the channel if the user recieved the message
                        if (position !== -1) {
                            data = data.substr(position + 1); // Remove the gernerated account line
                            
                            // Write changes
                            fs.writeFile(filePath, data, function (error) {
                                message.channel.send(
                                    new MessageEmbed()
                                    .setColor(config.color.green)
                                    .setTitle('Hesabınız Oluşturuldu!')
                                    .setDescription(`Özel ${message.author} hesabınızı kontrol edin! *Mesajı almadıysanız lütfen özelinizin kilidini açın!*`)
                                    .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                                    .setTimestamp()
                                );

                                generated.add(message.author.id); // Add user to the cooldown set

                                // Set cooldown time
                                setTimeout(() => {
                                    generated.delete(message.author.id); // Remove the user from the cooldown set after expire
                                }, config.genCooldown);

                                if (error) return log.error(error); // If an error occured, log to console
                            });
                        } else {
                            // If the service is empty
                            return message.channel.send(
                                new MessageEmbed()
                                .setColor(config.color.red)
                                .setTitle('Jeneratör hatası!')
                                .setDescription(`\`${args[0]}\` hizmeti boş!`)
                                .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                                .setTimestamp()
                            );
                        };
                    } else {
                        // If the service does not exists
                        return message.channel.send(
                            new MessageEmbed()
                            .setColor(config.color.red)
                            .setTitle('Jeneratör hatası!')
                            .setDescription(`\`${args[0]}\` hizmet
                            mevcut değil!`)
                            .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                            .setTimestamp()
                        );
                    };
                });
            };
        } else {
            // If the command executed in another channel
            message.channel.send(
                new MessageEmbed()
                .setColor(config.color.red)
                .setTitle('Yanlış komut kullanımı!')
                .setDescription(`Bu kanalda \`gen\` komutunu kullanamazsınız! Deneyin <#${config.genChannel}>!`)
                .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                .setTimestamp()
            );
        };
	}
};
