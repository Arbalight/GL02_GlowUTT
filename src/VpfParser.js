const fs = require('fs');
const path = require('path');
const Session = require('./model/session.js');
const Course = require('./model/course.js');

class VpfParser {
    constructor() {
        this.courses = [];
    }

    parseFile(filePath) {
        const data = fs.readFileSync(filePath, 'utf8');
        this.parseData(data);
    }

    parseDirectory(directoryPath) {
        console.log(`Parsing directory: ${directoryPath}`);
        const files = fs.readdirSync(directoryPath);
        files.forEach((file) => {
            const filePath = path.join(directoryPath, file);
            console.log(`Found: ${filePath}`);
            if (fs.lstatSync(filePath).isFile()) {
                console.log(`Parsing file: ${filePath}`);
                this.parseFile(filePath);
            } else if (fs.lstatSync(filePath).isDirectory()) {
                console.log(`Entering subdirectory: ${filePath}`);
                this.parseDirectory(filePath); // Récursion pour les sous-dossiers
            }
        });
    }


    parseData(data) {
        const lines = data.split('\n');
        let currentCourseCode = null;
        let currentCourse = null;

        for (let line of lines) {
            line = line.trim();
            if (line === '') {
                continue;
            }

            if (line.startsWith('+')) {
                currentCourseCode = line.substring(1).trim();
                if (currentCourseCode.startsWith('UVUV')) {
                    currentCourse = null;
                    continue;
                }

                currentCourse = new Course();
                currentCourse.code = currentCourseCode;
                this.courses.push(currentCourse);
            } else {
                const session = this.parseSessionLine(line);
                if (session && currentCourse) {
                    currentCourse.addSession(session);
                }
            }
        }
    }

    parseSessionLine(line) {
        if (line.endsWith('//')) {
            line = line.slice(0, -2);
        }

        const parts = line.split(',');
        if (parts.length < 3) {
            return null;
        }

        const type = parts[1].trim();
        const subGroup = parts[4].trim();
        let capacity = null;
        let day = null;
        let hStart = null;
        let hEnd = null;
        let room = null;

        for (let i = 2; i < parts.length; i++) {
            const part = parts[i].trim();

            if (part.startsWith('P=')) {
                capacity = parseInt(part.substring(2), 10);
            } else if (part.startsWith('H=')) {
                const rest = part.substring(2).trim();
                const dayAndTime = rest.split(' ');
                if (dayAndTime.length >= 2) {
                    day = this.convertDayToFull(dayAndTime[0]);
                    const times = dayAndTime[1].split('-');
                    if (times.length === 2) {
                        hStart = times[0];
                        hEnd = times[1];
                    }
                }
            } else if (part.startsWith('S=')) {
                room = part.substring(2);
            }
        }

        if (capacity !== null && day && hStart && hEnd && room) {
            return new Session(type, capacity, day, hStart, hEnd, subGroup, room);
        }

        return null;
    }

    convertDayToFull(dayAbbreviation) {
        const dayMap = {
            'L': 'Lundi',
            'M': 'Mardi',
            'ME': 'Mercredi',
            'J': 'Jeudi',
            'V': 'Vendredi'
        };
        return dayMap[dayAbbreviation] || dayAbbreviation;
    }
}

module.exports = VpfParser;


if (require.main === module) {
    const parser = new VpfParser();
    parser.parseDirectory('data/AB');
    //parser.parseFile("data/AB/edt.cru")

    parser.courses.forEach((course) => {
        console.log(`Cours : ${course.code}`);
        course.sessions.forEach((session) => {
            console.log(`\t${session.toString()}`);
        });
    });
}

