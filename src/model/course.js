import Session from 'src/model/session.js';


export default class Course {
    /**
     * The constructor of the Course class, initialize everything.
     *
     * @param {array[Session]} sessions [optional] - A list of session immediately added to the courses
     *                                               at the instantiation
     */
    constructor(sessions = []) {
        this._sessions = [];
        sessions.forEach(element => this.addSession(element));
    }


    // GETTERS
    /**
     * Returns the list that contains all sessions of the course.
     *
     * @returns {array[Session]} - all sessions of the course
     */
    get sessions() {
        return this._sessions;
    }


    // SETTERS
    /**
     * Add a given sessions to the list of sessions of the course.
     *
     * @param {Session} session - The session that we want to append
     *
     * @throws {TypeError} - If the parameter isn't an instance of Session class
     */
    addSession(session) {
        if (session instanceof Session === false) {
            throw new TypeError('session parameter must be an instance of Session class !');
        }

        this._sessions.push(session);
    }

    /**
     * Add multiple sessions in same time.
     *
     * @param {array[Session]} sessions - A list that contains all sessions that we want to add to the course
     *
     * @throws {TypeError} - If the parameter isn't an array that contains only Session object
     */
    addSessions(sessions) {
        if (!Array.isArray(sessions)) {
            throw new TypeError('sessions parameter must be an array !')
        }

        sessions.forEach(element => this.addSession(element));
    }

    /**
     * Remove a given session.
     *
     * @param {Session} session - The session object that we want to remove
     * @returns {boolean} True if we found and remove the session, false else
     *
     * @throws {TypeError} If the parameter isn't an instance of Session class
     */
    deleteSession(session) {
        if (session instanceof Session === false) {
            throw new TypeError('session parameter must be an instance of Session class !')
        }

        const index = this._sessions.indexOf(session);
        if (index === -1) {
            return false;
        }

        this._sessions.splice(session);
        return true;
    }


    // PUBLIC METHODS
    /**
     * Returns the number of sessions of the courses.
     *
     * @returns {int} the sessions count of the course
     */
    getSessionsCount() {
        return this._sessions.length;
    }

    /**
     * Check if a given session is in the course.
     *
     * @param {Session} session - The session to check.
     * @returns {boolean} - True if the course contains the session, false else;
     */
    containsSession(session) {
        return this._sessions.includes(session);
    }
}
