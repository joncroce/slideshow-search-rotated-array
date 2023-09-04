import Slides from './slides.svelte';
import '@styles/tailwind.css';
import 'carbon-components-svelte/css/g90.css';

const app = new Slides({
	target: document.getElementById('app'),
});

export default app;
