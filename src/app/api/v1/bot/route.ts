import { webhookCallback } from 'grammy';
import { getBot } from '@/bot';
import { NextRequest } from 'next/server';

export const POST = async (req: NextRequest, ...args: any[]) => {
	const bot = await getBot();
	return webhookCallback(bot, 'std/http')(req, ...args);
};
