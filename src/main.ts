import '@fontsource/poppins/latin-400.css';
import '@fontsource/poppins/latin-500.css';
import '@fontsource/poppins/latin-600.css';
import '@fontsource/poppins/latin-700.css';
import './app.css';
import { mount } from 'svelte';
import App from './App.svelte';

mount(App, { target: document.getElementById('app')! });
