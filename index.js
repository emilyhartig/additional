const g_szPathname = '/game-bot/';
const g_szApiSetScoreUrl = 'https://api.service.gameeapp.com/';

const g_szFetch = `await fetch("${g_szApiSetScoreUrl}",`;
const g_szTrailing = `);`;
const g_szFetchChrome = `fetch("${g_szApiSetScoreUrl}",`;

const md5 = (str) => window.hex(window.md51(str));
const g_iGenerateRandomNumber = (min, max, precision) => { return Math.round(Math.random() * Math.pow(10, precision)) / Math.pow(10, precision) * (max - min) + min; }

const g_szFormatSeconds = (seconds) => `${(seconds / 86400) | 0} days ${(seconds / 3600) | 0} hours ${((seconds % 3600) / 60) | 0} minutes ${(seconds % 60) | 0} seconds`;

const g_szReplayHash = ['o','a','y','h','u','5','5','i','u','6','k','t','a','l','f','a','f','x','7','8','u','0','g','j','k','j','s','u','j','0','s','p','9','x','j','m','o','k','6','3'].join('');

const g_szGamePlayDataHash = ['c','r','m','j','b','j','m','3','l','c','z','h','l','g','n','e','k','9','u','a','x','z','2','l','9','s','v','l','f','j','w','1','4','n','p','a','u','h','e','n'].join('');

const g_szHash = (iScore, iPlayTime, szUrl, objGameStateData) => { return md5(`${iScore}:${iPlayTime}:${szUrl}:${objGameStateData}:${g_szGamePlayDataHash}`); }

const g_AllowedHeadersList = ['Authorization', 'X-Install-Uuid', 'Client-Language', 'authorize'];
const g_FieldsList = ['gameId', 'score', 'playTime', 'gameUrl', /* 'metadata.gameplayId', */ 'releaseNumber', 'checksum', 'gameStateData', 'isSaveState'];

const iGetNumber = (c) => document.getElementById(c).value | 0;
const szGetString = (c) => document.getElementById(c).value;
const setElementValue = (c, str) => document.getElementById(c).value = str;
const setSelectOption = (c, str) => { let temp = document.getElementById(c); temp.value = str; temp.selectedIndex = (str | 0) - 1; }
const setSpanText = (c, str) => document.getElementById(c).textContent = str;

const g_bIsTokenExpired = () => { return ((new Date().getTime() / 1000) >= g_objFields.tokenExpirationTimeStamp); }

const getCurrentDate = () => getDateObjectFromWorker();

const padNumber = (iNum) => { return iNum < 10 ? `0${iNum}` : iNum; }

const eGameStateDataTypes = 0;
const eGameStateDataTypes_Null = 1;
const eGameStateDataTypes_String = 2;

const ePlayTimeTypes = 0;
const ePlayTimeTypes_PreCalculated = 1;
const ePlayTimeTypes_Exact = 2;

const eIsSaveStateTypes = 0;
const eIsSaveStateTypes_Enabled = 1;
const eIsSaveStateTypes_Disabled = 2;

const g_objFields = {
	get gameUrl() { return szGetString('a'); },
	set gameUrl(value) { setElementValue('a', value); },

	get score() { return iGetNumber('b'); },
	set score(value) { setElementValue('b', value); },

	get minDelay() { return iGetNumber('c'); },
	set minDelay(value) { setElementValue('c', value); },

	get maxDelay() { return iGetNumber('d'); },
	set maxDelay(value) { setElementValue('d', value); },

	get gameId() { return iGetNumber('f'); },
	set gameId(value) { setElementValue('f', value); },

	get releaseNumber() { return iGetNumber('g'); },
	set releaseNumber(value) { setElementValue('g', value); },

	get token() { return szGetString('_2'); },
	set token(value) { setElementValue('_2', value); },

	metadata: {
		get gameplayId() { return iGetNumber('h'); },
		set gameplayId(value) { setElementValue('h', value); }
	},

	get playTime() { return iGetNumber('_p'); },
	set playTime(value) { setElementValue('_p', value); },

	get playTimeType() { return iGetNumber('_p2'); },
	set playTimeType(value) { setElementValue('_p2', value); },

	get checksum() { return szGetString('i'); },
	set checksum(value) { setElementValue('i', value); },

	get headers() { return szGetString('_3'); },
	set headers(value) { setElementValue('_3', value); },

	get body() { return szGetString('_4'); },
	set body(value) { setElementValue('_4', value); },

	set tokenDescription(value) { setElementValue('_t', value); },

	get tokenExpirationDateTime() { return szGetString('_t1'); },
	set tokenExpirationDateTime(value) { setElementValue('_t1', value); },

	get tokenExpirationTimeStamp() { return iGetNumber('_t2'); },
	set tokenExpirationTimeStamp(value) { setElementValue('_t2', value); },

	get originalFetch() { return szGetString('_1'); },

	set generatedFetch(value) { setElementValue('j', value); },

	get gameStateData() { return szGetString('k'); },
	set gameStateData(value) { setElementValue('k', value); },

	get gameStateDataType() { return iGetNumber('_k'); },
	set gameStateDataType(value) { setSelectOption('_k', value); },

	set playTimeDuration(value) { setSpanText('_p3', value); },
	set playTimeDurationFetch(value) { setSpanText('_p4', value); },

	get isSaveState() { return iGetNumber('_g'); },
	set isSaveState(value) { setSelectOption('_g', value); },

}

const getCurrentUrlStrict = (bDecode) => {
	try {
		let szUrl = g_objFields.gameUrl;
		if(bDecode === true) szUrl = decodeURIComponent(szUrl);

		if(!szUrl.startsWith(g_szPathname)) {
			alert('Probably link is not valid.');

			return undefined;
		}

		return szUrl;
	}
	catch(e) {
		console.error(e);
		return undefined;
	}
}

const getCurrentScoreStrict = () => {
	try {
		let iScore = g_objFields.score;

		if(iScore === NaN || iScore <= 0 || iScore % 1 !== 0) {
			alert('Needed score is not valid.');

			return undefined;
		}

		return iScore;
	}
	catch(e) {
		console.error(e);
		return undefined;
	}
}

const getPlayTime = (iScore, flMinDelay, flMaxDelay) => {
	let flTemp = 0.0;

	for(let i = 0, l = iScore; i < l; i++) flTemp += g_iGenerateRandomNumber(flMinDelay, flMaxDelay, 100);

	return flTemp;
}

async function generateFetch() {
	if(g_bIsTokenExpired()) {
		alert('Token expired.');

		return;
	}

	let szUrl = getCurrentUrlStrict(true);
	if(szUrl === undefined) return;

	let iScore = getCurrentScoreStrict();
	if(iScore === undefined) return;

	let bodyObj = JSON.parse(g_objFields.body);

	let obj = { body: '', credentials: 'include', method: 'POST', mode: 'cors', headers: {}, /* referrer: '', */ referrerPolicy: 'strict-origin-when-cross-origin' }

	g_objFields.metadata.gameplayId++;

	let flTime = (g_objFields.playTimeType | 0) == ePlayTimeTypes_PreCalculated ? getPlayTime(iScore, g_objFields.minDelay, g_objFields.maxDelay) : (g_objFields.playTime | 0);

	let iPlayTime = flTime | 0;
	g_objFields.playTime = iPlayTime;

	displayPlayTime(iPlayTime);

	RecalculateHash();

	fillRequestBody(g_objFields, bodyObj);

	bodyObj.params.gameplayData.createdTime = getFormatedDateTime(await getCurrentDate());

	bodyObj.params.gameplayData.isSaveState = (g_objFields.isSaveState | 0) === eIsSaveStateTypes_Enabled ? true : false;

	if(bodyObj.params.gameplayData.gameStateData !== undefined) {
		bodyObj.params.gameplayData.gameStateData = g_objFields.gameStateDataType === eGameStateDataTypes_String ? g_objFields.gameStateData : null;
	}

	obj.body = JSON.stringify(bodyObj);

	fillHeaders(JSON.parse(g_objFields.headers), obj.headers);

	g_objFields.generatedFetch = `${g_szFetch} ${JSON.stringify(obj, null, 4)});`;
}
window.generateFetch = generateFetch;

const stripTrailingFetch = (str, bIsChromeLink) => str.replace(bIsChromeLink ? g_szFetchChrome : g_szFetch, '');

const processOriginalFetch = function () {
	try {
		let szTempString = g_objFields.originalFetch;

		let bIsChromeLink = false;

		if(!szTempString.startsWith(g_szFetch) && ((bIsChromeLink = true) && !szTempString.startsWith(g_szFetchChrome))) {
			alert('Probably link is not valid.');

			return;
		}

		szTempString = stripTrailingFetch(szTempString, bIsChromeLink).slice(0, -2);

		let tempObj = JSON.parse(szTempString);
		fillObject(tempObj, JSON.parse(tempObj.body), g_objFields);
	}
	catch(e) {
		alert('Is not valid.');

		throw e;
	}
}
window.processOriginalFetch = processOriginalFetch;

const fillHeaders = (obj, obj2) => g_AllowedHeadersList.forEach((item) => obj2[item] = obj[item.toLowerCase()]);
const fillRequestBody = (objFiller, objReceiver) => {
	let objData = objReceiver.params.gameplayData;

	g_FieldsList.forEach((item) => { objData[item] = objFiller[item];});
}

const iGetGameStateDataType = (gameStateData) => {
	if(gameStateData === null) return eGameStateDataTypes_Null;

	return eGameStateDataTypes_String;
}

const fillObject = (rawObj, obj, obj2) => {
	let objData = obj.params.gameplayData;

	let bIsGameStateDataNull = iGetGameStateDataType(objData.gameStateData) === eGameStateDataTypes_Null;
	let szGameStateData_ = bIsGameStateDataNull ? '' : objData.gameStateData;

	let szTempString = g_szHash(objData.score, objData.playTime, objData.gameUrl, szGameStateData_);
	if(szTempString !== objData.checksum) {
		alert('Mismatch in checksum generation.');

		return;
	}

	g_FieldsList.forEach((item) => obj2[item] = objData[item]);

	displayPlayTime(objData.playTime);

	obj2.metadata.gameplayId = objData.metadata.gameplayId;

	obj2.body = rawObj.body;
	obj2.headers = JSON.stringify(rawObj.headers);

	// obj2.playTimeType = ePlayTimeTypes_PreCalculated;

	obj2.isSaveState = objData.isSaveState === true ? eIsSaveStateTypes_Enabled : eIsSaveStateTypes_Disabled;

	// Seems like browsers (js) can convert null into empty string in case of gameDataState, it means - we shouldn't take care about it in iterations above. But we must take care about saving gameStateData type to not send empty string in generated object field.

	obj2.gameStateDataType = bIsGameStateDataNull ? eGameStateDataTypes_Null : eGameStateDataTypes_String;

	let szToken = rawObj.headers['authorization'] || rawObj.headers['Authorization'];
	obj2.token = szToken.replace('Bearer ', '');

	let tempObj = window.jwt_decode(obj2.token);
	g_objFields.tokenDescription = JSON.stringify(tempObj);
	g_objFields.tokenExpirationDateTime = `Expires: ${new Date((tempObj.exp | 0) * 1000).toString()}`;
	g_objFields.tokenExpirationTimeStamp = tempObj.exp;

	if(g_bIsTokenExpired()) {
		alert('Token expired.');

		return;
	}
}

const szGetGameStateData = () => {
	if(g_objFields.gameStateDataType === eGameStateDataTypes_Null) return '';

	return g_objFields.gameStateData;
}

const displayPlayTime = (iPlayTime) => {
	let szTempString = `Play time duration: ${g_szFormatSeconds(iPlayTime)}.`;
	g_objFields.playTimeDuration = szTempString;
	g_objFields.playTimeDurationFetch = szTempString;
}

const RecalculateHash = () => g_objFields.checksum = g_szHash(g_objFields.score, g_objFields.playTime, g_objFields.gameUrl, szGetGameStateData())
window.RecalculateHash = RecalculateHash;

const getFormatedDateTime = (date) => {
	let szResultTimezone = '+00:00';

	let timezoneOffset = new Date().getTimezoneOffset();
	let iHours = padNumber(parseInt(Math.abs(timezoneOffset / 60)));
	let iMinutes = padNumber(Math.abs(timezoneOffset % 60));

	if(timezoneOffset < 0) szResultTimezone = `+${iHours}:${iMinutes}`;
	else if(timezoneOffset > 0) szResultTimezone = `-${iHours}:${iMinutes}`;

	let iYear = padNumber(date.getFullYear()); let iMonth = padNumber(date.getMonth() + 1); let iDay = padNumber(date.getDate()); 
	let iHours_ = padNumber(date.getHours()); let iMinutes_ = padNumber(date.getMinutes()); let iSeconds = padNumber(date.getSeconds());

	return `${iYear}-${iMonth}-${iDay}T${iHours_}:${iMinutes_}:${iSeconds}${szResultTimezone}`;
}

const copyValue__ = () => {
	let temp = document.getElementById('j');
	temp.select();

	document.execCommand('copy');
}
