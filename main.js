//Create the time of day on the side programmatically, so as to make the html document as clean as possible

const time_of_day = ['9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00', '4:30', '5:00', '5:30', '6:00', '6:30', '7:00', '7:30', '8:00', '8:30', '9:00']

// Helper function to check if number is even or odd
const is_even = (x) => !(x % 2);

// Helper function to order object, in this case to order them based on first start date to last
function compare(a, b) {
    // Use toUpperCase() to ignore character casing
    const genreA = a.start;
    const genreB = b.start;

    let comparison = 0;
    if (genreA > genreB) {
        comparison = 1;
    } else if (genreA < genreB) {
        comparison = -1;
    }
    return comparison;
}

//Store reference to the DOM containers that will be populated with the time on the left side and the events
const time_container = document.querySelector('.calendar .time');
const events_container = document.querySelector('.calendar .events')

//Populate the left side with the time of day
time_of_day.forEach(function(time, i) {
    let container = document.createElement("div");
    const twelve_hour = i >= 6 ? '<span>pm</span>' : '<span>am</span>';
    let content = `${time_of_day[i]} ${is_even(i) ? twelve_hour : ''}`;
    container.insertAdjacentHTML('beforeend', content);
    time_container.append(container);
});


const CANVAS_WIDTH = 600;
const PADDING = 10;


function layOutDay(events) {

    if (check_for_errors(events)) { return };

    o_events = organize_events(events);

    let timeline = create_timeline(events);

    events_container.innerHTML = '';

    // Main container to hold all the information about the events and their relations ships together, marking them down into groups and sub_groups.
    let event_container = {
        groups: []
    }

    create_groups(timeline, o_events, event_container);

    // Set with for each group, this will be used to give the width to each element in the group. The width is based on the larges subgroup within each given group
    event_container.groups.forEach(function(group) {
        subgroup_size = 1;
        group.events.forEach(function(event) {
            subgroup_size = Math.max(subgroup_size, event.largest_subgroup);
        });

        group.width = CANVAS_WIDTH / subgroup_size;
        group.largest_subgroup = subgroup_size;

    });


    // Set the position of each event in group
    event_container.groups.forEach(function(group) {

        for (event_index in group.events) {
            var event = group.events[event_index];
            position = new Array(event.largest_subgroup);

            for (let index in event.subgroup) {
                let neighbour = event.subgroup[index];
                if (neighbour.position != null) {
                    position[neighbour.position] = true;
                }
            }

            for (let i = 0; i < position.length; i++) {
                if (!position[i]) {
                    event.position = i;
                    break;
                }
            }
        };
    });

    const content = "<div><h4>Sample event</h4><p>Sample event</p></div>"

    // Create and append the DOM elements for each event
    for (const event_id in o_events) {
        const event = o_events[event_id];
        let container = document.createElement("div");

        // Style the event
        container.style.cssText = `height:${event.end - event.start}px; width:${event.group.width}px; top: ${event.start}px; left: ${event.group.width * event.position + PADDING}px`;
        container.insertAdjacentHTML('beforeend', content);

        events_container.appendChild(container);
    }

}

// Create a array with empty length of each minute in the calendar, between 9am to 9pm. This will be used to map what minute each event occupies and how many occupy minutes together.
function create_timeline(events) {
    let timeline = new Array(720);
    for (let i = 0; i < timeline.length; i++) {
        timeline[i] = new Array();
    };

    events.forEach(function(event, index) {
        event.id = index
    });

    events.forEach(function(event) {
        for (let i = event.start; i <= event.end; i++) {
            timeline[i].push(event.id);
        }
    });
    return timeline;
}

/* Function to further order events, given each event information, like and id, its start and end time, the closest events it collides with (neighbors), all events in the group it belongs to, the position of the event within that group and the size of the largest subgroup that the event belongs to. */

function organize_events(events) {
    let organized_events = {}
    let Event = function(id, start, end) {
        this.id = id;
        this.start = start;
        this.end = end;
        this.subgroup = {};
        this.group = null;
        this.position = null;
        this.largest_subgroup = 1;
    }

    events = events.sort(compare);

    events.forEach(function(event, index) {
        organized_events[index] = new Event(index, event.start, event.end)
    });

    return organized_events;
}

// Function for creating groups between connected elements
function create_groups(timeline, events, event_container) {
    let group = null;

    timeline.forEach(function(minute) {
        if (minute.length > 0) {
            group = group || { events: [], width: 0 };
            //console.log('minute', minute, minute.length);
            minute.forEach(function(event_id, index) {
                if (!group.events[event_id]) {
                    group.events[event_id] = events[event_id];
                    events[event_id].group = group;
                };
            });
        } else {

            if (group != null) {
                event_container.groups.push(group);
            }

            group = null;

        }
    });

    timeline.forEach(function(minute) {
        minute.forEach(function(event_id) {
            let event = events[event_id];
            event.largest_subgroup = Math.max(event.largest_subgroup, minute.length);

            minute.forEach(function(targetEventId) {
                if (event_id != targetEventId) {
                    event.subgroup[targetEventId] = events[targetEventId];
                }
            });
        });
    });

    event_container.events = events
}

// Some error handling to make sure the array of events and the events them selfs are correct
function check_for_errors(events) {
    let pleseProvide = 'Please provide an array of objects in the format of {start:50, end:100}'

    var errorInput = false;

    if (!events) {
        console.error(`No arguments to process. ${pleseProvide}`)
        errorInput = true;
        return
    }
    if (!(events instanceof Array)) {
        console.error(`The variable given is not an Array and therefor cannot be processed. ${pleseProvide}`)
        errorInput = true;
        return
    }
    events.forEach(function(event) {
        if (event.start < 0 || event.end > 720) {
            console.error('incorrect time values, start time cannot be lower then 0 and end time cannot be higher then 720.');

            errorInput = true;

        } else if (event.end < event.start) {
            console.error('Incorrect time values, end time cannot be lower then the start time.');

            errorInput = true;
        }
    });

    if (errorInput) { return true }
}

layOutDay([{ start: 30, end: 150 }, { start: 540, end: 600 }, { start: 560, end: 620 }, { start: 610, end: 670 }]);