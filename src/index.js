import Peregrine from '@magento/peregrine'
import App from './components/app'

const app = new Peregrine()
const container = document.getElementById('root')

app.component = App
app.mount(container)

if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker
			.register(process.env.SERVICE_WORKER_FILE_NAME);
	});
}

export default app;