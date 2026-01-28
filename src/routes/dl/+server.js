import { json } from '@sveltejs/kit';
import ytstream from 'yt-stream';

export async function POST({ request }) {
	const { url } = await request.json();
	console.log(url);
	ytstream.setPreference('scrape');
	let dl_url = null;
	try {
		let stream = await ytstream.stream(url, {
			type: 'audio',
			quality: 'high'
		});
		dl_url = stream.url;
	} catch (error) {
		console.error(error);
	}

	return json(dl_url);
}
