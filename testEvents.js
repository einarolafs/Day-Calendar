function createEvents(times){
	let i = 0;
	let events = []

	function randomTime(min){
		return Math.floor(min + Math.random()*(700+1 - min))
	}

	while(i < times){
		let start = randomTime(0);
		let end = randomTime(start + 30);
		events.push({start, end})
		i++
	}

	return events;
}

var testEvents = [{"id":1,"start":522,"end":565},{"id":2,"start":85,"end":307},{"id":3,"start":190,"end":270},{"id":4,"start":228,"end":319},{"id":5,"start":506,"end":623},{"id":6,"start":315,"end":449},{"id":7,"start":539,"end":615},{"id":8,"start":97,"end":362},{"id":9,"start":386,"end":572},{"id":10,"start":649,"end":684}]