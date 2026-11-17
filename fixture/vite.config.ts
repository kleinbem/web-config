import { defineWebConfig } from '@kleinbem/web-config/vite';

export default defineWebConfig({
	adapterOptions: { fallback: '200.html' }
});
