// Importation des modules nécessaires
const fs = require('fs');
const path = require('path');
const Creneau = require('./Crenaux.js');

// Définition de la classe VpfParser
class VpfParser {
    constructor(){
        // Liste des sessions analysées à partir des fichiers d'entrée.
        this.parsedSessions = [];
        this.errorCount = 0;
    }

    // Méthode pour analyser un fichier individuel
    parseFile(filePath){
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            this.parseData(data);
        } catch (err) {
            console.error(`Erreur lors de la lecture du fichier ${filePath}:`, err);
        }
    }

    // Méthode pour analyser les données d'un fichier
    parseData(data){
        var lines = data.split('\n');
        var currentSession = null;

        for(var i = 0; i < lines.length; i++){
            var line = lines[i].trim();
            if(line.length === 0) continue; // Ignorer les lignes vides

            if(line.startsWith('+')){
                // Nouvelle session (cours)
                currentSession = {
                    nom: line.substring(1).trim(),
                    creneaux: []
                };
                this.parsedSessions.push(currentSession);
            } else if(line.startsWith('1,')){
                // Analyser un créneau
                if(currentSession == null){
                    this.errMsg("Créneau sans session associée", line);
                    continue;
                }

                var match = line.match(/^1,(\w\d),P=(\d+),H=(L|MA|ME|J|V|S)\s+(\d{1,2}:\d{2}-\d{1,2}:\d{2}),F(1|2),S=([A-Z0-9]{4})\/\/$/);

                if(match){
                    var [
                        fullMatch,
                        type,
                        nombrePlaces,
                        jour,
                        horaire,
                        indexSousGroupe,
                        salle
                    ] = match;

                    var [heureDebut, heureFin] = horaire.split('-');

                    // Créer une instance de la classe Creneau
                    var creneau = new Creneau(
                        parseInt(nombrePlaces, 10),
                        jour,
                        horaire,
                        `F${indexSousGroupe}`,
                        salle
                    );

                    currentSession.creneaux.push(creneau);
                } else {
                    this.errMsg("Format de créneau invalide", line);
                }
            } else {
                this.errMsg("Ligne non reconnue", line);
            }
        }
    }

    // Méthode pour afficher les messages d'erreur
    errMsg(msg, line){
        this.errorCount++;
        console.error("Erreur d'analyse sur la ligne : '"+line+"' -- message : "+msg);
    }

    // Méthode pour analyser les fichiers dans un répertoire et ses sous-répertoires
    parseDirectory(dir){
        const files = fs.readdirSync(dir);

        files.forEach((file) => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                // Analyser récursivement les sous-répertoires
                this.parseDirectory(filePath);
            } else {
                // Analyser le fichier s'il a l'extension .cru
                if (path.extname(file) === '.cru') {
                    this.parseFile(filePath);
                }
            }
        });
    }
}

// Exemple d'utilisation :

// Création d'une instance du parser
const parser = new VpfParser();

// Analyser tous les fichiers dans le répertoire 'data/'
parser.parseDirectory('data/');

// Affichage des sessions analysées
console.log(JSON.stringify(parser.parsedSessions, null, 2));

// Affichage du nombre d'erreurs s'il y en a
if (parser.errorCount > 0) {
    console.error(`Nombre total d'erreurs : ${parser.errorCount}`);
} else {
    console.log("Analyse terminée avec succès sans erreurs.");
}