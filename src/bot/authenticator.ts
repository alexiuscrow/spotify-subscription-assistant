import { Middleware } from 'grammy';
import { inspect } from 'node:util';

const authenticator: Middleware = async (ctx, next) => {
	console.log(inspect(ctx.message));

	await ctx.reply(`
		User ID: ${ctx.from?.id},
		First Name: ${ctx.from?.first_name},
	`);

	await next();
};

export default authenticator;
