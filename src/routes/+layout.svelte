<script>
	import './layout.css';
	import './app.css'
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600&display=swap"
		rel="stylesheet"
	/>
	<title>Pulse</title>
</svelte:head>

<style>
	
:global(*) {
    font-family: 'Work Sans', sans-serif;
}

:global(:root) {
    --bg-primary: #0a0a0a;
    --bg-secondary: #141414;
    --bg-tertiary: #1a1a1a;
    --text-primary: #ffffff;
    --text-secondary: #a3a3a3;
    --text-tertiary: #525252;
    --accent: #ffffff;
    --border: #262626;
}

:global(body) {
    background: var(--bg-primary);
    color: var(--text-primary);
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    -webkit-tap-highlight-color: transparent;
}
</style>

{@render children()}
