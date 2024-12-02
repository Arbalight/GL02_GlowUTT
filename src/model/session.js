class Session {
    // FIELDS
    _type = '';
    _capacity = 0;
    _day = '';
    _hStart;
    _hEnd;
    _subGroup = '';
    _room = '';


    /**
     * The constructor of the Session class, initialize everything.
     *
     * @param {string} type - the type of the session
     * @param {int} capacity - the number of places of the session
     * @param {string} day - the day of the session
     * @param {string} hStart - The beginning hour of the session
     * @param {string} hEnd - The end hour of the session
     * @param {string} subGroup - the subgroup that the session is dedicated
     * @param {string} roomName - the name of the room
     */
    constructor(type, capacity, day, hStart, hEnd, subGroup, roomName) {
        this.type = type
        this.capacity = capacity;
        this.day = day;

        this._hStart = new Date();
        this.hStart = hStart;
        this._hEnd = new Date();
        this.hEnd = hEnd;

        this.subGroup = subGroup;
        this.room = roomName;
    }


    // GETTERS
    get type() {
        return this._type;
    }

    get capacity() {
        return this._capacity;
    }

    get day() {
        return this._day;
    }

    get hStart() {
        return this._hStart;
    }

    get hEnd() {
        return this._hEnd;
    }

    get subGroup() {
        return this._subGroup;
    }

    get room() {
        return this._room;
    }


    // SETTERS
    set type(typeValue) {
        if (typeof typeValue !== 'string') {
            throw new TypeError('The typeValue parameter has to be a string !');
        }

        this._type = typeValue;
    }

    set capacity(capacityValue) {
        let capacity;

        if (typeof capacityValue === 'number') {
            capacity = capacityValue;

        } else if (typeof capacityValue === 'string') {
            const capacityParsed = parseInt(capacityValue, 10);

            if (isNaN(capacityParsed)) {
                throw new Error('The capacity string can\'t be parsed to an integer !');
            } else {
                capacity = capacityParsed;
            }
        } else {
            throw new TypeError('The capacity has to be an integer or a string that contains an integer !');
        }

        if (capacity < 0) {
            throw new RangeError('The capacity can\'t be negative !')
        }

        this._capacity = capacity;
    }

    set day(dayValue) {
        if (typeof dayValue !== 'string') {
            throw new TypeError('The day must be a string (the name of the day or its first letter) !')
        }

        this._day = dayValue;
    }

    set hStart(hourStartValue) {
        if (typeof hourStartValue === 'string') {
            const hourInt = parseInt(hourStartValue.split(':')[0], 10);
            const minutesInt = parseInt(hourStartValue.split(':')[1], 10)

            if (isNaN(hourInt) || isNaN(minutesInt)) {
                throw new Error('error during the parsing of the hourStartValue parameter !');
            }

            this._hStart.setHours(hourInt, minutesInt);

        } else if (hourStartValue instanceof Date) {
            this._hStart.setHours(hourStartValue.getHours(), hourStartValue.getMinutes());

        } else {
            throw new TypeError('The hourStartValue parameter has to be a Date or a string at format : "HH:MM"');
        }
    }

    set hEnd(hourEndValue) {
        if (typeof hourEndValue === 'string') {
            const hourInt = parseInt(hourEndValue.split(':')[0], 10);
            const minutesInt = parseInt(hourEndValue.split(':')[1], 10);

            if (isNaN(hourInt) || isNaN(minutesInt)) {
                throw new Error('error during the parsing of the hourStartValue parameter !');
            }

            this._hEnd.setHours(hourInt, minutesInt);

        } else if (hourEndValue instanceof Date) {
            this._hEnd.setHours(hourEndValue.getHours(), hourEndValue.getMinutes());

        } else {
            throw new TypeError('The hourEndValue parameter has to be a Date or a string at format : "HH:MM"');
        }
    }

    set subGroup(subGroupValue) {
        if (typeof subGroupValue !== 'string') {
            throw new TypeError('The subGroupValue parameter has to be a string !');
        }

        this._subGroup = subGroupValue;
    }

    set room(roomName) {
        if (typeof roomName !== 'string') {
            throw new TypeError('The roomName parameter has to be a string !');
        }

        this._room = roomName;
    }

    toICalEvent() {
        return {
            uid: `${this.day}-${this.hStart.toISOString()}-${this.room}`,
            summary: this.type,
            dtstart: this.hStart.toISOString(),
            dtend: this.hEnd.toISOString(),
            location: this.room,
            description: `Session Type: ${this.type}, SubGroup: ${this.subGroup || 'None'}`,
        };
    };

    /**
     * Returns a formatted string representation of the session.
     * @returns {string} - A detailed string representation of the session.
     */
    toString() {
        const formatTime = time => {
            const hours = time.getHours().toString().padStart(2, '0');
            const minutes = time.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        };

        return `
          ------------------------
          Session Details:
          ------------------------
          - Type        : ${this.type}
          - Capacity    : ${this.capacity}
          - Day         : ${this.day}
          - Time        : ${formatTime(this.hStart)} - ${formatTime(this.hEnd)}
          - Subgroup    : ${this.subGroup || 'None'}
          - Room        : ${this.room || 'No room assigned'}
          ------------------------`;
    }
}

module.exports = Session;
