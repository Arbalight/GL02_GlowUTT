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
 * Filtre les sessions en fonction des cours donnés et des plages de dates,
 * et retourne une liste de cours avec uniquement les sessions correspondantes.
 *
 * @param {Array<Course>} courses - Liste des cours disponibles.
 * @param {Array<string>} selectedCourses - Codes des cours à filtrer (vide pour tout inclure).
 * @param {string|null} start - Jour de début ("Lundi", "Mardi", etc.).
 * @param {string|null} end - Jour de fin ("Lundi", "Mardi", etc.).
 * @returns {Array<Object>} - Liste des cours avec leurs sessions filtrées.
 */
function filterSessionsByCoursesAndDates(courses, selectedCourses, start, end) {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    if (start === null || end === null) {
        throw new Error('Please provide both start and end days');
    }

    // Obtenir les indices des jours start et end
    const startIndex = days.indexOf(start);
    const endIndex = days.indexOf(end);

    if (startIndex === -1 || endIndex === -1) {
        throw new Error('Invalid start or end day');
    }

    // Déterminer les jours compris entre start et end (y compris start et end)
    const includedDays = [];
    if (startIndex <= endIndex) {
        // Cas où les jours sont dans le même ordre dans la semaine
        for (let i = startIndex; i <= endIndex; i++) {
            includedDays.push(days[i]);
        }
    } else {
        // Cas où end est avant start (semaine en boucle)
        for (let i = startIndex; i < days.length; i++) {
            includedDays.push(days[i]);
        }
        for (let i = 0; i <= endIndex; i++) {
            includedDays.push(days[i]);
        }
    }

    // Filtrer les cours sélectionnés (ou prendre tous les cours si la liste est vide)
    const filteredCourses = courses.filter(course =>
        selectedCourses.length === 0 || selectedCourses.includes(course.code)
    );

    // Construire une nouvelle liste de cours avec leurs sessions filtrées
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

    return result.filter(course => course.sessions.length > 0); // Retirer les cours sans sessions
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
