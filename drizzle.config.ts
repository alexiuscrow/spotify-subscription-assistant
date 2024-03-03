import { Config, defineConfig } from 'drizzle-kit';
import '@/store/config';

export default defineConfig({
	schema: './src/store/schema/index.ts',
	out: './drizzle',
	driver: 'pg',
	dbCredentials: {
		connectionString: process.env.POSTGRES_URL
	},
	verbose: true
} as Config);
