# SRU-Software CLI Documentation

Welcome to the **SRU-Software** CLI project. <br/>
This tool is a school project which helps to manage and analyze course sessions, room availability, and scheduling data from a local database.

---
## Project Details
- Developed by : [Florian Lopitaux](https://github.com/florianLopitaux) / [Lucas Bonnin](https://github.com/Lucarafe) / [Nathan Ramecourt](https://github.com/NathanRmct)
- School Group : **GlowUTT**
- Operating Systems : Windows, Linux, Mac
- Programming Language : Javascript, NodeJS

---
## Requirements / Installation

To use this tool, you will need NodeJS installed on your computer. <br/>
Then you can clone this repository in the `main` branch. <br/>
Now open a terminal and move into the project directory, then press this following command to install project depencies :
```bash
npm install
```

Once finished, you can use the tool with using program entry point `main.js` :
```bash
node src/main.js <command>
```
or moved into the src folder to directely access to the `main.js` :
```bash
cd src
node main.js <command>
```

---
## Commands Overview

This CLI includes the following commands:

1. [salles](#salles) - Display all sessions of a given course with associated rooms.
2. [capacite](#capacite) - Display the maximum number of seats in a given room.
3. [dispo_salle](#dispo_salle) - Show all free slots of a specific room.
4. [dispo_creneau](#dispo_creneau) - Display all rooms unreserved for a given time slot.
5. [export](#export) - Export sessions for given courses to an iCalendar file.
6. [visu](#visu) - Visualize room distribution statistics for a period.
7. [classement](#classement) - Display statistics for rooms sorted by capacity.

---

### 1. `salles` (SPEC 1)
**Description**  
Displays all sessions of a specified course along with the rooms they are scheduled in. <br/>

**Arguments**
- <course> - The name of the course, for example : LE02 <br/>

**Usage**
```bash
node main.js salles <course>
```

### 2. `capacite` (SPEC 2)
**Description**  
Displays the maximum seating capacity of a specified room. <br/>

**Arguments**
- <room_name> - The name of the course, for example : LE02 <br/>

**Usage**  
```bash
node main.js capacite <room_name>
```

### 3. `dispo_salle` (SPEC 3)
**Description**  
Shows all free time slots for a specified room. <br/>

**Arguments**
- <room_name> - The name of the room, for example : S103 <br/>

**Usage**  
```bash
node main.js dispo_salle <room_name>
```

### 4. `dispo_creneau` (SPEC 4)
**Description**  
Displays all rooms that are unreserved for a specific day or a time slot with option. <br/>

**Arguments**  
- `<day>` - The day of the slot in French, for example: Lundi <br/>

**Options**  
- `-t, --time` - Specify the start and end times in `HH:MM-HH:MM` format, for example: `10:30-12:00` <br/>

**Usage**  
```bash
node main.js dispo_creneau <day> [options]
```

### 5. `export` (SPEC 5)
**Description**  
Exports all sessions for specified courses into an iCalendar file. <br/>

**Arguments**  
- `[course..]` - Names of the courses to export, for example: LE02, NF16, ... <br/>

**Options (Obligatory)**  
- `-stdy, --start-day <startDay>` - The start day for the calendar export in French, for example: Mardi
- `-endy, --end-day <endDay>` - The end day for the calendar export in French, for example: Jeudi <br/>

**Usage**  
```bash
node main.js export [course..] [options]
```

### 6. `visu` (SPEC 6)
**Description**  
Displays a diagram showing room usage statistics over a specified period (export the diagram in a HTML file). <br/>

**Arguments**  
- `<start_day>` - The start date of the period in French, for example: Lundi
- `<end_day>` - The end date of the period in French, for example: Vendredi <br/>

**Usage**  
```bash
node main.js visu <start_day> <end_day>
```

### 7. `classement` (SPEC 7)
**Description**  
Displays the number of rooms sorted by their seating capacities. <br/>

**Usage**  
```bash
node main.js classement
```