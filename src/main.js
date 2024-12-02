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
        parser.parseDirectory('data');

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



        console.log(`Free slots for the room "${args.roomName}" :`);
        freeSlots.forEach(currentSlot => {
            console.log(currentSlot.toString());
        });
    })

    // SPEC 4
    // command to show all rooms unreserved of a given slot
    .command('dispo_creneau', 'display all rooms unreserved of a given slot')
    .argument('<day>', 'The day of the slot')
    .option('-t, --time', 'Session start and end times following this format : HH:MM;HH:MM',
        {validator: cli.STRING})
    .action(({args, options, logger}) => {
        // TODO
    })

    // SPEC 5
    // command to export sessions of given courses in an iCalendar file.
    .command('export', 'Export all scheduled sessions for given courses in an iCalendar file')
    .argument('[course..]', 'The name of courses to export')
    .option('-stdt, --start-date <startDate>', 'The start date of the calendar', { validator: cli.STRING })
    .option('-endtn, --end-date <endDate>', 'The end date of the calendar', { validator: cli.STRING })
    .action(({ args, logger, options }) => {
        const parser = new VpfParser();
        parser.parseDirectory('data'); // Répertoire contenant les données

        // Récupérer les cours et options utilisateur
        const courses = args.course.length > 0 ? args.course : [];
        const startDate = options.startDate || null;
        const endDate = options.endDate || null;

        if (startDate === null || endDate === null || courses.length === 0) {
            logger.error('Please provide both start and end dates.');
            process.exit(1);
        }

        // Filtrer les cours et leurs sessions
        const filteredCourses = cruTools.filterSessionsByCoursesAndDates(parser.courses, courses, startDate, endDate);

        if (filteredCourses.length === 0) {
            logger.warn('No sessions found for the given criteria.');
            process.exit(0);
        }

        // Créer un composant iCalendar
        const calendar = new ical.Component(['vcalendar', [], []]);
        calendar.updatePropertyWithValue('version', '2.0');
        calendar.updatePropertyWithValue('prodid', '-//My Course Export//EN');

        // Ajouter les sessions filtrées comme événements
        filteredCourses.forEach(course => {
            course.sessions.forEach(session => {
                const event = new ical.Component('vevent');
                const eventData = {
                    uid: `${session.day}-${session.hStart.toISOString()}-${session.room}`,
                    summary: `${course.code} - ${session.type}`,
                    dtstart: session.hStart.toISOString(),
                    dtend: session.hEnd.toISOString(),
                    location: session.room,
                    description: `Type: ${session.type}, Subgroup: ${session.subGroup || 'None'}`
                };

                event.updatePropertyWithValue('uid', eventData.uid);
                event.updatePropertyWithValue('summary', eventData.summary);
                event.updatePropertyWithValue('dtstart', eventData.dtstart);
                event.updatePropertyWithValue('dtend', eventData.dtend);
                event.updatePropertyWithValue('location', eventData.location);
                event.updatePropertyWithValue('description', eventData.description);

                calendar.addSubcomponent(event);
            });
        });

        // Exporter le fichier iCalendar
        // Trouver le dossier Téléchargements
        const downloadsDir = path.join(os.homedir(), 'Downloads');
        const fileName = path.join(downloadsDir, 'courses.ics');

        fs.writeFileSync(fileName, calendar.toString());
        logger.info(`iCalendar file "${fileName}" successfully created!`);
    })



    // SPEC 6
    // command to see diagram of rooms distribution for a given period
    .command('visu', 'Show diagram to see statistics of rooms distribution for a given period')
    .argument('<start_date>', 'The beginning date of the data in the diagram')
    .argument('<end_date>', 'The last date of the data in the diagram')
    .action(({args, logger}) => {
        // TODO
    })

    // SPEC 7
    // command to see diagram to analyse the rooms and their places
    .command('classement', 'Show diagram to see statistics of number of rooms and theirs places')
    .action(({args, logger}) => {
        // TODO
    })

cli.run();
