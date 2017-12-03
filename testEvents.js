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