
//Create the time of day on the side programaticly, so as to make the html document as clean as possible

const calTime = ['9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00', '4:30', '5:00', '5:30', '6:00', '6:30', '7:00', '7:30', '8:00', '8:30', '9:00']

const is_even = (x) => !(x % 2);

const time_container = document.querySelector('.calendar .time');
const events_container = document.querySelector('.calendar .events')


for(let i = 0; i < calTime.length; i++) {
	let container = document.createElement("div");
	const twelve_hour = i >= 6 ? 'pm' : 'am';
	let content = document.createTextNode(`${calTime[i]} ${is_even(i) ? twelve_hour : ''}`);
	container.append(content); time_container.append(container);
}

function median(values){
	values.sort(function(a,b){
  	return a-b;
  });
  var half = Math.floor(values.length / 2);
  
  if (values.length % 2)
  	return values[half];
  else
  	return (values[half - 1] + values[half]) / 2.0;
}

const layOutDay = function createEvents (events) { 

	var pleseProvide = 'Please provide an array of objets in the format of {start:50, end:100}'

	if(!events) {
		console.error('No arguments to process. ' + pleseProvide)
		return
	}
	if (!(events instanceof Array)) {
		console.error('The varible given is not an Array and therefor cannot be processed ' + pleseProvide)
		return
	}
	let errorInput = [];
	events.forEach(function(event) {
		if(event.start < 0 || event.end > 720) {
			console.error('incorrect time values, start time cannot be lower then 0 and end time cannot be higher then 720');

			errorInput.push(1);
			
		}
	});

	if (!!errorInput.length) {return}
	

	//Clear container of previous content
	while (events_container.hasChildNodes()) {
	    events_container.removeChild(events_container.lastChild);
	}

	const content = "<div><h4>Sample event</h4><p>Sample event</p></div>"

	//Container to hold all events
	events_spaces = {}

	events.forEach( function(event, index) {

		let container = document.createElement("div");

		container.insertAdjacentHTML('beforeend', content);

		let width = 600, position = 0, style = container.style;

		let how_many_events = []

		//count the amount of events that overlap with this one
		for (past in events_spaces) {

			if (events_spaces[past].end > event.start && events_spaces[past].start < event.end) {

				how_many_events.push(events_spaces[past])

			}
		}

		//Divide with among all items that overlap
		width = (width / (how_many_events.length + 1));
		let radius = width / 2;

		console.log(width, radius);

		let count_colition = [1];

		how_many_events.forEach( function(element, index) {
			count_colition.push(index + 2);
		});

		//console.log('count_colition', count_colition)

		let overlapping_index = 1; 
		//First if is when overlapping items are more then 1
		if(how_many_events.length > 1) {
			for (past in how_many_events) {
				position = ((overlapping_index - median(count_colition)) * width)
				how_many_events[past].container.style.width = width + 'px';
				how_many_events[past].container.style.left = 'calc(50% - ' + radius + 'px';
				how_many_events[past].container.style.transform = 'translatex('+ position +'px)'

				overlapping_index++;
			} 
		} else {
			for (past in how_many_events) { 
				if (how_many_events[past].position === width) {
					position = 0;
				} else { 
					how_many_events[past].container.style.width = width + 'px';
					position++ 
				}
			}
		}

		style.width = width + 'px';

		//console.log(overlapping_index);

		if (count_colition.length > 2) {
		 position = ((overlapping_index - median(count_colition)) * width)
		 style.left = position + 'px';
		 style.left = 'calc(50% - ' + radius + 'px';
		 style.transform = 'translatex('+ position +'px)'
		 console.log('move')
		}
		else {
			style.left = (width * position) + (position > 0 ? 10 : 0) + 'px';
		}

		style.height = (event.end - event.start) + 'px';
		style.top = event.start + 'px';

		// Add the item to an object that will store all the items to display, so that they can be retrieved and calculated against
		events_spaces[Math.random().toString(36).substr(2, 10)] = {
			end: event.end,
			start: event.start,
			position: (width * position),
			container: container,
		};

	})

	for (event in events_spaces) {
		events_container.appendChild(events_spaces[event].container);
	}


}

layOutDay([{start: 30, end: 150}, {start: 540, end: 600}, {start: 560, end: 620}, {start: 610, end: 670} ]);
