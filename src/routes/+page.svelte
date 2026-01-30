<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { init } from '$lib/yt';

	let activeTab = $state('home');
	let searchTimeoutID = $state(null);
	let searchQuery = $state('');
	let searchSongs = $state([]);
	let searchAlbums = $state([]);
	let searchArtists = $state([]);
	let isSearching = $state(false);

	let currentAudio = $state(null);

	const recentlyPlayed = $state([]);

	function clearSearch() {
		searchQuery = '';
	}

	function switchTab(tab) {
		activeTab = tab;
	}

	async function download(track) {
		let response = await fetch('https://youtube-mp36.p.rapidapi.com/dl?id=' + `${track.videoId}`, {
			method: 'GET',
			headers: {
				'x-rapidapi-key': '4b5f2611d2msh0d8803f54bf50a5p181e74jsnc7c6cdcf3ed3',
				'x-rapidapi-host': 'youtube-mp36.p.rapidapi.com'
			}
		});
		let { link } = await response.json();

		if (!link) {
			return;
		}
		const a = document.createElement('a');
		a.href = link;
		a.download = track.name + '.mp3';
		a.click();

		URL.revokeObjectURL(url);
	}

	async function play(track) {
		let response = await fetch('https://streamurl.up.railway.app', {
			method: 'PUT',
			body: JSON.stringify({ id: track.videoId })
		});
		let url = await response.text();
		if (currentAudio) {
			currentAudio.pause();
			currentAudio = null;
		}
		currentAudio = new Audio(url);
		currentAudio.play();
	}

	async function handleSearch() {
		if (!searchQuery) {
			isSearching = false;
			return;
		}
		isSearching = true;
		searchAlbums = [];
		searchArtists = [];
		searchSongs = [];
		try {
			let response = await fetch('/api', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ searchQuery })
			});
			let { artists, albums, songs } = await response.json();

			searchArtists = artists;
			searchAlbums = albums;
			searchSongs = songs;
		} catch (e) {
			console.error('Search error', e);
		} finally {
			isSearching = false;
		}
	}

	$effect(() => {
		if (searchQuery.trim() === '') {
			searchAlbums = [];
			searchArtists = [];
			searchSongs = [];
			isSearching = false;
		}
	});

	onMount(async () => {
		await init();
	});
</script>

<div class="mx-auto flex min-h-screen max-w-md flex-col pb-20">
	<!-- Header -->
	<div class="px-6 pt-6 pb-4">
		<div class="mb-6 flex items-center justify-between">
			<h1 class="text-2xl font-medium">Pulse</h1>
			<button aria-label="Search" class="btn-icon hover:bg-white/5">
				<svg
					class="h-5 w-5"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					viewBox="0 0 24 24"
				>
					<path
						d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
		</div>

		<!-- Search Bar -->
		<div class="search-container">
			<svg
				class="search-icon"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				viewBox="0 0 24 24"
			>
				<path
					d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search tracks, artists, albums..."
				class="search-input"
				onkeydown={async (e) => {
					isSearching = true;
					if (e.key === 'Enter') {
						await handleSearch();
					}
				}}
				oninput={async () => {
					if (searchQuery.length > 0) {
						clearTimeout(searchTimeoutID);
						searchTimeoutID = setTimeout(async () => {
							await handleSearch();
						}, 600);
					}
				}}
			/>
			{#if searchQuery}
				<button aria-label="Clear search" class="clear-btn" onclick={clearSearch}>
					<svg
						class="h-4 w-4"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						viewBox="0 0 24 24"
					>
						<path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</button>
			{/if}
		</div>
	</div>

	{#if searchQuery.length === 0}
		<!-- Tab Navigation -->
		<div class="mb-6 px-6">
			<div class="flex gap-3">
				<button
					class="tab-btn {activeTab === 'home' ? 'active' : ''}"
					onclick={() => switchTab('home')}
				>
					Home
				</button>
				<button
					class="tab-btn {activeTab === 'discover' ? 'active' : ''}"
					onclick={() => switchTab('discover')}
				>
					Discover
				</button>
			</div>
		</div>

		<!-- Content Area -->
		<div class="scroll-container flex-1">
			{#if activeTab === 'home'}
				<div class="fade-in">
					<!-- Recently Played -->
					<div class="mb-8 px-6">
						<h2 class="mb-4 text-lg font-medium">Recently Played</h2>
						{#if recentlyPlayed.length === 0}
							<div class="empty-state">
								<svg
									class="mb-3 h-12 w-12 text-neutral-700"
									fill="none"
									stroke="currentColor"
									stroke-width="1"
									viewBox="0 0 24 24"
								>
									<path
										d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
								<p class="text-sm text-neutral-500">No recent tracks</p>
								<p class="mt-1 text-xs text-neutral-600">Start listening to see your history</p>
							</div>
						{:else}
							<div class="horizontal-scroll">
								{#each recentlyPlayed as item}
									<button class="album-card">
										<div class="album-art-small">
											<img src={item.albumArt} alt={item.title} />
										</div>
										<div class="mt-2 truncate text-sm font-medium">{item.title}</div>
										<div class="truncate text-xs text-neutral-500">{item.artist}</div>
									</button>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			{:else if activeTab === 'discover'}
				<div class="fade-in px-6">
					<div class="empty-state py-20">
						<svg
							class="mb-4 h-16 w-16 text-neutral-700"
							fill="none"
							stroke="currentColor"
							stroke-width="1"
							viewBox="0 0 24 24"
						>
							<path
								d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
						<p class="mb-2 text-sm text-neutral-500">Discover new music</p>
						<p class="text-xs text-neutral-600">Explore genres, moods, and curated playlists</p>
					</div>
				</div>
			{/if}
		</div>
	{:else if isSearching}
		<div class="search-loading scroll-container flex flex-1 items-center justify-center pb-24">
			<div class="spinner" aria-hidden="true"></div>
			<div class="ml-3 text-sm text-neutral-500">Searching…</div>
		</div>
	{:else}
		<div>
			<!-- Results Container -->
			<div class="scroll-container flex-1 pb-24">
				<!-- Artists Carousel -->
				<div class="mb-8">
					<div class="mb-4 flex items-center justify-between px-6">
						<h2 class="text-sm font-medium tracking-wide">ARTISTS</h2>
						<button class="text-xs text-neutral-500">See all</button>
					</div>
					<div class="carousel-container">
						<div class="carousel-track px-6">
							{#each searchArtists as artist}
								<button class="carousel-item-artist flex-shrink-0">
									<div
										class="mb-3 h-28 w-28 overflow-hidden rounded-full bg-neutral-900 transition-all active:scale-95"
									>
										<img src={artist.thumbnails.at(-1).url} alt={artist.name} />
									</div>
									<div class="w-28 truncate text-center text-sm font-medium">{artist.name}</div>
									<!-- <div class="text-center text-xs text-neutral-500">{artist.followers}</div> -->
								</button>
							{/each}
						</div>
					</div>
				</div>

				<!-- Albums Carousel -->
				<div class="mb-8">
					<div class="mb-4 flex items-center justify-between px-6">
						<h2 class="text-sm font-medium tracking-wide">ALBUMS</h2>
						<button class="text-xs text-neutral-500">See all</button>
					</div>
					<div class="carousel-container">
						<div class="carousel-track px-6">
							{#each searchAlbums as album}
								<button class="carousel-item-album flex-shrink-0">
									<div
										class="mb-3 h-36 w-36 overflow-hidden rounded bg-neutral-900 transition-all active:scale-95"
									>
										<img src={album.thumbnails.at(-1).url} alt={album.name} />
									</div>
									<div class="w-36 truncate text-sm font-medium">{album.name}</div>
									<div class="w-36 truncate text-xs text-neutral-500">
										{album.artist} • {album.year}
									</div>
								</button>
							{/each}
						</div>
					</div>
				</div>

				<!-- Songs Grid -->
				<div class="px-6">
					<div class="mb-4 flex items-center justify-between">
						<h2 class="text-sm font-medium tracking-wide">SONGS</h2>
					</div>
					<div class="space-y-1">
						{#each searchSongs as track, index}
							<div class="track-item flex w-full items-center gap-3 rounded-sm py-2.5 text-left">
								<div
									class="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-neutral-900"
								>
									<!-- <svg class="h-4 w-4 text-neutral-600" fill="currentColor" viewBox="0 0 24 24">
											<path
												d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
											/>
										</svg> -->
									<img
										src={track.type === 'song' ? track.thumbnails.at(-1).url : track.thumbnails.url}
										alt={track.name}
									/>
								</div>
								<div class="min-w-0 flex-1">
									<div class="truncate text-sm font-medium">{track.name}</div>
									<div class="truncate text-xs text-neutral-500">
										{track.type !== 'song' ? track.author : track.artist.name}
									</div>
								</div>
								<div class="flex-shrink-0 text-xs text-neutral-400">
									<button
										onclick={async () => {
											await download(track);
										}}
									>
										DOWNLOAD
									</button>
									<button
										onclick={async () => {
											await play(track);
										}}
									>
										PLAY
									</button>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}
	<!-- Bottom Navigation -->
	<div
		class="safe-area-bottom fixed right-0 bottom-0 left-0 border-t border-neutral-800 bg-neutral-900/95 backdrop-blur-lg"
	>
		<div class="mx-auto max-w-md">
			<div class="flex items-center justify-around px-6 py-3">
				<button
					class="nav-btn {activeTab === 'home' ? 'active' : ''}"
					onclick={() => switchTab('home')}
				>
					<svg
						class="h-6 w-6"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						viewBox="0 0 24 24"
					>
						<path
							d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					<span class="mt-1 text-xs">Home</span>
				</button>

				<button class="nav-btn" onclick={() => goto('/library')}>
					<svg
						class="h-6 w-6"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						viewBox="0 0 24 24"
					>
						<path
							d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					<span class="mt-1 text-xs">Library</span>
				</button>

				<button class="nav-btn">
					<svg
						class="h-6 w-6"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						viewBox="0 0 24 24"
					>
						<path
							d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path
							d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					<span class="mt-1 text-xs">Settings</span>
				</button>
			</div>
		</div>
	</div>
</div>
