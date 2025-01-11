const cli = require("@caporal/core").default;

const os = require('os');
const path = require('path');
const fs = require('fs');
const prompt = require('prompt-sync')();

const CruParser = require('./CruParser.js');
const cruTools = require('./core/cru_tools.js');
const ical = require('ical.js');

function initializeParser(directory = 'data') {
    const parser = new CruParser();
    parser.parseDirectory(directory);
    return parser;
}

cli
    .version('SRU-software')
    .version('0.01')

    // SPEC 1
    // command to show the rooms by session of a given course
    .command('salles', 'display all sessions of the given course with associated rooms')
    .argument('<course>', 'The name of the course')
    .action(({args, logger}) => {
        // const parser = new CruParser();
        const parser = initializeParser();

        // try to get the data folder
        let  dataFolder;
        try {
            dataFolder = cruTools.findDataFolderFromCourseName(args.course);
        } catch (error) {
            logger.error(`Impossible to found the course: "${args.course}" in the database !`);
            process.exit(1);
        }

        //parser.parseDirectory(dataFolder);

        const courseSessions = cruTools.findAllSessionsFromCourse(parser.courses, args.course);
        cruTools.checkLength(courseSessions.length, args.course, logger);

        console.log(`Sessions of the course "${args.course}" :`);
        courseSessions.forEach(currentSession => {
            console.log(`${currentSession.toString()}`);
        });
    })

    // SPEC 2
    // command to show the maximum number of seats of a given room
    .command('capacite', 'display the maximum number of seats of a given room')
    .argument('<room_name>', 'The name of the room')
    .action(({args, logger}) => {
        const parser = initializeParser();

        // get all sessions with the given room
        const roomSessions = cruTools.findAllSessionsFromRoom(parser.courses, args.roomName);
        cruTools.checkLength(roomSessions.length, args.roomName, logger);

        // find room max capacity
        let maxCapacity = 0;
        roomSessions.forEach(currentSession => {
            if (currentSession.capacity > maxCapacity) {
                maxCapacity = currentSession.capacity;
            }
        });

        logger.info(`The maximum capacity in the database of the "${args.roomName}" room is : ${maxCapacity}`);
    })

    // SPEC 3
    // command to show all free slots of a given room
    .command('dispo_salle', 'display all free slots of a given room')
    .argument('<room_name>', 'The name of the room')
    .action(({args, logger}) => {
        const parser = initializeParser();

        const roomSessions = cruTools.findAllSessionsFromRoom(parser.courses, args.roomName);
        cruTools.checkLength(roomSessions.length, args.roomName, logger);

        const dates = cruTools.findDatesForRoom(roomSessions, args.roomName);

        // function to print all intervals of one day
        const prettyPrintIntervals = (intervals) => {
            intervals.forEach(([start, end], index) => {
                const formatTime = ([hours, minutes]) =>
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                console.log(`\tInterval ${index + 1}: ${formatTime(start)} - ${formatTime(end)}`);
            });
        }

        console.log(`All free slots for the "${args.roomName}" room :`);
        for (let day in dates) {
            console.log(`- ${day} :`);
            prettyPrintIntervals(dates[day]);
        }
    })

    // SPEC 4
    // command to show all rooms unreserved of a given slot
    .command('dispo_creneau', 'display all rooms unreserved of a given slot')
    .argument('<day>', 'The day of the slot')
    .option('-t, --time', 'Session start and end times following this format : HH:MM;HH:MM',
        {validator: cli.STRING})
    .action(({args, options, logger}) => {
        const parser = initializeParser();

        const validDays = ['Lundi','lundi','Mardi','mardi','Mercredi','mercredi','Jeudi','jeudi','Vendredi','vendredi','Samedi','samedi','Dimanche','dimanche'];
        
        if (!validDays.includes(args.day)) {
            logger.error(`Invalid day provided: "${args.day}". Please enter a valid day (e.g., Lundi, mardi).`);
            return;
        }

        let timestamp;
        let rooms;
        if ('time' in options) {
            timestamp = options.time;
            rooms = cruTools.findRoomsForDate(parser.courses, args.day, options.time);
        } else {
            timestamp = 'all time';
            rooms = cruTools.findRoomsForDate(parser.courses, args.day);
        }

        console.log(`All rooms unreserved the ${args.day} at ${timestamp} :`);
        console.log(rooms);
    })

    // SPEC 5
    // command to export sessions of given courses in an iCalendar file.
    .command('export', 'Export all scheduled sessions for given courses in an iCalendar file')
    .argument('[course..]', 'The name of courses to export')
    .argument('stdt', 'The start date of the calendar', { validator: cli.STRING })
    .argument('endtn', 'The end date of the calendar', { validator: cli.STRING })
    .action(({ args, logger, options }) => {
        const parser = initializeParser();

        // Retrieve courses and user options
        const courses = args.course.length > 0 ? args.course : [];
        const startDate = args.stdt;
        const endDate = args.endtn;
        

        // Filter courses and their sessions
        const filteredCourses = cruTools.filterSessionsByCoursesAndDates(parser.courses, courses, startDate, endDate);

        sessions = []
        console.log("Let's choose the sessions to export !\n");
        filteredCourses.forEach((course)=>{
            console.log("----------- Course " + course.code + " -----------");
            let count = 0;

            // printing the available sessions
            course.sessions.forEach((session)=>{
                console.log("Session " + count + "\n");
                console.log(session + "\n");
                count ++;
            });

            sessionList = []
            stopChoosing = "Yes";
            while ((stopChoosing !="n") && (stopChoosing !="N")){
                chosenSession = prompt("Course " + course.code + " : Enter the number of the session that you want to export (e.g. 1) : ");
                if (course.sessions[chosenSession] != undefined){
                    sessionList.push(course.sessions[chosenSession]);
                }
                else{
                    console.log("Please enter a valid session number.");
                }
                stopChoosing = prompt("Do you want to choose another session? (Y/N) ");
                console.log(stopChoosing);
            }
            course.sessions = sessionList;
         }
        );

        cruTools.checkLength(filteredCourses.length, args.course, logger);

        // Create an iCalendar component
        const calendar = new ical.Component(['vcalendar', [], []]);
        calendar.updatePropertyWithValue('version', '2.0');
        calendar.updatePropertyWithValue('prodid', '-//My Course Export//EN');

        filteredCourses.forEach(course => {
            course.sessions.forEach(session => {
                const event = new ical.Component('vevent');

                try {
                    const startDate = new Date(session.hStart);
                    const endDate = new Date(session.hEnd);

                    event.updatePropertyWithValue('UID', `${session.day}-${startDate.toISOString()}-${session.room}`);
                    event.updatePropertyWithValue('DTSTAMP', new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z');
                    event.updatePropertyWithValue('DTSTART', startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z');
                    event.updatePropertyWithValue('DTEND', endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z');
                    event.updatePropertyWithValue('SUMMARY', `${course.code} - ${session.type}`);
                    event.updatePropertyWithValue('LOCATION', session.room);
                    event.updatePropertyWithValue('DESCRIPTION', `Type: ${session.type}, Subgroup: ${session.subGroup || 'None'}, Day: ${session.day}`);
                    event.updatePropertyWithValue('CLASS', 'PUBLIC');
                    event.updatePropertyWithValue('STATUS', 'CONFIRMED');

                    calendar.addSubcomponent(event);
                } catch (error) {
                    console.error(`Error processing session for course ${course.code}:`, error.message);
                }
            });
        });


        // Export the iCalendar file
        // Find the Downloads folder
        const downloadsDir = path.join(os.homedir(), 'Downloads');
        const fileName = path.join(downloadsDir, 'courses.ics');

        fs.writeFileSync(fileName, calendar.toString());
        logger.info('If some of the courses do not appear on the calendar, it means that they were not found in the database.');
        logger.info(`iCalendar file "${fileName}" successfully created!`);
    })

    // SPEC 6
    // command to see diagram of rooms distribution for a given period
    .command('visu', 'Show diagram to see statistics of rooms distribution for a given period')
    .argument('<start_day>', 'The first day of the data in the diagram')
    .argument('<end_day>', 'The last day of the data in the diagram')
    .action(({ args, logger }) => {
        const startDate = args.startDay || null;
        const endDate = args.endDay || null;

        if (!startDate || !endDate) {
            logger.error('Both start_date and end_date must be provided.');
            process.exit(1);
        }

        const parser = initializeParser();
        const filteredCourses = cruTools.findAllSessionsFromDate(parser.courses, startDate, endDate);

        cruTools.checkLength(filteredCourses.length, null, logger);

        const roomUsage = {};
        filteredCourses.forEach(course => {
            course.sessions.forEach(session => {
                if (session.room in roomUsage) {
                    roomUsage[session.room] += 1;
                } else {
                    roomUsage[session.room] = 1;
                }
            });
        });

        for (let [key, value] of Object.entries(roomUsage)) {
            roomUsage[key] = value / filteredCourses.length;
        }

        const rooms = cruTools.getRoomsSet(parser.courses);
        rooms.forEach(room => {
            if (!(room in roomUsage)) {
                roomUsage[room] = 0;
            }
        });

        // Prepare data for Vega-Lite
        const chartData = Object.entries(roomUsage).map(([room, usage]) => ({
            room,
            usage
        }));

        const spec = {
            $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
            description: 'Room Usage Distribution Over a Period',
            width: 800,
            height: 400,
            data: {
                values: chartData
            },
            mark: 'bar',
            encoding: {
                x: { field: 'room', type: 'ordinal', axis: { title: 'Room Names' } },
                y: { field: 'usage', type: 'quantitative', axis: { title: 'Usage Rate' } },
                tooltip: [{ field: 'room' }, { field: 'usage', format: '.2%' }]
            }
        };

        // Generate HTML file
        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Room Usage Chart</title>
            <script src="https://cdn.jsdelivr.net/npm/vega@5"></script>
            <script src="https://cdn.jsdelivr.net/npm/vega-lite@5"></script>
            <script src="https://cdn.jsdelivr.net/npm/vega-embed@6"></script>
        </head>
        <body>
            <div id="chart"></div>
            <script>
                const spec = ${JSON.stringify(spec)};
                vegaEmbed('#chart', spec).catch(console.error);
            </script>
        </body>
        </html>`;

        const downloadsDir = path.join(os.homedir(), 'Downloads');
        const fileName = path.join(downloadsDir, 'room_usage_chart.html');

        fs.writeFileSync(fileName, htmlContent);
        logger.info('Chart saved as room_usage_chart.html');
    })



// SPEC 7
    // command to see diagram to analyse the rooms and their places
    .command('classement', 'Show diagram to see statistics of number of rooms and theirs places')
    .action(({args, logger}) => {
        const parser = initializeParser();    
        const courses = parser.courses;

         
        cruTools.checkLength(courses.length, null, logger);

        var rooms = {};
        courses.forEach(course => {
            course.sessions.forEach(session => {
                if (!rooms[session.room]) {
                    rooms[session.room] = session.capacity;
                } else {
                    rooms[session.room] = Math.max(rooms[session.room], session.capacity);
                }
            });
        });

        var sortedRooms = Object.keys(rooms).sort((a, b) => rooms[a] - rooms[b]);
        console.log('Rooms sorted by capacity: ');

        var lastCapacity = rooms[sortedRooms[0]];
        var count = 0;
        sortedRooms.forEach(room => {
            if (rooms[room] !== lastCapacity) {
                console.log(`${lastCapacity} places: ${count} rooms`);
                //console.log(`- ${room}`);
                lastCapacity = rooms[room];
                count = 1;
            } else {
                count++;
            }
        });

    })

cli.run();

