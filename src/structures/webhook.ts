import { RESTPostAPIChannelMessageJSONBody } from 'discord-api-types/v10';
import { createLogger } from '~/structures/logger';
import config from '~/../config.json';
import type { File } from '~/4chan';
import FormData from 'form-data';

const Logger = createLogger('Webhook');

class Webhook {
	constructor(
		public url: string
	) { }

	async send(payload: RESTPostAPIChannelMessageJSONBody, files?: File[]) {
		try {
			const form = new FormData();

			form.append('payload_json', JSON.stringify(payload));

			if (files?.length) {
				for (let i = 1; i < files.length + 1; i++) {
					const file = files[i - 1];
					const field = 'file' + i;

					form.append(field, file.buffer, { filename: file.name });
				}
			}

			return await new Promise((resolve, reject) => {
				form.submit(this.url, (err, res) => {
					if (err) {
						Logger.error(err.message);
						reject(err);
					}

					res.on('end', resolve);
					res.on('error', reject);

					Logger.debug(`Forwarding payload to webhook.`);
					res.resume();
				});
			});
		} catch (e) {
			Logger.error('Failed to send to webhook!', e);
		}
	};
}

export default new Webhook(config.webhook);