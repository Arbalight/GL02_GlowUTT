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
        if (this.horaire === creneau.horaire && this.ssGroupe === creneau.ssGroupe && this.salle === creneau.salle){
            return true
        }
        else {
            return false
        }

    }

    comparerHoraire(creneau){
        if (this.horaire < creneau.horaire){
            return true
        }
        else {
            return false
        }
    }
    comparerSalle(creneau){
        if (this.salle === creneau.salle){
            return true
        }else {
            return false
        }
    }
    comparerSsGroupe(creneau){
        if (this.ssGroupe() === creneau.ssGroupe){
            return true
        }else {
            return false
        }
    }
    comparerCapacitaire(creneau){
        if (this.capacitaire === creneau.capacitaire){
            return true
        }else {
            return false
        }
    }




}

