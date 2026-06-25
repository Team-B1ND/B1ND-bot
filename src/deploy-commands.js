import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { inquiryCommand } from './commands.js';

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID } = process.env;

const rest = new REST().setToken(DISCORD_TOKEN);

const body = [inquiryCommand.toJSON()];

const route = DISCORD_GUILD_ID
  ? Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID)
  : Routes.applicationCommands(DISCORD_CLIENT_ID);

await rest.put(route, { body });
console.log(`Registered ${body.length} command(s)${DISCORD_GUILD_ID ? ' to guild' : ' globally'}.`);
