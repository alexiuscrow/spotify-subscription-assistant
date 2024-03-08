import { Composer, Context } from 'grammy';
import startCommand from '@/bot/command/start';
import helpCommand from '@/bot/command/help';

const commandComposer = new Composer<Context>();

commandComposer.command('start', startCommand);
commandComposer.command('help', helpCommand);

export default commandComposer;
