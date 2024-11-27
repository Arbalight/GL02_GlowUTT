const VpfParser = require("./VpfParser.js");
const cli = require("@caporal/core").default;

cli
    .version('SRU-software')
    .version('0.01')

    // SPEC 1
    // command to show the rooms by session of a given course
    .command('salles', 'display all sessions of the given course with associated rooms')
    .argument('<course>', 'The name of the course')
    .argument('<directory>', 'The file to check with Vpf parser')
    .action(({args, logger}) => {
        const parser = new VpfParser();

        try {
            // Parse the specified directory
            logger.info(`Parsing directory: ${args.directory}`);
            parser.parseDirectory(args.directory);

            // Find the requested course
            const course = parser.courses.find(
                c => c.code.toLowerCase() === args.course.toLowerCase()
            );

            if (!course) {
                logger.error(`Error: Course "${args.course}" not found.`);
                return;
            }

            // Extract and display sessions and rooms
            logger.info(`Sessions for course "${args.course}":`);
            console.log(course.sessions.toString());
        } catch (error) {
            // Handle parsing or directory errors
            logger.error(`Failed to parse the directory: ${error.message}`);
        }
    })

    // SPEC 2
    // command to show the maximum number of seats of a given room
    .command('capacite', 'display the maximum number of seats of a given room')
    .argument('<room_name>', 'The name of the room')
    .action(({args, logger}) => {
        // TODO
    })

    // SPEC 3
    // command to show all free slots of a given room
    .command('dispo_salle', 'display all free slots of a given room')
    .argument('<room_name>', 'The name of the room')
    .action(({args, logger}) => {
        // TODO
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
    .command('export', 'Export all schedules sessions for given courses in an iCalendar file')
    .argument('[course..]', 'The name of courses that we follow')
    .option('-stdt, --start-date', 'The beginning date of the calendar that we want to create',
        {validator: cli.STRING})
    .option('-endtn --end-date', 'The last date of the calendar that we want to create',
        {validator: cli.STRING})
    .action(({args, logger}) => {
        // TODO
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
