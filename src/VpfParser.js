const fs = require('fs');
const path = require('path');
const Session = require('./model/session.js');
const Course = require('./model/course.js');

/**
 * VpfParser
 *
 * Parses .cru files to extract courses and their sessions, ensuring data integrity.
 * Supports parsing from files or directories, including subdirectories.
 */
class VpfParser {
    constructor() {
        /**
         * List of parsed courses.
         * @type {Array<Course>}
         */
        this.courses = [];

        /**
         * Set of unique course codes to prevent duplicates.
         * @type {Set<string>}
         */
        this.courseCodes = new Set();
    }

    /**
     * Parses a single .cru file.
     * @param {string} filePath - Path to the .cru file to parse.
     */
    parseFile(filePath) {
        const data = fs.readFileSync(filePath, 'utf8');
        this._parseData(data);
    }

    /**
     * Recursively parses all files in a directory and its subdirectories.
     * @param {string} directoryPath - Path to the directory to parse.
     */
    parseDirectory(directoryPath) {

        const entries = fs.readdirSync(directoryPath);

        entries.forEach((entry) => {
            const fullPath = path.join(directoryPath, entry);
            const stats = fs.lstatSync(fullPath);

            if (stats.isFile()) {
                this.parseFile(fullPath);
            } else if (stats.isDirectory()) {
                this.parseDirectory(fullPath); // Recursive parsing
            }
        });
    }

    /**
     * Internal method to parse raw data from a file.
     * Extracts courses and sessions while ensuring no duplicates.
     * @private
     * @param {string} data - Raw content of the .cru file.
     */
    _parseData(data) {
        const lines = data.split('\n');
        let currentCourse = null;

        lines.forEach((line) => {
            line = line.trim();

            if (!line) return; // Skip empty lines

            if (line.startsWith('+')) {
                // Start a new course
                const courseCode = line.substring(1).trim();

                // Skip courses starting with "UVUV"
                if (courseCode.startsWith('UVUV')) return;

                // Skip if course already exists
                if (this.courseCodes.has(courseCode)) {
                    currentCourse = null;
                    return;
                }

                // Add the course
                currentCourse = this._addCourse(courseCode);
            } else if (currentCourse) {
                // Parse session and add it to the current course
                const session = this._parseSessionLine(line);
                if (session) currentCourse.addSession(session);
            }
        });
    }

    /**
     * Adds a new course to the list and ensures it is indexed.
     * @private
     * @param {string} courseCode - The unique code of the course.
     * @returns {Course} The newly created course.
     */
    _addCourse(courseCode) {
        const course = new Course();
        course.code = courseCode;
        this.courses.push(course);
        this.courseCodes.add(courseCode);
        return course;
    }

    /**
     * Parses a single line representing a session.
     * Validates and extracts session details if valid.
     * @private
     * @param {string} line - The raw line describing a session.
     * @returns {Session|null} A Session object if the line is valid, otherwise null.
     */
    _parseSessionLine(line) {
        if (line.endsWith('//')) {
            line = line.slice(0, -2);
        }

        const parts = line.split(',');
        if (parts.length < 3) return null;

        const type = parts[1].trim();
        const subGroup = parts[4]?.trim() || '';
        let capacity = null;
        let day = null;
        let hStart = null;
        let hEnd = null;
        let room = null;

        parts.forEach((part) => {
            const trimmedPart = part.trim();

            if (trimmedPart.startsWith('P=')) {
                capacity = parseInt(trimmedPart.substring(2), 10);
            } else if (trimmedPart.startsWith('H=')) {
                const [dayPart, timePart] = trimmedPart.substring(2).split(' ');

                if (dayPart) day = this._convertDayToFull(dayPart);
                if (timePart) {
                    const [start, end] = timePart.split('-');
                    hStart = start;
                    hEnd = end;
                }
            } else if (trimmedPart.startsWith('S=')) {
                room = trimmedPart.substring(2);
            }
        });

        return capacity && day && hStart && hEnd && room
            ? new Session(type, capacity, day, hStart, hEnd, subGroup, room)
            : null;
    }

    /**
     * Converts abbreviated days into their full names.
     * @private
     * @param {string} dayAbbreviation - Abbreviated day (e.g., "L", "M").
     * @returns {string} Full day name (e.g., "Lundi", "Mardi").
     */
    _convertDayToFull(dayAbbreviation) {
        const dayMap = {
            'L': 'Lundi',
            'MA': 'Mardi',
            'ME': 'Mercredi',
            'J': 'Jeudi',
            'V': 'Vendredi',
        };
        return dayMap[dayAbbreviation] || dayAbbreviation;
    }
}

module.exports = VpfParser;