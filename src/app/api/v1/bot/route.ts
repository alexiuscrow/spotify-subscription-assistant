import { webhookCallback } from 'grammy';
import bot from '@/bot';

export const POST = webhookCallback(bot, 'std/http');
