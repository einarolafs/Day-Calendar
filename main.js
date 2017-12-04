//Create the time of day on the side programmatically, so as to make the html document as clean as possible

const time_of_day = ['9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00', '4:30', '5:00', '5:30', '6:00', '6:30', '7:00', '7:30', '8:00', '8:30', '9:00']

// Helper function to check if number is even or odd
const is_even = (x) => !(x % 2);

// Helper function to find the median of a row of numbers within an array
const median = function find_median(values){
   values.sort(function(a,b){
        return a-b;
    });
     
     var half = Math.floor(values.length / 2);
  
     if (values.length % 2)
        return values[half];
     else
        return (values[half - 1] + values[half]) / 2.0;
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

   // Star with some error handling to make sure the array of events and the events them selfs are correct

   var pleseProvide = 'Please provide an array of objects in the format of {start:50, end:100}'

   if(!events) {
      console.error('No arguments to process. ' + pleseProvide)
      return
   }

   if (!(events instanceof Array)) {
      console.error('The variable given is not an Array and therefor cannot be processed. ' + pleseProvide)
      return
   }

   let errorInput = [];
   events.forEach(function(event) {
      if(event.start < 0 || event.end > 720) {
         console.error('incorrect time values, start time cannot be lower then 0 and end time cannot be higher then 720.');

         errorInput.push(1);
         
      } else if (event.end < event.start){
         console.error('Incorrect time values, end time cannot be lower then the start time.');

         errorInput.push(1);
      }
   });

   if (!!errorInput.length) {return}

   // End of error checking



   //Clear events container of previous content
   events_container.innerHTML = '';

   //Create simple content for each event
   const content = "<div><h4>Sample event</h4><p>Sample event</p></div>"

   //Object to hold all the events
   events_spaces = {}

   events.forEach( function(event, index) {

      let container = document.createElement("div");

      container.insertAdjacentHTML('beforeend', content);

      let properties = {
         width: 600,
         position: 0,
         get_position: function(){
            return this.width * this.position;
         }
      }

      let overlap = {
         events: [],
         count: [1],
         index: 1,
      }

      // Function to be used to style multiple overlapping events.
      const style_multiple_events = function(event, index, count, width) {
         position = ((index - median(count)) * width);

         event.style.width = width + 'px';
         event.style.left = 'calc(50% - ' + (width / 2) + 'px';
         event.style.transform = 'translatex('+ position +'px)'
      }

      //count the amount of events that overlap with this one and store each one in an array
      for (past in events_spaces) {
         if (events_spaces[past].end > event.start && events_spaces[past].start < event.end) {
            overlap.events.push(events_spaces[past]);
            overlap.count.push(overlap.count.length + 1);
         }
      }

      //Divide width among all items that overlap
      properties.width = (properties.width / (overlap.events.length + 1));

      if(overlap.events.length > 1) {
         for (past in overlap.events) {
            style_multiple_events(overlap.events[past].container, overlap.index, overlap.count, properties.width);
            overlap.index++;
         } 
      } else {
         for (past in overlap.events) { 
            if (overlap.events[past].position === properties.width) {
               properties.position = 0;
            } else { 
               overlap.events[past].container.style.width = properties.width + 'px';
               properties.position++ 
            }
         }
      }

      if (overlap.count.length > 2) style_multiple_events(container, overlap.index, overlap.count, properties.width);
      else container.style.left = properties.get_position() + 'px';

      container.style.width = properties.width + 'px';
      container.style.height = (event.end - event.start) + 'px';
      container.style.top = event.start + 'px';

      // Add the event to an object that will store all the events to display, so that they can be retrieved and calculated against
      events_spaces[Math.random().toString(36).substr(2, 10)] = {
         end: event.end,
         start: event.start,
         position: properties.get_position(),
         container: container,
      };

   })

   for (event in events_spaces) {
      events_container.appendChild(events_spaces[event].container);
   }
}

layOutDay([{start: 30, end: 150}, {start: 540, end: 600}, {start: 560, end: 620}, {start: 610, end: 670} ]);