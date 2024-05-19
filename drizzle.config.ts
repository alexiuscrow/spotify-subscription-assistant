import { Config, defineConfig } from 'drizzle-kit';
import { loadEnvConfig } from '@next/env';
import { isProductionFn } from '@/store/utils';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const isProduction = isProductionFn();

const commonConfig: Config = {
	schema: './src/store/schema/index.ts',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.POSTGRES_URL
	},
	verbose: true,
	schemaFilter: ['ssa_prod', 'ssa_dev']
};

const prodConfig: Partial<Config> = {
	out: './drizzle-prod',
	migrations: {
		table: 'drizzle_migrations_ssa_prod',
		schema: 'ssa_prod'
	}
};

const devConfig: Partial<Config> = {
	out: './drizzle-dev',
	migrations: {
		table: 'drizzle_migrations_ssa_dev',
		schema: 'ssa_dev'
	}
};

export default defineConfig({
	...commonConfig,
	...(isProduction ? prodConfig : devConfig)
} as Config);
