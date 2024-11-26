export default class Session {
    // FIELDS
    _capacity = 0;
    _day = '';
    _hStart;
    _hEnd;
    _subGroup = '';
    _room = '';


    /**
     * The constructor of the Session class, initialize everything.
     *
     * @param {int} capacity - the number of places of the session
     * @param {string} day - the first letter of the day
     * @param {string} hStart - The beginning hour of the session
     * @param {string} hEnd - The end hour of the session
     * @param {string} subGroup - the subgroup that the session is dedicated
     * @param {string} roomName - the name of the room
     */
    constructor(capacity, day, hStart, hEnd, subGroup, roomName) {
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
        const hourParsed = parseInt(hourEndValue.split(':')[0], 10);
        const minutesParsed = parseInt(hourEndValue.split(':')[0], 10);

        this._hEnd.setHours(hourParsed, minutesParsed);
    }

    set subGroup(subGroupValue) {
        this._subGroup = subGroupValue;
    }

    set room(roomName) {
        this._room = roomName;
    }
}
