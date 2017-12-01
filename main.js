
//Create the time of day on the side programaticly, so as to make the html document as clean as possible

const calTime = ['9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00', '4:30', '5:00', '5:30', '6:00', '6:30', '7:00', '7:30', '8:00', '8:30', '9:00']

const is_even = (x) => !(x % 2);

const time_container = document.querySelector('.calendar .time');


for(let i = 0; i < calTime.length; i++) {
	let container = document.createElement("div");

	const twelve_hour = i >= 6 ? 'pm' : 'am';

	let content = document.createTextNode(`${calTime[i]} ${is_even(i) ? twelve_hour : ''}`);

	container.append(content); time_container.append(container);


}