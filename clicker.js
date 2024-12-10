'use strict';

// Base URL for API requests
const BASE_URL = 'http://127.0.0.1:3000'; // Replace with your actual API URL


// Event listener for the "New Game" button
document.getElementById('nappi_uusipeli').addEventListener('click', () => {
    const body = document.querySelector('body');  // Target <body> element

    // Clear only specific content (don't clear the whole body)
    const main = document.querySelector('main');
    if (main) main.innerHTML = ''; // Clear previous content inside <main>

    // Remove logo from the header (if needed)
    const logoHeader = document.querySelector('#paa-logo');
    if (logoHeader) logoHeader.remove(); // Remove the logo from the header

    // Create the new content
    const yla_osio = document.createElement('div');
    yla_osio.id = 'yla_osio';

    const logo_pieni = document.createElement('img');
    logo_pieni.src = 'kuvat/logo_pienempi.jpg';
    logo_pieni.alt = 'Logo';
    yla_osio.appendChild(logo_pieni);

    body.appendChild(yla_osio);  // Add the logo section

    // Show the registration form after button click
    showRegisterForm();
});

// Show the registration form
function showRegisterForm() {
    const main = document.querySelector('main');  // Target the <main> element to insert the form

    // Insert the registration form HTML dynamically
    main.innerHTML = `
        <h2 id="rekisteroidu_otsikko">Rekisteröidy</h2>
        <form id="rekisteroi-form">
            <label for="rekisteriTunnus">Käyttäjätunnus:</label>
            <input type="text" id="rekisteriTunnus" name="kayttajatunnus" required>
            <br>
            <button type="submit" id="rekisterointi_nappi_formissa">Rekisteröidy</button>
        </form>
        <div id="rekisteriVastaus"></div>
    `;

    // Handle form submission
    document.getElementById('rekisteroi-form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const rekisteriTunnus = document.getElementById('rekisteriTunnus').value;

        try {
            const response = await fetch(`${BASE_URL}/rekister`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ kayttajatunnus: rekisteriTunnus }),
            });

            const result = await response.json();
            const vastausElementti = document.getElementById('rekisteriVastaus');

            if (vastausElementti) {
                if (response.ok) {
                    vastausElementti.textContent = result.message || 'Rekisteröinti onnistui!';
                } else {
                    vastausElementti.textContent = result.error || 'Rekisteröinti epäonnistui.';
                }
            }
        } catch (error) {
            console.error('Error registering:', error);
            document.getElementById('rekisteriVastaus').textContent = 'Virhe rekisteröitymisessä.';
        }

        // After registration, show the map (delay to simulate a loading effect)
        setTimeout(() => {
            naytaKartta();
        }, 2000);
    });
}

// Show the map view after registration
function naytaKartta() {
    location.href = location.pathname.split('/')[1]+ '/sivu2.html';
}

