import { firebaseConfig } from "/config/auth.js";
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// Generates a trigram
function triGram(txt) {
    const map = [];
    const s1 = (txt || '').toLowerCase();
    const n = 3;
    for (let k = 0; k <= s1.length - n; k++) {
            map.push(s1.substring(k, k + n));
    }
    return map;
}

export function searchCollection(collection, term) {
    const resultsLarge = [];
    const results = [];

    // Create trigrams from the search term
    const searchTrigrams = triGram(term);

    // If trigram is found 
    db.collection( collection ).get().then( allDocuments => {
        allDocuments.forEach( doc => {
            let docField = doc.data().name;
            let fieldTrigrams = triGram(docField);
            for (var i = 0; i < fieldTrigrams.length; i++) {
                for (var j = 0; j < searchTrigrams.length; j++) {
                    if (fieldTrigrams[i].toLowerCase() == searchTrigrams[j].toLowerCase()) {
                        
                        let pass = true;
                        for (var k = 0; k < resultsLarge.length; k++) {
                            if (resultsLarge[k][0] == doc.id) { 
                                resultsLarge[k][1]++;
                                pass = false; 
                            }
                        }
                        if (pass) { resultsLarge.push([doc.id, 0]); }
                    }
                }
            }
        });

        // Sort by relevance
        resultsLarge.sort(
            function(a, b) {
                return b[1] - a[1]
        });
        for (var i = 0; i < resultsLarge.length; i++) {
            results[i] = resultsLarge[i][0];
        }
    });

    return results;
}