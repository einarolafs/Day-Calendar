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

    event_index = 0;

    events.forEach( function(event, index) {

        let container = document.createElement("div");

        container.insertAdjacentHTML('beforeend', content);

        events_spaces[event_index] = {id: event_index, overlap:{}};

        let properties = {
            width: 600,
            get_position: function(){
                return this.width * overlap.index;
            }
        }

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
                overlap.events[past.id] = past;
                overlap.shallow_events[past.id] = past;

                for (deep_overlap in past.overlap) {
                    overlap.events[past.overlap[deep_overlap].id] = past.overlap[deep_overlap];
                }
            }
        }
        
        // Divide width among all items that overlap

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


/*
        for (past in overlap.shallow_events) { 
            if (overlap.events[past].position === properties.width) {
                properties.position = 0;
            } else { 
                overlap.events[past].container.style.width = properties.width + 'px';
                properties.position++ 
            }
        }*/

       /* console.log(event_index, properties.width, events_spaces[event_index -1]);*/

        style_events(container, overlap.index, properties.width);

        container.style.width = properties.width + 'px';
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

        for(new_event in overlap.events) {
            events_spaces[new_event].overlap = overlap.events;
            events_spaces[new_event].count = overlap.count().length;
        }

        event_index++

    });
    
    for(event in events_spaces) {
        let total_width = events_spaces[event].width;
        
        for (overlap_event in events_spaces[event].overlap) {
            total_width = total_width + events_spaces[event].overlap[overlap_event].width;
        }
        total_width = total_width + events_spaces[event].width;
        
        if(events_spaces[event].count === 0 && events_spaces[event].width < 600) {
            console.log(events_spaces[event]);
            let width = 600;
            events_spaces[event].width = width;
            events_spaces[event].container.style.width = width + "px";

        }

        if(total_width < 600 && events_spaces[event].position !== 0) {
            console.log(events_spaces[event], 'total width:',  total_width);
            let space = (600 - total_width) + events_spaces[event].width;
            let width = events_spaces[event].width + space;
            let position = events_spaces[event].position - space;

            events_spaces[event].width = width;
            events_spaces[event].position = position;
            events_spaces[event].container.style.width = width + "px";
            events_spaces[event].container.style.left = position + "px";
        };
    }

    console.log(events_spaces);

   for (event in events_spaces) {
      events_container.appendChild(events_spaces[event].container);
   }

}


function checkErrors(events) {
       // Star with some error handling to make sure the array of events and the events them selfs are correct

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

/*layOutDay([{start: 30, end: 150}, {start: 540, end: 600}, {start: 560, end: 620}, {start: 610, end: 670} ]);*/
let conflicted = [{"start":31,"end":466},{"start":51,"end":403},{"start":88,"end":141},{"start":203,"end":562},{"start":340,"end":502},{"start":388,"end":569},{"start":406,"end":608},{"start":559,"end":670},{"start":668,"end":699},{"start":682,"end":709}];

let smallColide = [{"start":132,"end":683},{"start":255,"end":352},{"start":664,"end":698}];

let emptySpaces = [{"start":41,"end":401},{"start":49,"end":369},{"start":51,"end":103},{"start":177,"end":428},{"start":293,"end":407},{"start":450,"end":677},{"start":547,"end":637},{"start":640,"end":679},{"start":672,"end":701},{"start":691,"end":704}]

let wrongPosition = [{"start":122,"end":596},{"start":355,"end":488},{"start":490,"end":597},{"start":611,"end":668},{"start":700,"end":720}];

let wrongLong = [{"start":196,"end":321},{"start":241,"end":374},{"start":488,"end":536},{"start":654,"end":686},{"start":692,"end":702}]

layOutDay(wrongLong);


function createNewEvents(){
    layOutDay(createEvents(document.getElementById('numberValue').value));
}