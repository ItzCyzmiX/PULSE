
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	let { id } = await request.json();
  
    let response = await fetch('https://streamurl.up.railway.app', {
		method: 'PUT',
		body: JSON.stringify({ id: id })
	});
    console.log(response);
    let playback_link = await response.text();
    return json({ playback_link });
}
