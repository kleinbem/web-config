import { defineWebConfig } from '@kleinbem/web-config/vite';

export default defineWebConfig({
	kit: { paths: { relative: true } },
	vite: { preview: { port: 4173 } }
});
