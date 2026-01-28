import YoutubeMusicApi from 'youtube-music-api';
import { json } from '@sveltejs/kit';
const api = new YoutubeMusicApi();

export async function POST({ request }) {
	await api.initalize();
	const { searchQuery } = await request.json();
	let results = {};
	try {
		let response = await api.search(searchQuery);
		results['songs'] = response.content.filter(
			(r) => r.type === 'song' || r.type === 'single' || r.type === 'video'
		);
		results['artists'] = response.content.filter((r) => r.type === 'artist');
		results['albums'] = response.content.filter((r) => r.type === 'album' || r.type === 'playlist');

		for (let s of results['songs']) {
			console.log(s.thumbnails, s.type);
		}
	} catch (error) {
		console.error('Error searching:', error);
		return json({
			songs: [],
			artists: [],
			albums: []
		});
	}
	return json(results);
}
