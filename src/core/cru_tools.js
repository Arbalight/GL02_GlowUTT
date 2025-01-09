const fs = require('fs');
const Session = require('../model/session.js');


function findDataFolderFromCourseName(courseName) {
    let dataPath = 'data/';

    if (typeof courseName !== 'string') {
        throw new TypeError('The courseName parameter has to be a string !');
    }

    let courseLetter = courseName.at(0).toUpperCase();

    if (!courseLetter.match(/[a-z]/i)) {
        throw new Error('The first character of the course name has to be a letter !');
    }

    if (courseLetter.charCodeAt(0) % 2 === 0) { // it's the second letter of the folder
        dataPath += String.fromCharCode(courseLetter.charCodeAt(0) - 1) + courseLetter;
    } else { // it's the first letter of the folder
        dataPath += courseLetter + String.fromCharCode(courseLetter.charCodeAt(0) + 1);
    }

    if (fs.existsSync(dataPath) === false) {
        throw new Error('There are no folder for this course name !');
    }

    return dataPath;
}

function findAllSessionsFromCourse(courses, course_name) {
    if (typeof courses !== 'object') {
        throw new TypeError('The courses parameter has to be an object array !');
    } else if (typeof course_name !== 'string') {
        course_name = String(course_name);
    }

    let courseSessions = [];
    courses.forEach(currentCourse => {
        if (currentCourse.code.toUpperCase() === course_name.toUpperCase()) {
            courseSessions = currentCourse.sessions;
        }
    });
    return courseSessions;
}

/**
 * Filters sessions based on the given courses and date ranges,
 * and returns a list of courses with only the corresponding sessions.
 *
 * @param {Array<Course>} courses - List of available courses.
 * @param {Array<string>} selectedCourses - Course codes to filter (empty to include all).
 * @param {string|null} start - Start day ("Monday", "Tuesday", etc.).
 * @param {string|null} end - End day ("Monday", "Tuesday", etc.).
 * @returns {Array<Object>} - List of courses with their filtered sessions.
 */
function filterSessionsByCoursesAndDates(courses, selectedCourses, start, end) {
    const includedDays = findDateBetween(start, end);

    // Filter the selected courses (or take all courses if the list is empty)
    const filteredCourses = courses.filter(course =>
        selectedCourses.length === 0 || selectedCourses.includes(course.code)
    );

    // Construct a new list of courses with their filtered sessions
    const result = filteredCourses.map(course => {
        const filteredSessions = course.sessions.filter(session =>
            includedDays.includes(session.day)
        );

        return {
            code: course.code,
            name: course.name,
            sessions: filteredSessions
        };
    });

    return result.filter(course => course.sessions.length > 0); // Remove courses without sessions
}

function findAllSessionsFromRoom(courses, room_name) {
    if (typeof courses !== 'object') {
        throw new TypeError('The courses parameter has to be an object array !');
    } else if (typeof room_name !== 'string') {
        room_name = String(room_name);
    }

    let roomSessions = [];
    courses.forEach(currentCourse => {
        currentCourse.sessions.forEach(currentSession => {
            if (currentSession.room.toUpperCase() === room_name.toUpperCase()) {
                roomSessions.push(currentSession);
            }
        });
    });
    return roomSessions;
}

function findAllSessionsFromDate(courses, start, end){
    const includedDays = findDateBetween(start, end);

    const result = courses.map(course => {
        const filteredSessions = course.sessions.filter(session =>
            includedDays.includes(session.day)
        );

        return {
            code: course.code,
            name: course.name,
            sessions: filteredSessions
        };
    });

    return result.filter(course => course.sessions.length > 0);
}

function findDateBetween(start, end) {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    if (start === null || end === null) {
        throw new Error('Please provide both start and end days');
    }

    // Get the indices of the start and end days
    const startIndex = days.indexOf(start);
    const endIndex = days.indexOf(end);

    if (startIndex === -1 || endIndex === -1) {
        throw new Error('Invalid start or end day');
    }

    // Determine the days included between start and end (including start and end)
    const includedDays = [];
    if (startIndex <= endIndex) {
        // Case where the days are in the same order in the week
        for (let i = startIndex; i <= endIndex; i++) {
            includedDays.push(days[i]);
        }
    } else {
        // Case where end is before start (week wraps around)
        for (let i = startIndex; i < days.length; i++) {
            includedDays.push(days[i]);
        }
        for (let i = 0; i <= endIndex; i++) {
            includedDays.push(days[i]);
        }
    }
    return includedDays;
}

function getRoomsCount(courses){
    let rooms = new Set();
    courses.forEach(course => {
        course.sessions.forEach(session => {
            rooms.add(session.room);
        });
    });
    return rooms.size;
}

function getDateForDay(dayAbbreviation, startTime) {
    const dayMap = {
        'Lundi': 1,
        'Mardi': 2,
        'Mercredi': 3,
        'Jeudi': 4,
        'Vendredi': 5,
        'Samedi': 6,
        'Dimanche': 0
    };

    const targetDay = dayMap[dayAbbreviation];
    if (targetDay === undefined) {
        throw new Error(`Unknown day abbreviation: ${dayAbbreviation}`);
    }

    // Obtenir la date d'aujourd'hui
    const today = new Date();
    const todayDay = today.getDay();

    let difference = targetDay - todayDay;
    if (difference < 0) {
        difference += 7;
    }

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + difference);


    return targetDate;
}

function findRoomsForDate(courses, day, timestamp = '') {
    if (typeof day !== 'string') {
        throw new TypeError('The day parameter has to be a string !');
    } else if (typeof timestamp !== 'string') {
        throw new TypeError('The time parameter has to be a string !');
    }

    let roomsAvailable = [];
    let roomsUnavailable = [];
    courses.forEach(currentCourse => {
        currentCourse.sessions.forEach(currentSession => {

            if (currentSession.day.toUpperCase() === day.toUpperCase()) {
                // same day need to compare the timestamps (if timestamp given)
                if (timestamp.length > 0 && !compareTimestamp(currentSession, timestamp)) {
                    if (!roomsAvailable.includes(currentSession.room)) {
                        roomsAvailable.push(currentSession.room);
                    }
                } else {
                    roomsUnavailable.push(currentSession.room);
                }
            } else {
                if (!roomsAvailable.includes(currentSession.room)) {
                    roomsAvailable.push(currentSession.room);
                }
            }
        });
    });

    // remove false positives
    roomsAvailable = roomsAvailable.filter(room => !roomsUnavailable.includes(room));

    return roomsAvailable;
}

function getRoomsSet(courses) {
    let rooms = new Set();
    courses.forEach(course => {
        course.sessions.forEach(session => {
            rooms.add(session.room);
        });
    });
    return rooms;
}

function findDatesForRoom(roomSessions, room_name) {
    let dates = {
        'Lundi': [[0, 0], [23, 59]],
        'Mardi': [[0, 0], [23, 59]],
        'Mercredi': [[0, 0], [23, 59]],
        'Jeudi': [[0, 0], [23, 59]],
        'Vendredi': [[0, 0], [23, 59]]
    };

    const allTimestamps = roomSessions.map(value => {
        return [
            [value.hStart.getHours(), value.hStart.getMinutes()],
            [value.hEnd.getHours(), value.hEnd.getMinutes()]
        ];
    })

    for (let day in dates) {
        dates[day] = removeOverlaps(allTimestamps);
    }

    return dates;
}

function parseTimestamp(timestamp) {
    if (typeof timestamp !== 'string') {
        throw new TypeError('The timestamp parameter has to be a string at format : "HH:MM-HH:MM" !');
    }

    const timeBegin = timestamp.split('-')[0];
    const hourBegin = parseInt(timeBegin.split(':')[0], 10);
    const minutesBegin = parseInt(timeBegin.split(':')[1], 10);

    const timeEnd = timestamp.split('-')[1];
    const hourEnd = parseInt(timeEnd.split(':')[0], 10);
    const minutesEnd = parseInt(timeEnd.split(':')[1], 10);

    if (isNaN(hourBegin) || isNaN(minutesBegin) || isNaN(hourEnd) || isNaN(minutesEnd)) {
        throw new Error('Error during the parsing of the timestamp !\nThe timestamp has to be a string at the format : "HH:MM-HH:MM" !');
    }

    return [[hourBegin, minutesBegin], [hourEnd, minutesEnd]];
}

function compareTimestamp(session, timestamp) {
    if (session instanceof Session === false) {
        throw new TypeError('The session parameter has to be an instance of the Session class !');
    }

    if (typeof timestamp === 'string') {
        timestamp = parseTimestamp(timestamp);
    } else if (typeof timestamp !== 'object' || timestamp.length !== 2) {
        throw new TypeError('The timestamp has to be a string at the format : "HH:MM" !');
    }

    // convert each time into minutes to compare they more easy way
    const convertToMinutes = ([hours, minutes]) => hours * 60 + minutes;

    const sessionStart = convertToMinutes([session.hStart.getHours(), session.hStart.getMinutes()]);
    const sessionEnd = convertToMinutes([session.hEnd.getHours(), session.hEnd.getMinutes()]);
    const slotStart = convertToMinutes(timestamp[0]);
    const slotEnd = convertToMinutes(timestamp[1]);

    // check if the timestamps are overlap
    return (sessionEnd > slotStart && sessionStart <= slotEnd) || (sessionStart <= slotEnd && sessionEnd >= slotStart);
}


function removeOverlaps(timestamps) {
    const dayInterval = [[0, 0], [23, 59]];

    // functions to convert timestamp into minutes and inverse
    const toMinutes = ([hours, minutes]) => hours * 60 + minutes;
    const toTimestamp = (minutes) => [Math.floor(minutes / 60), minutes % 60];

    // initialize dayInterval into minutes
    let result = [[toMinutes(dayInterval[0]), toMinutes(dayInterval[1])]];

    timestamps.forEach(interval => {
        const intervalStart = toMinutes(interval[0]);
        const intervalEnd = toMinutes(interval[1]);
        let updatedResult = [];

        result.forEach(([start, end]) => {
            if (intervalEnd <= start || intervalStart >= end) {
                updatedResult.push([start, end]);

            } else {
                if (intervalStart > start) {
                    updatedResult.push([start, intervalStart]);
                }
                if (intervalEnd < end) {
                    updatedResult.push([intervalEnd, end]);
                }
            }
        });

        result = updatedResult;
    });

    // Convert all minutes interval into timestamp
    return result.map(([start, end]) => [toTimestamp(start), toTimestamp(end)]);
}

function verifTaille(tailleListe, name, logger){
    if (tailleListe === 0) {
        if(name != null){
        logger.error(`Not found with the given name : "${name}"`);}
        else{
        logger.error('No data found in the database');
        }
        process.exit(1);
    }
}


module.exports = {
    findDataFolderFromCourseName,
    getRoomsSet,
    findAllSessionsFromRoom,
    findRoomsForDate,
    findDatesForRoom,
    findAllSessionsFromCourse,
    findAllSessionsFromDate,
    filterSessionsByCoursesAndDates,
    verifTaille
};
