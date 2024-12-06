const Session = require('../src/model/session');
const Course = require('../src/model/course.js');

describe('Session Class', function () {
    it('should correctly initialize with valid parameters', function () {
        const session = new Session(
            'Lecture',
            50,
            'Lundi',
            '10:00',
            '12:00',
            'A',
            'Room 101'
        );

        expect(session.type).toBe('Lecture');
        expect(session.capacity).toBe(50);
        expect(session.day).toBe('Lundi');
        expect(session.hStart instanceof Date).toBe(true);
        expect(session.hEnd instanceof Date).toBe(true);
        expect(session.subGroup).toBe('A');
        expect(session.room).toBe('Room 101');
    });

    it('should throw a TypeError for invalid type', function () {
        expect(() => {
            new Session(123, 50, 'Lundi', '10:00', '12:00', 'A', 'Room 101');
        }).toThrowError(TypeError, 'The typeValue parameter has to be a string !');
    });

    it('should throw an Error for invalid capacity', function () {
        expect(() => {
            new Session('Lecture', 'invalid', 'Lundi', '10:00', '12:00', 'A', 'Room 101');
        }).toThrowError(Error, 'The capacity string can\'t be parsed to an integer !');
    });

    it('should return a string representation using toString()', function () {
        const session = new Session('Lecture', 50, 'Lundi', '10:00', '12:00', 'A', 'Room 101');
        const output = session.toString();
        expect(output).toContain('Type        : Lecture');
        expect(output).toContain('Capacity    : 50');
        expect(output).toContain('Day         : Lundi');
        expect(output).toContain('Room        : Room 101');
    });
});

describe('Course Class', function () {
    let session1, session2, course;

    beforeEach(function () {
        session1 = new Session('Lecture', 50, 'Lundi', '10:00', '12:00', 'A', 'Room 101');
        session2 = new Session('Lab', 30, 'Mardi', '14:00', '16:00', 'B', 'Room 102');
        course = new Course();
    });

    it('should initialize with an empty session list', function () {
        expect(course.sessions.length).toBe(0);
    });

    it('should add a session to the course', function () {
        course.addSession(session1);
        expect(course.sessions.length).toBe(1);
        expect(course.sessions[0]).toBe(session1);
    });

    it('should throw a TypeError when adding an invalid session', function () {
        expect(() => {
            course.addSession('invalid session');
        }).toThrowError(TypeError, 'session parameter must be an instance of Session class !');
    });

    it('should add multiple sessions at once', function () {
        course.addSessions([session1, session2]);
        expect(course.sessions.length).toBe(2);
        expect(course.sessions).toContain(session1);
        expect(course.sessions).toContain(session2);
    });

    it('should throw a TypeError when adding multiple invalid sessions (non-array input)', function () {
        expect(() => {
            course.addSessions('invalid session'); // Not an array
        }).toThrowError(TypeError, 'sessions parameter must be an array !');
    });

    it('should throw a TypeError when adding multiple invalid sessions (array with invalid elements)', function () {
        expect(() => {
            course.addSessions(['invalid session']); // Array, but elements are invalid
        }).toThrowError(TypeError, 'session parameter must be an instance of Session class !');
    });

    it('should remove a session from the course', function () {
        course.addSession(session1);
        const result = course.deleteSession(session1);
        expect(result).toBe(true);
        expect(course.sessions.length).toBe(0);
    });

    it('should return false if trying to remove a session that does not exist', function () {
        const result = course.deleteSession(session1);
        expect(result).toBe(false);
    });

    it('should throw a TypeError when trying to remove an invalid session', function () {
        expect(() => {
            course.deleteSession('invalid session');
        }).toThrowError(TypeError, 'session parameter must be an instance of Session class !');
    });

    it('should correctly check if a session is in the course', function () {
        course.addSession(session1);
        expect(course.containsSession(session1)).toBe(true);
        expect(course.containsSession(session2)).toBe(false);
    });

    it('should return the correct number of sessions', function () {
        course.addSessions([session1, session2]);
        expect(course.getSessionsCount()).toBe(2);
    });

    it('should return a string representation using toString()', function () {
        course.addSessions([session1, session2]);
        const output = course.toString();
        expect(output).toContain('Total Sessions: 2');
        expect(output).toContain('Room        : Room 101');
        expect(output).toContain('Room        : Room 102');
    });
});
