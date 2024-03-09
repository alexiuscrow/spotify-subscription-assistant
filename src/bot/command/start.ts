import { Middleware } from 'grammy';

const startCommand: Middleware = async ctx => {
	await ctx.api.setMyCommands([{ command: 'help', description: 'Показати довідку' }]);
};

export default startCommand;
