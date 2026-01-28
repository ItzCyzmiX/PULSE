import YoutubeMusicApi from 'youtube-music-api';

const api = new YoutubeMusicApi();
export async function init() {
    await api.initalize()
}

export default api