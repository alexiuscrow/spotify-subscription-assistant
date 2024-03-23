import winston from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';

const googleCloudLogger = new LoggingWinston({
	projectId: process.env.GOOGLE_AUTH_PROJECT_ID,
	credentials: {
		type: process.env.GOOGLE_AUTH_TYPE,
		project_id: process.env.GOOGLE_AUTH_PROJECT_ID,
		private_key_id: process.env.GOOGLE_AUTH_PRIVATE_KEY_ID,
		private_key: process.env.GOOGLE_AUTH_PRIVATE_KEY,
		client_email: process.env.GOOGLE_AUTH_CLIENT_EMAIL,
		client_id: process.env.GOOGLE_AUTH_CLIENT_ID,
		universe_domain: process.env.GOOGLE_AUTH_UNIVERSE_DOMAIN
	}
});

const logger = winston.createLogger({
	level: 'info',
	transports: [new winston.transports.Console(), googleCloudLogger]
});

export default logger;
