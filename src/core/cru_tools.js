const fs = require('fs');


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
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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


module.exports = {
    findDataFolderFromCourseName,
    findAllSessionsFromRoom,
    findAllSessionsFromCourse,
    filterSessionsByCoursesAndDates
};
