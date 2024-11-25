class Crenaux{
    constructor(Capacitaire, horaire, ssGroupe, salle) {
        this.capacitaire = Capacitaire;
        this.jour= horaire;
        this.hDebut = horaire.split("-")[0];
        this.hFin= horaire.split("-")[1];

        this.ssGroupe = ssGroupe;
        this.salle = salle;
    }

    capacitaire (){
        return this.capacitaire;
    }

    hDebut() {
        return this.hDebut;
    }
    hFin(){
        return this.hFin;
    }
    horaire(){
        this.horaire = this.jour+"-"+this.hDebut + "-"+ this.hFin;
        return this.horaire;
    }
    ssGroupe(){
        return this.ssGroupe;
    }
    salle(){
        return this.salle;
    }

    equivalence(creneau) {
        return this.horaire === creneau.horaire && this.ssGroupe === creneau.ssGroupe && this.salle === creneau.salle;

    }

    comparerHoraire(creneau){
        return this.horaire < creneau.horaire;
    }
    comparerSalle(creneau){
        return this.salle === creneau.salle;
    }
    comparerSsGroupe(creneau){
        return this.ssGroupe() === creneau.ssGroupe;
    }
    comparerCapacitaire(creneau){
        return this.capacitaire === creneau.capacitaire;
    }




}

