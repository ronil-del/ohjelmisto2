'use strict';

let score = 0;
const scoreDisplay = document.getElementById("pisteet");
let latitude_deg = {min: 35, max: 70};
let longitude_deg = {min: -30, max: 40};
const map = L.map('map').setView([60, 24], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
}).addTo(map);
let peliPaalla = true;
const URL = 'http://127.0.0.1:3000';
let highScoreLista = []

// Funktio 10 parhaan pelaajan hakemiseen
async function haeHighScoret() {
    try {
        const response = await fetch(`${URL}/leaderboard`); // Käytä oikeaa URL-reittiä
        if (!response.ok) throw new Error('Virhe haettaessa high score -listaa.');

        const leaderboardData = await response.json();

        if (Array.isArray(leaderboardData)) {
            highScoreLista = leaderboardData;
        } else {
            console.error("Odottamaton vastausmuoto:", leaderboardData);
        }
    } catch (error) {
        console.error('Virhe high score -listaa haettaessa:', error);
    }
}

async function tallenaflaskiin(score) {
    try {
        const response = await fetch(`${URL}/tallenna`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                score: score
            }),
        });
        if (!response.ok) throw new Error('RAKASTAN TALLENTAA JAJVASCRISRPTISSA')
        const tallennus = await response.json();
        alert("Pisteet tallessa!");
    } catch (error) {
        console.error(error);

    }
}

async function ListanPituus() {
    try {
        const listanvastaus = await fetch(`${URL}/listanPituus`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        });
        if (!listanvastaus.ok) throw new Error('Epäonnistui!')
        {
            const listadata = await listanvastaus.json();

            if (listadata.TAHAN_RETURN_FLASKISTA !== undefined) {
                return listadata.TAHAN_RETURN_FLASKISTA;
            } else {
                return null;
            }
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}
/*function highScorePrinttaus() {
    const listanPituus = ListanPituus(); // Muista, että ListanPituus pitäisi palauttaa oikean pituuden
    const kroppa = document.getElementById('kroppa');
    kroppa.innerHTML = "";
    kroppa.id = 'uusi_keho';

    const otsikko_highScore = document.createElement('h1');
    otsikko_highScore.id = 'otsikko_highScore';
    otsikko_highScore.textContent = "10 Parasta Klikkaajaa!!";
    kroppa.appendChild(otsikko_highScore);

    for (let i = 0; i < listanPituus; i++) {
        const kayttajat = highScoreLista[i];
        const li = document.createElement('li');
        li.textContent = `${kayttajat.kayttajatunnus}: ${kayttajat.highScore} pistettä!`;
        kroppa.appendChild(li);  // Tässä li lisätään kroppa elementtiin
    }
}
*/

function highScorePrinttaus() {
    const kroppa = document.getElementById('kroppa');
    kroppa.innerHTML = ""; // Tyhjennetään sisältö

    const otsikko = document.createElement('h1');
    otsikko.textContent = "10 Parasta Klikkaajaa!!";
    kroppa.appendChild(otsikko);

    // Käy läpi lista ja lisää jokainen tulos
    highScoreLista.forEach(player => {
        const li = document.createElement('li');
        li.textContent = `${player.nimi}: ${player.score} pistettä!`;
        kroppa.appendChild(li);
    });
}

// Käynnistä alustaminen
document.addEventListener('DOMContentLoaded', async () => {
    await haeHighScoret();  // Hae leaderboard
    highScorePrinttaus();  // Päivitä UI
});


// Alustetaan lista ja näytetään se
async function initializeHighScoreList() {
    await haeHighScoret(); // Hakee tiedot SQL:stä
    highScorePrinttaus(); // Renderöi tiedot
}

// Suorita initializeHighScoreList sivun latauksen yhteydessä
document.addEventListener('DOMContentLoaded', initializeHighScoreList);


async function getKoordinaattit() {
    try {
        const response = await fetch(`${URL}/airports_by_country`);
        if (!response.ok) throw new Error('Invalid server input!');
        const data = await response.json();
        if (data.latitude_deg && data.longitude_deg) {
            return [data.latitude_deg, data.longitude_deg];
        } else {
            console.error("No coordinates found");
            return [60, 24];
        }
    } catch (error) {
        console.error("Error fetching coordinates:", error);
        return [60, 24];
    }
}

function aika() {
    setTimeout(() => {
        peliPaalla = false;
        alert("Aika loppui! Pisteesi: " + score);
        tallenaflaskiin(score);
        ListanPituus();
        haeHighScoret();
    }, 30000);// jonkuverra sek voi vaihtaa kello sivulla ois jees
}

async function lemtokone() {
    if (!peliPaalla) return;
    const coords = await getKoordinaattit();
    const icon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/1503/1503143.png',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });
    const koneKuva = L.marker(coords, {icon: icon}).addTo(map);
    koneKuva.on('click', () => {
        score += 1;
        scoreDisplay.textContent = score;
        koneKuva.remove();
        lemtokone();
    });
}

lemtokone();
aika();
