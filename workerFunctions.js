let g_szWebWorkerCode = `onmessage=function(){postMessage(new Date());}`;

const worker = new Worker(`data:application/x-javascript;base64,${btoa(g_szWebWorkerCode)}`);

const getDateObjectFromWorker = async () => {
	return new Promise(function(resolve) {
		worker.postMessage(undefined);
		worker.onmessage = (event) => resolve(event.data);
	});
}
window.getDateObjectFromWorker = getDateObjectFromWorker;