class Crenaux{
    /**
     * the constructor of the classe Crenaux
     * @param Capacitaire = the place in a room
     * @param horaire = jour + heure d'arrivé + heure de départ
     * @param ssGroupe = nom du groupe
     * @param salle = nom salle
     */
    constructor(Capacitaire, horaire, ssGroupe, salle) {
        this.capacitaire = Capacitaire;
        this.jour= horaire;
        this.hDebut = horaire.split("-")[0];
        this.hFin= horaire.split("-")[1];

        this.ssGroupe = ssGroupe;
        this.salle = salle;
    }

    /**
     * returns the capacity linked to a slot
     * @return the slot
     */
    capacitaire (){
        return this.capacitaire;
    }

    /**
     * returns start time linked to a slot
     * @returns time slot in format {hh;hh}
     */
    hDebut() {
        return this.hDebut;
    }
    /**
     * returns end time linked to a slot
     * @returns time slot in format {hh;hh}
     */
    hFin(){
        return this.hFin;
    }

    /**
     * retourne la plage horaire complete du créneau
     * x = (l|m|m|j|v|s|d) one of the first letter of the day of the week
     * @returns horaire on the format:  (x - {hh:hh} - {hh:hh} )
     */
    horaire(){
        this.horaire = this.jour+"-"+this.hDebut + "-"+ this.hFin;
        return this.horaire;
    }

    /**
     * return the name of the group
     * @returns {ssGroupe}
     */
    ssGroupe(){
        return this.ssGroupe;
    }

    /**
     * return the room
     * @returns {salle}
     */
    salle(){
        return this.salle;
    }

    /**
     * compare two sloot
     * @param creneau
     * @returns {boolean} true if the both are equal
     */
    equivalence(creneau) {
        return this.horaire === creneau.horaire && this.ssGroupe === creneau.ssGroupe && this.salle === creneau.salle;

    }

    /**
     * compare two Schedule
     * @param creneau
     * @returns {boolean} true if the both are equal
     */

    comparerHoraire(creneau){
        return this.horaire < creneau.horaire;
    }

    /**
     * compare room
     * @param creneau
     * @returns {boolean} true if the both are equal
     */
    comparerSalle(creneau){
        return this.salle === creneau.salle;
    }
    /**
     * compare ssGroupe
     * @param creneau
     * @returns {boolean} true if the both are equal
     */
    comparerSsGroupe(creneau){
        return this.ssGroupe() === creneau.ssGroupe;
    }
    /**
     * compare capacitaire
     * @param creneau
     * @returns {boolean} true if the both are equal
     */
    comparerCapacitaire(creneau){
        return this.capacitaire === creneau.capacitaire;
    }




}

