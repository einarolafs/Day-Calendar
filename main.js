//Create the time of day on the side programmatically, so as to make the html document as clean as possible

const time_of_day = ['9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00', '4:30', '5:00', '5:30', '6:00', '6:30', '7:00', '7:30', '8:00', '8:30', '9:00']

// Helper function to check if number is even or odd
const is_even = (x) => !(x % 2);

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
time_of_day.forEach(function(time, i){
   let container = document.createElement("div");
   const twelve_hour = i >= 6 ? '<span>pm</span>' : '<span>am</span>';
   let content = `${time_of_day[i]} ${is_even(i) ? twelve_hour : ''}`;
   container.insertAdjacentHTML('beforeend', content); time_container.append(container);
});


const layOutDay = function createEvents (events) { 
    
    console.log(events);

    if(checkErrors(events)){return}

    // End of error checking
    events = events.sort(compare);

    //Clear events container of previous content
    events_container.innerHTML = '';

    //Create simple content for each event
    const content = "<div><h4>Sample event</h4><p>Sample event</p></div>"

    //Object to hold all the events
    events_spaces = {}

    // Current index of the event
    event_index = 0;

    // Loop through the events
    events.forEach( function(event, index) {

        let container = document.createElement("div");

        // Add sample content the the event container
        container.insertAdjacentHTML('beforeend', content);

        // Create the object the event and information about it will be stored it
        events_spaces[event_index] = {id: event_index, overlap:{}};

        // Set properties for the event
        let properties = {
            width: 600,
            get_position: function(){
                return this.width * overlap.index;
            }
        }


        /* Object to store information about any events that overlap with the current event 
             @events holds all events found to overlap with the current one, it also adds any event that has been stored as an overlapping event in the any previous event

             @shallow_events shows only the immediate events that overlap with the current one, it does check what events the previous once have as well. 

             @count is a function that will give you a number of how many events are overlapping the current event, if set to true, then it will only give the number of shallow_events

             @index holds the index of how many overlapping items have been found and need to be positioned.
        */

        let overlap = {
            events: {},
            shallow_events:{},
            count: function countProperties(shallow = false) {
                var count = [];
                var i = 0;

                for(var prop in (shallow ? this.shallow_events : this.events)) {
                    if(shallow){
                        if(this.shallow_events.hasOwnProperty(prop))
                        count.push(i);
                    } else {
                        if(this.events.hasOwnProperty(prop))
                        count.push(i);
                    }
                    
                    ++i;
                }

                return count;
            },
            index: 0,
        }

        // Function to be used to style multiple overlapping events.
        const style_events = function(event, index, width) {
            event.style.width = width + 'px';
            event.style.left = (index * width) + 'px';
        }

        // Count the amount of events that overlap with this one and store each one in an array
        for (past_events in events_spaces) {
            past = events_spaces[past_events];
            i = event_index;

            if (past.end > event.start && past.start < event.end && event_index > 0) {
                // Store the event in both the event object and shallow_events object
                overlap.events[past.id] = past;
                overlap.shallow_events[past.id] = past;

                for (deep_overlap in past.overlap) {
                    // Go further through the overlapping events and store all events they have along with this one.
                    overlap.events[past.overlap[deep_overlap].id] = past.overlap[deep_overlap];
                }
            }
        }
        
            /* Create a fix so that when only two items overlap in shallow_events, ( but is marked as 3 in events), that all the events should have 300px and should either be pushed to the left side or stay on the right side  */
            last_index = event_index > 0 ? event_index - 1 : 0;
/*
            console.log(last_index)
            console.log(events_spaces[last_index])
            console.log('count', events_spaces[last_index].count);
            console.log('shallow_count', events_spaces[last_index].shallow_count);*/

            if(events_spaces[last_index].width === 300 && events_spaces[last_index].shallow_count === 1 && overlap.count(true) < 2) {
                let overlaped = 300;
                for(overlap_event in overlap.events){
                    overlaped = events_spaces[overlap_event].position; 
                }
                properties.width = 300;
                overlap.index = overlaped === 300 ? 0 : 1;
           } else {

             properties.width = (properties.width / (overlap.count().length + 1));

             for (past in overlap.events) {
                style_events(overlap.events[past].container, overlap.index, properties.width);
                overlap.events[past].width = properties.width;
                overlap.index++;

            }
        }

        // Style the current event
        style_events(container, overlap.index, properties.width);

        // Add the height of the event, as well as it's top position and id
        container.style.height = (event.end - event.start) + 'px';
        container.style.top = event.start + 'px';
        container.id = event_index;

        // Add the event to an object that will store all the events to display, so that they can be retrieved and calculated against
        events_spaces[event_index] = {
            id: events_spaces[event_index].id,
            start: event.start,
            end: event.end,
            position: properties.get_position(),
            width: properties.width,
            overlap: overlap.events,
            shallow_overlap: overlap.shallow_events,
            count: overlap.count().length,
            shallow_count: overlap.count(true).length,
            container: container,
        };


        // Store information about overlapping events in previous events as well
        for(overlap_event in overlap.events) {
            events_spaces[overlap_event].overlap = overlap.events;
            events_spaces[overlap_event].count = overlap.count().length;
        }

        event_index++

    });


    /* Loop to help fix issues were events are leaving a empty space between them and the next event in the same time slot,
        This should try to move the event to the left and make it's with larger
     */    
    for(event in events_spaces) {
        
        // Start by counting the total with of all items that overlap with the current one.
        let total_width = events_spaces[event].width;
        for (overlap_event in events_spaces[event].overlap) {
            total_width = total_width + events_spaces[event].overlap[overlap_event].width;
        }

        /*console.log(events_spaces[event], total_width);*/

        // If an event is in the position 0 has no overlapping events but is not set to be full 600 width, then fix the event to take up all 600px
        if(events_spaces[event].count === 0 && events_spaces[event].width < 600) {
            console.log(events_spaces[event]);
            let width = 600;
            events_spaces[event].width = width;
            events_spaces[event].container.style.width = width + "px";

        }

        //Find event that is less then 599px (some total_width will get to 599.9999px) and fix it's width and position to fill up any empty space
        if(total_width < 599 && events_spaces[event].position !== 0) {
            let space = (600 - total_width);
            let width = events_spaces[event].width + space;
            let position = events_spaces[event].position - space;

            events_spaces[event].width = width;
            events_spaces[event].position = position;
            events_spaces[event].container.style.width = width + "px";
            events_spaces[event].container.style.left = position + "px";
        };
    }

    console.log(events_spaces);

   // Add the events to the container 
   for (event in events_spaces) {
      events_container.appendChild(events_spaces[event].container);
   }

}


function checkErrors(events) {
    // Some error handling to make sure the array of events and the events them selfs are correct

   let pleseProvide = 'Please provide an array of objects in the format of {start:50, end:100}'

   var errorInput = false;

   if(!events) {
      console.error('No arguments to process. ' + pleseProvide)
      errorInput = true;
      return
   }

   if (!(events instanceof Array)) {
      console.error('The variable given is not an Array and therefor cannot be processed. ' + pleseProvide)
      errorInput = true;
      return
   }

   events.forEach(function(event) {
      if(event.start < 0 || event.end > 720) {
         console.error('incorrect time values, start time cannot be lower then 0 and end time cannot be higher then 720.');

         errorInput = true;
         
      } else if (event.end < event.start){
         console.error('Incorrect time values, end time cannot be lower then the start time.');

         errorInput = true;
      }
   });

   if (errorInput) {return true}
}

// Call a default layout
/*layOutDay([{start: 30, end: 150}, {start: 540, end: 600}, {start: 560, end: 620}, {start: 610, end: 670} ]);*/

let conflicted = [{"start":31,"end":466},{"start":51,"end":403},{"start":88,"end":141},{"start":203,"end":562},{"start":340,"end":502},{"start":388,"end":569},{"start":406,"end":608},{"start":559,"end":670},{"start":668,"end":699},{"start":682,"end":709}];

let smallColide = [{"start":132,"end":683},{"start":255,"end":352},{"start":664,"end":698}];

let emptySpaces = [{"start":41,"end":401},{"start":49,"end":369},{"start":51,"end":103},{"start":177,"end":428},{"start":293,"end":407},{"start":450,"end":677},{"start":547,"end":637},{"start":640,"end":679},{"start":672,"end":701},{"start":691,"end":704}]

let wrongPosition = [{"start":122,"end":596},{"start":355,"end":488},{"start":490,"end":597},{"start":611,"end":668},{"start":700,"end":720}];

let wrongLong = [{"start":196,"end":321},{"start":241,"end":374},{"start":488,"end":536},{"start":654,"end":686},{"start":692,"end":702}]

layOutDay(emptySpaces);

// Function to create events when button is clicked
function createNewEvents(){
    layOutDay(createEvents(document.getElementById('numberValue').value));
}