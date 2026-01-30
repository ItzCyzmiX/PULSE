import getStreamUrl from '$lib/stream_url';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const { url } = await request.json();
	let playback_link = '';
	try {
		let info = await getStreamUrl(url);
		console.log(info);
		playback_link = info.url;
	} catch (error) {
		console.error('Error searching:', error);
	}
	return json(playback_link);
}
