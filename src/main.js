const cli = require("@caporal/core").default;

const os = require('os');
const path = require('path');
const fs = require('fs');

const VpfParser = require('./VpfParser.js');
const cruTools = require('./core/cru_tools.js');
const ical = require('ical.js');

cli
    .version('SRU-software')
    .version('0.01')

    // SPEC 1
    // command to show the rooms by session of a given course
    .command('salles', 'display all sessions of the given course with associated rooms')
    .argument('<course>', 'The name of the course')
    .action(({args, logger}) => {
        const parser = new VpfParser();

        // try to get the data folder
        let  dataFolder;
        try {
            dataFolder = cruTools.findDataFolderFromCourseName(args.course);
        } catch (error) {
            logger.error(`Impossible to found the course: "${args.course}" in the database !`);
            process.exit(1);
        }

        parser.parseDirectory(dataFolder);

        const courseSessions = cruTools.findAllSessionsFromCourse(parser.courses, args.course);
        if (courseSessions.length === 0) {
            logger.error(`No sessions found with the given name : "${args.course}"`);
            process.exit(1);
        }

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
        const parser = new VpfParser();
        parser.parseDirectory('data');

        // get all sessions with the given room
        const roomSessions = cruTools.findAllSessionsFromRoom(parser.courses, args.roomName);
        if (roomSessions.length === 0) {
            logger.error(`No room found with the given name : "${args.roomName}"`);
            process.exit(1);
        }

        // find room max capacity
        let maxCapacity = 0;
        roomSessions.forEach(currentSession => {
            if (currentSession.capacity > maxCapacity) {
                maxCapacity = currentSession.capacity;
            }
        });

        console.log(`The maximum capacity in the database of the "${args.roomName}" room is : ${maxCapacity}`);
    })

    // SPEC 3
    // command to show all free slots of a given room
    .command('dispo_salle', 'display all free slots of a given room')
    .argument('<room_name>', 'The name of the room')
    .action(({args, logger}) => {
        const parser = new VpfParser();
        parser.parseDirectory('data');

        const roomSessions = cruTools.findAllSessionsFromRoom(parser.courses, args.roomName);
        if (roomSessions.length === 0) {
            logger.error(`No room found with the given name : "${args.roomName}"`);
            process.exit(1);
        }

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
        const parser = new VpfParser();
        parser.parseDirectory('data');

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
    .option('-stdt, --start-date <startDate>', 'The start date of the calendar', { validator: cli.STRING })
    .option('-endtn, --end-date <endDate>', 'The end date of the calendar', { validator: cli.STRING })
    .action(({ args, logger, options }) => {
        const parser = new VpfParser();
        parser.parseDirectory('data'); // Directory containing the data

        // Retrieve courses and user options
        const courses = args.course.length > 0 ? args.course : [];
        const startDate = options.startDate || null;
        const endDate = options.endDate || null;

        if (startDate === null || endDate === null || courses.length === 0) {
            logger.error('Please provide both start and end dates.');
            process.exit(1);
        }

        // Filter courses and their sessions
        const filteredCourses = cruTools.filterSessionsByCoursesAndDates(parser.courses, courses, startDate, endDate);

        if (filteredCourses.length === 0) {
            logger.warn('No sessions found for the given criteria.');
            process.exit(0);
        }

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
        logger.info(`iCalendar file "${fileName}" successfully created!`);
    })



    // SPEC 6
    // command to see diagram of rooms distribution for a given period
    .command('visu', 'Show diagram to see statistics of rooms distribution for a given period')
    .argument('<startDate>', 'The beginning date of the data in the diagram')
    .argument('<endDate>', 'The last date of the data in the diagram')
    .action(({ args, logger }) => {
        const parser = new VpfParser();
        parser.parseDirectory('data/AB');

        const startDate = args.startDate || null;
        const endDate = args.endDate || null;


        if (!startDate || !endDate) {
            logger.error('Both start_date and end_date must be provided.');
            process.exit(1);
        }

        const filteredCourses = cruTools.findAllSessionsFromDate(parser.courses, startDate, endDate);

        if (filteredCourses.length === 0) {
            logger.warn('No data found for the given period.');
            process.exit(0);
        }


        // Calculer le taux d'occupation par salle
        const roomUsage = {};
        filteredCourses.forEach(course => {
            course.sessions.forEach(session => {
                const room = session.room || 'Unknown';
                if (!roomUsage[room]) {
                    roomUsage[room] = { used: 0, total: 0 };
                }
                roomUsage[room].used += 1;
            });
        });

        const totalSlots = Object.keys(roomUsage).reduce((sum, room) => {
            roomUsage[room].total = roomUsage[room].used;
            return sum + roomUsage[room].total;
        }, 0);



    })

    // SPEC 7
    // command to see diagram to analyse the rooms and their places
    .command('classement', 'Show diagram to see statistics of number of rooms and theirs places')
    .action(({args, logger}) => {
        // TODO
    })

cli.run();
