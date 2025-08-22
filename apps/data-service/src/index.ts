import { WorkerEntrypoint } from 'cloudflare:workers';
import { App } from '@/api/app';
import { initDatabase } from '@repo/data-ops/database';

export default class DataService extends WorkerEntrypoint<Env> {
	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env);
		initDatabase(this.env.DB);
	}

	fetch(request: Request) {
		return App.fetch(request, this.env, this.ctx);
	}
}
