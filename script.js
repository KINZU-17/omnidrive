const BACKEND_URL = (() => {
    // Local development detection
    if (['localhost', '127.0.0.1'].includes(window.location.hostname) ||
        window.location.hostname.endsWith('.ngrok-free.app') ||
        window.location.hostname.endsWith('.ngrok-free.dev')) {
        return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3002'
            : `https://${window.location.hostname}`;
    }
    // Production fallback
    return 'https://omnidrive-backend-production.up.railway.app';
})();



function showSearchSuggestions() {
    const query = document.getElementById('searchBar').value.trim().toLowerCase();
    const box = document.getElementById('searchSuggestions');
    if (!query || query.length < 2) { box.innerHTML = ''; box.style.display = 'none'; return; }

    const matches = [];
    const seen = new Set();
    inventory.forEach(car => {
        const full = `${car.brand} ${car.model}`;
        const key = full.toLowerCase();
        if (key.includes(query) && !seen.has(key)) {
            seen.add(key);
            matches.push({ label: full, type: 'vehicle' });
        }
        if (car.brand.toLowerCase().includes(query) && !seen.has(car.brand.toLowerCase())) {
            seen.add(car.brand.toLowerCase());
            matches.push({ label: car.brand, type: 'brand' });
        }
    });

    if (!matches.length) { box.innerHTML = ''; box.style.display = 'none'; return; }

    box.innerHTML = matches.slice(0, 8).map(m => `
        <div class="suggestion-item" onmousedown="selectSuggestion('${sanitize(m.label)}')">
            <span>${m.type === 'brand' ? '\uD83C\uDFED' : '\uD83D\uDE97'}</span>
            <span>${sanitize(m.label)}</span>
        </div>
    `).join('');
    box.style.display = 'block';
}

function selectSuggestion(value) {
    document.getElementById('searchBar').value = value;
    hideSearchSuggestions();
    applyFilters();
}

function hideSearchSuggestions() {
    setTimeout(() => {
        const box = document.getElementById('searchSuggestions');
        if (box) { box.innerHTML = ''; box.style.display = 'none'; }
    }, 150);
}


(function () {
    const container = document.getElementById('splashParticles');
    for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.className = 'splash-particle';
        const size = Math.random() * 4 + 1;
        p.style.cssText = `
            width:${size}px; height:${size}px;
            left:${Math.random() * 100}%;
            bottom:${Math.random() * -20}%;
            animation-duration:${Math.random() * 8 + 5}s;
            animation-delay:${Math.random() * 5}s;
            opacity:${Math.random() * 0.6 + 0.2};
        `;
        container.appendChild(p);
    }

})();

function dismissSplash() {
    splash.classList.add('dismissed');
    setTimeout(() => {
        splash.remove();
        showLoginModal();  // MANDATORY login before accessing showroom
    }, 950);

// ============================================
// LOGIN MODAL FUNCTIONALITY
// ============================================

let selectedUserType = null;
const loginModal = document.getElementById('loginModal');
const signupPromptModal = document.getElementById('signupPromptModal');

function showLoginModal() {
    // Remove splash screen
    const splash = document.getElementById('splashScreen');
    if (splash) {
        splash.classList.add('dismissed');
        setTimeout(() => splash.remove(), 950);
    }
    
    // Show login modal
    if (loginModal) {
        loginModal.style.display = 'flex';
        // Force reflow
        loginModal.offsetHeight;
        loginModal.classList.add('show');
    }
}
function closeLoginModal() {
    if (!loginModal) return;
    loginModal.classList.remove('show');
    setTimeout(() => {
        loginModal.style.display = 'none';
        showUserTypeSelection(); // Reset to type selection
    }, 300);
}


function showUserTypeSelection() {
    document.getElementById('loginFormSection').style.display = 'none';
    document.querySelector('.user-type-selection').style.display = 'grid';
    selectedUserType = null;
}

function showLoginForm() {
    document.querySelector('.user-type-selection').style.display = 'none';
    document.getElementById('loginFormSection').style.display = 'block';
    
    const labels = {
        admin: 'Admin Login',
        dealer: 'Dealer Login',
        liaison: 'Technical Liaison Login',
        client: 'Client Login'
    };
    const colors = {
        admin: '#e74c3c',
        dealer: '#27ae60',
        liaison: '#e67e22',
        client: '#2684ff'
    };
    
    document.getElementById('loginHeader').innerHTML = `
        <div class="user-type-icon" style="font-size:40px;margin-bottom:10px">${getIcon(selectedUserType)}</div>
        <div style="font-size:20px;font-weight:700;color:${colors[selectedUserType]}">${labels[selectedUserType]}</div>
    `;
    
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginUsername').focus();
}

function selectUserType(type) {
    selectedUserType = type;
    
    const titles = {
        admin: 'Administrator Access',
        dealer: 'Dealer Account',
        liaison: 'Technical Liaison Account',
        client: 'Client Account'
    };
    const descriptions = {
        admin: 'Manage the entire platform, view all data, and configure system settings.',
        dealer: 'List vehicles, manage inventory, and track sales leads.',
        liaison: 'Connect technical buyers and sellers, facilitate deals and earn commissions.',
        client: 'Browse vehicles, compare options, and find your dream car.'
    };
    
    // Show confirmation prompt
    const confirmed = confirm(
        `You selected: ${titles[type].toUpperCase()}\n\n${descriptions[type]}\n\nClick OK to proceed to login.`
    );
    
    if (confirmed) {
        showLoginForm();
    }
}

function getIcon(type) {
    const icons = {
        admin: '🛡️',
        dealer: '🏢',
        liaison: '🤝',
        client: '👤'
    };
    return icons[type] || '👤';
}

function performLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    if (!username || !password) {
        alert('Please enter both username and password.');
        return;
    }
    
    // Simulate login (in real app, this would be an API call)
    alert(`${selectedUserType.toUpperCase()} Login:\nUsername: ${username}\n\n(In production, this would authenticate against the server)`);
    
    // Close modal and proceed
    closeLoginModal();
    
    // Show success message
    showNotification(`Welcome, ${username}! You are logged in as ${selectedUserType}.`, 'success');
    
    // Depending on user type, show different content
    if (selectedUserType === 'admin') {
        setTimeout(() => showSection('admin'), 500);
    } else if (selectedUserType === 'dealer') {
        setTimeout(() => showSection('dealers'), 500);
    } else if (selectedUserType === 'liaison') {
        setTimeout(() => showSection('liaison'), 500);
    } else if (selectedUserType === 'client') {
        // For clients, show the main vehicle showroom
        setTimeout(() => {
            // Close login modal first if it's still open
            closeLoginModal();
            // Show the main showroom (vehicle grid)
            document.querySelector('.main-wrapper').classList.remove('hidden');
            // Ensure we're on the grid view
            setView('grid');
            highlightBottomNav(document.querySelector('.bottom-nav-item[onclick*="setView(\'grid\')"]));
        }, 500);
    }
}

// Signup Prompt Functions
function showSignupPrompt() {
    document.getElementById('signupName').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPhone').value = '';
    document.getElementById('signupUserType').value = '';
    document.getElementById('signupMessage').value = '';
    
    signupPromptModal.style.display = 'flex';
    setTimeout(() => signupPromptModal.classList.add('show'), 10);
}

function showCreateAccountModal() {
    closeLoginModal();
    setTimeout(() => {
        signupPromptModal.style.display = 'flex';
        setTimeout(() => signupPromptModal.classList.add('show'), 10);
    }, 300);
}

function closeSignupPrompt() {
    signupPromptModal.classList.remove('show');
    setTimeout(() => {
        signupPromptModal.style.display = 'none';
    }, 300);
}

function submitSignupRequest() {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const userType = document.getElementById('signupUserType').value;
    const message = document.getElementById('signupMessage').value.trim();
    
    if (!name || !email || !userType) {
        alert('Please fill in all required fields (Name, Email, User Type).');
        return;
    }
    
    // In production, this would send to the server API
    console.log('Signup Request:', { name, email, phone, userType, message });
    
    alert('Thank you for your request! We will contact you at ' + email + ' soon.');
    closeSignupPrompt();
    showNotification('Account request submitted successfully!', 'success');
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === loginModal) closeLoginModal();
    if (e.target === signupPromptModal) closeSignupPrompt();
});

// ============================================
// CONFIGURATION & STATE
// ============================================

const imageDatabase = {
    // ── Acura ──
    "Acura NSX": "assets/vehicles/acura-nsx.jpg",
    "Acura MDX": "assets/vehicles/acura-nsx.jpg",
    "Acura TLX": "assets/vehicles/acura-nsx.jpg",
    "Acura": "assets/vehicles/acura-nsx.jpg",
    // ── Alfa Romeo ──
    "Alfa Romeo Giulia": "assets/vehicles/alfa-romeo-giulia.jpg",
    "Alfa Romeo": "assets/vehicles/alfa-romeo-giulia.jpg",
    // ── Aston Martin ──
    "Aston Martin DB12": "assets/vehicles/aston-martin-db12.jpg",
    "Aston Martin": "assets/vehicles/aston-martin-db12.jpg",
    // ── Bentley ──
    "Bentley Continental": "assets/vehicles/bentley-continental.jpg",
    "Bentley": "assets/vehicles/bentley-continental.jpg",
    // ── Bugatti ──
    "Bugatti Chiron": "assets/vehicles/bugatti-chiron.jpg",
    "Bugatti": "assets/vehicles/bugatti-chiron.jpg",
    // ── Buick ──
    "Buick Enclave": "https://upload.wikimedia.org/wikipedia/commons/8/8e/2018_Buick_Enclave_Avenir%2C_front_11.3.18.jpg",
    "Buick": "https://upload.wikimedia.org/wikipedia/commons/8/8e/2018_Buick_Enclave_Avenir%2C_front_11.3.18.jpg",
    // ── Cadillac ──
    "Cadillac Escalade": "assets/vehicles/cadillac-escalade.jpg",
    "Cadillac": "assets/vehicles/cadillac-escalade.jpg",
    // ── Chevrolet ──
    "Chevrolet Corvette": "assets/vehicles/chevrolet-corvette.jpg",
    "Chevrolet Silverado": "assets/vehicles/ford-f150.jpg",
    "Chevrolet": "assets/vehicles/chevrolet-corvette.jpg",
    // ── Chrysler ──
    "Chrysler Pacifica": "https://upload.wikimedia.org/wikipedia/commons/3/3e/2021_Chrysler_Pacifica_Touring_L%2C_front_10.3.20.jpg",
    "Chrysler": "https://upload.wikimedia.org/wikipedia/commons/3/3e/2021_Chrysler_Pacifica_Touring_L%2C_front_10.3.20.jpg",
    // ── Dodge ──
    "Dodge Challenger": "assets/vehicles/dodge-challenger.jpg",
    "Dodge": "assets/vehicles/dodge-challenger.jpg",
    // ── Cupra ──
    "Cupra Formentor": "https://upload.wikimedia.org/wikipedia/commons/2/2e/CUPRA_Formentor_VZ5_%282022%29_front.jpg",
    "Cupra": "https://upload.wikimedia.org/wikipedia/commons/2/2e/CUPRA_Formentor_VZ5_%282022%29_front.jpg",
    // ── Dacia ──
    "Dacia Duster": "https://upload.wikimedia.org/wikipedia/commons/f/f3/Dacia_Duster_II_facelift_IMG_3526.jpg",
    "Dacia": "https://upload.wikimedia.org/wikipedia/commons/f/f3/Dacia_Duster_II_facelift_IMG_3526.jpg",
    // ── Fiat ──
    "Fiat 500": "https://upload.wikimedia.org/wikipedia/commons/0/0e/Fiat_500_Abarth_595_Competizione_%282016%29_front.jpg",
    "Fiat": "https://upload.wikimedia.org/wikipedia/commons/0/0e/Fiat_500_Abarth_595_Competizione_%282016%29_front.jpg",
    // ── Genesis ──
    "Genesis GV80": "https://upload.wikimedia.org/wikipedia/commons/e/e5/2021_Genesis_GV80_2.5T%2C_front_10.3.20.jpg",
    "Genesis": "https://upload.wikimedia.org/wikipedia/commons/e/e5/2021_Genesis_GV80_2.5T%2C_front_10.3.20.jpg",
    // ── GMC ──
    "GMC Sierra": "assets/vehicles/ford-f150.jpg",
    "GMC Hummer": "assets/vehicles/gmc-hummer-ev.jpg",
    "GMC": "assets/vehicles/gmc-hummer-ev.jpg",
    // ── Hennessey ──
    "Hennessey Venom": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Hennessey_Venom_F5_2020_NY_Auto_Show.jpg",
    "Hennessey": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Hennessey_Venom_F5_2020_NY_Auto_Show.jpg",
    // ── Hyundai ──
    "Hyundai Ioniq": "assets/vehicles/hyundai-ioniq5.jpg",
    "Hyundai": "assets/vehicles/hyundai-ioniq5.jpg",
    // ── Infiniti ──
    "Infiniti QX80": "https://upload.wikimedia.org/wikipedia/commons/2/2e/2018_Infiniti_QX80%2C_front_10.27.19.jpg",
    "Infiniti": "https://upload.wikimedia.org/wikipedia/commons/2/2e/2018_Infiniti_QX80%2C_front_10.27.19.jpg",
    // ── Jaguar ──
    "Jaguar F-PACE": "assets/vehicles/jaguar-fpace.jpg",
    "Jaguar": "assets/vehicles/jaguar-fpace.jpg",
    // ── Jeep ──
    "Jeep Wrangler": "assets/vehicles/jeep-wrangler.jpg",
    "Jeep Grand Cherokee": "assets/vehicles/jeep-wrangler.jpg",
    "Jeep": "assets/vehicles/jeep-wrangler.jpg",
    // ── Kia ──
    "Kia EV9": "assets/vehicles/kia-ev9.jpg",
    "Kia Carnival": "https://upload.wikimedia.org/wikipedia/commons/4/4e/2022_Kia_Carnival_SX_Prestige%2C_front_5.28.22.jpg",
    "Kia": "assets/vehicles/kia-ev9.jpg",
    // ── Koenigsegg ──
    "Koenigsegg Regera": "https://upload.wikimedia.org/wikipedia/commons/5/5e/Koenigsegg_Regera_-_Goodwood_Festival_of_Speed_2016.jpg",
    "Koenigsegg": "https://upload.wikimedia.org/wikipedia/commons/5/5e/Koenigsegg_Regera_-_Goodwood_Festival_of_Speed_2016.jpg",
    // ── Land Rover ──
    "Land Rover Range Rover": "assets/vehicles/land-rover-rr.jpg",
    "Land Rover": "assets/vehicles/land-rover-rr.jpg",
    // ── Lincoln ──
    "Lincoln Navigator": "https://upload.wikimedia.org/wikipedia/commons/4/4e/2018_Lincoln_Navigator_L_Reserve%2C_front_10.27.19.jpg",
    "Lincoln": "https://upload.wikimedia.org/wikipedia/commons/4/4e/2018_Lincoln_Navigator_L_Reserve%2C_front_10.27.19.jpg",
    // ── Lotus ──
    "Lotus Emira": "assets/vehicles/lotus-emira.jpg",
    "Lotus": "assets/vehicles/lotus-emira.jpg",
    // ── Lucid ──
    "Lucid Air": "assets/vehicles/lucid-air.jpg",
    "Lucid": "assets/vehicles/lucid-air.jpg",
    // ── Maserati ──
    "Maserati MC20": "assets/vehicles/maserati-mc20.jpg",
    "Maserati": "assets/vehicles/maserati-mc20.jpg",
    // ── Mini ──
    "Mini JCW": "https://upload.wikimedia.org/wikipedia/commons/4/4e/MINI_John_Cooper_Works_GP_%28F56%2C_2020%29_front.jpg",
    "Mini": "https://upload.wikimedia.org/wikipedia/commons/4/4e/MINI_John_Cooper_Works_GP_%28F56%2C_2020%29_front.jpg",
    // ── Pagani ──
    "Pagani Utopia": "assets/vehicles/pagani-utopia.jpg",
    "Pagani": "assets/vehicles/pagani-utopia.jpg",
    // ── Peugeot ──
    "Peugeot 508": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Peugeot_508_PSE_%282021%29_front.jpg",
    "Peugeot": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Peugeot_PSE_%282021%29_front.jpg",
    // ── Pininfarina ──
    "Pininfarina Battista": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Pininfarina_Battista_%282019%29_front.jpg",
    "Pininfarina": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Pininfarina_Battista_%282019%29_front.jpg",
    // ── Polestar ──
    "Polestar 3": "assets/vehicles/polestar-3.jpg",
    "Polestar": "assets/vehicles/polestar-3.jpg",
    // ── Ram ──
    "Ram 1500": "https://upload.wikimedia.org/wikipedia/commons/5/5e/2021_Ram_1500_TRX%2C_front_10.3.20.jpg",
    "Ram 2500": "https://upload.wikimedia.org/wikipedia/commons/5/5e/2021_Ram_2500_Power_Wagon%2C_front_10.3.20.jpg",
    "Ram": "https://upload.wikimedia.org/wikipedia/commons/5/5e/2021_Ram_1500_TRX%2C_front_10.3.20.jpg",
    // ── Renault ──
    "Renault Megane": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Renault_M%C3%A9gane_RS_Trophy-R_%282019%29_front.jpg",
    "Renault": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Renault_M%C3%A9gane_RS_Trophy-R_%282019%29_front.jpg",
    // ── Rimac ──
    "Rimac Nevera": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Rimac_Nevera_%282021%29_front.jpg",
    "Rimac": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Rimac_Nevera_%282021%29_front.jpg",
    // ── Rivian ──
    "Rivian R1T": "assets/vehicles/rivian-r1t.jpg",
    "Rivian": "assets/vehicles/rivian-r1t.jpg",
    // ── Rolls-Royce ──
    "Rolls Royce Spectre": "assets/vehicles/rolls-royce-spectre.jpg",
    "Rolls Royce": "assets/vehicles/rolls-royce-spectre.jpg",
    // ── Skoda ──
    "Skoda Octavia": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Skoda_Octavia_RS_%28IV%2C_2020%29_front.jpg",
    "Skoda Kodiaq": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Skoda_Kodiaq_RS_%282019%29_front.jpg",
    "Skoda": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Skoda_Octavia_RS_%28IV%2C_2020%29_front.jpg",
    // ── Volkswagen ──
    "Volkswagen Golf": "assets/vehicles/volkswagen-golf-r.jpg",
    "Volkswagen": "assets/vehicles/volkswagen-golf-r.jpg",
    // ── Wuling ──
    "Wuling": "https://upload.wikimedia.org/wikipedia/commons/f/f3/Wuling_Hongguang_MINI_EV_%282020%29_front.jpg",
    // ── Chery ──
    "Chery Tiggo": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Chery_Tiggo_8_Pro_%282021%29_front.jpg",
    "Chery": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Chery_Tiggo_8_Pro_%282021%29_front.jpg",
    // ── Geely ──
    "Geely Coolray": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Geely_Coolray_%282019%29_front.jpg",
    "Geely": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Geely_Coolray_%282019%29_front.jpg",
    // ── Haval ──
    "Haval H6": "assets/vehicles/haval-h6.jpg",
    "Haval": "assets/vehicles/haval-h6.jpg",
    // ── MG ──
    "MG HS": "assets/vehicles/mg-hs.jpg",
    "MG": "assets/vehicles/mg-hs.jpg",
    // ── Tata ──
    "Tata Safari": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Tata_Safari_%282021%29_front.jpg",
    "Tata": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Tata_Safari_%282021%29_front.jpg",
    // ── Mahindra ──
    "Mahindra XUV500": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Mahindra_XUV500_W10_%282018%29_front.jpg",
    "Mahindra": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Mahindra_XUV500_W10_%282018%29_front.jpg",
    // ── Isuzu ──
    "Isuzu D-Max": "https://upload.wikimedia.org/wikipedia/commons/5/5e/Isuzu_D-Max_V-Cross_%282020%29_front.jpg",
    "Isuzu": "https://upload.wikimedia.org/wikipedia/commons/5/5e/Isuzu_D-Max_V-Cross_%282020%29_front.jpg",
    // ── Perodua ──
    "Perodua Alza": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Perodua_Alza_%282022%29_front.jpg",
    "Perodua": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Perodua_Alza_%282022%29_front.jpg",
    // ── Proton ──
    "Proton X90": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Proton_X90_%282023%29_front.jpg",
    "Proton": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Proton_X90_%282023%29_front.jpg",
    // ── Daewoo ──
    "Daewoo Matiz": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Daewoo_Matiz_%281998%29_front.jpg",
    "Daewoo": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Daewoo_Matiz_%281998%29_front.jpg",
    // ── CFMoto ──
    "CFMoto 450": "https://upload.wikimedia.org/wikipedia/commons/3/3e/CFMoto_450CL-C_%282022%29_front.jpg",
    "CFMoto": "https://upload.wikimedia.org/wikipedia/commons/3/3e/CFMoto_450CL-C_%282022%29_front.jpg",
    // ── Benelli ──
    "Benelli Leoncino": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Benelli_Leoncino_500_%282017%29_front.jpg",
    "Benelli": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Benelli_Leoncino_500_%282017%29_front.jpg",
    // ── Bajaj ──
    "Bajaj Pulsar": "https://upload.wikimedia.org/wikipedia/commons/5/5e/Bajaj_Pulsar_NS200_%282017%29_front.jpg",
    "Bajaj": "https://upload.wikimedia.org/wikipedia/commons/5/5e/Bajaj_Pulsar_NS200_%282017%29_front.jpg",
    // ── Hero ──
    "Hero Xtreme": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Hero_Xtreme_200S_%282019%29_front.jpg",
    "Hero": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Hero_Xtreme_200S_%282019%29_front.jpg",
    // ── NIU ──
    "NIU NQi": "https://upload.wikimedia.org/wikipedia/commons/4/4e/NIU_NQi_GT_%282020%29_front.jpg",
    "NIU": "https://upload.wikimedia.org/wikipedia/commons/4/4e/NIU_NQi_GT_%282020%29_front.jpg",
    // ── Freightliner ──
    "Freightliner Cascadia": "https://upload.wikimedia.org/wikipedia/commons/5/5e/Freightliner_Cascadia_%282018%29_front.jpg",
    "Freightliner": "https://upload.wikimedia.org/wikipedia/commons/5/5e/Freightliner_Cascadia_%282018%29_front.jpg",
    // ── Peterbilt ──
    "Peterbilt 579": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Peterbilt_579_%282012%29_front.jpg",
    "Peterbilt": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Peterbilt_579_%282012%29_front.jpg",
    // ── Kenworth ──
    "Kenworth T680": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Kenworth_T680_%282012%29_front.jpg",
    "Kenworth": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Kenworth_T680_%282012%29_front.jpg",
    // ── Hino ──
    "Hino 258": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Hino_258_%282016%29_front.jpg",
    "Hino": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Hino_258_%282016%29_front.jpg",
    // ── Fuso ──
    "Fuso Canter": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Mitsubishi_Fuso_Canter_%282017%29_front.jpg",
    "Fuso": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Mitsubishi_Fuso_Canter_%282017%29_front.jpg",
    // ── Existing brands ──
    "Nissan Skyline GT-R": "assets/vehicles/nissan-gtr.jpg",
    "Nissan GT-R": "assets/vehicles/nissan-gtr.jpg",
    "Nissan": "assets/vehicles/nissan-gtr.jpg",
    "Honda Super Cub": "assets/vehicles/honda-pcx.jpg",
    "Honda CBR": "assets/vehicles/honda-cbr1000.jpg",
    "Honda": "assets/vehicles/honda-civic-type-r.jpg",
    "Porsche 911 GT3": "assets/vehicles/porsche-911.jpg",
    "Porsche 911": "assets/vehicles/porsche-911.jpg",
    "Porsche": "assets/vehicles/porsche-911.jpg",
    "Mercedes Citaro": "assets/vehicles/mercedes-citaro.jpg",
    "Mercedes-Benz": "assets/vehicles/mercedes-sprinter.jpg",
    "Mercedes": "assets/vehicles/mercedes-citaro.jpg",
    "Ducati Panigale V4": "assets/vehicles/ducati-panigale.jpg",
    "Ducati Panigale": "assets/vehicles/ducati-panigale.jpg",
    "Ducati": "assets/vehicles/ducati-panigale.jpg",
    "Ford F-150 Lightning": "assets/vehicles/ford-f150.jpg",
    "Ford F-150": "assets/vehicles/ford-f150.jpg",
    "Ford": "assets/vehicles/ford-f150.jpg",
    "Tesla Model S": "assets/vehicles/tesla-model-s.jpg",
    "Tesla Model 3": "assets/vehicles/tesla-model-s.jpg",
    "Tesla": "assets/vehicles/tesla-model-s.jpg",
    "Volvo 9700": "assets/vehicles/volvo-9700.jpg",
    "Volvo Coach": "assets/vehicles/volvo-9700.jpg",
    "Volvo": "assets/vehicles/volvo-9700.jpg",
    "Royal Enfield Interceptor": "assets/vehicles/royal-enfield.jpg",
    "Royal Enfield": "assets/vehicles/royal-enfield.jpg",
    "BYD K9": "assets/vehicles/byd-k9.jpg",
    "BYD": "assets/vehicles/byd-k9.jpg",
    "Toyota GR Supra": "assets/vehicles/toyota-gr-corolla.jpg",
    "Toyota Supra": "assets/vehicles/toyota-gr-corolla.jpg",
    "Toyota Crown": "assets/vehicles/toyota-gr-corolla.jpg",
    "Toyota": "assets/vehicles/toyota-gr-corolla.jpg",
    "BMW M1000": "assets/vehicles/bmw-m1000rr.jpg",
    "BMW M3": "assets/vehicles/bmw-m5.jpg",
    "BMW": "assets/vehicles/bmw-m5.jpg",
    "Audi RS7": "assets/vehicles/audi-rs7.jpg",
    "Audi": "assets/vehicles/audi-rs7.jpg",
    "Lamborghini Huracan": "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
    "Lamborghini": "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
    "Ferrari 296": "assets/vehicles/ferrari-sf90.jpg",
    "Ferrari": "assets/vehicles/ferrari-sf90.jpg",
    "McLaren": "assets/vehicles/mclaren-750s.jpg",
    "Yamaha YZF-R1": "assets/vehicles/yamaha-r1.jpg",
    "Yamaha YZF": "assets/vehicles/yamaha-r1.jpg",
    "Yamaha": "assets/vehicles/yamaha-r1.jpg",
    "Kawasaki Ninja ZX-6R": "assets/vehicles/kawasaki-ninja.jpg",
    "Kawasaki Ninja": "assets/vehicles/kawasaki-ninja.jpg",
    "Kawasaki": "assets/vehicles/kawasaki-ninja.jpg",
    "Suzuki GSX-R1000": "assets/vehicles/suzuki-gsxr.jpg",
    "Suzuki GSX": "assets/vehicles/suzuki-gsxr.jpg",
    "Suzuki": "assets/vehicles/suzuki-gsxr.jpg",
    "Harley-Davidson": "assets/vehicles/harley-davidson.jpg",
    "Lexus LC": "assets/vehicles/lexus-lfa.jpg",
    "Lexus": "assets/vehicles/lexus-lfa.jpg",
    "Mazda RX-7": "assets/vehicles/mazda-mx5.jpg",
    "Mazda": "assets/vehicles/mazda-mx5.jpg",
    "Subaru WRX": "assets/vehicles/subaru-wrx.jpg",
    "Subaru": "assets/vehicles/subaru-wrx.jpg",
    "Mitsubishi Lancer": "assets/vehicles/mitsubishi-lancer.jpg",
    "Mitsubishi": "assets/vehicles/mitsubishi-lancer.jpg",
    "KTM": "assets/vehicles/ktm-super-duke.jpg",
    "Triumph": "assets/vehicles/triumph-speed-triple.jpg",
    "MV Agusta": "https://upload.wikimedia.org/wikipedia/commons/3/3f/Ducati_Panigale_V4.jpg",
    "Piaggio": "https://upload.wikimedia.org/wikipedia/commons/5/54/Honda_Super_Cub_125.jpg",
    "Zero": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Tesla_Model_S_long_range.jpg",
    "Aprilia": "https://upload.wikimedia.org/wikipedia/commons/3/3f/Ducati_Panigale_V4.jpg",
    "Scania": "assets/vehicles/volvo-9700.jpg",
    "MAN": "assets/vehicles/mercedes-citaro.jpg",
    "Alexander Dennis": "https://upload.wikimedia.org/wikipedia/commons/d/d0/Mercedes-Benz_Citaro_G_(W639)_Frontline.jpg",
    "New Flyer": "assets/vehicles/mercedes-citaro.jpg",
    "Gillig": "assets/vehicles/mercedes-citaro.jpg",
    "Wrightbus": "assets/vehicles/mercedes-citaro.jpg",
    "Yutong": "assets/vehicles/yutong-e12.jpg"
};

const brandColors = {
    "Nissan": "c62828", "Honda": "ff5722", "Porsche": "d32f2f", "Mercedes": "1565c0",
    "Ducati": "b71c1c", "Ford": "283593", "Tesla": "c62828", "Volvo": "263238",
    "Royal Enfield": "33691e", "BYD": "00838f", "Toyota": "d32f2f", "BMW": "1565c0",
    "Audi": "c62828", "Lamborghini": "ffb300", "Ferrari": "c62828", "McLaren": "fbc02d",
    "Yamaha": "0d47a1", "Kawasaki": "00695c", "Suzuki": "01579b", "Harley-Davidson": "bf360c",
    "Lexus": "0d47a1", "Mazda": "0d47a1", "Subaru": "0d47a1", "Mitsubishi": "1565c0",
    "Aprilia": "e63946", "KTM": "ff6700", "MV Agusta": "cc0000", "Triumph": "1a1a1a",
    "Piaggio": "1e90ff", "Zero": "2d2d2d", "Scania": "007bff", "MAN": "fdb813",
    "Alexander Dennis": "dc143c", "New Flyer": "ffc107", "Gillig": "4a90d9", "Wrightbus": "228b22",
    "Yutong": "0066cc"
};

function getCarImage(brand, model) {
    const fullName = `${brand} ${model || ''}`.trim();

    // Exact full name match first
    if (imageDatabase[fullName]) return imageDatabase[fullName];

    // Brand + first word of model
    const brandModel = `${brand} ${(model || '').split(' ')[0]}`;
    if (imageDatabase[brandModel]) return imageDatabase[brandModel];

    // Brand only
    if (imageDatabase[brand]) return imageDatabase[brand];

    // Partial match
    for (const [key, url] of Object.entries(imageDatabase)) {
        if (fullName.toLowerCase().startsWith(key.toLowerCase())) return url;
    }

    // imagin.studio live fallback with correct make/model
    const makeSlug = brand.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const modelSlug = (model || '').toLowerCase().split(' ')[0].replace(/[^a-z0-9-]/g, '');
    return `https://cdn.imagin.studio/getimage?customer=img&make=${makeSlug}&modelFamily=${modelSlug}&paintId=color-white&angle=01&width=800`;
}

// Filter options data
const filterOptions = {
    fuelTypes: ["Gasoline", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"],
    bodyStyles: ["Sedan", "SUV", "Coupe", "Convertible", "Truck", "Van", "Hatchback", "Wagon"],
    drivetrains: ["AWD", "RWD", "FWD", "4WD"],
    conditions: ["New", "Used", "Certified Pre-Owned"],
    years: [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015],
    colors: ["Black", "White", "Silver", "Gray", "Red", "Blue", "Green", "Yellow", "Orange", "Brown", "Gold", "Beige"]
};

let inventory = [
    { id: 1, brand: "Acura", model: "NSX", price: 165000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Hybrid", drivetrain: "AWD", bodyStyle: "Coupe", color: "Black", img: getCarImage("Acura", "NSX"), engine: "3.5L Twin Turbo Hybrid", horsepower: 573, transmission: "9-Speed DCT", availability: "In Stock", warranty: "4 Years/50k Miles", rating: 4.8 },
    { id: 2, brand: "Alfa Romeo", model: "Giulia Quadrifoglio", price: 95000, nation: "Italy", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Sedan", color: "Red", img: getCarImage("Alfa Romeo", "Giulia"), engine: "2.9L Twin Turbo V6", horsepower: 505, transmission: "8-Speed Auto", availability: "In Stock", warranty: "4 Years/50k Miles", rating: 4.7 },
    { id: 3, brand: "Aston Martin", model: "DB12", price: 245000, nation: "UK", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Coupe", color: "Silver", img: getCarImage("Aston Martin", "DB12"), engine: "5.2L Twin Turbo V12", horsepower: 680, transmission: "8-Speed Auto", availability: "Low Stock", warranty: "3 Years/Unlimited", rating: 4.9 },
    { id: 4, brand: "Bentley", model: "Continental GT", price: 215000, nation: "UK", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "Coupe", color: "Blue", img: getCarImage("Bentley", "Continental GT"), engine: "6.0L Twin Turbo W12", horsepower: 626, transmission: "8-Speed Auto", availability: "In Stock", warranty: "3 Years/Unlimited", rating: 4.9 },
    { id: 5, brand: "BMW", model: "M5 Competition", price: 105000, nation: "Germany", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "Sedan", color: "Gray", img: getCarImage("BMW", "M5"), engine: "4.4L Twin Turbo V8", horsepower: 617, transmission: "8-Speed Auto", availability: "In Stock", warranty: "4 Years/50k Miles", rating: 4.8 },
    { id: 6, brand: "Bugatti", model: "Chiron", price: 350000, nation: "France", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "Coupe", color: "Blue", img: getCarImage("Bugatti", "Chiron"), engine: "8.0L Quad Turbo W16", horsepower: 1500, transmission: "7-Speed DCT", availability: "Pre-Order", warranty: "3 Years/Unlimited", rating: 5.0 },
    { id: 7, brand: "Buick", model: "Enclave", price: 45000, nation: "USA", category: "Car", condition: "Certified Pre-Owned", year: 2024, mileage: 25000, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "SUV", color: "White", img: getCarImage("Buick", "Enclave"), engine: "3.6L V6", horsepower: 310, transmission: "9-Speed Auto", availability: "In Stock", warranty: "6 Years/70k Miles", rating: 4.3 },
    { id: 8, brand: "Cadillac", model: "Escalade", price: 105000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "4WD", bodyStyle: "SUV", color: "Black", img: getCarImage("Cadillac", "Escalade"), engine: "6.2L V8", horsepower: 420, transmission: "10-Speed Auto", availability: "In Stock", warranty: "6 Years/70k Miles", rating: 4.6 },
    { id: 9, brand: "Chevrolet", model: "Corvette Z06", price: 125000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Coupe", color: "Red", img: getCarImage("Chevrolet", "Corvette"), engine: "5.5L V8", horsepower: 670, transmission: "8-Speed DCT", availability: "In Stock", warranty: "3 Years/36k Miles", rating: 4.9 },
    { id: 10, brand: "Chrysler", model: "Pacifica", price: 42000, nation: "USA", category: "Car", condition: "Used", year: 2023, mileage: 35000, fuel: "Hybrid", drivetrain: "FWD", bodyStyle: "Van", color: "Gray", img: getCarImage("Chrysler", "Pacifica"), engine: "3.6L V6 Hybrid", horsepower: 260, transmission: "eCVT", availability: "In Stock", warranty: "3 Years/36k Miles", rating: 4.2 },
    { id: 11, brand: "Dodge", model: "Challenger SRT Hellcat", price: 78000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Coupe", color: "Black", img: getCarImage("Dodge", "Challenger"), engine: "6.2L Supercharged V8", horsepower: 717, transmission: "6-Speed Manual", availability: "Low Stock", warranty: "3 Years/36k Miles", rating: 4.7 },
    { id: 12, brand: "Ferrari", model: "SF90 Stradale", price: 520000, nation: "Italy", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Plug-in Hybrid", drivetrain: "AWD", bodyStyle: "Coupe", color: "Red", img: getCarImage("Ferrari", "SF90"), engine: "4.0L Twin Turbo V8 Hybrid", horsepower: 985, transmission: "8-Speed DCT", availability: "Pre-Order", warranty: "3 Years/Unlimited", rating: 5.0 },
    { id: 13, brand: "Ford", model: "Mustang Dark Horse", price: 58000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Coupe", color: "Gray", img: getCarImage("Ford", "Mustang"), engine: "5.0L V8", horsepower: 500, transmission: "10-Speed Auto", availability: "In Stock", warranty: "3 Years/36k Miles", rating: 4.6 },
    { id: 14, brand: "GMC", model: "Sierra Denali", price: 85000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "4WD", bodyStyle: "Truck", color: "Black", img: getCarImage("GMC", "Sierra"), engine: "6.6L Duramax Diesel", horsepower: 470, transmission: "10-Speed Auto", availability: "In Stock", warranty: "5 Years/100k Miles", rating: 4.5 },
    { id: 15, brand: "Honda", model: "Civic Type R", price: 48000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "Hatchback", color: "Red", img: getCarImage("Honda", "Civic Type R"), engine: "2.0L Turbo", horsepower: 315, transmission: "6-Speed Manual", availability: "In Stock", warranty: "3 Years/36k Miles", rating: 4.7 },
    { id: 16, brand: "Hyundai", model: "Ioniq 5", price: 52000, nation: "South Korea", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "AWD", bodyStyle: "SUV", color: "Silver", img: getCarImage("Hyundai", "Ioniq 5"), engine: "Dual Motor AWD", horsepower: 320, transmission: "1-Speed", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.5 },
    { id: 17, brand: "Infiniti", model: "QX80", price: 78000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "4WD", bodyStyle: "SUV", color: "Black", img: getCarImage("Infiniti", "QX80"), engine: "5.6L V8", horsepower: 400, transmission: "7-Speed Auto", availability: "Low Stock", warranty: "4 Years/60k Miles", rating: 4.4 },
    { id: 18, brand: "Jaguar", model: "F-PACE SVR", price: 95000, nation: "UK", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "SUV", color: "Blue", img: getCarImage("Jaguar", "F-PACE"), engine: "5.0L Supercharged V8", horsepower: 542, transmission: "8-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.6 },
    { id: 19, brand: "Jeep", model: "Wrangler Rubicon", price: 55000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "4WD", bodyStyle: "SUV", color: "Green", img: getCarImage("Jeep", "Wrangler"), engine: "3.6L V6", horsepower: 285, transmission: "8-Speed Auto", availability: "In Stock", warranty: "3 Years/36k Miles", rating: 4.5 },
    { id: 20, brand: "Kia", model: "EV9", price: 65000, nation: "South Korea", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "AWD", bodyStyle: "SUV", color: "Silver", img: getCarImage("Kia", "EV9"), engine: "Dual Motor AWD", horsepower: 380, transmission: "1-Speed", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.6 },
    { id: 21, brand: "Koenigsegg", model: "Regera", price: 2500000, nation: "Sweden", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Hybrid", drivetrain: "RWD", bodyStyle: "Coupe", color: "Blue", img: getCarImage("Koenigsegg", "Regera"), engine: "5.0L Twin Turbo V8 Hybrid", horsepower: 1500, transmission: "9-Speed DCT", availability: "Pre-Order", warranty: "3 Years/Unlimited", rating: 5.0 },
    { id: 22, brand: "Lamborghini", model: "Revuelto", price: 600000, nation: "Italy", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Plug-in Hybrid", drivetrain: "AWD", bodyStyle: "Coupe", color: "Yellow", img: getCarImage("Lamborghini", "Revuelto"), engine: "6.5L V12 Hybrid", horsepower: 1001, transmission: "8-Speed DCT", availability: "Pre-Order", warranty: "3 Years/Unlimited", rating: 5.0 },
    { id: 23, brand: "Land Rover", model: "Range Rover Sport", price: 95000, nation: "UK", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "SUV", color: "Black", img: getCarImage("Land Rover", "Range Rover"), engine: "4.4L Twin Turbo V8", horsepower: 523, transmission: "8-Speed Auto", availability: "Low Stock", warranty: "4 Years/50k Miles", rating: 4.7 },
    { id: 24, brand: "Lexus", model: "LFA", price: 500000, nation: "Japan", category: "Car", condition: "Used", year: 2015, mileage: 15000, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Coupe", color: "White", img: getCarImage("Lexus", "LFA"), engine: "4.8L V10", horsepower: 552, transmission: "6-Speed Auto", availability: "In Stock", warranty: "4 Years/50k Miles", rating: 4.9 },
    { id: 25, brand: "Lincoln", model: "Navigator", price: 82000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "4WD", bodyStyle: "SUV", color: "Black", img: getCarImage("Lincoln", "Navigator"), engine: "3.5L Twin Turbo V6", horsepower: 440, transmission: "10-Speed Auto", availability: "In Stock", warranty: "4 Years/50k Miles", rating: 4.5 },
    { id: 26, brand: "Lotus", model: "Emira", price: 95000, nation: "UK", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Coupe", color: "Yellow", img: getCarImage("Lotus", "Emira"), engine: "3.5L V6 Supercharged", horsepower: 400, transmission: "6-Speed Manual", availability: "In Stock", warranty: "3 Years/36k Miles", rating: 4.8 },
    { id: 27, brand: "Maserati", model: "MC20", price: 215000, nation: "Italy", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Coupe", color: "White", img: getCarImage("Maserati", "MC20"), engine: "3.0L Twin Turbo V6", horsepower: 621, transmission: "8-Speed DCT", availability: "In Stock", warranty: "4 Years/50k Miles", rating: 4.8 },
    { id: 28, brand: "McLaren", model: "750S", price: 320000, nation: "UK", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Coupe", color: "Orange", img: getCarImage("McLaren", "750S"), engine: "4.0L Twin Turbo V8", horsepower: 740, transmission: "7-Speed DCT", availability: "Pre-Order", warranty: "3 Years/Unlimited", rating: 4.9 },
    { id: 29, brand: "Mercedes-AMG", model: "GT Black Series", price: 325000, nation: "Germany", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Coupe", color: "Black", img: getCarImage("Mercedes", "AMG GT"), engine: "4.0L Twin Turbo V8", horsepower: 730, transmission: "7-Speed DCT", availability: "Pre-Order", warranty: "3 Years/Unlimited", rating: 4.9 },
    { id: 30, brand: "Mini", model: "John Cooper Works GP", price: 45000, nation: "UK", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "Hatchback", color: "Red", img: getCarImage("Mini", "JCW"), engine: "2.0L Turbo", horsepower: 301, transmission: "8-Speed Auto", availability: "In Stock", warranty: "4 Years/50k Miles", rating: 4.5 },
    { id: 31, brand: "Mitsubishi", model: "Lancer Evolution", price: 55000, nation: "Japan", category: "Car", condition: "Used", year: 2015, mileage: 45000, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "Sedan", color: "Red", img: getCarImage("Mitsubishi", "Lancer Evolution"), engine: "2.0L Turbo", horsepower: 303, transmission: "5-Speed Manual", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.6 },
    { id: 32, brand: "Nissan", model: "GT-R R35", price: 115000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "Coupe", color: "Silver", img: getCarImage("Nissan", "GT-R"), engine: "3.8L Twin Turbo V6", horsepower: 600, transmission: "6-Speed DCT", availability: "In Stock", warranty: "3 Years/36k Miles", rating: 4.7 },
    { id: 33, brand: "Pagani", model: "Utopia", price: 2100000, nation: "Italy", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Coupe", color: "Blue", img: getCarImage("Pagani", "Utopia"), engine: "6.0L Twin Turbo V12", horsepower: 852, transmission: "7-Speed Manual", availability: "Pre-Order", warranty: "3 Years/Unlimited", rating: 5.0 },
    { id: 34, brand: "Peugeot", model: "508 PSE", price: 68000, nation: "France", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Plug-in Hybrid", drivetrain: "AWD", bodyStyle: "Sedan", color: "Gray", img: getCarImage("Peugeot", "508"), engine: "2.0L Turbo Hybrid", horsepower: 360, transmission: "8-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.4 },
    { id: 35, brand: "Polestar", model: "Polestar 3", price: 85000, nation: "Sweden", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "AWD", bodyStyle: "SUV", color: "Black", img: getCarImage("Polestar", "3"), engine: "Dual Motor AWD", horsepower: 489, transmission: "1-Speed", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.6 },
    { id: 36, brand: "Porsche", model: "911 Dakar", price: 165000, nation: "Germany", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "Coupe", color: "Orange", img: getCarImage("Porsche", "911 Dakar"), engine: "3.0L Twin Turbo", horsepower: 473, transmission: "8-Speed PDK", availability: "Low Stock", warranty: "4 Years/50k Miles", rating: 4.8 },
    { id: 37, brand: "Ram", model: "1500 TRX", price: 95000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "4WD", bodyStyle: "Truck", color: "Green", img: getCarImage("Ram", "1500"), engine: "6.2L Supercharged V8", horsepower: 702, transmission: "8-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.7 },
    { id: 38, brand: "Renault", model: "Megane RS", price: 48000, nation: "France", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "Hatchback", color: "Yellow", img: getCarImage("Renault", "Megane RS"), engine: "1.8L Turbo", horsepower: 295, transmission: "6-Speed Manual", availability: "In Stock", warranty: "3 Years/60k Miles", rating: 4.5 },
    { id: 39, brand: "Rolls-Royce", model: "Spectre", price: 420000, nation: "UK", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "AWD", bodyStyle: "Coupe", color: "White", img: getCarImage("Rolls Royce", "Spectre"), engine: "Dual Motor AWD", horsepower: 577, transmission: "1-Speed", availability: "Low Stock", warranty: "4 Years/Unlimited", rating: 5.0 },
    { id: 40, brand: "Subaru", model: "WRX STI", price: 50000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "Sedan", color: "Blue", img: getCarImage("Subaru", "WRX STI"), engine: "2.5L Turbo", horsepower: 310, transmission: "6-Speed Manual", availability: "In Stock", warranty: "3 Years/36k Miles", rating: 4.6 },
    { id: 41, brand: "Tesla", model: "Roadster", price: 45000, nation: "USA", category: "Car", condition: "Used", year: 2020, mileage: 25000, fuel: "Electric", drivetrain: "RWD", bodyStyle: "Convertible", color: "Red", img: getCarImage("Tesla", "Roadster"), engine: "3 Motor RWD", horsepower: 292, transmission: "1-Speed", availability: "In Stock", warranty: "4 Years/50k Miles", rating: 4.5 },
    { id: 42, brand: "Toyota", model: "GR Corolla", price: 42000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "Hatchback", color: "White", img: getCarImage("Toyota", "GR Corolla"), engine: "1.6L Turbo", horsepower: 300, transmission: "6-Speed Manual", availability: "In Stock", warranty: "3 Years/36k Miles", rating: 4.7 },
    { id: 43, brand: "Volkswagen", model: "Golf R", price: 52000, nation: "Germany", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "Hatchback", color: "Blue", img: getCarImage("Volkswagen", "Golf R"), engine: "2.0L Turbo", horsepower: 315, transmission: "7-Speed DCT", availability: "In Stock", warranty: "4 Years/50k Miles", rating: 4.6 },
    { id: 44, brand: "Volvo", model: "XC90 Recharge", price: 78000, nation: "Sweden", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Plug-in Hybrid", drivetrain: "AWD", bodyStyle: "SUV", color: "Black", img: getCarImage("Volvo", "XC90"), engine: "2.0L Supercharged Hybrid", horsepower: 455, transmission: "8-Speed Auto", availability: "In Stock", warranty: "4 Years/50k Miles", rating: 4.7 },
    { id: 45, brand: "Genesis", model: "GV80", price: 65000, nation: "South Korea", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "SUV", color: "White", img: getCarImage("Genesis", "GV80"), engine: "2.5L Turbo", horsepower: 300, transmission: "8-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.5 },
    { id: 46, brand: "Lucid", model: "Air Sapphire", price: 249000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "AWD", bodyStyle: "Sedan", color: "Blue", img: getCarImage("Lucid", "Air"), engine: "Tri Motor AWD", horsepower: 1234, transmission: "1-Speed", availability: "Pre-Order", warranty: "4 Years/50k Miles", rating: 4.9 },
    { id: 47, brand: "Rimac", model: "Nevera", price: 2200000, nation: "Croatia", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "AWD", bodyStyle: "Coupe", color: "Black", img: getCarImage("Rimac", "Nevera"), engine: "Quad Motor AWD", horsepower: 1914, transmission: "1-Speed", availability: "Pre-Order", warranty: "3 Years/Unlimited", rating: 5.0 },
    { id: 48, brand: "Pininfarina", model: "Battista", price: 2200000, nation: "Italy", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "AWD", bodyStyle: "Coupe", color: "Red", img: getCarImage("Pininfarina", "Battista"), engine: "Quad Motor AWD", horsepower: 1900, transmission: "1-Speed", availability: "Pre-Order", warranty: "3 Years/Unlimited", rating: 5.0 },
    { id: 49, brand: "Hennessey", model: "Venom F5", price: 1800000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Coupe", color: "Black", img: getCarImage("Hennessey", "Venom"), engine: "6.6L Twin Turbo V8", horsepower: 1842, transmission: "6-Speed DCT", availability: "Pre-Order", warranty: "3 Years/36k Miles", rating: 5.0 },
    { id: 50, brand: "Ferrari", model: "Daytona SP3", price: 2200000, nation: "Italy", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Coupe", color: "Red", img: getCarImage("Ferrari", "Daytona"), engine: "6.5L V12", horsepower: 840, transmission: "8-Speed DCT", availability: "Pre-Order", warranty: "3 Years/Unlimited", rating: 5.0 },
    
    // ========== MOTORCYCLES ==========
    { id: 51, brand: "Ducati", model: "Panigale V4 R", price: 42000, nation: "Italy", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Sport", color: "Red", img: getCarImage("Ducati", "Panigale"), engine: "999cc V4", horsepower: 234, transmission: "6-Speed", availability: "Low Stock", warranty: "2 Years/Unlimited", rating: 4.9 },
    { id: 52, brand: "Yamaha", model: "YZF-R1M", price: 28000, nation: "Japan", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Sport", color: "Blue", img: getCarImage("Yamaha", "YZF-R1"), engine: "998cc Inline-4", horsepower: 200, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/20k Miles", rating: 4.8 },
    { id: 53, brand: "Kawasaki", model: "Ninja ZX-10RR", price: 32000, nation: "Japan", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Sport", color: "Green", img: getCarImage("Kawasaki", "Ninja"), engine: "998cc Inline-4", horsepower: 204, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/Unlimited", rating: 4.7 },
    { id: 54, brand: "BMW", model: "M1000 RR", price: 35000, nation: "Germany", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Sport", color: "Black", img: getCarImage("BMW", "M1000"), engine: "999cc Inline-4", horsepower: 205, transmission: "6-Speed", availability: "In Stock", warranty: "3 Years/Unlimited", rating: 4.8 },
    { id: 55, brand: "Suzuki", model: "GSX-R1000", price: 24000, nation: "Japan", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Sport", color: "Blue", img: getCarImage("Suzuki", "GSX-R"), engine: "999cc Inline-4", horsepower: 202, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/20k Miles", rating: 4.7 },
    { id: 56, brand: "Honda", model: "CBR1000RR-R Fireblade", price: 30000, nation: "Japan", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Sport", color: "Red", img: getCarImage("Honda", "CBR1000"), engine: "1000cc Inline-4", horsepower: 215, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/Unlimited", rating: 4.8 },
    { id: 57, brand: "Aprilia", model: "RS 125", price: 12000, nation: "Italy", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Sport", color: "White", img: getCarImage("Aprilia", "RS"), engine: "125cc Single", horsepower: 15, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/10k Miles", rating: 4.5 },
    { id: 58, brand: "Harley-Davidson", model: "Road Glide", price: 25000, nation: "USA", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Touring", color: "Black", img: getCarImage("Harley-Davidson", "Road Glide"), engine: "1868cc V-Twin", horsepower: 90, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/Unlimited", rating: 4.6 },
    { id: 59, brand: "Triumph", model: "Speed Triple 1200 RS", price: 22000, nation: "UK", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Naked", color: "Black", img: getCarImage("Triumph", "Speed Triple"), engine: "1160cc Triple", horsepower: 180, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/Unlimited", rating: 4.8 },
    { id: 60, brand: "MV Agusta", model: "F4 RC", price: 45000, nation: "Italy", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Sport", color: "Red", img: getCarImage("MV Agusta", "F4"), engine: "998cc Inline-4", horsepower: 212, transmission: "6-Speed", availability: "Pre-Order", warranty: "3 Years/Unlimited", rating: 4.9 },
    { id: 61, brand: "KTM", model: "1290 Super Duke R", price: 26000, nation: "Austria", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Naked", color: "Orange", img: getCarImage("KTM", "Super Duke"), engine: "1301cc V-Twin", horsepower: 180, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/Unlimited", rating: 4.7 },
    { id: 62, brand: "Ducati", model: "Multistrada V4", price: 28000, nation: "Italy", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Adventure", color: "Red", img: getCarImage("Ducati", "Multistrada"), engine: "1260cc V4", horsepower: 170, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/Unlimited", rating: 4.8 },
    { id: 63, brand: "Royal Enfield", model: "Interceptor 650", price: 7000, nation: "India", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Standard", color: "Gray", img: getCarImage("Royal Enfield", "Interceptor"), engine: "648cc Parallel-Twin", horsepower: 47, transmission: "6-Speed", availability: "In Stock", warranty: "3 Years/30k Miles", rating: 4.4 },
    { id: 64, brand: "Piaggio", model: "Vespa GTS 300", price: 7500, nation: "Italy", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Scooter", color: "White", img: getCarImage("Piaggio", "Vespa"), engine: "278cc Single", horsepower: 26, transmission: "CVT", availability: "In Stock", warranty: "2 Years/Unlimited", rating: 4.3 },
    { id: 65, brand: "Zero Motorcycles", model: "SR/F", price: 23000, nation: "USA", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "RWD", bodyStyle: "Standard", color: "Black", img: getCarImage("Zero", "SR-F"), engine: "Z-Force 75-10", horsepower: 110, transmission: "1-Speed", availability: "In Stock", warranty: "5 Years/100k Miles", rating: 4.6 },

    // ========== BUSES ==========
    { id: 66, brand: "Mercedes-Benz", model: "Citaro", price: 350000, nation: "Germany", category: "Bus", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "RWD", bodyStyle: "City Bus", color: "White", img: getCarImage("Mercedes", "Citaro"), engine: "7.7L Diesel", horsepower: 354, transmission: "6-Speed Auto", availability: "In Stock", warranty: "3 Years/100k Miles", rating: 4.5 },
    { id: 67, brand: "Volvo", model: "9700", price: 420000, nation: "Sweden", category: "Bus", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "RWD", bodyStyle: "Coach", color: "Blue", img: getCarImage("Volvo", "9700"), engine: "12.8L Diesel", horsepower: 460, transmission: "8-Speed Auto", availability: "In Stock", warranty: "3 Years/150k Miles", rating: 4.7 },
    { id: 68, brand: "Scania", model: "K series", price: 380000, nation: "Sweden", category: "Bus", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "RWD", bodyStyle: "Coach", color: "White", img: getCarImage("Scania", "K-series"), engine: "12.4L Diesel", horsepower: 410, transmission: "8-Speed Auto", availability: "Low Stock", warranty: "3 Years/100k Miles", rating: 4.6 },
    { id: 69, brand: "MAN", model: "Lion's Coach", price: 390000, nation: "Germany", category: "Bus", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "RWD", bodyStyle: "Coach", color: "Yellow", img: getCarImage("MAN", "Lion's Coach"), engine: "12.4L Diesel", horsepower: 420, transmission: "8-Speed Auto", availability: "In Stock", warranty: "3 Years/150k Miles", rating: 4.6 },
    { id: 70, brand: "Alexander Dennis", model: "Enviro500", price: 320000, nation: "UK", category: "Bus", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "RWD", bodyStyle: "Double Decker", color: "Red", img: getCarImage("Alexander Dennis", "Enviro500"), engine: "9.3L Diesel", horsepower: 340, transmission: "6-Speed Auto", availability: "In Stock", warranty: "3 Years/100k Miles", rating: 4.4 },
    { id: 71, brand: "BYD", model: "K9", price: 280000, nation: "China", category: "Bus", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "RWD", bodyStyle: "City Bus", color: "Blue", img: getCarImage("BYD", "K9"), engine: "Dual Motor Electric", horsepower: 300, transmission: "1-Speed", availability: "In Stock", warranty: "8 Years/500k Miles", rating: 4.5 },
    { id: 72, brand: "New Flyer", model: "Xcelsior", price: 350000, nation: "USA", category: "Bus", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "RWD", bodyStyle: "City Bus", color: "Yellow", img: getCarImage("New Flyer", "Xcelsior"), engine: "8.9L Diesel", horsepower: 320, transmission: "6-Speed Auto", availability: "In Stock", warranty: "3 Years/100k Miles", rating: 4.4 },
    { id: 73, brand: "Gillig", model: "Low Floor", price: 320000, nation: "USA", category: "Bus", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "RWD", bodyStyle: "City Bus", color: "White", img: getCarImage("Gillig", "Low Floor"), engine: "8.9L Diesel", horsepower: 300, transmission: "6-Speed Auto", availability: "In Stock", warranty: "3 Years/100k Miles", rating: 4.3 },
    { id: 74, brand: "Wrightbus", model: "Streetdeck", price: 300000, nation: "UK", category: "Bus", condition: "New", year: 2026, mileage: 0, fuel: "Hybrid", drivetrain: "RWD", bodyStyle: "Double Decker", color: "Red", img: getCarImage("Wrightbus", "Streetdeck"), engine: "4.5L Hybrid", horsepower: 220, transmission: "6-Speed Auto", availability: "In Stock", warranty: "3 Years/100k Miles", rating: 4.5 },
    { id: 75, brand: "Yutong", model: "E12", price: 250000, nation: "China", category: "Bus", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "RWD", bodyStyle: "Coach", color: "Blue", img: getCarImage("Yutong", "E12"), engine: "Dual Motor Electric", horsepower: 280, transmission: "1-Speed", availability: "In Stock", warranty: "8 Years/500k Miles", rating: 4.3 },

    // ========== TRUCKS ==========
    { id: 76, brand: "Ford", model: "F-150 Raptor", price: 78000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "4WD", bodyStyle: "Truck", color: "Black", img: getCarImage("Ford", "F-150"), engine: "3.0L EcoBoost V6", horsepower: 450, transmission: "10-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.7 },
    { id: 77, brand: "Chevrolet", model: "Silverado ZR2", price: 72000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "4WD", bodyStyle: "Truck", color: "White", img: getCarImage("Chevrolet", "Silverado"), engine: "6.2L V8", horsepower: 420, transmission: "10-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.6 },
    { id: 78, brand: "Ram", model: "2500 Power Wagon", price: 75000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "4WD", bodyStyle: "Truck", color: "Gray", img: getCarImage("Ram", "2500"), engine: "6.7L Diesel", horsepower: 410, transmission: "8-Speed Auto", availability: "Low Stock", warranty: "5 Years/60k Miles", rating: 4.5 },
    { id: 79, brand: "Toyota", model: "Tundra TRD Pro", price: 65000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "4WD", bodyStyle: "Truck", color: "White", img: getCarImage("Toyota", "Tundra"), engine: "3.4L Twin Turbo V6", horsepower: 389, transmission: "10-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.6 },
    { id: 80, brand: "GMC", model: "Hummer EV", price: 110000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "4WD", bodyStyle: "Truck", color: "Green", img: getCarImage("GMC", "Hummer"), engine: "Tri Motor", horsepower: 1000, transmission: "1-Speed", availability: "In Stock", warranty: "8 Years/100k Miles", rating: 4.8 },
    { id: 81, brand: "Nissan", model: "Frontier Pro-4X", price: 42000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "4WD", bodyStyle: "Truck", color: "Red", img: getCarImage("Nissan", "Frontier"), engine: "3.8L V6", horsepower: 310, transmission: "9-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.4 },
    { id: 82, brand: "Rivian", model: "R1T", price: 73000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "4WD", bodyStyle: "Truck", color: "Black", img: getCarImage("Rivian", "R1T"), engine: "Quad Motor", horsepower: 800, transmission: "1-Speed", availability: "Low Stock", warranty: "6 Years/60k Miles", rating: 4.7 },

    // ========== VANS ==========
    { id: 83, brand: "Mercedes-Benz", model: "Sprinter", price: 55000, nation: "Germany", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "RWD", bodyStyle: "Van", color: "White", img: getCarImage("Mercedes", "Sprinter"), engine: "2.0L Diesel", horsepower: 188, transmission: "9-Speed Auto", availability: "In Stock", warranty: "5 Years/100k Miles", rating: 4.5 },
    { id: 84, brand: "Ford", model: "Transit", price: 48000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Van", color: "White", img: getCarImage("Ford", "Transit"), engine: "3.5L V6", horsepower: 310, transmission: "10-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.4 },
    { id: 85, brand: "Ram", model: "ProMaster", price: 42000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "Van", color: "White", img: getCarImage("Ram", "ProMaster"), engine: "3.6L V6", horsepower: 280, transmission: "6-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.3 },
    { id: 86, brand: "Toyota", model: "Sienna", price: 52000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Hybrid", drivetrain: "AWD", bodyStyle: "Van", color: "Silver", img: getCarImage("Toyota", "Sienna"), engine: "2.5L Hybrid", horsepower: 245, transmission: "eCVT", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.6 },
    { id: 87, brand: "Honda", model: "Odyssey", price: 48000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "Van", color: "White", img: getCarImage("Honda", "Odyssey"), engine: "3.5L V6", horsepower: 280, transmission: "10-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.5 },
    { id: 88, brand: "Chevrolet", model: "Express", price: 38000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Van", color: "White", img: getCarImage("Chevrolet", "Express"), engine: "4.3L V6", horsepower: 276, transmission: "8-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.2 },
    { id: 89, brand: "Nissan", model: "NV3500", price: 45000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Van", color: "White", img: getCarImage("Nissan", "NV"), engine: "5.6L V8", horsepower: 375, transmission: "7-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.3 },
    { id: 90, brand: "Kia", model: "Carnival", price: 42000, nation: "South Korea", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "Van", color: "White", img: getCarImage("Kia", "Carnival"), engine: "3.5L V6", horsepower: 290, transmission: "8-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.4 },

    // ========== SCOOTERS ==========
    { id: 91, brand: "Honda", model: "PCX 150", price: 3600, nation: "Japan", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Scooter", color: "White", img: getCarImage("Honda", "PCX"), engine: "149cc Single", horsepower: 15, transmission: "CVT", availability: "In Stock", warranty: "2 Years/10k Miles", rating: 4.3 },
    { id: 92, brand: "Yamaha", model: "NMAX", price: 4000, nation: "Japan", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Scooter", color: "Blue", img: getCarImage("Yamaha", "NMAX"), engine: "155cc Single", horsepower: 16, transmission: "CVT", availability: "In Stock", warranty: "2 Years/10k Miles", rating: 4.4 },
    { id: 93, brand: "Piaggio", model: "Medley 150", price: 4200, nation: "Italy", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Scooter", color: "White", img: getCarImage("Piaggio", "Medley"), engine: "150cc Single", horsepower: 16, transmission: "CVT", availability: "In Stock", warranty: "2 Years/10k Miles", rating: 4.3 },
    { id: 94, brand: "SYM", model: "Joymax", price: 3500, nation: "Taiwan", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Scooter", color: "Black", img: getCarImage("SYM", "Joymax"), engine: "125cc Single", horsepower: 12, transmission: "CVT", availability: "In Stock", warranty: "2 Years/10k Miles", rating: 4.1 },
    { id: 95, brand: "BMW", model: "C 400 GT", price: 8000, nation: "Germany", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Scooter", color: "Silver", img: getCarImage("BMW", "C400"), engine: "350cc Single", horsepower: 34, transmission: "CVT", availability: "In Stock", warranty: "3 Years/Unlimited", rating: 4.5 },
    { id: 96, brand: "TVS", model: "NTORQ", price: 2500, nation: "India", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Scooter", color: "Red", img: getCarImage("TVS", "NTORQ"), engine: "124.8cc Single", horsepower: 9, transmission: "CVT", availability: "In Stock", warranty: "5 Years/50k Miles", rating: 4.2 },

    // ========== MORE CARS - GLOBAL BRANDS ==========
    { id: 97, brand: "Audi", model: "RS e-tron GT", price: 145000, nation: "Germany", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "AWD", bodyStyle: "Sedan", color: "Black", img: getCarImage("Audi", "RS e-tron"), engine: "Dual Motor AWD", horsepower: 646, transmission: "2-Speed", availability: "In Stock", warranty: "4 Years/50k Miles", rating: 4.8 },
    { id: 98, brand: "Audi", model: "RS6 Avant", price: 135000, nation: "Germany", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "Wagon", color: "Gray", img: getCarImage("Audi", "RS6"), engine: "4.0L Twin Turbo V8", horsepower: 621, transmission: "8-Speed Auto", availability: "In Stock", warranty: "4 Years/50k Miles", rating: 4.7 },
    { id: 99, brand: "Audi", model: "R8 V10", price: 185000, nation: "Germany", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Coupe", color: "Yellow", img: getCarImage("Audi", "R8"), engine: "5.2L V10", horsepower: 602, transmission: "7-Speed DCT", availability: "Low Stock", warranty: "4 Years/50k Miles", rating: 4.9 },
    { id: 100, brand: "Mazda", model: "MX-5 Miata", price: 35000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Convertible", color: "Red", img: getCarImage("Mazda", "MX-5"), engine: "2.0L Skyactiv-G", horsepower: 181, transmission: "6-Speed Manual", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.7 },
    { id: 101, brand: "Mazda", model: "CX-90", price: 58000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "SUV", color: "White", img: getCarImage("Mazda", "CX-90"), engine: "3.3L Inline-6 Turbo", horsepower: 340, transmission: "8-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.6 },
    { id: 102, brand: "Acura", model: "MDX", price: 52000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "SUV", color: "White", img: getCarImage("Acura", "MDX"), engine: "3.5L V6", horsepower: 290, transmission: "10-Speed Auto", availability: "In Stock", warranty: "6 Years/70k Miles", rating: 4.5 },
    { id: 103, brand: "Acura", model: "TLX Type S", price: 58000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Sedan", color: "Blue", img: getCarImage("Acura", "TLX"), engine: "3.0L Turbo V6", horsepower: 355, transmission: "10-Speed Auto", availability: "In Stock", warranty: "6 Years/70k Miles", rating: 4.6 },
    { id: 104, brand: "Cupra", model: "Formentor", price: 48000, nation: "Spain", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "SUV", color: "Gray", img: getCarImage("Cupra", "Formentor"), engine: "2.0L Turbo", horsepower: 306, transmission: "7-Speed DCT", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.5 },
    { id: 105, brand: "Dacia", model: "Duster", price: 22000, nation: "France", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "SUV", color: "White", img: getCarImage("Dacia", "Duster"), engine: "1.3L Turbo", horsepower: 150, transmission: "6-Speed Manual", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.2 },
    { id: 106, brand: "Skoda", model: "Octavia RS", price: 42000, nation: "Czech Republic", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "Sedan", color: "White", img: getCarImage("Skoda", "Octavia"), engine: "2.0L Turbo", horsepower: 245, transmission: "7-Speed DCT", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.5 },
    { id: 107, brand: "Skoda", model: "Kodiaq RS", price: 55000, nation: "Czech Republic", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "AWD", bodyStyle: "SUV", color: "Black", img: getCarImage("Skoda", "Kodiaq"), engine: "2.0L Diesel", horsepower: 240, transmission: "7-Speed DCT", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.6 },
    { id: 108, brand: "Fiat", model: "500 Abarth", price: 28000, nation: "Italy", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "Hatchback", color: "Red", img: getCarImage("Fiat", "500"), engine: "1.4L Turbo", horsepower: 180, transmission: "5-Speed Manual", availability: "In Stock", warranty: "4 Years/50k Miles", rating: 4.3 },
    { id: 109, brand: "Jeep", model: "Grand Cherokee Trackhaw", price: 72000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "SUV", color: "Black", img: getCarImage("Jeep", "Grand Cherokee"), engine: "6.4L V8", horsepower: 470, transmission: "8-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.6 },
    { id: 110, brand: "Wuling", model: "Hongguang Mini EV", price: 8500, nation: "China", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "RWD", bodyStyle: "Hatchback", color: "White", img: getCarImage("Wuling", "Mini EV"), engine: "Single Motor", horsepower: 27, transmission: "1-Speed", availability: "In Stock", warranty: "3 Years/30k Miles", rating: 4.0 },
    { id: 111, brand: "Chery", model: "Tiggo 8", price: 32000, nation: "China", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "SUV", color: "White", img: getCarImage("Chery", "Tiggo"), engine: "1.6L Turbo", horsepower: 197, transmission: "7-Speed DCT", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.3 },
    { id: 112, brand: "Geely", model: "Coolray", price: 18000, nation: "China", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "SUV", color: "Red", img: getCarImage("Geely", "Coolray"), engine: "1.5L Turbo", horsepower: 177, transmission: "7-Speed DCT", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.4 },
    { id: 113, brand: "Haval", model: "H6", price: 25000, nation: "China", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "SUV", color: "White", img: getCarImage("Haval", "H6"), engine: "1.5L Turbo", horsepower: 150, transmission: "7-Speed DCT", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.2 },
    { id: 114, brand: "MG", model: "HS", price: 22000, nation: "China", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "SUV", color: "Red", img: getCarImage("MG", "HS"), engine: "1.5L Turbo", horsepower: 162, transmission: "6-Speed Manual", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.3 },
    { id: 115, brand: "Tata", model: "Safari", price: 28000, nation: "India", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "AWD", bodyStyle: "SUV", color: "Brown", img: getCarImage("Tata", "Safari"), engine: "2.0L Diesel", horsepower: 168, transmission: "6-Speed Manual", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.4 },
    { id: 116, brand: "Mahindra", model: "XUV500", price: 25000, nation: "India", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "AWD", bodyStyle: "SUV", color: "Black", img: getCarImage("Mahindra", "XUV500"), engine: "2.2L Diesel", horsepower: 185, transmission: "6-Speed Manual", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.3 },
    { id: 117, brand: "Isuzu", model: "D-Max", price: 28000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "4WD", bodyStyle: "Truck", color: "White", img: getCarImage("Isuzu", "D-Max"), engine: "1.9L Diesel", horsepower: 163, transmission: "6-Speed Manual", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.4 },
    { id: 118, brand: "Honda", model: "CR-V", price: 42000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Hybrid", drivetrain: "AWD", bodyStyle: "SUV", color: "White", img: getCarImage("Honda", "CR-V"), engine: "2.0L Hybrid", horsepower: 204, transmission: "eCVT", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.7 },
    { id: 119, brand: "Toyota", model: "Prado", price: 85000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "SUV", color: "Black", img: getCarImage("Toyota", "Prado"), engine: "2.7L V6", horsepower: 163, transmission: "6-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.8 },
    { id: 120, brand: "Toyota", model: "Land Cruiser 300", price: 95000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "SUV", color: "White", img: getCarImage("Toyota", "Land Cruiser"), engine: "3.4L Twin Turbo V6", horsepower: 409, transmission: "10-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.9 },
    
    // ========== LOCAL/AFRICAN VEHICLES ==========
    { id: 121, brand: "Toyota", model: "Voxy", price: 35000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "Van", color: "White", img: getCarImage("Toyota", "Voxy"), engine: "2.0L", horsepower: 170, transmission: "CVT", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.6 },
    { id: 122, brand: "Nissan", model: "Note e-Power", price: 28000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Hybrid", drivetrain: "FWD", bodyStyle: "Hatchback", color: "White", img: getCarImage("Nissan", "Note"), engine: "1.2L Hybrid", horsepower: 79, transmission: "1-Speed", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.3 },
    { id: 123, brand: "Honda", model: "Stepwgn", price: 32000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "Van", color: "White", img: getCarImage("Honda", "Stepwgn"), engine: "1.5L Turbo", horsepower: 150, transmission: "CVT", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.5 },
    { id: 124, brand: "Toyota", model: "Hiace", price: 45000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "RWD", bodyStyle: "Van", color: "White", img: getCarImage("Toyota", "Hiace"), engine: "2.8L Diesel", horsepower: 174, transmission: "6-Speed Manual", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.7 },
    { id: 125, brand: "Mitsubishi", model: "Xpander", price: 22000, nation: "Indonesia", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "SUV", color: "Silver", img: getCarImage("Mitsubishi", "Xpander"), engine: "1.5L", horsepower: 105, transmission: "4-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.2 },
    { id: 126, brand: "Perodua", model: "Alza", price: 18000, nation: "Malaysia", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "SUV", color: "White", img: getCarImage("Perodua", "Alza"), engine: "1.5L", horsepower: 103, transmission: "4-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.1 },
    { id: 127, brand: "Proton", model: "X90", price: 20000, nation: "Malaysia", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "SUV", color: "White", img: getCarImage("Proton", "X90"), engine: "1.5L Turbo", horsepower: 174, transmission: "6-Speed Auto", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.3 },
    { id: 128, brand: "Suzuki", model: "Ertiga", price: 18000, nation: "Indonesia", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "Van", color: "White", img: getCarImage("Suzuki", "Ertiga"), engine: "1.5L", horsepower: 103, transmission: "5-Speed Manual", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.2 },
    { id: 129, brand: "Daewoo", model: "Matiz", price: 12000, nation: "South Korea", category: "Car", condition: "Used", year: 2015, mileage: 45000, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "Hatchback", color: "Red", img: getCarImage("Daewoo", "Matiz"), engine: "0.8L", horsepower: 51, transmission: "5-Speed Manual", availability: "In Stock", warranty: "3 Years/30k Miles", rating: 3.8 },
    { id: 130, brand: "Chevrolet", model: "Joy", price: 15000, nation: "China", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "Hatchback", color: "Red", img: getCarImage("Chevrolet", "Joy"), engine: "1.5L", horsepower: 99, transmission: "5-Speed Manual", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.0 },
    
    // ========== MORE MOTORCYCLES ==========
    { id: 131, brand: "CFMoto", model: "450CL-C", price: 5500, nation: "China", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Cruiser", color: "Black", img: getCarImage("CFMoto", "450"), engine: "450cc Parallel Twin", horsepower: 40, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/20k Miles", rating: 4.2 },
    { id: 132, brand: "Benelli", model: "Leoncino 500", price: 6500, nation: "Italy", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Standard", color: "Gray", img: getCarImage("Benelli", "Leoncino"), engine: "500cc Parallel Twin", horsepower: 47, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/Unlimited", rating: 4.3 },
    { id: 133, brand: "Zontes", model: "GK350", price: 4800, nation: "China", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Naked", color: "Black", img: getCarImage("Zontes", "GK350"), engine: "348cc Single", horsepower: 38, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/20k Miles", rating: 4.1 },
    { id: 134, brand: "CFMoto", model: "NK150", price: 4200, nation: "China", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Naked", color: "Red", img: getCarImage("CFMoto", "NK150"), engine: "149cc Single", horsepower: 18, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/20k Miles", rating: 4.0 },
    { id: 135, brand: "Bajaj", model: "Pulsar NS200", price: 3500, nation: "India", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Sport", color: "Black", img: getCarImage("Bajaj", "Pulsar"), engine: "199.5cc Single", horsepower: 24, transmission: "6-Speed", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.2 },
    { id: 136, brand: "Hero", model: "Xtreme 200S", price: 2200, nation: "India", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Sport", color: "Red", img: getCarImage("Hero", "Xtreme"), engine: "199.6cc Single", horsepower: 18, transmission: "5-Speed", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.1 },
    { id: 137, brand: "UM", model: "Renzo D200", price: 4500, nation: "China", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Sport", color: "Black", img: getCarImage("UM", "Renzo"), engine: "200cc Single", horsepower: 19, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/20k Miles", rating: 3.9 },
    { id: 138, brand: "Kawasaki", model: "Versys 650", price: 18000, nation: "Japan", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Adventure", color: "Green", img: getCarImage("Kawasaki", "Versys"), engine: "649cc Parallel Twin", horsepower: 65, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/Unlimited", rating: 4.6 },
    { id: 139, brand: "Yamaha", model: "Tracer 9", price: 22000, nation: "Japan", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Touring", color: "Blue", img: getCarImage("Yamaha", "Tracer"), engine: "890cc Triple", horsepower: 119, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/20k Miles", rating: 4.7 },
    { id: 140, brand: "Triumph", model: "Tiger 900", price: 25000, nation: "UK", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Adventure", color: "White", img: getCarImage("Triumph", "Tiger"), engine: "888cc Triple", horsepower: 104, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/Unlimited", rating: 4.7 },
    
    // ========== ELECTRIC BIKES ==========
    { id: 141, brand: "NIU", model: "NQi GT", price: 3500, nation: "China", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "RWD", bodyStyle: "Scooter", color: "Black", img: getCarImage("NIU", "NQi"), engine: "Hyper Motor", horsepower: 5, transmission: "1-Speed", availability: "In Stock", warranty: "2 Years/30k Miles", rating: 4.2 },
    { id: 142, brand: "AIMA", model: "Emma 3000", price: 2800, nation: "China", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "RWD", bodyStyle: "Scooter", color: "White", img: getCarImage("AIMA", "Emma"), engine: "800W Motor", horsepower: 2, transmission: "1-Speed", availability: "In Stock", warranty: "1 Year/10k Miles", rating: 3.8 },
    { id: 143, brand: "Yadea", model: "DT3", price: 3200, nation: "China", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "RWD", bodyStyle: "Scooter", color: "Red", img: getCarImage("Yadea", "DT3"), engine: "1200W Motor", horsepower: 3, transmission: "1-Speed", availability: "In Stock", warranty: "2 Years/20k Miles", rating: 4.0 },
    
    // ========== HEAVY TRUCKS ==========
    { id: 144, brand: "Freightliner", model: "Cascadia", price: 180000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "RWD", bodyStyle: "Truck", color: "White", img: getCarImage("Freightliner", "Cascadia"), engine: "12.8L Diesel", horsepower: 505, transmission: "18-Speed Auto", availability: "In Stock", warranty: "2 Years/200k Miles", rating: 4.5 },
    { id: 145, brand: "Peterbilt", model: "579", price: 195000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "RWD", bodyStyle: "Truck", color: "Red", img: getCarImage("Peterbilt", "579"), engine: "12.9L Diesel", horsepower: 515, transmission: "18-Speed Auto", availability: "In Stock", warranty: "2 Years/200k Miles", rating: 4.6 },
    { id: 146, brand: "Kenworth", model: "T680", price: 185000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "RWD", bodyStyle: "Truck", color: "White", img: getCarImage("Kenworth", "T680"), engine: "12.9L Diesel", horsepower: 485, transmission: "18-Speed Auto", availability: "In Stock", warranty: "2 Years/200k Miles", rating: 4.5 },
    { id: 147, brand: "Hino", model: "258", price: 95000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "RWD", bodyStyle: "Truck", color: "White", img: getCarImage("Hino", "258"), engine: "7.6L Diesel", horsepower: 260, transmission: "6-Speed Auto", availability: "In Stock", warranty: "5 Years/150k Miles", rating: 4.4 },
    { id: 148, brand: "Fuso", model: "Canter", price: 75000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "RWD", bodyStyle: "Truck", color: "White", img: getCarImage("Fuso", "Canter"), engine: "3.0L Diesel", horsepower: 175, transmission: "6-Speed Manual", availability: "In Stock", warranty: "5 Years/100k Miles", rating: 4.3 },

    // ========== NEW: AFRICAN MARKET FAVOURITES ==========
    { id: 149, brand: "Toyota", model: "Probox", price: 12000, nation: "Japan", category: "Car", condition: "Used", year: 2018, mileage: 62000, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "Wagon", color: "White", img: getCarImage("Toyota", "Probox"), engine: "1.5L", horsepower: 109, transmission: "5-Speed Manual", availability: "In Stock", warranty: "1 Year/20k Miles", rating: 4.4 },
    { id: 150, brand: "Toyota", model: "Premio", price: 16000, nation: "Japan", category: "Car", condition: "Used", year: 2019, mileage: 48000, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "Sedan", color: "Silver", img: getCarImage("Toyota", "Premio"), engine: "1.8L", horsepower: 132, transmission: "CVT", availability: "In Stock", warranty: "1 Year/20k Miles", rating: 4.5 },
    { id: 151, brand: "Toyota", model: "Fielder", price: 14000, nation: "Japan", category: "Car", condition: "Used", year: 2018, mileage: 55000, fuel: "Hybrid", drivetrain: "FWD", bodyStyle: "Wagon", color: "White", img: getCarImage("Toyota", "Fielder"), engine: "1.5L Hybrid", horsepower: 74, transmission: "CVT", availability: "In Stock", warranty: "1 Year/20k Miles", rating: 4.6 },
    { id: 152, brand: "Mazda", model: "Demio", price: 10000, nation: "Japan", category: "Car", condition: "Used", year: 2017, mileage: 70000, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "Hatchback", color: "Red", img: getCarImage("Mazda", "Demio"), engine: "1.3L", horsepower: 91, transmission: "CVT", availability: "In Stock", warranty: "1 Year/20k Miles", rating: 4.2 },
    { id: 153, brand: "Nissan", model: "X-Trail", price: 22000, nation: "Japan", category: "Car", condition: "Used", year: 2019, mileage: 45000, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "SUV", color: "Black", img: getCarImage("Nissan", "X-Trail"), engine: "2.0L", horsepower: 147, transmission: "CVT", availability: "In Stock", warranty: "2 Years/30k Miles", rating: 4.4 },
    { id: 154, brand: "Subaru", model: "Forester", price: 24000, nation: "Japan", category: "Car", condition: "Used", year: 2020, mileage: 38000, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "SUV", color: "Blue", img: getCarImage("Subaru", "Forester"), engine: "2.5L", horsepower: 182, transmission: "CVT", availability: "In Stock", warranty: "2 Years/30k Miles", rating: 4.5 },
    { id: 155, brand: "Honda", model: "Fit", price: 9500, nation: "Japan", category: "Car", condition: "Used", year: 2016, mileage: 80000, fuel: "Gasoline", drivetrain: "FWD", bodyStyle: "Hatchback", color: "White", img: getCarImage("Honda", "Fit"), engine: "1.3L", horsepower: 99, transmission: "CVT", availability: "In Stock", warranty: "1 Year/15k Miles", rating: 4.3 },
    { id: 156, brand: "Mitsubishi", model: "Outlander", price: 26000, nation: "Japan", category: "Car", condition: "Used", year: 2020, mileage: 40000, fuel: "Gasoline", drivetrain: "AWD", bodyStyle: "SUV", color: "Gray", img: getCarImage("Mitsubishi", "Outlander"), engine: "2.4L", horsepower: 166, transmission: "CVT", availability: "In Stock", warranty: "2 Years/30k Miles", rating: 4.3 },

    // ========== NEW: ELECTRIC VEHICLES ==========
    { id: 157, brand: "Polestar", model: "2", price: 52000, nation: "Sweden", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "AWD", bodyStyle: "Sedan", color: "Black", img: getCarImage("Polestar", "2"), engine: "Dual Motor AWD", horsepower: 476, transmission: "1-Speed", availability: "In Stock", warranty: "5 Years/60k Miles", rating: 4.6 },
    { id: 158, brand: "BYD", model: "Seal", price: 38000, nation: "China", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "AWD", bodyStyle: "Sedan", color: "Blue", img: getCarImage("BYD", "Seal"), engine: "Dual Motor AWD", horsepower: 523, transmission: "1-Speed", availability: "In Stock", warranty: "6 Years/100k Miles", rating: 4.5 },
    { id: 159, brand: "BYD", model: "Atto 3", price: 32000, nation: "China", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "FWD", bodyStyle: "SUV", color: "White", img: getCarImage("BYD", "Atto"), engine: "Single Motor FWD", horsepower: 201, transmission: "1-Speed", availability: "In Stock", warranty: "6 Years/100k Miles", rating: 4.4 },
    { id: 160, brand: "Nio", model: "ET5", price: 55000, nation: "China", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "AWD", bodyStyle: "Sedan", color: "White", img: getCarImage("Nio", "ET5"), engine: "Dual Motor AWD", horsepower: 483, transmission: "1-Speed", availability: "In Stock", warranty: "5 Years/75k Miles", rating: 4.6 },
    { id: 161, brand: "Tesla", model: "Model Y", price: 48000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "AWD", bodyStyle: "SUV", color: "White", img: getCarImage("Tesla", "Model Y"), engine: "Dual Motor AWD", horsepower: 384, transmission: "1-Speed", availability: "In Stock", warranty: "4 Years/50k Miles", rating: 4.7 },
    { id: 162, brand: "Tesla", model: "Cybertruck", price: 80000, nation: "USA", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Electric", drivetrain: "AWD", bodyStyle: "Truck", color: "Silver", img: getCarImage("Tesla", "Cybertruck"), engine: "Tri Motor AWD", horsepower: 845, transmission: "1-Speed", availability: "Low Stock", warranty: "4 Years/50k Miles", rating: 4.5 },

    // ========== NEW: BUDGET BIKES ==========
    { id: 163, brand: "TVS", model: "Apache RTR 200", price: 2800, nation: "India", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Sport", color: "Black", img: getCarImage("TVS", "Apache"), engine: "197.75cc Single", horsepower: 20, transmission: "5-Speed", availability: "In Stock", warranty: "3 Years/30k Miles", rating: 4.3 },
    { id: 164, brand: "Bajaj", model: "Dominar 400", price: 4200, nation: "India", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Touring", color: "Black", img: getCarImage("Bajaj", "Dominar"), engine: "373cc Single", horsepower: 40, transmission: "6-Speed", availability: "In Stock", warranty: "3 Years/30k Miles", rating: 4.4 },
    { id: 165, brand: "Yamaha", model: "MT-07", price: 9500, nation: "Japan", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Naked", color: "Gray", img: getCarImage("Yamaha", "MT-07"), engine: "689cc Parallel Twin", horsepower: 73, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/20k Miles", rating: 4.6 },
    { id: 166, brand: "Honda", model: "CB500F", price: 7200, nation: "Japan", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Naked", color: "Red", img: getCarImage("Honda", "CB500"), engine: "471cc Parallel Twin", horsepower: 47, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/20k Miles", rating: 4.5 },
    { id: 167, brand: "Kawasaki", model: "Z400", price: 5500, nation: "Japan", category: "Bike", condition: "New", year: 2026, mileage: 0, fuel: "Gasoline", drivetrain: "RWD", bodyStyle: "Naked", color: "Green", img: getCarImage("Kawasaki", "Z400"), engine: "399cc Parallel Twin", horsepower: 45, transmission: "6-Speed", availability: "In Stock", warranty: "2 Years/Unlimited", rating: 4.4 },

    // ========== NEW: COMMERCIAL TRUCKS ==========
    { id: 168, brand: "Isuzu", model: "FRR", price: 65000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "RWD", bodyStyle: "Truck", color: "White", img: getCarImage("Isuzu", "FRR"), engine: "5.2L Diesel", horsepower: 215, transmission: "6-Speed Manual", availability: "In Stock", warranty: "5 Years/150k Miles", rating: 4.5 },
    { id: 169, brand: "Mitsubishi", model: "Canter FE", price: 55000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "RWD", bodyStyle: "Truck", color: "White", img: getCarImage("Mitsubishi", "Canter"), engine: "3.0L Diesel", horsepower: 150, transmission: "6-Speed Manual", availability: "In Stock", warranty: "5 Years/100k Miles", rating: 4.3 },
    { id: 170, brand: "Toyota", model: "Dyna", price: 48000, nation: "Japan", category: "Car", condition: "New", year: 2026, mileage: 0, fuel: "Diesel", drivetrain: "RWD", bodyStyle: "Truck", color: "White", img: getCarImage("Toyota", "Dyna"), engine: "4.0L Diesel", horsepower: 150, transmission: "5-Speed Manual", availability: "In Stock", warranty: "5 Years/100k Miles", rating: 4.4 }
];

// ============================================
// DEALER REGISTRY
// ============================================
const dealerRegistry = [
    { id: 'D001', name: 'Westlands Premium Motors',    city: 'Nairobi',   phone: '+254 712 000 001', email: 'sales@westlandsmotors.co.ke',  verified: true,  rating: 4.8, since: '2021' },
    { id: 'D002', name: 'Coastal Imports Ltd',          city: 'Mombasa',   phone: '+254 722 000 002', email: 'info@coastalimports.co.ke',     verified: true,  rating: 4.7, since: '2020' },
    { id: 'D003', name: 'Lakeside Auto Hub',            city: 'Kisumu',    phone: '+254 733 000 003', email: 'contact@lakesideauto.co.ke',    verified: false, rating: 4.3, since: '2023' },
    { id: 'D004', name: 'Rift Valley Motors',           city: 'Nakuru',    phone: '+254 744 000 004', email: 'sales@riftvalleymotors.co.ke',  verified: true,  rating: 4.5, since: '2022' },
    { id: 'D005', name: 'Eldoret Speed Centre',         city: 'Eldoret',   phone: '+254 755 000 005', email: 'info@eldoretspeed.co.ke',       verified: false, rating: 4.1, since: '2023' },
    { id: 'D006', name: 'Thika Road Auto Mall',         city: 'Nairobi',   phone: '+254 766 000 006', email: 'sales@thikaautomall.co.ke',     verified: true,  rating: 4.6, since: '2021' },
    { id: 'D007', name: 'Nyali Luxury Cars',            city: 'Mombasa',   phone: '+254 777 000 007', email: 'info@nyaliluxury.co.ke',        verified: true,  rating: 4.9, since: '2019' },
    { id: 'D008', name: 'Karen Motors & Bikes',         city: 'Nairobi',   phone: '+254 788 000 008', email: 'contact@karenmotors.co.ke',     verified: true,  rating: 4.7, since: '2020' },
    { id: 'D009', name: 'Kisumu Bay Vehicles',          city: 'Kisumu',    phone: '+254 799 000 009', email: 'sales@kisumubayvehicles.co.ke', verified: false, rating: 4.2, since: '2022' },
    { id: 'D010', name: 'Nakuru Central Autos',         city: 'Nakuru',    phone: '+254 700 000 010', email: 'info@nakuruautos.co.ke',        verified: true,  rating: 4.4, since: '2021' },
];

function getDealerById(id) {
    return dealerRegistry.find(d => d.id === id) || null;
}

// Assign dealers to inventory items deterministically
function assignDealer(carId) {
    return dealerRegistry[carId % dealerRegistry.length];
}

// Track dealer stats in localStorage
function trackDealerStat(dealerId, stat) {
    const key = 'dealer_stats_' + dealerId;
    const stats = JSON.parse(localStorage.getItem(key) || '{"views":0,"wishlists":0,"inquiries":0}');
    stats[stat] = (stats[stat] || 0) + 1;
    localStorage.setItem(key, JSON.stringify(stats));
}

function getDealerStats(dealerId) {
    return JSON.parse(localStorage.getItem('dealer_stats_' + dealerId) || '{"views":0,"wishlists":0,"inquiries":0}');
}


let compareList = [];
let currentCurrency = 'USD';
let liveRates = {};
let wishlist = [];
let recentlyViewed = [];
let priceAlerts = [];
let pendingListings = JSON.parse(localStorage.getItem('dealership_pending') || '[]');
const ADMIN_PASS_HASH = btoa('admin123');  // obfuscated; replace with server-side auth in production
function verifyAdmin(input) { return btoa(input) === ADMIN_PASS_HASH; }

// Load price alerts from localStorage
const savedAlerts = localStorage.getItem('dealership_priceAlerts');
if (savedAlerts) {
    priceAlerts = JSON.parse(savedAlerts);
}

// ============================================
// SANITIZE HELPER
// ============================================

function sanitize(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

function showConfirm(message, onConfirm) {
    const id = 'confirm_' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'modal';
    div.style.zIndex = 99998;
    div.innerHTML = `
        <div class="modal-content" style="max-width:380px;text-align:center">
            <p style="font-size:1.1rem;margin-bottom:20px">${sanitize(message)}</p>
            <div style="display:flex;gap:10px;justify-content:center">
                <button class="btn-primary" id="${id}_yes">Yes</button>
                <button class="close-btn" id="${id}_no">Cancel</button>
            </div>
        </div>`;
    document.body.appendChild(div);
    document.getElementById(`${id}_yes`).onclick = () => { div.remove(); onConfirm(); };
    document.getElementById(`${id}_no`).onclick = () => div.remove();
    div.onclick = (e) => { if (e.target === div) div.remove(); };
}

function showPrompt(message, defaultVal, onSubmit, isPassword = false) {
    const id = 'prompt_' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'modal';
    div.style.zIndex = 99998;
    div.innerHTML = `
        <div class="modal-content" style="max-width:380px">
            <p style="margin-bottom:12px">${sanitize(message)}</p>
            <input type="${isPassword ? 'password' : 'text'}" id="${id}_input"
                value="${sanitize(defaultVal)}"
                style="width:100%;padding:10px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);margin-bottom:15px;display:block;box-sizing:border-box">
            <div style="display:flex;gap:10px">
                <button class="btn-primary" id="${id}_ok" style="flex:1">OK</button>
                <button class="close-btn" id="${id}_cancel" style="flex:1">Cancel</button>
            </div>
        </div>`;
    document.body.appendChild(div);
    const input = document.getElementById(`${id}_input`);
    setTimeout(() => input.focus(), 50);
    input.onkeydown = (e) => { if (e.key === 'Enter') document.getElementById(`${id}_ok`).click(); };
    document.getElementById(`${id}_ok`).onclick = () => { const v = input.value; div.remove(); onSubmit(v); };
    document.getElementById(`${id}_cancel`).onclick = () => div.remove();
    div.onclick = (e) => { if (e.target === div) div.remove(); };
}

// ============================================
// NOTIFICATIONS
// ============================================

function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    const id = Date.now();
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.id = 'notif_' + id;
    const span = document.createElement('span');
    span.textContent = message;
    const btn = document.createElement('button');
    btn.className = 'notification-close';
    btn.textContent = '✕';
    btn.onclick = () => dismissNotification('notif_' + id);
    notification.appendChild(span);
    notification.appendChild(btn);
    container.appendChild(notification);
    setTimeout(() => dismissNotification('notif_' + id), 5000);
}

function dismissNotification(id) {
    const el = document.getElementById(id);
    if (el) {
        el.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => el.remove(), 300);
    }
}

// Add price alert styles
const style = document.createElement('style');
style.textContent = `
@keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}
`;
document.head.appendChild(style);

// ============================================
// PRICE ALERTS
// ============================================

function showPriceAlerts() {
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    
    let html = `
        <h2>🔔 Price Alerts</h2>
        <p>Get notified when a vehicle drops to your target price.</p>
        
        <div class="finance-form">
            <div class="filter-group">
                <label>Select Vehicle</label>
                <select id="alertVehicle">
                    ${inventory.map(v => `<option value="${v.id}">${v.brand} ${v.model} - ${formatPrice(v.price)}</option>`).join('')}
                </select>
            </div>
            <div class="filter-group">
                <label>Target Price</label>
                <input type="number" id="alertTarget" placeholder="Your target price">
            </div>
            <div class="filter-group">
                <label>Your Email</label>
                <input type="email" id="alertEmail" placeholder="your@email.com">
            </div>
            <button onclick="addPriceAlert()" class="calc-btn">🔔 Create Alert</button>
        </div>
        
        <div class="trade-in-result" style="margin-top:20px;">
            <h3>Your Active Alerts</h3>
            ${priceAlerts.length === 0 ? '<p>No active alerts</p>' : priceAlerts.map(alert => {
                const v = inventory.find(x => x.id === alert.vehicleId);
                return v ? `
                    <div class="inventory-item">
                        <div class="info">
                            <strong>${v.brand} ${v.model}</strong><br>
                            <small>Target: ${formatPrice(alert.target)} | Current: ${formatPrice(v.price)}</small>
                        </div>
                        <button class="btn-delete" onclick="removePriceAlert(${alert.id})">Remove</button>
                    </div>
                ` : '';
            }).join('')}
        </div>
    `;
    
    content.innerHTML = html;
    modal.classList.remove('hidden');
}

function addPriceAlert() {
    const vehicleId = parseInt(document.getElementById('alertVehicle').value);
    const target = parseInt(document.getElementById('alertTarget').value);
    const email = document.getElementById('alertEmail').value;
    
    if (!target || !email) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    const vehicle = inventory.find(v => v.id === vehicleId);
    if (target >= vehicle.price) {
        showNotification('Target price must be lower than current price', 'warning');
        return;
    }
    
    const alert = {
        id: Date.now(),
        vehicleId,
        target,
        email,
        createdAt: new Date().toISOString()
    };
    
    priceAlerts.push(alert);
    localStorage.setItem('dealership_priceAlerts', JSON.stringify(priceAlerts));
    
    showNotification(`Alert created! We'll notify ${email} when price drops to ${formatPrice(target)}`, 'success');
    showPriceAlerts();
}

function removePriceAlert(id) {
    priceAlerts = priceAlerts.filter(a => a.id !== id);
    localStorage.setItem('dealership_priceAlerts', JSON.stringify(priceAlerts));
    showPriceAlerts();
}

// Check alerts (could be called on price changes or periodically)
function checkPriceAlerts() {
    priceAlerts.forEach(alert => {
        const vehicle = inventory.find(v => v.id === alert.vehicleId);
        if (vehicle && vehicle.price <= alert.target) {
            showNotification(`🔔 Price drop! ${vehicle.brand} ${vehicle.model} is now ${formatPrice(vehicle.price)}`, 'success');
            priceAlerts = priceAlerts.filter(a => a.id !== alert.id);
            localStorage.setItem('dealership_priceAlerts', JSON.stringify(priceAlerts));
        }
    });
}

// ============================================
// DEALERS NETWORK
// ============================================

const dealers = [
    { id: 1, name: "OmniDrive Tokyo", address: "Tokyo, Japan", phone: "+81-3-1234-5678", email: "tokyo@globaldrive.com", lat: 35.6762, lng: 139.6503, hours: "9:00 AM - 6:00 PM" },
    { id: 2, name: "OmniDrive Osaka", address: "Osaka, Japan", phone: "+81-6-1234-5678", email: "osaka@globaldrive.com", lat: 34.6937, lng: 135.5023, hours: "9:00 AM - 6:00 PM" },
    { id: 3, name: "OmniDrive Frankfurt", address: "Frankfurt, Germany", phone: "+49-69-1234-5678", email: "frankfurt@globaldrive.com", lat: 50.1109, lng: 8.6821, hours: "9:00 AM - 6:00 PM" },
    { id: 4, name: "OmniDrive Munich", address: "Munich, Germany", phone: "+49-89-1234-5678", email: "munich@globaldrive.com", lat: 48.1351, lng: 11.5820, hours: "9:00 AM - 6:00 PM" },
    { id: 5, name: "OmniDrive New York", address: "New York, USA", phone: "+1-212-123-4567", email: "ny@globaldrive.com", lat: 40.7128, lng: -74.0060, hours: "9:00 AM - 6:00 PM" },
    { id: 6, name: "OmniDrive Los Angeles", address: "Los Angeles, USA", phone: "+1-310-123-4567", email: "la@globaldrive.com", lat: 34.0522, lng: -118.2437, hours: "9:00 AM - 6:00 PM" },
    { id: 7, name: "OmniDrive Miami", address: "Miami, USA", phone: "+1-305-123-4567", email: "miami@globaldrive.com", lat: 25.7617, lng: -80.1918, hours: "9:00 AM - 6:00 PM" },
    { id: 8, name: "OmniDrive London", address: "London, UK", phone: "+44-20-1234-5678", email: "london@globaldrive.com", lat: 51.5074, lng: -0.1278, hours: "9:00 AM - 6:00 PM" },
    { id: 9, name: "OmniDrive Paris", address: "Paris, France", phone: "+33-1-1234-5678", email: "paris@globaldrive.com", lat: 48.8566, lng: 2.3522, hours: "9:00 AM - 6:00 PM" },
    { id: 10, name: "OmniDrive Dubai", address: "Dubai, UAE", phone: "+971-4-123-4567", email: "dubai@globaldrive.com", lat: 25.2048, lng: 55.2708, hours: "9:00 AM - 6:00 PM" },
    { id: 11, name: "OmniDrive Singapore", address: "Singapore", phone: "+65-1234-5678", email: "singapore@globaldrive.com", lat: 1.3521, lng: 103.8198, hours: "9:00 AM - 6:00 PM" },
    { id: 12, name: "OmniDrive Sydney", address: "Sydney, Australia", phone: "+61-2-1234-5678", email: "sydney@globaldrive.com", lat: -33.8688, lng: 151.2093, hours: "9:00 AM - 6:00 PM" },
    { id: 13, name: "OmniDrive Toronto", address: "Toronto, Canada", phone: "+1-416-123-4567", email: "toronto@globaldrive.com", lat: 43.6532, lng: -79.3832, hours: "9:00 AM - 6:00 PM" },
    { id: 14, name: "OmniDrive Shanghai", address: "Shanghai, China", phone: "+86-21-1234-5678", email: "shanghai@globaldrive.com", lat: 31.2304, lng: 121.4737, hours: "9:00 AM - 6:00 PM" },
    { id: 15, name: "OmniDrive Mumbai", address: "Mumbai, India", phone: "+91-22-1234-5678", email: "mumbai@globaldrive.com", lat: 19.0760, lng: 72.8777, hours: "9:00 AM - 6:00 PM" },
    { id: 16, name: "OmniDrive São Paulo", address: "São Paulo, Brazil", phone: "+55-11-1234-5678", email: "saopaulo@globaldrive.com", lat: -23.5505, lng: -46.6333, hours: "9:00 AM - 6:00 PM" },
    { id: 17, name: "OmniDrive Rome", address: "Rome, Italy", phone: "+39-06-1234-5678", email: "rome@globaldrive.com", lat: 41.9028, lng: 12.4964, hours: "9:00 AM - 6:00 PM" },
    { id: 18, name: "OmniDrive Seoul", address: "Seoul, South Korea", phone: "+82-2-1234-5678", email: "seoul@globaldrive.com", lat: 37.5665, lng: 126.9780, hours: "9:00 AM - 6:00 PM" },
    { id: 19, name: "OmniDrive Bangkok", address: "Bangkok, Thailand", phone: "+66-2-123-4567", email: "bangkok@globaldrive.com", lat: 13.7563, lng: 100.5018, hours: "9:00 AM - 6:00 PM" },
    { id: 20, name: "OmniDrive Johannesburg", address: "Johannesburg, South Africa", phone: "+27-11-123-4567", email: "johannesburg@globaldrive.com", lat: -26.2041, lng: 28.0473, hours: "9:00 AM - 6:00 PM" }
];

let userLocation = null;

// ============================================
// INITIALIZATION
// ============================================

const savedWishlist = localStorage.getItem('dealership_wishlist');
if (savedWishlist) {
    wishlist = JSON.parse(savedWishlist);
}

const savedCompare = localStorage.getItem('dealership_compare');
if (savedCompare) {
    compareList = JSON.parse(savedCompare);
}

const savedRecent = localStorage.getItem('dealership_recent');
if (savedRecent) {
    recentlyViewed = JSON.parse(savedRecent);
}

const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

const fallbackRates = {
    USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.50, CNY: 7.24,
    CHF: 0.88, SEK: 10.42, NOK: 10.68, DKK: 6.87, PLN: 3.98,
    CZK: 22.65, HUF: 351.20, RON: 4.58, BGN: 1.80, HRK: 6.95,
    ISK: 137.50, CAD: 1.36, AUD: 1.53, MXN: 17.15, BRL: 4.97,
    ARS: 875.00, CLP: 925.00, COP: 3920.00, PEN: 3.72, VEB: 36.10,
    INR: 83.12, KRW: 1335.00, SGD: 1.34, HKD: 7.82, MYR: 4.72,
    THB: 36.25, IDR: 15650.00, PHP: 55.80, VND: 24350.00, PKR: 278.50,
    BDT: 110.00, TWD: 31.50, AED: 3.67, SAR: 3.75, ILS: 3.67,
    TRY: 32.15, EGP: 30.90, KWD: 0.31, QAR: 3.64, BHD: 0.38,
    OMR: 0.38, ZAR: 18.65, NGN: 1550.00, KES: 157.50, GHS: 12.35,
    MAD: 9.95, TND: 3.12, NZD: 1.64, FJD: 2.23, PGK: 3.75
};

let isLoading = true;

document.getElementById('footerYear').textContent = new Date().getFullYear();

async function init() {
    checkCookieConsent();
    showLoadingSpinner();
    try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        liveRates = { ...fallbackRates, ...data.rates };
    } catch (e) {
        console.log("Using fallback rates - " + e.message);
        liveRates = fallbackRates;
        showNotification('Using offline rates. Some features may be limited.', 'warning');
    }
    updateWishCount();
    renderRecentlyViewed();
    renderFeatured();
    render();
    hideLoadingSpinner();
    setupInfiniteScroll();
    setupSearchDebounce(); // Add debounced search
}

function checkCookieConsent() {
    const consent = localStorage.getItem('cookieConsent');
    if (consent === null) {
        document.getElementById('cookieBanner').classList.remove('hidden');
    }
}

function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    document.getElementById('cookieBanner').classList.add('hidden');
    showNotification('Cookies accepted. Thank you!', 'success');
}

function declineCookies() {
    localStorage.setItem('cookieConsent', 'declined');
    document.getElementById('cookieBanner').classList.add('hidden');
    showNotification('Non-essential cookies declined.', 'warning');
}

function showLoadingSpinner() {
    const grid = document.getElementById('vehicleGrid');
    grid.innerHTML = Array(8).fill(`
        <div class="skeleton-card">
            <div class="skeleton-img"></div>
            <div class="skeleton-body">
                <div class="skeleton-line medium"></div>
                <div class="skeleton-line short"></div>
                <div class="skeleton-line medium"></div>
                <div class="skeleton-line short"></div>
            </div>
        </div>
    `).join('');
}

function hideLoadingSpinner() {
    isLoading = false;
}

// Error handling for images
function handleImageError(img) {
    img.onerror = null;
    const card = img.closest('.car-card');
    const wrap = img.closest('.img-wrap');
    const brand = img.dataset.brand || '';
    const model = img.dataset.model || '';
    const emoji = brand.includes('Bike') || ['Ducati','Yamaha','Kawasaki','Honda','Suzuki','BMW','Harley','Triumph','KTM','MV Agusta','Royal Enfield','Piaggio','Zero','Aprilia','CFMoto','Benelli','Bajaj','Hero','NIU'].some(b => brand.includes(b)) ? '🏍️' : brand.includes('Bus') || brand.includes('Yutong') || brand.includes('BYD') ? '🚌' : '🚗';
    if (wrap) {
        wrap.innerHTML = `<div class="img-placeholder"><span>${emoji}</span><span>${brand} ${model}</span></div>`;
    } else {
        img.style.display = 'none';
    }
}

function toggleAdvancedFilters() {
    const panel = document.getElementById('advancedFilters');
    const btn = document.getElementById('advancedToggle');
    const isHidden = panel.classList.toggle('hidden');
    btn.textContent = isHidden ? '⚙️ More' : '⚙️ Less';
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatPrice(amount) {
    const convertedAmount = amount * (liveRates[currentCurrency] || 1);
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currentCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(convertedAmount);
}

function calculateFreight(car) {
    let baseRate = 2000;
    const multipliers = { "Bike": 0.5, "Car": 1.0, "Bus": 3.5 };
    const multiplier = multipliers[car.category] || 1.0;
    let totalFreight = baseRate * multiplier;
    if (car.nation === "Japan" || car.nation === "China") {
        totalFreight += 1000;
    }
    return totalFreight;
}

function updateWishCount() {
    document.getElementById('wishCount').innerText = wishlist.length;
}

function getAvailabilityClass(status) {
    if (status === "In Stock") return "availability";
    if (status === "Low Stock") return "urgency";
    return "urgency";
}

// ============================================
// PAGINATION
// ============================================
const PAGE_SIZE = 24;
let currentPage = 1;
let filteredInventory = [];
let isLoadingMore = false;

function renderPage(data, page) {
    const start = (page - 1) * PAGE_SIZE;
    const pageItems = data.slice(start, start + PAGE_SIZE);
    if (page === 1) {
        renderCards(pageItems);
    } else {
        appendCards(pageItems);
    }
    updateInfiniteScrollSentinel(data.length, page);
}

function updateInfiniteScrollSentinel(total, page) {
    let sentinel = document.getElementById('scrollSentinel');
    if (!sentinel) {
        sentinel = document.createElement('div');
        sentinel.id = 'scrollSentinel';
        sentinel.style.cssText = 'height:1px;margin-top:20px';
        document.querySelector('.grid-main').appendChild(sentinel);
    }
    const totalPages = Math.ceil(total / PAGE_SIZE);
    sentinel.dataset.hasMore = page < totalPages ? '1' : '0';
}

function setupInfiniteScroll() {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
            const sentinel = document.getElementById('scrollSentinel');
            if (sentinel?.dataset.hasMore === '1') {
                isLoadingMore = true;
                const nextPage = currentPage + 1;
                const totalPages = Math.ceil(filteredInventory.length / PAGE_SIZE);
                if (nextPage <= totalPages) {
                    currentPage = nextPage;
                    renderPage(filteredInventory, currentPage);
                }
                isLoadingMore = false;
            }
        }
    }, { rootMargin: '200px' });
    const sentinel = document.getElementById('scrollSentinel');
    if (sentinel) observer.observe(sentinel);
    window._infiniteObserver = observer;
}

function goToPage(page) {
    const totalPages = Math.ceil(filteredInventory.length / PAGE_SIZE);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderPage(filteredInventory, currentPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// RENDERING
// ============================================

function getVehicleBadge(car) {
    const hotDeals = [32, 9, 42, 15, 13]; // GT-R, Corvette, GR Corolla, Civic Type R, Mustang
    const newArrivals = [52, 53, 54, 55, 56]; // Latest bikes
    const topRated = inventory.filter(v => v.rating >= 4.9).slice(0, 10).map(v => v.id);
    
    if (hotDeals.includes(car.id)) return '<span class="deal-badge">🔥 Hot Deal</span>';
    if (newArrivals.includes(car.id)) return '<span class="deal-badge badge-new-arrival">🆕 New Arrival</span>';
    if (topRated.includes(car.id)) return '<span class="deal-badge badge-top-rated">⭐ Top Rated</span>';
    if (car.price > 1000000) return '<span class="deal-badge badge-luxury">💎 Luxury</span>';
    if (car.fuel === 'Electric' && car.category !== 'Bus') return '<span class="deal-badge badge-electric">🔋 Electric</span>';
    return '';
}

function render(data = inventory) {
    const grid = document.getElementById('vehicleGrid');
    const emptyState = document.getElementById('emptyState');

    grid.innerHTML = '';

    if (data.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        document.getElementById('resultsCount').innerText = '0';
        return;
    }

    grid.classList.remove('hidden');
    emptyState.classList.add('hidden');
    document.getElementById('resultsCount').innerText = data.length;

    filteredInventory = data;
    currentPage = 1;
    isLoadingMore = false;
    renderPage(data, currentPage);

    // Re-observe sentinel after render
    requestAnimationFrame(() => {
        if (window._infiniteObserver) {
            const sentinel = document.getElementById('scrollSentinel');
            if (sentinel) window._infiniteObserver.observe(sentinel);
        } else {
            setupInfiniteScroll();
        }
    });

    updateFilterPillStates();
    renderRecentlyViewed();
    
    // Setup lazy loading for images
    setupLazyLoading();
    enhanceImagesForLazyLoading();
}

function renderCards(data) {
    const grid = document.getElementById('vehicleGrid');
    grid.innerHTML = '';
    // Featured (boosted) listings always first
    const sorted = [...data].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    sorted.forEach(car => {
        const isFavorited = wishlist.includes(car.id);
        const freight = calculateFreight(car);
        const availClass = getAvailabilityClass(car.availability);
        const badge = getVehicleBadge(car);
        const dealer = car.dealerRef ? getDealerById(car.dealerRef) : assignDealer(car.id);
        const verifiedBadge = dealer?.verified ? '<span class="dealer-verified">✔ Verified</span>' : '';
        const featuredBadge = car.featured ? '<span class="deal-badge badge-featured">🚀 Featured</span>' : '';
        
        grid.innerHTML += `
            <div class="car-card" onclick="toggleCompare(${car.id})" oncontextmenu="event.preventDefault(); showDetailModal(${car.id}); return false;">
                <div class="img-wrap">
                    <img src="${sanitize(car.img)}" alt="${sanitize(car.brand)} ${sanitize(car.model)}" loading="lazy" onerror="this.onerror=null; this.src='https://placehold.co/400x250/161b22/febd69?text=No+Image'">
                    ${badge}
                    ${featuredBadge}
                    <div class="heart-icon" onclick="toggleWishlist(${car.id}); event.stopPropagation();">${isFavorited ? '❤️' : '🤍'}</div>
                </div>
                <div class="car-content">
                    <h3>${sanitize(car.brand)} ${sanitize(car.model)}</h3>
                    <div class="origin">${sanitize(car.nation)}</div>
                    <p class="price">${formatPrice(car.price)}</p>
                    <p class="shipping-fee">+ ${formatPrice(freight)} shipping</p>
                    <p class="availability ${availClass}">${getAvailabilityText(car.availability)}</p>
                    ${car.urgency ? `<p class="urgency">${car.urgency}</p>` : ''}
                    <div class="car-card-buttons">
                        <button class="btn-primary" onclick="showDetailModal(${car.id}); event.stopPropagation();">Details</button>
                        <button class="btn-secondary" onclick="showMpesaPayment(${car.id}, ${car.price}); event.stopPropagation();">MPesa</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    // Add lazy loading observer for images
    setupLazyLoading();
}

function appendCards(data) {
    const grid = document.getElementById('vehicleGrid');
    const tmp = document.createElement('div');
    const sorted = [...data].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    sorted.forEach(car => {
        const isFavorited = wishlist.includes(car.id);
        const freight = calculateFreight(car);
        const availClass = getAvailabilityClass(car.availability);
        const badge = getVehicleBadge(car);
        const dealer = car.dealerRef ? getDealerById(car.dealerRef) : assignDealer(car.id);
        const verifiedBadge = dealer?.verified ? '<span class="dealer-verified">\u2714 Verified</span>' : '';
        const featuredBadge = car.featured ? '<span class="deal-badge badge-featured">\uD83D\uDE80 Featured</span>' : '';
        const el = document.createElement('div');
        el.className = `car-card ${car.featured ? 'card-featured' : ''}`;
        el.innerHTML = `
            <div class="img-wrap" onclick="showDetailModal(${car.id})" style="cursor:pointer">
                <img src="${sanitize(car.img || '')}" loading="lazy"
                     data-brand="${sanitize(car.brand)}" data-model="${sanitize(car.model)}"
                     onerror="handleImageError(this)" alt="${sanitize(car.brand)} ${sanitize(car.model)}">
            </div>
            <span class="heart-icon ${isFavorited ? 'active' : ''}" onclick="toggleWishlist(${car.id})">\u2665</span>
            ${featuredBadge}${badge}
            <span class="condition-badge ${car.condition === 'New' ? 'badge-new' : car.condition === 'Used' ? 'badge-used' : 'badge-cpo'}">${sanitize(car.condition || 'New')}</span>
            <h3 onclick="showDetailModal(${car.id})" style="cursor:pointer">${sanitize(car.brand)} ${sanitize(car.model)}</h3>
            <div class="rating-display">\u2B50 ${sanitize(String(car.rating || 'N/A'))} <span class="year-badge">${sanitize(String(car.year))}</span></div>
            <p class="specs-mini">${sanitize(car.color)} \u2022 ${sanitize(car.fuel)} \u2022 ${sanitize(car.drivetrain)} \u2022 ${sanitize(car.bodyStyle)}</p>
            <div class="dealer-info-card">
                <span class="dealer-city">\uD83D\uDCCD ${sanitize(dealer?.city || car.nation)}</span>
                <span class="dealer-name-small">${sanitize(dealer?.name || 'OmniDrive Partner')} ${verifiedBadge}</span>
            </div>
            <p class="price">${formatPrice(car.price)}</p>
            <p class="shipping-fee">+ ${formatPrice(freight)} Shipping</p>
            <div class="card-actions">
                <button class="btn-view" onclick="showDetailModal(${car.id})">View Details</button>
                <button class="btn-wish" onclick="toggleWishlist(${car.id})">${isFavorited ? '\u2764\uFE0F' : '\uD83E\uDD0D'}</button>
                <button class="btn-share" onclick="shareVehicle('${sanitize(car.brand)} ${sanitize(car.model)}', ${car.price})">\uD83D\uDCE4</button>
            </div>
            <p class="${availClass}">${car.availability === 'Pre-Order' ? '\uD83D\uDCE6 ' + sanitize(car.availability) : '\u2713 ' + sanitize(car.availability)}</p>
            <div class="car-card-buttons">
                <button class="btn-primary" onclick="showDetailModal(${car.id})">View Details</button>
                <button class="btn-contact" onclick="directContactDealer(${car.id})">\uD83D\uDCDE Contact Dealer</button>
            </div>
        `;
        grid.appendChild(el);
    });
}


// ============================================
// FILTERING & SEARCH
// ============================================

function renderRecentlyViewed() {
    const container = document.getElementById('recentList');
    if (!container) return;
    container.innerHTML = '';
    if (recentlyViewed.length === 0) return;
    recentlyViewed.slice(0, 5).forEach(id => {
        const car = inventory.find(c => c.id === id);
        if (car) {
            const el = document.createElement('div');
            el.className = 'recent-item';
            el.textContent = `${car.brand} ${car.model}`;
            el.onclick = () => showDetailModal(car.id);
            container.appendChild(el);
        }
    });
}

function updateFilterPillStates() {
    const defaults = {
        categoryFilter: 'all', conditionFilter: 'all', bodyStyleFilter: 'all',
        fuelFilter: 'all', drivetrainFilter: 'all', nationFilter: 'all',
        colorFilter: 'all', cityFilter: 'all'
    };
    Object.entries(defaults).forEach(([id, def]) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.toggle('filter-pill-active', el.value !== def);
    });
    const minP = parseInt(document.getElementById('minPriceRange')?.value || 0);
    const maxP = parseInt(document.getElementById('priceRange')?.value || 3000000);
    const sortEl = document.getElementById('sortFilter');
    if (sortEl) sortEl.classList.toggle('filter-pill-active', sortEl.value !== 'default');
    const priceActive = minP > 0 || maxP < 3000000;
    document.getElementById('advancedToggle')?.classList.toggle('filter-pill-active', priceActive || (sortEl?.value !== 'default'));
}

function applyFilters() {
    const query = document.getElementById('searchBar').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const condition = document.getElementById('conditionFilter').value;
    const nation = document.getElementById('nationFilter').value;
    const bodyStyle = document.getElementById('bodyStyleFilter').value;
    const fuel = document.getElementById('fuelFilter').value;
    const drivetrain = document.getElementById('drivetrainFilter').value;
    const color = document.getElementById('colorFilter').value;
    const city = document.getElementById('cityFilter')?.value || 'all';
    const minP = parseInt(document.getElementById('minPriceRange').value);
    const maxP = parseInt(document.getElementById('priceRange').value);
    const sort = document.getElementById('sortFilter').value;

    document.getElementById('minPriceDisplay').innerText = `$${minP.toLocaleString()}`;
    document.getElementById('priceDisplay').innerText = `$${maxP.toLocaleString()}`;

    let filtered = inventory.filter(car => {
        const dealer = car.dealerRef ? getDealerById(car.dealerRef) : assignDealer(car.id);
        const matchesSearch = car.brand.toLowerCase().includes(query) || car.model.toLowerCase().includes(query);
        const matchesCategory = category === 'all' || car.category === category;
        const matchesCondition = condition === 'all' || car.condition === condition;
        const matchesNation = nation === 'all' || car.nation === nation;
        const matchesBodyStyle = bodyStyle === 'all' || car.bodyStyle === bodyStyle;
        const matchesFuel = fuel === 'all' || car.fuel === fuel;
        const matchesDrivetrain = drivetrain === 'all' || car.drivetrain === drivetrain;
        const matchesColor = color === 'all' || car.color === color;
        const matchesCity = city === 'all' || dealer?.city === city;
        const matchesPrice = car.price >= minP && car.price <= maxP;
        return matchesSearch && matchesCategory && matchesCondition && matchesNation &&
               matchesBodyStyle && matchesFuel && matchesDrivetrain && matchesColor && matchesCity && matchesPrice;
    });

    if (sort === 'price-low') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'price-high') filtered.sort((a, b) => b.price - a.price);
    else if (sort === 'name-asc') filtered.sort((a, b) => a.brand.localeCompare(b.brand));
    else if (sort === 'name-desc') filtered.sort((a, b) => b.brand.localeCompare(a.brand));
    else if (sort === 'rating') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    render(filtered);
}

function clearFilters() {
    document.getElementById('searchBar').value = '';
    const _ms = document.getElementById('mobileSearchInput'); if (_ms) _ms.value = '';
    const mobileSearch = document.getElementById('mobileSearchInput');
    if (mobileSearch) mobileSearch.value = '';
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('conditionFilter').value = 'all';
    document.getElementById('nationFilter').value = 'all';
    document.getElementById('bodyStyleFilter').value = 'all';
    document.getElementById('fuelFilter').value = 'all';
    document.getElementById('drivetrainFilter').value = 'all';
    document.getElementById('colorFilter').value = 'all';
    document.getElementById('minPriceRange').value = 0;
    document.getElementById('priceRange').value = 3000000;
    document.getElementById('sortFilter').value = 'default';
    const cf = document.getElementById('cityFilter');
    if (cf) cf.value = 'all';
    render();
}

function updateCurrency() {
    currentCurrency = document.getElementById('currencyPicker').value;
    render();
}

// ============================================
// COMPARISON
// ============================================

function toggleCompare(id) {
    const index = compareList.indexOf(id);
    if (index > -1) {
        compareList.splice(index, 1);
    } else if (compareList.length < 3) {
        compareList.push(id);
    }
    
    localStorage.setItem('dealership_compare', JSON.stringify(compareList));
    
    const tray = document.getElementById('compareTray');
    if (compareList.length > 0) {
        tray.classList.remove('hidden');
    } else {
        tray.classList.add('hidden');
    }
    document.getElementById('compareText').innerText = `${compareList.length} Vehicles Selected`;
    // No full re-render needed — just update tray
}

function clearCompare() {
    compareList = [];
    localStorage.setItem('dealership_compare', JSON.stringify(compareList));
    document.getElementById('compareTray').classList.add('hidden');
    render();
}

function showComparison() {
    if (compareList.length === 0) return;
    
    const selected = inventory.filter(car => compareList.includes(car.id));
    const modal = document.getElementById('compareModal');
    const table = document.getElementById('compareTable');
    
    let html = '<table class="compare-table"><thead><tr><th>Feature</th>';
    selected.forEach(car => {
        html += `<th>${car.brand} ${car.model}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    // Image row
    html += '<tr><td><strong>Image</strong></td>';
    selected.forEach(car => { html += `<td><img src="${sanitize(car.img)}" alt="${sanitize(car.model)}"></td>`; });
    html += '</tr>';
    
    // Price row
    html += '<tr><td><strong>Price</strong></td>';
    selected.forEach(car => { html += `<td>${formatPrice(car.price)}</td>`; });
    html += '</tr>';
    
    // Origin row
    html += '<tr><td><strong>Origin</strong></td>';
    selected.forEach(car => { html += `<td>${sanitize(car.nation)}</td>`; });
    html += '</tr>';
    
    // Category row
    html += '<tr><td><strong>Category</strong></td>';
    selected.forEach(car => { html += `<td>${sanitize(car.category)}</td>`; });
    html += '</tr>';
    
    // Engine row
    html += '<tr><td><strong>Engine</strong></td>';
    selected.forEach(car => { html += `<td>${sanitize(car.engine || 'N/A')}</td>`; });
    html += '</tr>';
    
    // Horsepower row
    html += '<tr><td><strong>Horsepower</strong></td>';
    selected.forEach(car => { html += `<td>${sanitize(String(car.horsepower || 'N/A'))} hp</td>`; });
    html += '</tr>';
    
    // Transmission row
    html += '<tr><td><strong>Transmission</strong></td>';
    selected.forEach(car => { html += `<td>${sanitize(car.transmission || 'N/A')}</td>`; });
    html += '</tr>';
    
    // Availability row
    html += '<tr><td><strong>Availability</strong></td>';
    selected.forEach(car => { html += `<td>${sanitize(car.availability)}</td>`; });
    html += '</tr>';
    
    // Shipping row
    html += '<tr><td><strong>Shipping</strong></td>';
    selected.forEach(car => { html += `<td>${formatPrice(calculateFreight(car))}</td>`; });
    html += '</tr>';
    
    html += '</tbody></table>';
    
    table.innerHTML = html;
    modal.classList.remove('hidden');
}

function closeCompareModal() {
    document.getElementById('compareModal').classList.add('hidden');
}

// ============================================
// WISHLIST
// ============================================

function toggleWishlist(id) {
    const index = wishlist.indexOf(id);
    if (index > -1) {
        wishlist.splice(index, 1);
    } else {
        wishlist.push(id);
        // Track dealer wishlist stat
        const car = inventory.find(c => c.id === id);
        if (car) {
            const dealer = car.dealerRef ? getDealerById(car.dealerRef) : assignDealer(car.id);
            if (dealer) trackDealerStat(dealer.id, 'wishlists');
        }
    }
    localStorage.setItem('dealership_wishlist', JSON.stringify(wishlist));
    updateWishCount();
    // Update only the affected card hearts instead of re-rendering everything
    const isFav = wishlist.includes(id);
    document.querySelectorAll(`.heart-icon[onclick="toggleWishlist(${id})"]`).forEach(el => {
        el.classList.toggle('active', isFav);
    });
    document.querySelectorAll(`.btn-wish[onclick="toggleWishlist(${id})"]`).forEach(el => {
        el.textContent = isFav ? '\u2764\uFE0F' : '\uD83E\uDD0D';
    });
}

function showWishlistModal() {
    const modal = document.getElementById('wishlistModal');
    const content = document.getElementById('wishlistContent');
    
    if (wishlist.length === 0) {
        content.innerHTML = '<p>Your wishlist is empty</p>';
    } else {
        const items = inventory.filter(car => wishlist.includes(car.id));
        let html = `<div style="text-align:right;margin-bottom:12px">
            <button onclick="exportWishlist()" class="btn-primary" style="padding:8px 16px;font-size:.85rem">📄 Export List</button>
        </div>`;
        items.forEach(car => {
            html += `
                <div class="inventory-item">
                    <div class="info">
                        <strong>${car.brand} ${car.model}</strong><br>
                        <small>${car.nation} - ${formatPrice(car.price)}</small>
                    </div>
                    <div class="actions">
                        <button class="btn-edit" onclick="showDetailModal(${car.id}); closeWishlistModal();">View</button>
                        <button class="btn-delete" onclick="toggleWishlist(${car.id}); showWishlistModal();">Remove</button>
                    </div>
                </div>
            `;
        });
        content.innerHTML = html;
    }
    
    modal.classList.remove('hidden');
}

function closeWishlistModal() {
    document.getElementById('wishlistModal').classList.add('hidden');
}

// ============================================
// DETAIL MODAL
// ============================================

function showDetailModal(id) {
    const car = inventory.find(c => c.id === id);
    if (!car) return;
    
    // Add to recently viewed
    recentlyViewed = recentlyViewed.filter(rid => rid !== id);
    recentlyViewed.unshift(id);
    recentlyViewed = recentlyViewed.slice(0, 10);
    localStorage.setItem('dealership_recent', JSON.stringify(recentlyViewed));
    renderRecentlyViewed();
    // Track dealer view stat
    const dealer = car.dealerRef ? getDealerById(car.dealerRef) : assignDealer(car.id);
    if (dealer) trackDealerStat(dealer.id, 'views');
    
    const freight = calculateFreight(car);
    const total = car.price + freight;
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    
    const carDescriptions = {
        "Nissan Skyline GT-R R34": "The legendary R34 GT-R represents the pinnacle of JDM performance engineering. With its iconic boxy design and advanced all-wheel drive system, it's a true sports car legend.",
        "Porsche 911 GT3": "Track-focused perfection! The 911 GT3 delivers pure driving joy with its naturally aspirated flat-six engine and PDK transmission.",
        "Tesla Model S Plaid": "The future of performance! Tri-motor AWD delivers insane acceleration, making it one of the fastest production cars ever made.",
        "Ford F-150 Lightning": "America's best-selling truck goes electric. Same rugged capability with zero emissions and instant torque.",
        "Mercedes Citaro": "Premium urban transportation. Mercedes-Benz quality meets modern bus engineering for comfortable city travel.",
        "Ducati Panigale V4": "Italian excellence on two wheels. The Panigale dominates the Superbike World Championship.",
        "Volvo 9700": "Scandinavian luxury on the road. Premium coach with superior comfort for long-distance travel.",
        "BYD K9": "Zero-emission public transport from China's EV leader. Quiet, efficient, and eco-friendly."
    };
    
    const desc = carDescriptions[car.brand + " " + car.model] || `The ${car.brand} ${car.model} is a premium ${car.category.toLowerCase()} from ${car.nation}, combining cutting-edge technology with exceptional performance.`;
    
    content.innerHTML = `
        <img src="${car.img}" class="detail-image" alt="${car.model}" onerror="this.onerror=null; this.src='https://placehold.co/800x400/131921/febd69?text=${encodeURIComponent(car.brand + ' ' + car.model)}'">
        <h2>${car.brand} ${car.model}</h2>
        <span class="category-badge">${car.category}</span>
        
        <div class="about-section">
            <h3>📝 About This Vehicle</h3>
            <p>${desc}</p>
            <div class="specs-grid">
                <div class="spec-item"><label>🔑 VIN</label><span>${car.id}GD${car.year}</span></div>
                <div class="spec-item"><label>📅 Year</label><span>${car.year}</span></div>
                <div class="spec-item"><label>🏭 Manufacturer</label><span>${sanitize(car.brand)} Motors</span></div>
                <div class="spec-item"><label>🌍 Country</label><span>${sanitize(car.nation)}</span></div>
            </div>
        </div>
        
        <div class="detail-info">
            <div class="info-item">
                <label>Origin</label>
                <span>${car.nation} 🌏</span>
            </div>
            <div class="info-item">
                <label>Engine</label>
                <span>${car.engine || 'N/A'}</span>
            </div>
            <div class="info-item">
                <label>Horsepower</label>
                <span>${car.horsepower || 'N/A'} hp</span>
            </div>
            <div class="info-item">
                <label>Transmission</label>
                <span>${car.transmission || 'N/A'}</span>
            </div>
            <div class="info-item">
                <label>0-60 mph</label>
                <span>${car.horsepower ? Math.max(2, (600 - car.horsepower/20)).toFixed(1) + ' sec' : 'N/A'}</span>
            </div>
            <div class="info-item">
                <label>Top Speed</label>
                <span>${car.horsepower ? Math.min(220, 150 + car.horsepower/20).toFixed(0) + ' mph' : 'N/A'}</span>
            </div>
            <div class="info-item">
                <label>Fuel Type</label>
                <span>${sanitize(car.fuel)}</span>
            </div>
            <div class="info-item">
                <label>Warranty</label>
                <span>${sanitize(car.warranty || (car.category === 'Car' ? '3 Years' : '2 Years'))}</span>
            </div>
            <div class="info-item">
                <label>Category</label>
                <span>${car.category}</span>
            </div>
            <div class="info-item">
                <label>Availability</label>
                <span class="${getAvailabilityClass(car.availability)}">${car.availability}</span>
            </div>
        </div>
        
        <div class="shipping-info">
            <h4>🚢 Shipping & Import</h4>
            <div class="shipping-grid">
                <div class="ship-item"><label>Vehicle Price</label><span>${formatPrice(car.price)}</span></div>
                <div class="ship-item"><label>Freight Cost</label><span>${formatPrice(freight)}</span></div>
                <div class="ship-item"><label>Import Duty</label><span>${formatPrice(car.price * 0.025)}</span></div>
                <div class="ship-item total"><label>Total Cost</label><span>${formatPrice(total + car.price * 0.025)}</span></div>
            </div>
        </div>
        
            <button class="btn-primary" id="wishBtn_${car.id}" onclick="toggleWishlist(${car.id}); this.textContent=wishlist.includes(${car.id})?2665+0027 In Wishlist0027:2661+0027 Add to Wishlist0027">
            <button class="btn-primary" onclick="toggleWishlist(${car.id}); this.textContent=wishlist.includes(${car.id})?'♥ In Wishlist':'♡ Add to Wishlist'">
                ${wishlist.includes(car.id) ? '♥ In Wishlist' : '♡ Add to Wishlist'}
            </button>
            <button class="btn-compare" onclick="toggleCompare(${car.id}); this.textContent=compareList.includes(${car.id})?'✓ In Compare':'+ Add to Compare'">
                ${compareList.includes(car.id) ? '✓ Added to Compare' : '+ Add to Compare'}
            </button>
            <button class="btn-contact" onclick="directContactDealer(${car.id})">📞 Contact Dealer</button>
            <button class="btn-whatsapp" onclick="whatsappContact('${car.brand}','${car.model}',${car.price})">💬 WhatsApp</button>
            <button class="btn-test-drive" onclick="showTestDriveBooking(${car.id})">🚗 Test Drive</button>
            <button class="btn-customize" onclick="showVehicleCustomization(${car.id})">🔧 Customize</button>
            <button class="btn-buy" onclick="showMpesaPayment(${car.id}, ${car.price + calculateFreight(car)})">💳 Buy with MPesa</button>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.add('hidden');
}

function shareVehicle(name, price) {
    const url = window.location.href;
    const text = `Check out this ${name} for ${formatPrice(price)} on OmniDrive!`;
    if (navigator.share) {
        navigator.share({ title: name, text: text, url: url });
    } else {
        navigator.clipboard.writeText(`${text} ${url}`);
        showNotification('Link copied to clipboard!', 'success');
    }
}

// ============================================
// REVIEWS
// ============================================

const reviews = [
    { vehicleId: 1, user: "John D.", rating: 5, comment: "Amazing car! Best purchase ever.", date: "2026-03-15" },
    { vehicleId: 1, user: "Sarah M.", rating: 4, comment: "Great performance, smooth ride.", date: "2026-02-28" },
    { vehicleId: 5, user: "Mike R.", rating: 5, comment: "The M5 is a beast!", date: "2026-03-10" },
    { vehicleId: 36, user: "Emma L.", rating: 5, comment: "Dream car. Worth every penny.", date: "2026-01-20" },
    { vehicleId: 12, user: "Alex K.", rating: 5, comment: "Ferrari quality is unmatched.", date: "2026-03-05" }
];

function getReviews(vehicleId) {
    return reviews.filter(r => r.vehicleId === vehicleId);
}

// ============================================
// FEATURED DEALS
// ============================================

// Deterministic savings per vehicle (seeded by id so it never changes)
function getVehicleSavings(car) {
    const pct = [0.08, 0.10, 0.12, 0.15, 0.18, 0.20];
    return Math.floor(car.price * pct[car.id % pct.length]);
}

function renderFeatured() {
    const section = document.getElementById('featuredSection');
    if (!section) return;
    const deals = inventory.filter(car => car.availability === 'In Stock' && car.price < 100000).slice(0, 6);
    let html = '<div class="featured-grid">';
    deals.forEach(car => {
        const savings = getVehicleSavings(car);
        html += `
            <div class="featured-card" onclick="showDetailModal(${car.id})">
                <span class="deal-badge">SAVE ${formatPrice(savings)}</span>
                <img src="${sanitize(car.img)}" alt="${sanitize(car.model)}" onerror="this.onerror=null;this.src='https://placehold.co/250x150/131921/febd69?text=${encodeURIComponent(car.brand)}'">
                <h4>${sanitize(car.brand)} ${sanitize(car.model)}</h4>
                <p class="deal-price">${formatPrice(car.price - savings)} <span class="was-price">${formatPrice(car.price)}</span></p>
            </div>
        `;
    });
    html += '</div>';
    section.innerHTML = html;
}

// ============================================
// VIDEO GALLERY
// ============================================

const vehicleVideos = {
    // BMW M5
    5:  'https://www.youtube.com/embed/9YcPCMxGaFo',
    // Chevrolet Corvette Z06
    9:  'https://www.youtube.com/embed/0nlkHqZHQ8Y',
    // Porsche 911 Dakar
    36: 'https://www.youtube.com/embed/3Z7TnHBaJxk',
    // Ferrari SF90
    12: 'https://www.youtube.com/embed/7Ry9GHdBpxU',
    // Lamborghini Revuelto
    22: 'https://www.youtube.com/embed/Yd3OBnpBqec',
    // Tesla Roadster
    41: 'https://www.youtube.com/embed/v4zy1a3-eQY',
    // Ducati Panigale V4 R
    51: 'https://www.youtube.com/embed/Yd3OBnpBqec',
    // GMC Hummer EV
    80: 'https://www.youtube.com/embed/9YcPCMxGaFo'
};

function showVideoGallery(carId) {
    const modal = document.getElementById('videoModal');
    const content = document.getElementById('videoContent');
    const videoUrl = vehicleVideos[carId] || "https://www.youtube.com/embed/dQw4w9WgXcQ";
    content.innerHTML = `
        <div class="video-container">
            <iframe src="${sanitize(videoUrl)}" frameborder="0" allowfullscreen sandbox="allow-scripts allow-same-origin allow-presentation"></iframe>
        </div>
        <p class="video-note">🎥 Official vehicle walkaround and test drive footage</p>
    `;
    modal.classList.remove('hidden');
}

// ============================================
// LIVE CHAT
// ============================================

let chatMessages = [];
let chatOpen = false;

function toggleChat() {
    chatOpen = !chatOpen;
    document.getElementById('chatWidget').classList.toggle('hidden', chatOpen);
    document.getElementById('chatBox').classList.toggle('hidden', !chatOpen);
    if (chatOpen && chatMessages.length === 0) {
        chatMessages.push({ from: 'bot', text: '👋 Hi! Welcome to OmniDrive. How can I help you today?' });
        renderChat();
    }
}

const botReplies = [
    { keys: ['price','cost','how much','afford'], reply: '💰 Our vehicles range from $2,200 to $2.5M. Use the filters on the left to set your budget, or try our Financing Calculator in the navbar.' },
    { keys: ['mpesa','pay','payment','buy','purchase'], reply: '📱 We accept MPesa, Visa/Mastercard, AMEX and Bank Transfer. Click "Buy with MPesa" on any vehicle to get started.' },
    { keys: ['ship','deliver','import','freight'], reply: '🚢 We ship globally! Shipping costs depend on vehicle size and destination. Use the Import Calculator in the sidebar for an estimate.' },
    { keys: ['test drive','testdrive','drive'], reply: '🚗 You can book a test drive through our Dealer Locator. Click any vehicle → View Details → Contact Dealer.' },
    { keys: ['warranty','guarantee'], reply: '🛡️ All new vehicles come with manufacturer warranty (2–8 years depending on brand). Certified Pre-Owned vehicles include extended warranty.' },
    { keys: ['electric','ev','battery','tesla','byd'], reply: '🔋 We stock a wide range of EVs including Tesla, BYD, Rivian, Lucid, Polestar and more. Filter by "Electric" fuel type to browse.' },
    { keys: ['bike','motorcycle','ducati','yamaha'], reply: '🏍️ We have 40+ motorcycles from sport to touring to scooters. Select "Bikes" in the Category filter.' },
    { keys: ['bus','coach','transport'], reply: '🚌 Our bus fleet includes city buses, coaches and double deckers from Mercedes, Volvo, BYD and more.' },
    { keys: ['trade','sell','my car'], reply: '🔄 Use our Trade-In Calculator in the sidebar to estimate your vehicle\'s value, or click "Sell Your Vehicle" in the navbar.' },
    { keys: ['insurance'], reply: '🛡️ Get an instant insurance quote using the Insurance Calculator in the sidebar.' },
    { keys: ['hello','hi','hey','good'], reply: '😊 Hello! I\'m the OmniDrive assistant. Ask me about vehicles, payments, shipping, or anything else!' },
    { keys: ['thank','thanks'], reply: '🙏 You\'re welcome! Is there anything else I can help you with?' },
    { keys: ['contact','phone','email','support'], reply: '📞 Reach us at info@omnidrive.co.ke or +254 700 000 000. We\'re available Mon–Sat 8am–6pm EAT.' },
    { keys: ['location','office','where','nairobi'], reply: '📍 OmniDrive is based in Nairobi, Kenya. We have dealer partners in 20+ cities globally. Use the Dealer Locator to find the nearest one.' },
    { keys: ['compare'], reply: '⚖️ You can compare up to 3 vehicles side by side! Click "+ Compare" on any vehicle card, then hit the Compare button at the bottom.' },
    { keys: ['customize','pimp','modify','upgrade'], reply: '🔧 Yes! Click "Customize" on any vehicle detail page to pimp your ride — wheels, paint, body kit, interior, engine upgrades and more.' },
];

function getBotReply(msg) {
    const lower = msg.toLowerCase();
    for (const { keys, reply } of botReplies) {
        if (keys.some(k => lower.includes(k))) return reply;
    }
    return '🤖 Great question! For detailed assistance, email us at info@omnidrive.co.ke or call +254 700 000 000. Our team responds within 1 hour.';
}

function sendChat() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;
    chatMessages.push({ from: 'user', text: sanitize(msg) });
    renderChat();
    input.value = '';
    setTimeout(() => {
        chatMessages.push({ from: 'bot', text: getBotReply(msg) });
        renderChat();
    }, 600);
}

function renderChat() {
    const container = document.getElementById('chatMessages');
    container.innerHTML = chatMessages.map(m => `<div class="chat-${m.from}">${m.text}</div>`).join('');
    container.scrollTop = container.scrollHeight;
}

// ============================================
// SERVICE APPOINTMENTS
// ============================================

function showServiceCenter() {
    const modal = document.getElementById('serviceModal');
    const content = document.getElementById('serviceContent');
    content.innerHTML = `
        <div class="service-form">
            <h3>📅 Schedule Service Appointment</h3>
            <div class="filter-group">
                <label>Select Service</label>
                <select id="serviceType">
                    <option>Oil Change</option>
                    <option>Tire Rotation</option>
                    <option>Brake Inspection</option>
                    <option>General Maintenance</option>
                    <option>Annual Inspection</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Preferred Date</label>
                <input type="date" id="serviceDate">
            </div>
            <div class="filter-group">
                <label>Select Dealer</label>
                <select id="serviceDealer">
                    ${dealers.slice(0, 5).map(d => `<option>${d.name}</option>`).join('')}
                </select>
            </div>
            <div class="filter-group">
                <label>Your Phone</label>
                <input type="tel" id="servicePhone" placeholder="+1 (555) 123-4567">
            </div>
            <button onclick="scheduleService()" class="schedule-btn">Schedule Appointment</button>
        </div>
    `;
    modal.classList.remove('hidden');
}

function scheduleService() {
    const type = document.getElementById('serviceType').value;
    const date = document.getElementById('serviceDate').value;
    const dealer = document.getElementById('serviceDealer').value;
    if (!date) { showNotification('Please select a date', 'error'); return; }
    showNotification(`✅ Service scheduled! ${type} on ${date} at ${dealer}`, 'success');
    closeModal('serviceModal');
}

// ============================================
// ACCESSORIES STORE
// ============================================

const accessories = [
    { id: 1, name: "All-Weather Floor Mats", price: 150, category: "Interior" },
    { id: 2, name: "Roof Box (Large)", price: 450, category: "Exterior" },
    { id: 3, name: "Dash Camera", price: 250, category: "Electronics" },
    { id: 4, name: "Tire Pressure Monitor", price: 120, category: "Safety" },
    { id: 5, name: "Wireless Charger", price: 80, category: "Electronics" },
    { id: 6, name: "Seat Covers (Leather)", price: 350, category: "Interior" },
    { id: 7, name: "Car Cover (Indoor)", price: 100, category: "Exterior" },
    { id: 8, name: "Jump Starter Kit", price: 90, category: "Safety" }
];

function showAccessories() {
    const modal = document.getElementById('accessoriesModal');
    const content = document.getElementById('accessoriesContent');
    let html = '<div class="accessories-grid">';
    accessories.forEach(item => {
        html += `
            <div class="accessory-card">
                <h4>${item.name}</h4>
                <p class="category">${item.category}</p>
                <p class="price">${formatPrice(item.price)}</p>
                <button onclick="addToCart(${item.id})">Add to Cart</button>
            </div>
        `;
    });
    html += '</div>';
    html += '<div class="cart-summary"><button class="checkout-btn">🛒 View Cart</button></div>';
    content.innerHTML = html;
    modal.classList.remove('hidden');
}

function addToCart(id) {
    showNotification('✅ Added to cart!', 'success');
}

// ============================================
// MPESA PAYMENT
// ============================================

let cartTotal = 0;
let selectedVehicle = null;

function showPaymentModal(vehicleId, totalAmount) {
    selectedVehicle = inventory.find(v => v.id === vehicleId);
    cartTotal = totalAmount || selectedVehicle.price;
    
    const modal = document.getElementById('mpesaModal');
    const content = document.getElementById('mpesaContent');
    
    content.innerHTML = `
        <div class="mpesa-form">
            <div class="payment-methods">
                <h3>Select Payment Method</h3>
                
                <div class="payment-options">
                    <label class="payment-option">
                        <input type="radio" name="paymentMethod" value="mpesa" checked onchange="togglePaymentMethod()">
                        <span class="option-icon">📱</span>
                        <span class="option-name">MPesa</span>
                    </label>
                    <label class="payment-option">
                        <input type="radio" name="paymentMethod" value="card" onchange="togglePaymentMethod()">
                        <span class="option-icon">💳</span>
                        <span class="option-name">Card</span>
                    </label>
                    <label class="payment-option">
                        <input type="radio" name="paymentMethod" value="bank" onchange="togglePaymentMethod()">
                        <span class="option-icon">🏦</span>
                        <span class="option-name">Bank Transfer</span>
                    </label>
                </div>
                
                <div class="payment-summary">
                    <p><strong>Vehicle:</strong> ${selectedVehicle.brand} ${selectedVehicle.model}</p>
                    <p><strong>Amount:</strong> ${formatPrice(cartTotal)}</p>
                </div>
                
                <div id="mpesaFields">
                    <div class="filter-group">
                        <label>MPesa Phone Number</label>
                        <input type="tel" id="mpesaPhone" placeholder="2547XXXXXXXX (Kenya)">
                    </div>
                    <button onclick="initiateMpesaPayment()" class="mpesa-btn">💳 Pay with MPesa</button>
                </div>
                
                <div id="cardFields" class="hidden">
                    <div class="filter-group">
                        <label>Card Number</label>
                        <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19">
                    </div>
                    <div class="filter-group" style="display:flex;gap:10px">
                        <div style="flex:1">
                            <label>Expiry</label>
                            <input type="text" id="cardExpiry" placeholder="MM/YY" maxlength="5">
                        </div>
                        <div style="flex:1">
                            <label>CVV</label>
                            <input type="password" id="cardCvv" placeholder="123" maxlength="4">
                        </div>
                    </div>
                    <div class="filter-group">
                        <label>Cardholder Name</label>
                        <input type="text" id="cardName" placeholder="John Doe">
                    </div>
                    <button onclick="processCardPayment()" class="mpesa-btn">💳 Pay with Card</button>
                    <div class="card-logos">
                        <span>💳 Visa</span>
                        <span>💳 Mastercard</span>
                        <span>💳 AMEX</span>
                    </div>
                </div>
                
                <div id="bankFields" class="hidden">
                    <div class="bank-details">
                        <p><strong>Bank:</strong> Standard Chartered</p>
                        <p><strong>Account:</strong> 0123456789</p>
                        <p><strong>Branch:</strong> Westlands</p>
                        <p><strong>SWIFT:</strong> SCBLKENX</p>
                        <p class="bank-note">Use your order ID as payment reference</p>
                    </div>
                    <button onclick="confirmBankTransfer()" class="mpesa-btn">🏦 Confirm Transfer</button>
                </div>
                
                <div id="mpesaResult" class="mpesa-result"></div>
                
                <div class="mpesa-note">
                    <p>💡 Secure payment powered by OmniDrive</p>
                    <p>Supported: Kenya, Tanzania, Mozambique, Ghana, DRC</p>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function togglePaymentMethod() {
    const method = document.querySelector('input[name="paymentMethod"]:checked').value;
    document.getElementById('mpesaFields').classList.toggle('hidden', method !== 'mpesa');
    document.getElementById('cardFields').classList.toggle('hidden', method !== 'card');
    document.getElementById('bankFields').classList.toggle('hidden', method !== 'bank');
}

function processCardPayment() {
    const cardNum = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const expiry = document.getElementById('cardExpiry').value;
    const cvv = document.getElementById('cardCvv').value;
    const name = document.getElementById('cardName').value;
    
    if (!cardNum || !expiry || !cvv || !name) {
        showNotification('Please fill all card details', 'error');
        return;
    }
    
    if (cardNum.length < 13 || cvv.length < 3) {
        showNotification('Invalid card details', 'error');
        return;
    }
    
    const result = document.getElementById('mpesaResult');
    result.innerHTML = '<div class="loading">Processing card payment...</div>';
    
    setTimeout(() => {
        const txnId = 'CARD' + Date.now();
        result.innerHTML = `
            <div class="success-message">
                <h4>✅ Payment Successful!</h4>
                <p>Transaction ID: ${txnId}</p>
                <p>Amount: ${formatPrice(cartTotal)}</p>
                <p>Receipt sent to your email</p>
                <button onclick="closeModal('mpesaModal')" class="calc-btn">Done</button>
            </div>
        `;
        showNotification('Card payment successful!', 'success');
    }, 2000);
}

function confirmBankTransfer() {
    const result = document.getElementById('mpesaResult');
    const orderId = 'ORD' + Date.now();
    result.innerHTML = `
        <div class="success-message">
            <h4>✅ Bank Details Provided</h4>
            <p>Order ID: ${orderId}</p>
            <p>Use this ID when making the transfer</p>
            <p>You'll receive confirmation once payment clears</p>
            <button onclick="closeModal('mpesaModal')" class="calc-btn">Done</button>
        </div>
    `;
    showNotification('Bank transfer initiated. Please complete payment within 24 hours.', 'success');
}

function showMpesaPayment(vehicleId, totalAmount) {
    showPaymentModal(vehicleId, totalAmount);
}

// ============================================
// VEHICLE CUSTOMIZATION (PIMP YOUR RIDE)
// ============================================

const customizationOptions = {
    wheels: [
        { id: 'stock', name: 'Stock Wheels', price: 0 },
        { id: 'sport', name: 'Sport Alloy 19"', price: 1200 },
        { id: 'performance', name: 'Performance 20"', price: 2500 },
        { id: 'forged', name: 'Forged Black 21"', price: 4500 },
        { id: 'gold', name: 'Gold Plated 22"', price: 8000 }
    ],
    paint: [
        { id: 'stock', name: 'Stock Color', price: 0 },
        { id: 'metallic', name: 'Metallic Paint', price: 800 },
        { id: 'matte', name: 'Matte Finish', price: 1500 },
        { id: 'pearl', name: 'Pearl Effect', price: 2000 },
        { id: 'chrome', name: 'Chrome Finish', price: 3000 },
        { id: 'wrapping', name: 'Vinyl Wrap (Custom)', price: 2500 },
        { id: 'candy', name: 'Candy Red', price: 3500 },
        { id: 'flip', name: 'Flip Paint (Color Shift)', price: 4500 }
    ],
    body: [
        { id: 'stock', name: 'Stock Body', price: 0 },
        { id: 'bodykit', name: 'Sport Body Kit', price: 3500 },
        { id: 'widebody', name: 'Wide Body Kit', price: 8000 },
        { id: 'carbon', name: 'Carbon Fiber Parts', price: 5000 },
        { id: 'aero', name: 'Aero Package', price: 4500 },
        { id: 'hood', name: 'Carbon Hood', price: 2800 },
        { id: 'spoiler', name: 'Racing Spoiler', price: 1800 },
        { id: 'diffuser', name: 'Rear Diffuser', price: 1200 }
    ],
    interior: [
        { id: 'stock', name: 'Stock Interior', price: 0 },
        { id: 'leather', name: 'Leather Seats', price: 2500 },
        { id: 'nappa', name: 'Nappa Leather', price: 4500 },
        { id: 'alcantara', name: 'Alcantara Interior', price: 3500 },
        { id: 'stitching', name: 'Custom Stitching', price: 800 },
        { id: 'carbon', name: 'Carbon Trim', price: 1500 },
        { id: 'lighting', name: 'Ambient Lighting', price: 600 },
        { id: 'sound', name: 'Premium Sound System', price: 3500 }
    ],
    engine: [
        { id: 'stock', name: 'Stock Engine', price: 0 },
        { id: 'tune', name: 'ECU Tune', price: 1500 },
        { id: 'intake', name: 'Cold Air Intake', price: 800 },
        { id: 'exhaust', name: 'Sport Exhaust', price: 2500 },
        { id: 'turbo', name: 'Turbo Upgrade', price: 8000 },
        { id: 'super', name: 'Supercharger', price: 12000 },
        { id: 'ecu', name: 'Engine Management', price: 3000 },
        { id: 'cooling', name: 'Performance Cooling', price: 1800 }
    ],
    audio: [
        { id: 'stock', name: 'Stock Audio', price: 0 },
        { id: 'premium', name: 'Premium Audio', price: 2000 },
        { id: 'focal', name: 'Focal Sound System', price: 4500 },
        { id: 'bose', name: 'Bose Surround', price: 3500 },
        { id: 'subwoofer', name: 'Subwoofer Install', price: 1200 },
        { id: 'amp', name: 'Amplifier Upgrade', price: 1500 }
    ],
    windows: [
        { id: 'stock', name: 'Stock Windows', price: 0 },
        { id: 'tint', name: 'Window Tint', price: 350 },
        { id: 'privacy', name: 'Privacy Glass', price: 800 },
        { id: 'laminated', name: 'Laminated Glass', price: 1200 }
    ],
    accessories: [
        { id: 'none', name: 'No Accessories', price: 0 },
        { id: 'spoiler', name: 'Rear Spoiler', price: 600 },
        { id: 'roofrack', name: 'Roof Rack', price: 450 },
        { id: 'bike', name: 'Bike Rack', price: 350 },
        { id: 'cargo', name: 'Cargo Box', price: 550 },
        { id: 'led', name: 'LED Light Bar', price: 400 },
        { id: 'lights', name: 'Underglow Lights', price: 500 },
        { id: 'ground', name: 'Ground Effects', price: 800 }
    ]
};

let vehicleCustomization = {};
let customTotal = 0;
let pimpCart = [];

const pimpImages = {
    wheels: {
        stock: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80',
        sport: 'https://images.unsplash.com/photo-1611016186353-9af58c69a533?w=200&q=80',
        performance: 'https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=200&q=80',
        forged: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=200&q=80',
        gold: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&q=80'
    },
    paint: {
        stock: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=200&q=80',
        metallic: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&q=80',
        matte: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=200&q=80',
        pearl: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=200&q=80',
        chrome: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=200&q=80',
        wrapping: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=200&q=80',
        candy: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=200&q=80',
        flip: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=200&q=80'
    },
    body: {
        stock: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&q=80',
        bodykit: 'https://images.unsplash.com/photo-1547744152-14d985cb937f?w=200&q=80',
        widebody: 'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=200&q=80',
        carbon: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200&q=80',
        aero: 'https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=200&q=80',
        hood: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=200&q=80',
        spoiler: 'https://images.unsplash.com/photo-1571607388263-1044f9ea01dd?w=200&q=80',
        ' diffuser': 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=200&q=80'
    },
    interior: {
        stock: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&q=80',
        leather: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80',
        nappa: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&q=80',
        alcantara: 'https://images.unsplash.com/photo-1547744152-14d985cb937f?w=200&q=80',
        stitching: 'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=200&q=80',
        carbon: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200&q=80',
        lighting: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=200&q=80',
        sound: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=200&q=80'
    },
    engine: {
        stock: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=200&q=80',
        tune: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=200&q=80',
        intake: 'https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=200&q=80',
        exhaust: 'https://images.unsplash.com/photo-1571607388263-1044f9ea01dd?w=200&q=80',
        turbo: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=200&q=80',
        super: 'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=200&q=80',
        ecu: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200&q=80',
        cooling: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=200&q=80'
    },
    audio: {
        stock: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=200&q=80',
        premium: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80',
        focal: 'https://images.unsplash.com/photo-1547744152-14d985cb937f?w=200&q=80',
        bose: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&q=80',
        subwoofer: 'https://images.unsplash.com/photo-1571607388263-1044f9ea01dd?w=200&q=80',
        amp: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=200&q=80'
    },
    windows: {
        stock: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&q=80',
        tint: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=200&q=80',
        privacy: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&q=80',
        laminated: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=200&q=80'
    },
    accessories: {
        none: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&q=80',
        spoiler: 'https://images.unsplash.com/photo-1571607388263-1044f9ea01dd?w=200&q=80',
        roofrack: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200&q=80',
        bike: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=200&q=80',
        cargo: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=200&q=80',
        led: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=200&q=80',
        lights: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=200&q=80',
        ground: 'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=200&q=80'
    }
};

function showVehicleCustomization(vehicleId) {
    const vehicle = inventory.find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    selectedVehicle = vehicle;
    vehicleCustomization = { vehicleId: vehicle.id, basePrice: vehicle.price };
    pimpCart = [];
    
    const modal = document.getElementById('customizeModal');
    const content = document.getElementById('customizeContent');
    
    content.innerHTML = renderCustomizationUI(vehicle);
    modal.classList.remove('hidden');
    renderPimpCart();
}

function renderCustomizationUI(vehicle) {
    const sections = [
        { key: 'wheels', label: '🛞 Wheels', items: customizationOptions.wheels },
        { key: 'paint', label: '🎨 Paint', items: customizationOptions.paint },
        { key: 'body', label: '🚗 Body Kit', items: customizationOptions.body },
        { key: 'interior', label: '💺 Interior', items: customizationOptions.interior },
        { key: 'engine', label: '⚙️ Engine', items: customizationOptions.engine },
        { key: 'audio', label: '🔊 Audio', items: customizationOptions.audio },
        { key: 'windows', label: '🪟 Windows', items: customizationOptions.windows },
        { key: 'accessories', label: '🎁 Accessories', items: customizationOptions.accessories }
    ];

    return `
        <div class="pimp-layout">
            <div class="pimp-header">
                <img src="${vehicle.img || ''}" alt="${vehicle.model}" class="pimp-vehicle-img">
                <div>
                    <h3>${vehicle.brand} ${vehicle.model}</h3>
                    <p class="base-price">Base Price: ${formatPrice(vehicle.price)}</p>
                </div>
            </div>

            <div class="pimp-sections">
                ${sections.map(s => `
                    <div class="pimp-section">
                        <h4>${s.label}</h4>
                        <div class="pimp-cards">
                            ${s.items.filter(item => item.price > 0).map(item => `
                                <div class="pimp-card" id="pcard-${s.key}-${item.id}">
                                    <img src="${(pimpImages[s.key] && pimpImages[s.key][item.id]) || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&q=80'}" alt="${item.name}" loading="lazy">
                                    <div class="pimp-card-info">
                                        <span class="pimp-card-name">${item.name}</span>
                                        <span class="pimp-card-price">+${formatPrice(item.price)}</span>
                                    </div>
                                    <button class="pimp-add-btn" onclick="addPimpToCart('${s.key}', '${item.id}', '${item.name}', ${item.price}, '${s.label}')">+ Add</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="pimp-cart-panel">
                <h4>🛒 Your Pimp Cart</h4>
                <div id="pimpCartItems"><p class="pimp-empty">No upgrades added yet.</p></div>
                <div class="pimp-cart-footer">
                    <div class="pimp-totals">
                        <div class="pimp-total-row"><span>Base:</span><span>${formatPrice(vehicle.price)}</span></div>
                        <div class="pimp-total-row"><span>Upgrades:</span><span id="pimpUpgradeCost">${formatPrice(0)}</span></div>
                        <div class="pimp-total-row pimp-grand"><span>Grand Total:</span><span id="pimpGrandTotal">${formatPrice(vehicle.price)}</span></div>
                    </div>
                    <div class="customize-buttons">
                        <button onclick="clearPimpCart()" class="btn-secondary">🗑 Clear</button>
                        <button onclick="proceedToPaymentCustom()" class="calc-btn">💳 Buy Now</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

const MULTI_SELECT_CATEGORIES = ['accessories'];

function addPimpToCart(category, id, name, price, label) {
    const isMulti = MULTI_SELECT_CATEGORIES.includes(category);
    const cartKey = isMulti ? `${category}-${id}` : category;
    const existing = pimpCart.findIndex(i => i.cartKey === cartKey);

    if (existing >= 0) {
        // toggle off
        document.getElementById(`pcard-${category}-${id}`)?.classList.remove('pimp-card-active');
        pimpCart.splice(existing, 1);
        renderPimpCart();
        return;
    }

    if (!isMulti) {
        // remove previous selection in same category
        const prev = pimpCart.findIndex(i => i.category === category);
        if (prev >= 0) {
            const old = pimpCart[prev];
            document.getElementById(`pcard-${old.category}-${old.id}`)?.classList.remove('pimp-card-active');
            pimpCart.splice(prev, 1);
        }
    }

    pimpCart.push({ category, id, name, price, label, cartKey });
    document.getElementById(`pcard-${category}-${id}`)?.classList.add('pimp-card-active');
    renderPimpCart();
}

function renderPimpCart() {
    const container = document.getElementById('pimpCartItems');
    if (!container) return;
    if (pimpCart.length === 0) {
        container.innerHTML = '<p class="pimp-empty">No upgrades added yet.</p>';
    } else {
        container.innerHTML = pimpCart.map(item => `
            <div class="pimp-cart-item">
                <span>${item.label.split(' ').slice(1).join(' ')}: ${item.name}</span>
                <span class="pimp-cart-price">+${formatPrice(item.price)}</span>
                <button onclick="addPimpToCart('${item.category}','${item.id}','${item.name}',${item.price},'${item.label}')" class="pimp-remove">✕</button>
            </div>
        `).join('');
    }
    const upgradeCost = pimpCart.reduce((s, i) => s + i.price, 0);
    customTotal = (selectedVehicle?.price || 0) + upgradeCost;
    document.getElementById('pimpUpgradeCost').innerText = formatPrice(upgradeCost);
    document.getElementById('pimpGrandTotal').innerText = formatPrice(customTotal);
}

function clearPimpCart() {
    pimpCart.forEach(i => document.getElementById(`pcard-${i.category}-${i.id}`)?.classList.remove('pimp-card-active'));
    pimpCart = [];
    renderPimpCart();
}

function proceedToPaymentCustom() {
    closeModal('customizeModal');
    showPaymentModal(selectedVehicle.id, customTotal);
    showNotification('Customized vehicle ready for purchase! Total: ' + formatPrice(customTotal), 'success');
}

// ============================================
// BROKER/PARTNERSHIP SYSTEM
// ============================================

let liaisonApplications = [];
let sellerListings = [];

function showLiaisonModal() {
    const modal = document.getElementById('liaisonModal');
    const content = document.getElementById('liaisonContent');
    
    content.innerHTML = `
        <div class="liaison-form">
            <div class="liaison-hero">
                <h3>🤝 Technical Liaison Partner Program</h3>
                <p>Earn commissions by connecting buyers to vehicles on OmniDrive</p>
            </div>
            
            <div class="liaison-benefits">
                <div class="benefit-item">
                    <span class="benefit-icon">💰</span>
                    <div>
                        <strong>5% Commission</strong>
                        <small>On every successful sale</small>
                    </div>
                </div>
                <div class="benefit-item">
                    <span class="benefit-icon">🌍</span>
                    <div>
                        <strong>Global Inventory</strong>
                        <small>Access to 234+ vehicles</small>
                    </div>
                </div>
                <div class="benefit-item">
                    <span class="benefit-icon">📱</span>
                    <div>
                        <strong>Easy Management</strong>
                        <small>Track sales from dashboard</small>
                    </div>
                </div>
            </div>
            
            <div class="liaison-form-section">
                <h4>Apply Now</h4>
                <div class="filter-group">
                    <label>Full Name</label>
                    <input type="text" id="liaisonName" placeholder="Your full name">
                </div>
                <div class="filter-group">
                    <label>Email</label>
                    <input type="email" id="liaisonEmail" placeholder="your@email.com">
                </div>
                <div class="filter-group">
                    <label>Phone</label>
                    <input type="tel" id="liaisonPhone" placeholder="+2547XXXXXXXX">
                </div>
                <div class="filter-group">
                    <label>Company/Organization (Optional)</label>
                    <input type="text" id="liaisonCompany" placeholder="Your company name">
                </div>
                <div class="filter-group">
                    <label>Why do you want to join?</label>
                    <textarea id="liaisonReason" rows="3" placeholder="Tell us about your experience..."></textarea>
                </div>
                <button onclick="submitLiaisonApplication()" class="calc-btn">📝 Submit Application</button>
            </div>
            
            <div class="liaison-login">
                <p>Already a partner? <a href="#" onclick="showLiaisonDashboard()">Login to Dashboard</a></p>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
}

function submitLiaisonApplication() {
    const name = document.getElementById('liaisonName').value;
    const email = document.getElementById('liaisonEmail').value;
    const phone = document.getElementById('liaisonPhone').value;
    const company = document.getElementById('liaisonCompany').value;
    const reason = document.getElementById('liaisonReason').value;
    
    if (!name || !email || !phone) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    const application = {
        id: 'BRK' + Date.now(),
        name,
        email,
        phone,
        company,
        reason,
        status: 'pending',
        date: new Date().toISOString()
    };
    
    liaisonApplications.push(application);
    localStorage.setItem('dealership_liaisons', JSON.stringify(liaisonApplications));
    
    showNotification('Application submitted! We will contact you within 24 hours.', 'success');
    closeModal('liaisonModal');
}

function showLiaisonDashboard() {
    const modal = document.getElementById('liaisonModal');
    const content = document.getElementById('liaisonContent');
    const apps = JSON.parse(localStorage.getItem('dealership_liaisons') || '[]');
    const app = apps[apps.length - 1];
    if (!app) {
        showNotification('No broker account found. Please apply first.', 'warning');
        return;
    }
    content.innerHTML = `
        <div class="liaison-form">
            <div class="liaison-hero">
                <h3>📊 Broker Dashboard</h3>
                <p>Welcome back, ${sanitize(app.name)}</p>
            </div>
            <div class="liaison-benefits">
                <div class="benefit-item">
                    <span class="benefit-icon">💰</span>
                    <div><strong>$0</strong><small>Total Earnings</small></div>
                </div>
                <div class="benefit-item">
                    <span class="benefit-icon">👥</span>
                    <div><strong>0</strong><small>Referrals</small></div>
                </div>
                <div class="benefit-item">
                    <span class="benefit-icon">⏳</span>
                    <div><strong>${sanitize(app.status)}</strong><small>Account Status</small></div>
                </div>
            </div>
            <div class="liaison-form-section">
                <h4>Your Referral Link</h4>
                <div style="background:var(--bg);padding:12px;border-radius:6px;font-family:monospace;word-break:break-all">
                    https://omnidrive.co.ke?ref=${sanitize(app.id)}
                </div>
                <button onclick="navigator.clipboard.writeText('https://omnidrive.co.ke?ref=${sanitize(app.id)}');showNotification('Link copied!','success')" 
                    class="calc-btn" style="margin-top:10px">📋 Copy Link</button>
            </div>
            <div class="liaison-form-section">
                <h4>Recent Activity</h4>
                <p style="opacity:0.6;font-size:0.9rem">No activity yet. Share your link to start earning!</p>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
}

// ============================================
// SELL YOUR VEHICLE (LIST FOR SALE)
// ============================================

function showListVehicleModal() {
    const modal = document.getElementById('listVehicleModal');
    const content = document.getElementById('listVehicleContent');
    
    content.innerHTML = `
        <div class="list-vehicle-form">
            <div class="seller-info">
                <h3>🚗 List Your Vehicle for Sale</h3>
                <p>Sell your car through OmniDrive and reach thousands of buyers</p>
            </div>
            
            <div class="seller-benefits">
                <div class="benefit-item">
                    <span class="benefit-icon">🎯</span>
                    <div>
                        <strong>Wide Reach</strong>
                        <small>Access to Kenya & East Africa</small>
                    </div>
                </div>
                <div class="benefit-item">
                    <span class="benefit-icon">🔒</span>
                    <div>
                        <strong>Secure Payments</strong>
                        <small>MPesa, Card, Bank Transfer</small>
                    </div>
                </div>
                <div class="benefit-item">
                    <span class="benefit-icon">🚚</span>
                    <div>
                        <strong>We Handle Delivery</strong>
                        <small>Logistics included</small>
                    </div>
                </div>
            </div>
            
            <div class="vehicle-form">
                <h4>Vehicle Details</h4>
                <div class="form-row">
                    <div class="filter-group">
                        <label>Brand *</label>
                        <input type="text" id="sellerBrand" placeholder="e.g., Toyota">
                    </div>
                    <div class="filter-group">
                        <label>Model *</label>
                        <input type="text" id="sellerModel" placeholder="e.g., Premio">
                    </div>
                </div>
                <div class="form-row">
                    <div class="filter-group">
                        <label>Year *</label>
                        <input type="number" id="sellerYear" placeholder="2020" min="1990" max="2026">
                    </div>
                    <div class="filter-group">
                        <label>Price (USD) *</label>
                        <input type="number" id="sellerPrice" placeholder="15000">
                    </div>
                </div>
                <div class="form-row">
                    <div class="filter-group">
                        <label>Category</label>
                        <select id="sellerCategory">
                            <option value="Car">Car</option>
                            <option value="Bike">Bike</option>
                            <option value="Bus">Bus</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Condition</label>
                        <select id="sellerCondition">
                            <option value="New">New</option>
                            <option value="Used">Used</option>
                            <option value="Certified Pre-Owned">Certified Pre-Owned</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="filter-group">
                        <label>Mileage</label>
                        <input type="number" id="sellerMileage" placeholder="50000">
                    </div>
                    <div class="filter-group">
                        <label>Fuel Type</label>
                        <select id="sellerFuel">
                            <option value="Gasoline">Gasoline</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Electric">Electric</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>
                    </div>
                </div>
                <div class="filter-group">
                    <label>Description</label>
                    <textarea id="sellerDescription" rows="4" placeholder="Describe your vehicle's condition, features, etc."></textarea>
                </div>
                <div class="filter-group">
                    <label>Image URL</label>
                    <input type="url" id="sellerImage" placeholder="https://example.com/car-image.jpg">
                </div>
            </div>
            
            <div class="seller-contact">
                <h4>Your Contact Details</h4>
                <div class="form-row">
                    <div class="filter-group">
                        <label>Name *</label>
                        <input type="text" id="sellerName" placeholder="Your name">
                    </div>
                    <div class="filter-group">
                        <label>Phone *</label>
                        <input type="tel" id="sellerPhone" placeholder="+2547XXXXXXXX">
                    </div>
                </div>
                <div class="form-row">
                    <div class="filter-group">
                        <label>Email</label>
                        <input type="email" id="sellerEmail" placeholder="your@email.com">
                    </div>
                    <div class="filter-group">
                        <label>City *</label>
                        <select id="sellerCity">
                            <option value="Nairobi">Nairobi</option>
                            <option value="Mombasa">Mombasa</option>
                            <option value="Kisumu">Kisumu</option>
                            <option value="Nakuru">Nakuru</option>
                            <option value="Eldoret">Eldoret</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="listing-fee">
                <p><strong>Listing Fee:</strong> FREE for first 3 vehicles!</p>
                <p><small>We charge 3% commission on successful sale</small></p>
            </div>
            
            <button onclick="submitVehicleListing()" class="calc-btn">🚗 Submit Listing</button>
        </div>
    `;
    modal.classList.remove('hidden');
}

function submitVehicleListing() {
    const brand = document.getElementById('sellerBrand').value;
    const model = document.getElementById('sellerModel').value;
    const year = document.getElementById('sellerYear').value;
    const price = document.getElementById('sellerPrice').value;
    const category = document.getElementById('sellerCategory').value;
    const condition = document.getElementById('sellerCondition').value;
    const mileage = document.getElementById('sellerMileage').value;
    const fuel = document.getElementById('sellerFuel').value;
    const description = document.getElementById('sellerDescription').value;
    const image = document.getElementById('sellerImage').value;
    const sellerName = document.getElementById('sellerName').value;
    const sellerPhone = document.getElementById('sellerPhone').value;
    const sellerEmail = document.getElementById('sellerEmail').value;
    const sellerCity = document.getElementById('sellerCity')?.value || 'Nairobi';

    if (!brand || !model || !year || !price || !sellerName || !sellerPhone) {
        showNotification('Please fill all required fields', 'error');
        return;
    }

    const listing = {
        id: 'PND' + Date.now(),
        brand, model,
        price: parseInt(price),
        year: parseInt(year),
        category, condition,
        mileage: parseInt(mileage) || 0,
        fuel, bodyStyle: 'Sedan', color: 'White',
        nation: 'Kenya',
        city: sellerCity,
        description,
        img: image || getCarImage(brand, model),
        seller: { name: sellerName, phone: sellerPhone, email: sellerEmail, city: sellerCity },
        status: 'pending',
        date: new Date().toISOString()
    };

    pendingListings.push(listing);
    localStorage.setItem('dealership_pending', JSON.stringify(pendingListings));

    // Also POST to backend
    fetch(`${BACKEND_URL}/api/listings/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...listing, listing_id: listing.id })
    }).catch(() => {}); // silent fallback — already saved to localStorage

    showNotification('\uD83D\uDCEC Listing submitted! Our team will review and publish within 24 hours.', 'success');
    closeModal('listVehicleModal');
}

async function initiateMpesaPayment() {
    let phone = document.getElementById('mpesaPhone').value.replace(/\D/g, '');
    const result = document.getElementById('mpesaResult');

    if (!phone || phone.length < 9) {
        showNotification('Please enter a valid phone number', 'error');
        return;
    }

    if (phone.startsWith('0')) phone = '254' + phone.substring(1);
    else if (phone.startsWith('+')) phone = phone.substring(1);

    result.innerHTML = '<div class="loading">Sending STK Push to your phone...</div>';

    try {
        const res = await fetch(`${BACKEND_URL}/api/mpesa/purchase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone,
                amount: cartTotal,
                vehicleName: selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : 'Vehicle',
                vehicleId: selectedVehicle?.id
            })
        });

        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'STK Push failed');

        const checkoutId = data.checkoutRequestId;

        result.innerHTML = `
            <div class="success-message">
                <h4>&#128241; Check Your Phone!</h4>
                <p>An MPesa prompt has been sent to <strong>+${sanitize(phone)}</strong></p>
                <p>Enter your MPesa PIN <strong>on your phone</strong> to complete the payment.</p>
                <p style="font-size:0.85rem;opacity:0.6;margin-top:10px">Request ID: ${sanitize(checkoutId)}</p>
                <div class="mpesa-waiting" id="mpesaWaiting">
                    <div class="spinner" style="width:30px;height:30px;margin:15px auto"></div>
                    <p style="font-size:0.9rem">Waiting for confirmation...</p>
                </div>
                <button onclick="closeModal('mpesaModal')" class="calc-btn" style="margin-top:15px">Close</button>
            </div>
        `;

        let attempts = 0;
        const poll = setInterval(async () => {
            attempts++;
            if (attempts > 20) {
                clearInterval(poll);
                const w = document.getElementById('mpesaWaiting');
                if (w) w.innerHTML = '<p style="color:var(--danger)">Payment timed out. Please try again.</p>';
                return;
            }
            try {
                const statusRes = await fetch(`${BACKEND_URL}/api/mpesa/status/${checkoutId}`);
                const statusData = await statusRes.json();
                if (statusData.status === 'paid') {
                    clearInterval(poll);
                    const w = document.getElementById('mpesaWaiting');
                    if (!w) return;
                    w.innerHTML = `
                        <p style="color:var(--success);font-weight:bold;font-size:1.1rem">&#10003; Payment Confirmed!</p>
                        <p>Receipt: <strong>${sanitize(statusData.receipt || '')}</strong></p>
                        <p>Amount: ${formatPrice(cartTotal)}</p>
                        <p style="font-size:0.85rem;opacity:0.6">You will receive an SMS from MPesa shortly.</p>
                    `;
                    showNotification(`Payment confirmed! ${selectedVehicle?.brand} ${selectedVehicle?.model}`, 'success');
                } else if (statusData.status === 'failed') {
                    clearInterval(poll);
                    const w = document.getElementById('mpesaWaiting');
                    if (w) w.innerHTML = '<p style="color:var(--danger)">Payment cancelled or failed. Please try again.</p>';
                }
            } catch (_) {}
        }, 3000);

    } catch (err) {
        result.innerHTML = `<p style="color:var(--danger)">Error: ${sanitize(err.message)}. Make sure the backend is running.</p>`;
    }
}

// ============================================
// USER AUTHENTICATION
// ============================================

let currentUser = null;

function showAuthModal() {
    const modal = document.getElementById('authModal');
    const content = document.getElementById('authContent');
    
    const savedUser = localStorage.getItem('dealership_user');
    currentUser = savedUser ? JSON.parse(savedUser) : null;
    
    if (currentUser) {
        const avatar = currentUser.avatar || '👤';
        const isEmoji = !avatar.startsWith('data:') && !avatar.startsWith('http');
        const avatarHtml = isEmoji
            ? `<span style="font-size:2.8rem;line-height:1">${avatar}</span>`
            : `<img src="${avatar}" alt="avatar">`;
        const EMOJIS = ['👤','😎','🥷','👨‍💻','👩‍💻','🧑‍🚀','👨‍🚒','🤵','👸','🦸','👼','🦄','🐼','🦊','🐯','🦁'];
        content.innerHTML = `
            <div class="user-profile">
                <div class="avatar-ring" onclick="document.getElementById('avatarUpload').click()" title="Change avatar">
                    ${avatarHtml}
                    <div class="avatar-edit-overlay">✏️</div>
                </div>
                <input type="file" id="avatarUpload" accept="image/*" class="hidden" onchange="previewAvatar(event)">
                <div class="avatar-emoji-picker">
                    ${EMOJIS.map(e => `<span onclick="setEmojiAvatar('${e}')" title="Use this avatar">${e}</span>`).join('')}
                </div>
                <h3>Welcome back, ${sanitize(currentUser.name)}!</h3>
                <div class="user-info" id="profileInfo">
                    <p><label>Name</label> <span>${sanitize(currentUser.name)}</span></p>
                    <p><label>Email</label> <span>${sanitize(currentUser.email)}</span></p>
                    <p><label>Phone</label> <span>${sanitize(currentUser.phone || 'Not set')}</span></p>
                    <p><label>Address</label> <span>${sanitize(currentUser.address || 'Not set')}</span></p>
                    <p><label>Orders</label> <span>${currentUser.orders || 0}</span></p>
                    <p><label>Member since</label> <span>${sanitize(currentUser.since || 'Today')}</span></p>
                </div>
                <div id="editProfileForm" class="hidden">
                    <div class="filter-group">
                        <label>Full Name</label>
                        <input type="text" id="editName" value="${sanitize(currentUser.name)}">
                    </div>
                    <div class="filter-group">
                        <label>Email</label>
                        <input type="email" id="editEmail" value="${sanitize(currentUser.email)}">
                    </div>
                    <div class="filter-group">
                        <label>Phone</label>
                        <input type="tel" id="editPhone" value="${sanitize(currentUser.phone || '')}" placeholder="+2547XXXXXXXX">
                    </div>
                    <div class="filter-group">
                        <label>Address</label>
                        <input type="text" id="editAddress" value="${sanitize(currentUser.address || '')}" placeholder="City, Country">
                    </div>
                    <div class="filter-group">
                        <label>New Password <small style="opacity:.6">(leave blank to keep current)</small></label>
                        <input type="password" id="editPassword" placeholder="••••••••">
                    </div>
                    <button onclick="saveProfile()" class="calc-btn">💾 Save Changes</button>
                    <button onclick="cancelEditProfile()" class="clear-btn" style="margin-top:10px">Cancel</button>
                </div>
                <div id="profileButtons">
                    <button onclick="enableEditProfile()" class="btn-primary" style="width:100%;margin-bottom:10px">✏️ Edit Profile</button>
                    <button onclick="showOrderTracking()" class="calc-btn">📦 My Orders</button>
                    <button onclick="showReferralProgram()" class="calc-btn" style="margin-top:10px">🎁 Referral Program</button>
                    <button onclick="logout()" class="clear-btn" style="margin-top:20px">Logout</button>
                </div>
            </div>
        `;
    } else {
        content.innerHTML = `
            <div class="auth-tabs">
                <button class="auth-tab active" onclick="switchAuthTab('login')">Login</button>
                <button class="auth-tab" onclick="switchAuthTab('register')">Register</button>
            </div>
            
            <div id="loginForm">
                <div class="filter-group">
                    <label>Email</label>
                    <input type="email" id="loginEmail" placeholder="your@email.com">
                </div>
                <div class="filter-group">
                    <label>Password</label>
                    <input type="password" id="loginPassword" placeholder="••••••••">
                </div>
                <button onclick="doLogin()" class="calc-btn">Login</button>
            </div>
            
            <div id="registerForm" class="hidden">
                <div class="filter-group">
                    <label>Full Name</label>
                    <input type="text" id="regName" placeholder="John Doe">
                </div>
                <div class="filter-group">
                    <label>Email</label>
                    <input type="email" id="regEmail" placeholder="your@email.com">
                </div>
                <div class="filter-group">
                    <label>Password</label>
                    <input type="password" id="regPassword" placeholder="••••••••">
                </div>
                <div class="filter-group">
                    <label>Phone</label>
                    <input type="tel" id="regPhone" placeholder="+2547XXXXXXXX">
                </div>
                <button onclick="doRegister()" class="calc-btn">Create Account</button>
            </div>
        `;
    }
    
    modal.classList.remove('hidden');
}

function previewAvatar(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        currentUser.avatar = e.target.result;
        localStorage.setItem('dealership_user', JSON.stringify(currentUser));
        showAuthModal();
    };
    reader.readAsDataURL(file);
}

function setEmojiAvatar(emoji) {
    currentUser.avatar = emoji;
    localStorage.setItem('dealership_user', JSON.stringify(currentUser));
    showAuthModal();
}

function enableEditProfile() {
    document.getElementById('profileInfo').classList.add('hidden');
    document.getElementById('profileButtons').classList.add('hidden');
    document.getElementById('editProfileForm').classList.remove('hidden');
}

function saveProfile() {
    const name = document.getElementById('editName').value;
    const email = document.getElementById('editEmail').value;
    const phone = document.getElementById('editPhone').value;
    const address = document.getElementById('editAddress').value;
    const password = document.getElementById('editPassword').value;

    if (!name || !email) {
        showNotification('Name and email are required', 'error');
        return;
    }

    currentUser = { 
        ...currentUser, name, email, phone, address,
        ...(password ? { password: btoa(password) } : {})
    };
    localStorage.setItem('dealership_user', JSON.stringify(currentUser));
    showNotification('Profile updated successfully!', 'success');
    showAuthModal();
}

function cancelEditProfile() {
    document.getElementById('profileInfo').classList.remove('hidden');
    document.getElementById('profileButtons').classList.remove('hidden');
    document.getElementById('editProfileForm').classList.add('hidden');
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    const activeBtn = document.querySelector(`.auth-tab[onclick*="'${tab}'"]`);
    if (activeBtn) activeBtn.classList.add('active');
    document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
    document.getElementById('registerForm').classList.toggle('hidden', tab !== 'register');
}

function doLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('Please enter email and password', 'error');
        return;
    }
    
    currentUser = { name: email.split('@')[0], email, orders: 3, since: '2024' };
    localStorage.setItem('dealership_user', JSON.stringify(currentUser));
    showNotification('Login successful!', 'success');
    showAuthModal();
}

function doRegister() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const phone = document.getElementById('regPhone').value;
    
    if (!name || !email || !password) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    currentUser = { name, email, phone, orders: 0, since: new Date().toLocaleDateString() };
    localStorage.setItem('dealership_user', JSON.stringify(currentUser));
    showNotification('Account created! Welcome to OmniDrive!', 'success');
    showAuthModal();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('dealership_user');
    showAuthModal();
}

// ============================================
// ORDER TRACKING
// ============================================

let orders = [
    { id: 'ORD12345', vehicle: 'Toyota GR Corolla', price: 42000, status: 'delivered', date: '2024-01-15' },
    { id: 'ORD12346', vehicle: 'Ducati Panigale V4 R', price: 42000, status: 'shipped', date: '2024-02-01' },
    { id: 'ORD12347', vehicle: 'Mercedes Citaro', price: 350000, status: 'processing', date: '2024-02-10' }
];

function showOrderTracking() {
    const modal = document.getElementById('orderModal');
    const content = document.getElementById('orderContent');
    
    let html = `
        <div class="filter-group">
            <label>Order ID</label>
            <input type="text" id="orderSearch" placeholder="ORD12345">
        </div>
        <button onclick="searchOrder()" class="clear-btn">Track Order</button>
        
        <div id="orderResults">
    `;
    
    orders.forEach(order => {
        const statusSteps = ['placed', 'paid', 'processing', 'shipped', 'delivered'];
        const currentIdx = statusSteps.indexOf(order.status);
        
        html += `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">${order.id}</span>
                    <span class="order-status">${order.status}</span>
                </div>
                <div class="order-vehicle">
                    <div>
                        <strong>${order.vehicle}</strong>
                        <p>${formatPrice(order.price)}</p>
                        <p>${order.date}</p>
                    </div>
                </div>
                <div class="order-timeline">
                    ${statusSteps.map((step, i) => `
                        <div class="timeline-item ${i <= currentIdx ? 'completed' : ''} ${i === currentIdx ? 'current' : ''}">
                            <h4>${step.charAt(0).toUpperCase() + step.slice(1)}</h4>
                            <p>${i <= currentIdx ? '✓ Completed' : 'Pending'}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    content.innerHTML = html;
    modal.classList.remove('hidden');
}

function searchOrder() {
    const id = document.getElementById('orderSearch').value;
    const order = orders.find(o => o.id === id);
    
    if (order) {
        showNotification(`Order ${id}: ${order.status}`, 'success');
    } else {
        showNotification('Order not found', 'error');
    }
}

// ============================================
// VIN CHECK
// ============================================

function showVinCheck() {
    const modal = document.getElementById('vinModal');
    const content = document.getElementById('vinContent');
    
    content.innerHTML = `
        <div class="vin-form">
            <p>Enter Vehicle Identification Number (VIN) to get full history report</p>
            <div class="filter-group">
                <label>VIN Number</label>
                <input type="text" id="vinNumber" class="vin-input" placeholder="1HGBH41JXMN109186" maxlength="17">
            </div>
            <button onclick="checkVin()" class="calc-btn">🔍 Check VIN</button>
            
            <div id="vinResult"></div>
        </div>
    `;
    modal.classList.remove('hidden');
}

function checkVin() {
    const vin = document.getElementById('vinNumber').value.toUpperCase();
    
    if (vin.length < 11) {
        showNotification('Please enter a valid VIN (11+ characters)', 'error');
        return;
    }
    
    const result = document.getElementById('vinResult');
    result.innerHTML = '<div class="loading">Checking VIN...</div>';
    
    setTimeout(() => {
        const car = inventory[Math.floor(Math.random() * inventory.length)];
        
        result.innerHTML = `
            <div class="vin-result">
                <div class="vin-section">
                    <h4>Vehicle Details <span class="check-badge badge-verified">✓ Verified</span></h4>
                    <div class="vin-row"><span class="vin-label">Make:</span><span class="vin-value">${car.brand}</span></div>
                    <div class="vin-row"><span class="vin-label">Model:</span><span class="vin-value">${car.model}</span></div>
                    <div class="vin-row"><span class="vin-label">Year:</span><span class="vin-value">${car.year}</span></div>
                    <div class="vin-row"><span class="vin-label">Fuel:</span><span class="vin-value">${car.fuel}</span></div>
                </div>
                
                <div class="vin-section">
                    <h4>Ownership <span class="check-badge badge-verified">✓ Clear</span></h4>
                    <div class="vin-row"><span class="vin-label">Previous Owners:</span><span class="vin-value">0</span></div>
                    <div class="vin-row"><span class="vin-label">Accidents:</span><span class="vin-value">None reported</span></div>
                    <div class="vin-row"><span class="vin-label">Title Status:</span><span class="vin-value">Clean</span></div>
                </div>
                
                <div class="vin-section">
                    <h4>Inspection</h4>
                    <div class="vin-row"><span class="vin-label">Engine:</span><span class="vin-value">✓ Passed</span></div>
                    <div class="vin-row"><span class="vin-label">Brakes:</span><span class="vin-value">✓ Passed</span></div>
                    <div class="vin-row"><span class="vin-label">Tires:</span><span class="vin-value">✓ Good</span></div>
                </div>
            </div>
        `;
    }, 1500);
}

// ============================================
// REFERRAL PROGRAM
// ============================================

function showReferralProgram() {
    const modal = document.getElementById('referralModal');
    const content = document.getElementById('referralContent');
    
    const referralCode = 'GLOBAL' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const referrals = Math.floor(Math.random() * 5);
    const earnings = referrals * 500;
    
    content.innerHTML = `
        <div class="referral-program">
            <p>Invite friends and earn $500 per successful referral!</p>
            
            <div class="referral-steps">
                <div class="referral-step">
                    <div class="step-number">1</div>
                    <div class="step-icon">📤</div>
                    <h4>Share Code</h4>
                    <p>Send to friends</p>
                </div>
                <div class="referral-step">
                    <div class="step-number">2</div>
                    <div class="step-icon">👤</div>
                    <h4>They Buy</h4>
                    <p>They purchase a vehicle</p>
                </div>
                <div class="referral-step">
                    <div class="step-number">3</div>
                    <div class="step-icon">💰</div>
                    <h4>You Earn</h4>
                    <p>$500 credit!</p>
                </div>
            </div>
            
            <div class="referral-code">
                <p>Your Referral Code</p>
                <div class="code-display">${referralCode}</div>
                <div class="share-buttons">
                    <button class="share-btn" onclick="copyReferralCode()">📋 Copy</button>
                    <button class="share-btn" onclick="shareReferralWhatsApp()">💬 WhatsApp</button>
                    <button class="share-btn" onclick="shareReferralEmail()">✉️ Email</button>
                </div>
            </div>
            
            <div class="referral-stats">
                <div class="stat-box">
                    <div class="stat-number">${referrals}</div>
                    <div class="stat-label">Referrals</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">${earnings}</div>
                    <div class="stat-label">Earnings ($)</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">${referrals > 0 ? '$' + (earnings + 500) : '$0'}</div>
                    <div class="stat-label">Pending</div>
                </div>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
}

function copyReferralCode() {
    const code = document.querySelector('.code-display').innerText;
    navigator.clipboard.writeText(code);
    showNotification('Code copied!', 'success');
}

function shareReferralWhatsApp() {
    const code = document.querySelector('.code-display').innerText;
    const text = encodeURIComponent(`Join OmniDrive! Use my referral code: ${code} to get $500 off on your vehicle purchase!`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
}

function shareReferralEmail() {
    const code = document.querySelector('.code-display').innerText;
    const subject = encodeURIComponent('OmniDrive Referral Code');
    const body = encodeURIComponent(`Use my referral code: ${code} to get $500 off on your vehicle purchase at OmniDrive!`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
}

// ============================================
// DEALER LOCATION SYSTEM
// ============================================

function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    resolve(userLocation);
                },
                () => {
                    resolve(null);
                }
            );
        } else {
            resolve(null);
        }
    });
}

function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng/2) * Math.sin(dLng/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function findNearestDealers(userLat, userLng, limit = 5) {
    return dealers.map(dealer => ({
        ...dealer,
        distance: calculateDistance(userLat, userLng, dealer.lat, dealer.lng)
    })).sort((a, b) => a.distance - b.distance).slice(0, limit);
}

function showDealerLocator(vehicleName) {
    const modal = document.getElementById('dealerModal');
    const content = document.getElementById('dealerContent');
    content.innerHTML = `
        <div id="dealerList"><p class="loading">🔍 Locating you…</p></div>
    `;
    modal.classList.remove('hidden');
    locateAndFindDealers(vehicleName);
}

async function locateAndFindDealers(vehicleName) {
    const listEl = document.getElementById('dealerList');
    if (!listEl) return;
    listEl.innerHTML = '<p class="loading">🔍 Locating you…</p>';

    const userLoc = await getUserLocation();

    if (!userLoc) {
        listEl.innerHTML = `
            <p class="dealer-note">⚠️ Location access denied. <button onclick="locateAndFindDealers('${vehicleName}')" class="locate-btn" style="display:inline;padding:6px 14px;font-size:0.85rem">🔄 Try Again</button></p>
            <div class="dealer-grid">
                ${dealers.map(d => createDealerCard(d, vehicleName)).join('')}
            </div>
        `;
        return;
    }

    const nearest = findNearestDealers(userLoc.lat, userLoc.lng, dealers.length);
    listEl.innerHTML = `
        <div class="nearest-header">
            <h4>📍 Dealers Near You</h4>
            <span class="distance-badge">Sorted by Distance</span>
        </div>
        <div class="dealer-grid">
            ${nearest.map(d => createDealerCard(d, vehicleName)).join('')}
        </div>
    `;
}

function createDealerCard(dealer, vehicleName) {
    const distKm = dealer.distance;
    const distText = distKm != null ? (distKm < 1 ? 'Less than 1 km away' : `${distKm.toFixed(0)} km away`) : '';
    const isNearest = distKm != null && distKm < 100;
    const waPhone = dealer.phone.replace(/[^0-9]/g, '');
    const waText = encodeURIComponent(`Hi ${dealer.name}! I found you on OmniDrive${vehicleName ? ` and I'm interested in the ${vehicleName}` : ''}. Are you available?`);
    return `
        <div class="dealer-card ${isNearest ? 'nearest' : ''}">
            <div class="dealer-header">
                <h4>${dealer.name} ${dealer.verified ? '<span class="dealer-verified">✔ Verified</span>' : ''}</h4>
                ${isNearest ? '<span class="nearest-tag">📍 Nearest</span>' : ''}
            </div>
            <p class="dealer-address">📍 ${dealer.address}</p>
            ${distText ? `<p class="dealer-distance"><strong>${distText}</strong></p>` : ''}
            <p class="dealer-hours">🕐 ${dealer.hours}</p>
            <div class="dealer-contact">
                <a href="https://wa.me/${waPhone}?text=${waText}" target="_blank" class="contact-btn" style="background:#25D366;color:white;font-weight:700">💬 WhatsApp</a>
                <a href="tel:${dealer.phone}" class="contact-btn">📞 Call</a>
                <a href="mailto:${dealer.email}?subject=Inquiry: ${vehicleName || 'Vehicle'}" class="contact-btn">✉️ Email</a>
            </div>
            <div class="dealer-actions">
                <button onclick="getDirections(${dealer.lat}, ${dealer.lng})" class="directions-btn">🧭 Get Directions</button>
                <button onclick="scheduleTestDrive('${dealer.name}', '${vehicleName || ''}')" class="test-drive-btn">📅 Test Drive</button>
            </div>
        </div>
    `;
}

function getDirections(lat, lng) {
    const userLat = userLocation?.lat || 0;
    const userLng = userLocation?.lng || 0;
    window.open(`https://www.google.com/maps/dir/${userLat},${userLng}/${lat},${lng}`, '_blank');
}

function scheduleTestDrive(dealerName, vehicleName) {
    const modal = document.getElementById('serviceModal');
    const content = document.getElementById('serviceContent');
    content.innerHTML = `
        <h3>📅 Schedule Test Drive</h3>
        <p><strong>Vehicle:</strong> ${sanitize(vehicleName)}</p>
        <p><strong>Dealer:</strong> ${sanitize(dealerName)}</p>
        <div class="filter-group">
            <label>Preferred Date</label>
            <input type="date" id="testDriveDate">
        </div>
        <div class="filter-group">
            <label>Your Phone</label>
            <input type="tel" id="testDrivePhone" placeholder="+2547XXXXXXXX">
        </div>
        <button onclick="confirmTestDrive('${sanitize(dealerName)}','${sanitize(vehicleName)}')" class="calc-btn">Confirm Booking</button>
    `;
    modal.classList.remove('hidden');
}

function confirmTestDrive(dealerName, vehicleName) {
    const date = document.getElementById('testDriveDate').value;
    const phone = document.getElementById('testDrivePhone').value;
    if (!date || !phone) { showNotification('Please fill all fields', 'error'); return; }
    showNotification(`✅ Test drive booked for ${vehicleName} on ${date} at ${dealerName}`, 'success');
    closeModal('serviceModal');
}

function closeDealerModal() {
    document.getElementById('dealerModal').classList.add('hidden');
}

function directContactDealer(carId) {
    const car = inventory.find(c => c.id === carId);
    if (!car) return;
    const dealer = car.dealerRef ? getDealerById(car.dealerRef) : assignDealer(car.id);
    if (!dealer) return;
    trackDealerStat(dealer.id, 'inquiries');
    const subject = encodeURIComponent(`Inquiry via OmniDrive: ${car.brand} ${car.model}`);
    const emailBody = encodeURIComponent(`Hi ${dealer.name},\n\nI found your ${car.brand} ${car.model} (${car.year}) listed on OmniDrive for ${formatPrice(car.price)}.\n\nI would like to visit your showroom in ${dealer.city} to see it.\n\nPlease confirm availability.\n\nThank you.`);
    const waText = encodeURIComponent(`Hi ${dealer.name}, I found your *${car.brand} ${car.model} (${car.year})* listed on OmniDrive for ${formatPrice(car.price)}. I'd like to visit your showroom in ${dealer.city}. Is it still available?`);
    const waPhone = dealer.phone.replace(/[^0-9]/g, '');
    const modal = document.getElementById('serviceModal');
    const content = document.getElementById('serviceContent');
    content.innerHTML = `
        <h3>\uD83D\uDCDE Contact Dealer</h3>
        <div class="dealer-card" style="margin:15px 0">
            <div class="dealer-header">
                <h4>${sanitize(dealer.name)} ${dealer.verified ? '<span class="dealer-verified">\u2714 Verified</span>' : ''}</h4>
            </div>
            <p class="dealer-address">\uD83D\uDCCD ${sanitize(dealer.city)}, Kenya</p>
            <p class="dealer-distance">\u2B50 ${dealer.rating}/5 &middot; Partner since ${dealer.since}</p>
            <p style="margin:8px 0"><strong>Vehicle:</strong> ${sanitize(car.brand)} ${sanitize(car.model)} &mdash; ${formatPrice(car.price)}</p>
            <div class="dealer-contact" style="margin-top:15px">
                <a href="https://wa.me/${waPhone}?text=${waText}" target="_blank" class="contact-btn" style="background:#25D366;color:white;font-weight:700">\uD83D\uDCAC WhatsApp</a>
                <a href="tel:${sanitize(dealer.phone)}" class="contact-btn">\uD83D\uDCDE Call</a>
                <a href="mailto:${sanitize(dealer.email)}?subject=${subject}&body=${emailBody}" class="contact-btn">\u2709\uFE0F Email</a>
            </div>
            <div class="dealer-actions" style="margin-top:10px">
                <button onclick="window.open('https://www.google.com/maps/search/${encodeURIComponent(dealer.name + ' ' + dealer.city)}','_blank')" class="directions-btn">\uD83E\uDDED Get Directions</button>
                <button onclick="scheduleTestDrive('${sanitize(dealer.name)}','${sanitize(car.brand + ' ' + car.model)}')" class="test-drive-btn">\uD83D\uDCC5 Test Drive</button>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
}



// ============================================
// LAZY LOADING
// ============================================

function setupLazyLoading() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
        const lazyImageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const lazyImage = entry.target;
                    lazyImage.src = lazyImage.dataset.src || lazyImage.src;
                    lazyImage.removeAttribute('data-src');
                    lazyImageObserver.unobserve(lazyImage);
                }
            });
        });

        lazyImages.forEach(lazyImage => {
            lazyImageObserver.observe(lazyImage);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        lazyImages.forEach(img => {
            img.src = img.src;
        });
    }
}

// Add data-src attribute for lazy loading
function enhanceImagesForLazyLoading() {
    const images = document.querySelectorAll('.car-card img');
    images.forEach(img => {
        if (!img.dataset.src) {
            img.dataset.src = img.src;
            // Use a placeholder until real image loads
            img.src = 'https://placehold.co/400x250/161b22/febd69?text=Loading...';
        }
    });
}

// ============================================
// DEBOUNCED SEARCH
// ============================================

let searchTimeout;
function debouncedApplyFilters() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(applyFilters, 300); // 300ms debounce
}

// Update search input to use debounced function
function setupSearchDebounce() {
    const searchInput = document.getElementById('searchBar');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    
    if (searchInput) {
        searchInput.removeEventListener('input', applyFilters);
        searchInput.addEventListener('input', debouncedApplyFilters);
    }
    
    if (mobileSearchInput) {
        mobileSearchInput.removeEventListener('input', applyFilters);
        mobileSearchInput.addEventListener('input', debouncedApplyFilters);
    }
}

function closeFinanceModal() {
    document.getElementById('financeModal').classList.add('hidden');
}

// ============================================
// TRADE-IN CALCULATOR
// ============================================

function showTradeInCalc() {
    const modal = document.getElementById('tradeInModal') || createModal('tradeInModal', 'tradeInContent', '🔄 Trade-In Value Calculator');
    const content = document.getElementById('tradeInContent');
    content.innerHTML = `
        <div class="calculator-form">
            <div class="filter-group">
                <label>Your Vehicle's Original Price ($)</label>
                <input type="number" id="tradeInOriginal" placeholder="e.g., 50000" oninput="calculateTradeIn()">
            </div>
            <div class="filter-group">
                <label>Current Mileage</label>
                <input type="number" id="tradeInMileage" placeholder="e.g., 30000" oninput="calculateTradeIn()">
            </div>
            <div class="filter-group">
                <label>Vehicle Condition</label>
                <select id="tradeInCondition" onchange="calculateTradeIn()">
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Years Old</label>
                <input type="number" id="tradeInYears" placeholder="e.g., 3" oninput="calculateTradeIn()">
            </div>
            <div id="tradeInResult" class="trade-in-result"></div>
        </div>
    `;
    modal.classList.remove('hidden');
}

function calculateTradeIn() {
    const original = parseFloat(document.getElementById('tradeInOriginal').value) || 0;
    const mileage = parseFloat(document.getElementById('tradeInMileage').value) || 0;
    const condition = document.getElementById('tradeInCondition').value;
    const years = parseFloat(document.getElementById('tradeInYears').value) || 0;
    const result = document.getElementById('tradeInResult');
    
    if (original <= 0) {
        result.innerHTML = '';
        return;
    }
    
    const depreciationRates = { excellent: 0.15, good: 0.20, fair: 0.30, poor: 0.45 };
    const mileageDeduction = Math.min(0.15, mileage / 100000 * 0.05);
    const yearDeduction = Math.min(0.40, years * 0.08);
    
    const totalDeduction = depreciationRates[condition] + mileageDeduction + yearDeduction;
    const tradeInValue = original * (1 - totalDeduction);
    const tradeInRange = `${formatPrice(tradeInValue * 0.9)} - ${formatPrice(tradeInValue * 1.1)}`;
    
    result.innerHTML = `
        <h4>Estimated Trade-In Value</h4>
        <div class="trade-value">${tradeInRange}</div>
        <p class="trade-note">Based on ${condition} condition with ${mileage.toLocaleString()} miles</p>
    `;
}

// ============================================
// INSURANCE CALCULATOR
// ============================================

function showInsuranceCalc() {
    const modal = document.getElementById('insuranceModal') || createModal('insuranceModal', 'insuranceContent', '🛡️ Insurance Quote');
    const content = document.getElementById('insuranceContent');
    content.innerHTML = `
        <div class="calculator-form">
            <div class="filter-group">
                <label>Vehicle Price ($)</label>
                <input type="number" id="insurePrice" placeholder="e.g., 50000" oninput="calculateInsurance()">
            </div>
            <div class="filter-group">
                <label>Driver Age</label>
                <input type="number" id="insureAge" placeholder="e.g., 30" oninput="calculateInsurance()">
            </div>
            <div class="filter-group">
                <label>Driving Experience (years)</label>
                <input type="number" id="insureExperience" placeholder="e.g., 5" oninput="calculateInsurance()">
            </div>
            <div class="filter-group">
                <label>Location</label>
                <select id="insureLocation" onchange="calculateInsurance()">
                    <option value="urban">Urban</option>
                    <option value="suburban">Suburban</option>
                    <option value="rural">Rural</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Coverage</label>
                <select id="insureCoverage" onchange="calculateInsurance()">
                    <option value="basic">Basic Liability</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                </select>
            </div>
            <div id="insuranceResult" class="insurance-result"></div>
        </div>
    `;
    modal.classList.remove('hidden');
}

function calculateInsurance() {
    const price = parseFloat(document.getElementById('insurePrice').value) || 0;
    const age = parseFloat(document.getElementById('insureAge').value) || 30;
    const experience = parseFloat(document.getElementById('insureExperience').value) || 5;
    const location = document.getElementById('insureLocation').value;
    const coverage = document.getElementById('insureCoverage').value;
    const result = document.getElementById('insuranceResult');
    
    if (price <= 0) {
        result.innerHTML = '';
        return;
    }
    
    const baseRate = price * 0.01;
    const ageFactor = age < 25 ? 1.5 : age > 50 ? 0.9 : 1.0;
    const expFactor = experience < 2 ? 1.3 : experience < 5 ? 1.1 : 1.0;
    const locFactor = { urban: 1.3, suburban: 1.0, rural: 0.8 };
    const covFactor = { basic: 0.7, standard: 1.0, premium: 1.4 };
    
    const monthlyPremium = baseRate * ageFactor * expFactor * locFactor[location] * covFactor[coverage];
    const annualPremium = monthlyPremium * 12;
    
    result.innerHTML = `
        <h4>Estimated Insurance</h4>
        <div class="premium-monthly">${formatPrice(monthlyPremium)}<small>/month</small></div>
        <div class="premium-annual">${formatPrice(annualPremium)}<small>/year</small></div>
    `;
}

// ============================================
// IMPORT CALCULATOR
// ============================================

function showImportCalc() {
    const modal = document.getElementById('importModal') || createModal('importModal', 'importContent', '📦 Import Calculator');
    const content = document.getElementById('importContent');
    content.innerHTML = `
        <div class="calculator-form">
            <div class="filter-group">
                <label>Vehicle Price ($)</label>
                <input type="number" id="importPrice" placeholder="e.g., 50000" oninput="calculateImport()">
            </div>
            <div class="filter-group">
                <label>Destination Country</label>
                <select id="importCountry" onchange="calculateImport()">
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="EU">European Union</option>
                    <option value="AU">Australia</option>
                    <option value="CA">Canada</option>
                    <option value="JP">Japan</option>
                    <option value="SG">Singapore</option>
                    <option value="AE">UAE</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Shipping Method</label>
                <select id="importShipping" onchange="calculateImport()">
                    <option value="roauto">Roll-on/Roll-off</option>
                    <option value="container">Container</option>
                    <option value="air">Air Freight</option>
                </select>
            </div>
            <div id="importResult" class="import-result"></div>
        </div>
    `;
    modal.classList.remove('hidden');
}

function calculateImport() {
    const price = parseFloat(document.getElementById('importPrice').value) || 0;
    const country = document.getElementById('importCountry').value;
    const shipping = document.getElementById('importShipping').value;
    const result = document.getElementById('importResult');
    
    if (price <= 0) {
        result.innerHTML = '';
        return;
    }
    
    const duties = { US: 0.025, UK: 0.10, EU: 0.10, AU: 0.05, CA: 0.065, JP: 0, SG: 0.20, AE: 0.05 };
    const shippingCosts = { roauto: 1500, container: 2500, air: 8000 };
    
    const duty = price * duties[country];
    const freight = shippingCosts[shipping];
    const clearance = 500;
    const total = price + duty + freight + clearance;
    
    result.innerHTML = `
        <h4>Import Cost Breakdown</h4>
        <div class="import-item"><span>Vehicle Price</span><span>${formatPrice(price)}</span></div>
        <div class="import-item"><span>Import Duty (${duties[country]*100}%)</span><span>${formatPrice(duty)}</span></div>
        <div class="import-item"><span>Freight</span><span>${formatPrice(freight)}</span></div>
        <div class="import-item"><span>Clearance</span><span>${formatPrice(clearance)}</span></div>
        <div class="import-total"><span>Total Cost</span><span>${formatPrice(total)}</span></div>
    `;
}

function createModal(id, contentId, title) {
    const div = document.createElement('div');
    div.id = id;
    div.className = 'modal hidden';
    div.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <button class="back-btn" onclick="closeModal('${id}')">← Back</button>
                <button class="close-btn" onclick="closeModal('${id}')">✕ Exit</button>
            </div>
            <h2>${title}</h2>
            <div id="${contentId}"></div>
        </div>
    `;
    document.body.appendChild(div);
    return div;
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
}

function calculateFinance() {
    const price = parseFloat(document.getElementById('financePrice').value) || 0;
    const down = parseFloat(document.getElementById('financeDown').value) || 0;
    const term = parseInt(document.getElementById('financeTerm').value) || 48;
    const rate = parseFloat(document.getElementById('financeRate').value) || 5.9;
    
    if (price <= 0) {
        showNotification('Please enter a vehicle price', 'error');
        return;
    }
    
    const principal = price - down;
    const monthlyRate = rate / 100 / 12;
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
    const totalPayment = (monthlyPayment * term) + down;
    const totalInterest = totalPayment - price;
    
    const result = document.getElementById('financeResult');
    result.innerHTML = `
        <div class="monthly">${formatPrice(monthlyPayment)} <small>/month</small></div>
        <div class="total">Total: ${formatPrice(totalPayment)} (Interest: ${formatPrice(totalInterest)})</div>
    `;
}

// ============================================
// THEME
// ============================================

function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const target = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('theme', target);
}

// ============================================
// ADMIN
// ============================================

function addNewVehicle() {
    const brand = document.getElementById('newBrand').value;
    const model = document.getElementById('newModel').value;
    const price = document.getElementById('newPrice').value;
    const nation = document.getElementById('newNation').value;
    const category = document.getElementById('newCategory').value;
    const img = document.getElementById('newImage').value;
    const engine = document.getElementById('newEngine').value;
    const horsepower = document.getElementById('newHorsepower').value;
    const transmission = document.getElementById('newTransmission').value;

    if (!brand || !model || !price) {
        showNotification('Please fill in Brand, Model and Price', 'error');
        return;
    }

    const newCar = {
        id: Date.now(),
        brand,
        model,
        price: Number(price),
        nation,
        category,
        img: img || getCarImage(brand, model),
        engine: engine || 'N/A',
        horsepower: Number(horsepower) || 0,
        transmission: transmission || 'N/A',
        availability: "In Stock"
    };

    inventory.push(newCar);
    localStorage.setItem('dealership_db', JSON.stringify(inventory));
    render();
    renderAdminInventory();
    
    // Clear form
    document.getElementById('newBrand').value = '';
    document.getElementById('newModel').value = '';
    document.getElementById('newPrice').value = '';
    document.getElementById('newImage').value = '';
    document.getElementById('newEngine').value = '';
    document.getElementById('newHorsepower').value = '';
    document.getElementById('newTransmission').value = '';
    
    showNotification('Vehicle added successfully!', 'success');
}

function deleteVehicle(id) {
    const car = inventory.find(c => c.id === id);
    if (!car) return;
    showConfirm(`Delete ${car.brand} ${car.model}?`, () => {
        inventory = inventory.filter(c => c.id !== id);
        localStorage.setItem('dealership_db', JSON.stringify(inventory));
        render();
        renderAdminInventory();
        showNotification('Vehicle deleted.', 'success');
    });
}

function editVehicle(id) {
    const car = inventory.find(c => c.id === id);
    if (!car) return;
    const modal = document.getElementById('adminModal');
    const addTab = document.getElementById('adminAddTab');
    addTab.innerHTML = `
        <div class="admin-form">
            <h4 style="margin-bottom:15px">✏️ Edit: ${sanitize(car.brand)} ${sanitize(car.model)}</h4>
            <input type="text" id="newBrand" value="${sanitize(car.brand)}" placeholder="Brand">
            <input type="text" id="newModel" value="${sanitize(car.model)}" placeholder="Model">
            <input type="number" id="newPrice" value="${car.price}" placeholder="Price in USD">
            <select id="newNation">
                ${['Japan','Germany','USA','Italy','UK','Sweden','India','China','South Korea','France','Croatia'].map(n =>
                    `<option value="${n}" ${car.nation === n ? 'selected' : ''}>${n}</option>`
                ).join('')}
            </select>
            <select id="newCategory">
                ${['Car','Bike','Bus'].map(c2 =>
                    `<option value="${c2}" ${car.category === c2 ? 'selected' : ''}>${c2}</option>`
                ).join('')}
            </select>
            <input type="text" id="newImage" value="${sanitize(car.img || '')}" placeholder="Image URL (optional)">
            <div class="specs-inputs">
                <input type="text" id="newEngine" value="${sanitize(car.engine || '')}" placeholder="Engine">
                <input type="number" id="newHorsepower" value="${car.horsepower || ''}" placeholder="Horsepower">
                <input type="text" id="newTransmission" value="${sanitize(car.transmission || '')}" placeholder="Transmission">
            </div>
            <div style="display:flex;gap:10px;margin-top:10px">
                <button onclick="saveEditVehicle(${id})" class="btn-primary" style="flex:1">💾 Save Changes</button>
                <button onclick="showAdminTab('add')" class="close-btn" style="flex:1">Cancel</button>
            </div>
        </div>
    `;
    showAdminTab('add');
}

function saveEditVehicle(id) {
    const car = inventory.find(c => c.id === id);
    if (!car) return;
    car.brand        = document.getElementById('newBrand').value || car.brand;
    car.model        = document.getElementById('newModel').value || car.model;
    car.price        = Number(document.getElementById('newPrice').value) || car.price;
    car.nation       = document.getElementById('newNation').value;
    car.category     = document.getElementById('newCategory').value;
    car.img          = document.getElementById('newImage').value || getCarImage(car.brand, car.model);
    car.engine       = document.getElementById('newEngine').value || car.engine;
    car.horsepower   = Number(document.getElementById('newHorsepower').value) || car.horsepower;
    car.transmission = document.getElementById('newTransmission').value || car.transmission;
    localStorage.setItem('dealership_db', JSON.stringify(inventory));
    render();
    showAdminTab('list');
    showNotification(`${car.brand} ${car.model} updated!`, 'success');
}

function showAdminTab(tab) {
    const addTab = document.getElementById('adminAddTab');
    const listTab = document.getElementById('adminListTab');
    const pendingTab = document.getElementById('adminPendingTab');
    const statsTab = document.getElementById('adminStatsTab');
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    [addTab, listTab, pendingTab, statsTab].forEach(t => t && t.classList.add('hidden'));

    if (tab === 'add') {
        addTab.classList.remove('hidden');
        buttons[0]?.classList.add('active');
    } else if (tab === 'list') {
        listTab.classList.remove('hidden');
        buttons[1]?.classList.add('active');
        renderAdminInventory();
    } else if (tab === 'pending') {
        pendingTab.classList.remove('hidden');
        buttons[2]?.classList.add('active');
        renderPendingListings();
    } else if (tab === 'stats') {
        statsTab.classList.remove('hidden');
        buttons[3]?.classList.add('active');
        renderDealerStats();
    }
}

function renderAdminInventory() {
    const list = document.getElementById('adminInventoryList');
    list.innerHTML = inventory.map(car => `
        <div class="inventory-item">
            <div class="info">
                <strong>${sanitize(car.brand)} ${sanitize(car.model)}</strong><br>
                <small>${sanitize(car.nation)} | ${car.category} | ${formatPrice(car.price)}
                ${car.featured ? ' | <span style="color:var(--warning)">\uD83D\uDE80 Featured</span>' : ''}</small>
            </div>
            <div class="actions">
                <button class="btn-edit" onclick="toggleFeatured(${car.id})">${car.featured ? '\u2B50 Unfeature' : '\uD83D\uDE80 Feature'}</button>
                <button class="btn-edit" onclick="editVehicle(${car.id})">Edit</button>
                <button class="btn-delete" onclick="deleteVehicle(${car.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function toggleFeatured(id) {
    const car = inventory.find(c => c.id === id);
    if (!car) return;
    car.featured = !car.featured;
    localStorage.setItem('dealership_db', JSON.stringify(inventory));
    renderAdminInventory();
    render();
    showNotification(`${car.brand} ${car.model} ${car.featured ? 'is now Featured \uD83D\uDE80' : 'removed from Featured'}`, 'success');
}

function renderPendingListings() {
    const tab = document.getElementById('adminPendingTab');
    if (!pendingListings.length) {
        tab.innerHTML = '<p style="opacity:0.6;padding:20px">No pending listings.</p>';
        return;
    }
    tab.innerHTML = pendingListings.map(l => `
        <div class="inventory-item">
            <div class="info">
                <strong>${sanitize(l.brand)} ${sanitize(l.model)} (${l.year})</strong><br>
                <small>${sanitize(l.city)} | ${l.category} | ${formatPrice(l.price)}</small><br>
                <small>Seller: ${sanitize(l.seller?.name)} · ${sanitize(l.seller?.phone)}</small>
            </div>
            <div class="actions">
                <button class="btn-edit" onclick="approveListing('${l.id}')">\u2714 Approve</button>
                <button class="btn-delete" onclick="rejectListing('${l.id}')">\u2716 Reject</button>
            </div>
        </div>
    `).join('');
}

function approveListing(id) {
    const idx = pendingListings.findIndex(l => l.id === id);
    if (idx === -1) return;
    const listing = pendingListings[idx];
    const newId = Math.max(...inventory.map(v => v.id)) + 1;
    const dealer = dealerRegistry.find(d => d.city === listing.city) || dealerRegistry[0];
    inventory.push({ ...listing, id: newId, dealerRef: dealer.id, status: 'approved', rating: 4.0, availability: 'In Stock', drivetrain: 'FWD', color: listing.color || 'White', bodyStyle: listing.bodyStyle || 'Sedan' });
    pendingListings.splice(idx, 1);
    localStorage.setItem('dealership_pending', JSON.stringify(pendingListings));
    localStorage.setItem('dealership_db', JSON.stringify(inventory));
    render();
    renderPendingListings();
    showNotification(`\u2714 ${listing.brand} ${listing.model} approved and live!`, 'success');
}

function rejectListing(id) {
    pendingListings = pendingListings.filter(l => l.id !== id);
    localStorage.setItem('dealership_pending', JSON.stringify(pendingListings));
    renderPendingListings();
    showNotification('Listing rejected.', 'warning');
}

function renderDealerStats() {
    const tab = document.getElementById('adminStatsTab');
    tab.innerHTML = `
        <h4 style="margin-bottom:15px">\uD83D\uDCCA Dealer Performance</h4>
        <div style="overflow-x:auto">
        <table class="compare-table">
            <thead><tr>
                <th>Dealer</th><th>City</th><th>Verified</th>
                <th>Views</th><th>Wishlists</th><th>Inquiries</th><th>Rating</th>
            </tr></thead>
            <tbody>
                ${dealerRegistry.map(d => {
                    const s = getDealerStats(d.id);
                    return `<tr>
                        <td><strong>${sanitize(d.name)}</strong></td>
                        <td>${sanitize(d.city)}</td>
                        <td>${d.verified ? '\u2714 Yes' : '\u2014'}</td>
                        <td>${s.views}</td>
                        <td>${s.wishlists}</td>
                        <td>${s.inquiries}</td>
                        <td>\u2B50 ${d.rating}</td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
        </div>
    `;
}

function checkAdminAccess() {
    if (sessionStorage.getItem('isAdmin') === 'true') {
        showAdminModal();
        return;
    }
    showPrompt('Enter Administrator Password:', '', (entry) => {
        if (verifyAdmin(entry)) {
            sessionStorage.setItem('isAdmin', 'true');
            showAdminModal();
        } else {
            showNotification('Access Denied: Incorrect Password.', 'error');
        }
    }, true);
}

function showAdminModal() {
    document.getElementById('adminModal').classList.remove('hidden');
    showAdminTab('add');
}

function closeAdmin() {
    document.getElementById('adminModal').classList.add('hidden');
}

// ============================================
// EXPORT
// ============================================

function exportInventory() {
    const dataStr = JSON.stringify(inventory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventory-' + new Date().toISOString().split('T')[0] + '.json';
    link.click();
    URL.revokeObjectURL(url);
}

// ============================================
// BACK TO TOP
// ============================================
window.addEventListener('scroll', () => {
    const btn = document.getElementById('backToTop');
    if (btn) btn.style.display = window.scrollY > 400 ? 'flex' : 'none';
});

// ============================================
// MOBILE SIDEBAR TOGGLE
// ============================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('collapsed');
}

function syncMobileSearch() {
    const val = document.getElementById('mobileSearchInput')?.value || '';
    const desktop = document.getElementById('searchBar');
    if (desktop) desktop.value = val;
    applyFilters();
}

function highlightBottomNav(el) {
    document.querySelectorAll('.bottom-nav-item').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
}

// ============================================
// MAP VIEW
// ============================================

let currentView = 'grid';
let leafletMap = null;

function setView(view) {
    currentView = view;
    const grid = document.getElementById('vehicleGrid');
    const mapEl = document.getElementById('mapView');
    const btnGrid = document.getElementById('viewGrid');
    const btnMap = document.getElementById('viewMap');

    if (view === 'map') {
        grid.classList.add('hidden');
        mapEl.classList.remove('hidden');
        btnGrid.classList.remove('active');
        btnMap.classList.add('active');
        renderMapView();
    } else {
        mapEl.classList.add('hidden');
        grid.classList.remove('hidden');
        btnGrid.classList.add('active');
        btnMap.classList.remove('active');
        if (leafletMap) { leafletMap.remove(); leafletMap = null; }
    }
}

function renderMapView() {
    const mapEl = document.getElementById('mapView');
    if (leafletMap) { leafletMap.remove(); leafletMap = null; }

    leafletMap = L.map(mapEl).setView([-1.286389, 36.817223], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18
    }).addTo(leafletMap);

    const shown = filteredInventory.slice(0, 200);
    const markerIcon = L.divIcon({ className: '', html: '<div class="map-marker">&#x1F697;</div>', iconSize: [32, 32], iconAnchor: [16, 32] });
    const bikeIcon  = L.divIcon({ className: '', html: '<div class="map-marker">&#x1F3CD;</div>', iconSize: [32, 32], iconAnchor: [16, 32] });
    const busIcon   = L.divIcon({ className: '', html: '<div class="map-marker">&#x1F68C;</div>', iconSize: [32, 32], iconAnchor: [16, 32] });

    shown.forEach(car => {
        const regDealer = car.dealerRef ? getDealerById(car.dealerRef) : assignDealer(car.id);
        // dealerRegistry has no lat/lng — look up coordinates from the global dealers array by city
        const geoDealer = dealers.find(d => d.address.includes(regDealer?.city || '')) || dealers[car.id % dealers.length];
        const icon = car.category === 'Bike' ? bikeIcon : car.category === 'Bus' ? busIcon : markerIcon;
        L.marker([geoDealer.lat, geoDealer.lng], { icon })
            .addTo(leafletMap)
            .bindPopup(`
                <div style="min-width:180px">
                    <img src="${car.img}" onerror="this.style.display='none'" style="width:100%;height:90px;object-fit:cover;border-radius:6px;margin-bottom:8px">
                    <strong>${car.brand} ${car.model}</strong><br>
                    <span style="color:#1a56db;font-weight:700">${formatPrice(car.price)}</span><br>
                    <small>${regDealer?.name || geoDealer.name} &bull; ${regDealer?.city || geoDealer.address}</small><br>
                    <button onclick="showDetailModal(${car.id})" style="margin-top:8px;padding:6px 12px;background:#1a56db;color:white;border:none;border-radius:6px;cursor:pointer;width:100%">View Details</button>
                </div>
            `);
    });

    // Fit map to markers
    const coords = shown.map(car => {
        const reg = car.dealerRef ? getDealerById(car.dealerRef) : assignDealer(car.id);
        const geo = dealers.find(d => d.address.includes(reg?.city || '')) || dealers[car.id % dealers.length];
        return [geo.lat, geo.lng];
    });
    if (coords.length) leafletMap.fitBounds(coords, { padding: [40, 40], maxZoom: 10 });
}

// ============================================
// BOOT
// ============================================

init();

// ============================================
// DARK MODE AUTO-DETECT
// ============================================
(function () {
    const saved = localStorage.getItem('theme');
    if (!saved) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = prefersDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        const btn = document.querySelector('.theme-btn');
        if (btn) btn.textContent = prefersDark ? '☀️' : '🌙';
    }
})();

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    const btn = document.querySelector('.theme-btn');
    if (btn) btn.textContent = next === 'dark' ? '☀️' : '🌙';
}

// ============================================
// WHATSAPP DIRECT CONTACT
// ============================================
function whatsappContact(brand, model, price) {
    const msg = encodeURIComponent(`Hi OmniDrive! I'm interested in the ${brand} ${model} priced at ${formatPrice(price)}. Please send more details.`);
    window.open(`https://wa.me/254700000000?text=${msg}`, '_blank');
}

function contactDealer(vehicleName) {
    const msg = encodeURIComponent(`Hi OmniDrive! I'm interested in the ${vehicleName}. Please send more details.`);
    window.open(`https://wa.me/254700000000?text=${msg}`, '_blank');
}

// ============================================
// ANIMATED STATS COUNTER
// ============================================
function animateCounter(el, target, duration = 1500) {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
        start += step;
        if (start >= target) { el.textContent = target.toLocaleString(); clearInterval(timer); return; }
        el.textContent = Math.floor(start).toLocaleString();
    }, 16);
}

function showStatsBar() {
    const existing = document.getElementById('statsBar');
    if (existing) return;
    const bar = document.createElement('div');
    bar.id = 'statsBar';
    bar.className = 'stats-bar';
    bar.innerHTML = `
        <div class="stat-item"><span class="stat-num" data-target="${inventory.length}">0</span><span class="stat-lbl">Vehicles</span></div>
        <div class="stat-item"><span class="stat-num" data-target="${dealerRegistry.length}">0</span><span class="stat-lbl">Dealers</span></div>
        <div class="stat-item"><span class="stat-num" data-target="20">0</span><span class="stat-lbl">Countries</span></div>
        <div class="stat-item"><span class="stat-num" data-target="50">0</span><span class="stat-lbl">Brands</span></div>
    `;
    const featured = document.querySelector('.featured-section');
    if (featured) featured.before(bar);
    bar.querySelectorAll('.stat-num').forEach(el => {
        animateCounter(el, parseInt(el.dataset.target));
    });
}

// ============================================
// NEWSLETTER SIGNUP
// ============================================
function showNewsletterModal() {
    const id = 'newsletterModal';
    if (document.getElementById(id)) return;
    const div = document.createElement('div');
    div.id = id;
    div.className = 'modal';
    div.innerHTML = `
        <div class="modal-content" style="max-width:420px;text-align:center">
            <div class="modal-header">
                <h3>📧 Stay in the Loop</h3>
                <button class="close-btn" onclick="document.getElementById('${id}').remove()">✕</button>
            </div>
            <p style="margin-bottom:20px;opacity:.8">Get weekly deals, new arrivals & price drops straight to your inbox.</p>
            <div class="filter-group">
                <input type="text" id="nlName" placeholder="Your name">
            </div>
            <div class="filter-group">
                <input type="email" id="nlEmail" placeholder="your@email.com">
            </div>
            <button onclick="subscribeNewsletter()" class="calc-btn">🚀 Subscribe — It's Free</button>
            <p style="font-size:.75rem;opacity:.5;margin-top:12px">No spam. Unsubscribe anytime.</p>
        </div>`;
    document.body.appendChild(div);
}

function subscribeNewsletter() {
    const name = document.getElementById('nlName').value.trim();
    const email = document.getElementById('nlEmail').value.trim();
    if (!name || !email) { showNotification('Please fill all fields', 'error'); return; }
    const subs = JSON.parse(localStorage.getItem('omnidrive_newsletter') || '[]');
    if (subs.find(s => s.email === email)) { showNotification('Already subscribed!', 'warning'); return; }
    subs.push({ name, email, date: new Date().toISOString() });
    localStorage.setItem('omnidrive_newsletter', JSON.stringify(subs));
    document.getElementById('newsletterModal')?.remove();
    showNotification(`🎉 Welcome ${name}! You're subscribed.`, 'success');
}

// ============================================
// WISHLIST PDF / TEXT EXPORT
// ============================================
function exportWishlist() {
    if (!wishlist.length) { showNotification('Your wishlist is empty', 'warning'); return; }
    const items = inventory.filter(c => wishlist.includes(c.id));
    const lines = [
        'OmniDrive Wishlist Export',
        `Generated: ${new Date().toLocaleString()}`,
        '─'.repeat(40),
        ...items.map((c, i) =>
            `${i + 1}. ${c.brand} ${c.model} (${c.year})\n   Price: ${formatPrice(c.price)}\n   Engine: ${c.engine} | ${c.horsepower}hp\n   Availability: ${c.availability}`
        ),
        '─'.repeat(40),
        `Total vehicles: ${items.length}`,
        `Combined value: ${formatPrice(items.reduce((s, c) => s + c.price, 0))}`
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'omnidrive-wishlist.txt';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Wishlist exported!', 'success');
}

// ============================================
// TEST DRIVE BOOKING
// ============================================
function showTestDriveBooking(carId) {
    const car = inventory.find(c => c.id === carId);
    if (!car) return;
    const dealer = car.dealerRef ? getDealerById(car.dealerRef) : assignDealer(car.id);
    const id = 'testDriveModal';
    document.getElementById(id)?.remove();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'modal';
    const today = new Date().toISOString().split('T')[0];
    div.innerHTML = `
        <div class="modal-content" style="max-width:480px">
            <div class="modal-header">
                <h3>🚗 Book a Test Drive</h3>
                <button class="close-btn" onclick="document.getElementById('${id}').remove()">✕ Exit</button>
            </div>
            <p style="margin-bottom:16px">Book a test drive for the <strong>${sanitize(car.brand)} ${sanitize(car.model)}</strong> at <strong>${sanitize(dealer?.name || 'OmniDrive')}</strong></p>
            <div class="filter-group"><label>Your Name *</label><input type="text" id="tdName" placeholder="Full name"></div>
            <div class="filter-group"><label>Phone *</label><input type="tel" id="tdPhone" placeholder="+2547XXXXXXXX"></div>
            <div class="filter-group"><label>Preferred Date *</label><input type="date" id="tdDate" min="${today}"></div>
            <div class="filter-group"><label>Preferred Time</label>
                <select id="tdTime">
                    <option>9:00 AM</option><option>10:00 AM</option><option>11:00 AM</option>
                    <option>12:00 PM</option><option>2:00 PM</option><option>3:00 PM</option><option>4:00 PM</option>
                </select>
            </div>
            <div class="filter-group"><label>Notes</label><textarea id="tdNotes" rows="2" placeholder="Any special requests..."></textarea></div>
            <button onclick="confirmTestDrive(${car.id})" class="calc-btn">✅ Confirm Booking</button>
        </div>`;
    document.body.appendChild(div);
}

function confirmTestDrive(carId) {
    const car = inventory.find(c => c.id === carId);
    const name = document.getElementById('tdName').value.trim();
    const phone = document.getElementById('tdPhone').value.trim();
    const date = document.getElementById('tdDate').value;
    const time = document.getElementById('tdTime').value;
    if (!name || !phone || !date) { showNotification('Please fill all required fields', 'error'); return; }
    const bookings = JSON.parse(localStorage.getItem('omnidrive_testdrives') || '[]');
    bookings.push({ carId, car: `${car.brand} ${car.model}`, name, phone, date, time, id: 'TD' + Date.now() });
    localStorage.setItem('omnidrive_testdrives', JSON.stringify(bookings));
    document.getElementById('testDriveModal')?.remove();
    showNotification(`✅ Test drive booked for ${car.brand} ${car.model} on ${date} at ${time}!`, 'success');
    // WhatsApp confirmation
    const msg = encodeURIComponent(`Hi OmniDrive! I've booked a test drive for ${car.brand} ${car.model} on ${date} at ${time}. Name: ${name}, Phone: ${phone}`);
    setTimeout(() => window.open(`https://wa.me/254700000000?text=${msg}`, '_blank'), 500);
}

// ============================================
// AI RECOMMENDATIONS (based on wishlist/viewed)
// ============================================
function getRecommendations() {
    const viewed = [...new Set([...recentlyViewed, ...wishlist])];
    if (!viewed.length) return inventory.filter(c => c.rating >= 4.7).slice(0, 6);

    const viewedCars = inventory.filter(c => viewed.includes(c.id));
    const avgPrice = viewedCars.reduce((s, c) => s + c.price, 0) / viewedCars.length;

    // Count frequency of each attribute
    const freq = (arr, key) => arr.reduce((m, c) => { m[c[key]] = (m[c[key]] || 0) + 1; return m; }, {});
    const fuelFreq     = freq(viewedCars, 'fuel');
    const catFreq      = freq(viewedCars, 'category');
    const brandFreq    = freq(viewedCars, 'brand');
    const bodyFreq     = freq(viewedCars, 'bodyStyle');
    const nationFreq   = freq(viewedCars, 'nation');

    return inventory
        .filter(c => !viewed.includes(c.id) && c.availability !== 'Pre-Order')
        .map(c => ({
            ...c,
            score:
                (catFreq[c.category]   || 0) * 4 +
                (fuelFreq[c.fuel]      || 0) * 3 +
                (bodyFreq[c.bodyStyle] || 0) * 2 +
                (brandFreq[c.brand]    || 0) * 2 +
                (nationFreq[c.nation]  || 0) * 1 +
                (Math.abs(c.price - avgPrice) < avgPrice * 0.4 ? 3 : 0) +
                (c.rating >= 4.8 ? 2 : c.rating >= 4.5 ? 1 : 0)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);
}

function showRecommendations() {
    const recs = getRecommendations();
    const id = 'recsModal';
    document.getElementById(id)?.remove();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'modal';
    div.innerHTML = `
        <div class="modal-content detail-modal-content">
            <div class="modal-header">
                <h3>🤖 Recommended For You</h3>
                <button class="close-btn" onclick="document.getElementById('${id}').remove()">✕ Exit</button>
            </div>
            <p style="opacity:.7;margin-bottom:20px">Based on your browsing & wishlist activity</p>
            <div class="featured-grid">
                ${recs.map(c => `
                    <div class="featured-card" onclick="document.getElementById('${id}').remove();showDetailModal(${c.id})">
                        <img src="${sanitize(c.img)}" alt="${sanitize(c.brand)}" onerror="this.src='https://placehold.co/250x150/131921/febd69?text=${encodeURIComponent(c.brand)}'">
                        <h4>${sanitize(c.brand)} ${sanitize(c.model)}</h4>
                        <p class="deal-price">${formatPrice(c.price)}</p>
                        <p style="font-size:.8rem;opacity:.7">⭐ ${c.rating} • ${sanitize(c.fuel)}</p>
                    </div>`).join('')}
            </div>
        </div>`;
    document.body.appendChild(div);
}

// ============================================
// FINANCING CALCULATOR (full)
// ============================================
function calculateFinance() {
    const price = parseFloat(document.getElementById('financePrice').value);
    const down = parseFloat(document.getElementById('financeDown').value) || 0;
    const term = parseInt(document.getElementById('financeTerm').value);
    const rate = parseFloat(document.getElementById('financeRate').value) / 100 / 12;
    if (!price || price <= 0) { showNotification('Enter a valid price', 'error'); return; }
    const principal = price - down;
    const monthly = rate > 0
        ? (principal * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1)
        : principal / term;
    const total = monthly * term;
    const interest = total - principal;
    document.getElementById('financeResult').innerHTML = `
        <div class="monthly">${formatPrice(monthly)}<small>/mo</small></div>
        <div class="total">Total: ${formatPrice(total)} | Interest: ${formatPrice(interest)}</div>
        <div style="margin-top:12px;font-size:.85rem;opacity:.7">
            Loan: ${formatPrice(principal)} over ${term} months at ${(rate * 12 * 100).toFixed(1)}% p.a.
        </div>`;
}

// ============================================
// TRADE-IN CALCULATOR
// ============================================
function showTradeInCalc() {
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    content.innerHTML = `
        <h2>🔄 Trade-In Calculator</h2>
        <p>Estimate your current vehicle's trade-in value.</p>
        <div class="finance-form">
            <div class="filter-group"><label>Brand</label><input type="text" id="tiB" placeholder="e.g. Toyota"></div>
            <div class="filter-group"><label>Model</label><input type="text" id="tiM" placeholder="e.g. Corolla"></div>
            <div class="filter-group"><label>Year</label><input type="number" id="tiY" placeholder="2018" min="1990" max="2026"></div>
            <div class="filter-group"><label>Mileage (km)</label><input type="number" id="tiKm" placeholder="80000"></div>
            <div class="filter-group"><label>Condition</label>
                <select id="tiC"><option value="5">Excellent</option><option value="4">Good</option><option value="3" selected>Fair</option><option value="2">Poor</option></select>
            </div>
            <button onclick="calcTradeIn()" class="calc-btn">Calculate Value</button>
            <div id="tiResult"></div>
        </div>`;
    modal.classList.remove('hidden');
}

function calcTradeIn() {
    const year = parseInt(document.getElementById('tiY').value);
    const km = parseInt(document.getElementById('tiKm').value) || 0;
    const cond = parseInt(document.getElementById('tiC').value);
    const brand = document.getElementById('tiB').value || 'Vehicle';
    const model = document.getElementById('tiM').value || '';
    if (!year) { showNotification('Please enter the year', 'error'); return; }
    const age = new Date().getFullYear() - year;
    const base = 25000;
    const ageFactor = Math.max(0.2, 1 - age * 0.08);
    const kmFactor = Math.max(0.5, 1 - (km / 300000) * 0.4);
    const condFactor = cond / 5;
    const value = Math.round(base * ageFactor * kmFactor * condFactor);
    document.getElementById('tiResult').innerHTML = `
        <div class="trade-in-result">
            <p>Estimated Trade-In Value for <strong>${sanitize(brand)} ${sanitize(model)}</strong></p>
            <div class="trade-value">${formatPrice(value)}</div>
            <p style="font-size:.85rem;opacity:.7;margin-top:8px">Range: ${formatPrice(value * 0.9)} – ${formatPrice(value * 1.1)}</p>
            <button onclick="showNotification('Our team will contact you within 24 hours!','success')" class="calc-btn" style="margin-top:12px">📞 Get Firm Offer</button>
        </div>`;
}

// ============================================
// INSURANCE CALCULATOR
// ============================================
function showInsuranceCalc() {
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    content.innerHTML = `
        <h2>🛡️ Insurance Quote</h2>
        <div class="finance-form">
            <div class="filter-group"><label>Vehicle Value (USD)</label><input type="number" id="insVal" placeholder="50000"></div>
            <div class="filter-group"><label>Driver Age</label><input type="number" id="insAge" placeholder="30" min="18" max="80"></div>
            <div class="filter-group"><label>Cover Type</label>
                <select id="insCover">
                    <option value="0.03">Third Party Only</option>
                    <option value="0.05" selected>Comprehensive</option>
                    <option value="0.07">Comprehensive + Extras</option>
                </select>
            </div>
            <button onclick="calcInsurance()" class="calc-btn">Get Quote</button>
            <div id="insResult"></div>
        </div>`;
    modal.classList.remove('hidden');
}

function calcInsurance() {
    const val = parseFloat(document.getElementById('insVal').value);
    const age = parseInt(document.getElementById('insAge').value) || 30;
    const rate = parseFloat(document.getElementById('insCover').value);
    if (!val) { showNotification('Enter vehicle value', 'error'); return; }
    const ageFactor = age < 25 ? 1.3 : age > 60 ? 1.15 : 1.0;
    const annual = val * rate * ageFactor;
    const monthly = annual / 12;
    document.getElementById('insResult').innerHTML = `
        <div class="insurance-result">
            <p>Estimated Annual Premium</p>
            <div class="premium-monthly">${formatPrice(annual)}/yr</div>
            <p style="opacity:.7">${formatPrice(monthly)}/month</p>
            <button onclick="showNotification('Insurance partner will contact you shortly!','success')" class="calc-btn" style="margin-top:12px">📋 Get Full Quote</button>
        </div>`;
}

// ============================================
// IMPORT DUTY CALCULATOR
// ============================================
function showImportCalc() {
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    content.innerHTML = `
        <h2>📦 Import Duty Calculator</h2>
        <div class="finance-form">
            <div class="filter-group"><label>Vehicle Value (USD)</label><input type="number" id="impVal" placeholder="30000"></div>
            <div class="filter-group"><label>Destination Country</label>
                <select id="impCountry">
                    <option value="0.25">Kenya (25%)</option>
                    <option value="0.20">Uganda (20%)</option>
                    <option value="0.25">Tanzania (25%)</option>
                    <option value="0.20">Rwanda (20%)</option>
                    <option value="0.35">Nigeria (35%)</option>
                    <option value="0.30">Ghana (30%)</option>
                    <option value="0.15">South Africa (15%)</option>
                </select>
            </div>
            <div class="filter-group"><label>Vehicle Age</label>
                <select id="impAge">
                    <option value="0">New (0 years)</option>
                    <option value="3">1–3 years</option>
                    <option value="5">4–5 years</option>
                    <option value="8">6–8 years</option>
                </select>
            </div>
            <button onclick="calcImport()" class="calc-btn">Calculate</button>
            <div id="impResult"></div>
        </div>`;
    modal.classList.remove('hidden');
}

function calcImport() {
    const val = parseFloat(document.getElementById('impVal').value);
    const rate = parseFloat(document.getElementById('impCountry').value);
    const age = parseInt(document.getElementById('impAge').value);
    if (!val) { showNotification('Enter vehicle value', 'error'); return; }
    const ageSurcharge = age >= 8 ? 0.10 : age >= 5 ? 0.05 : 0;
    const duty = val * (rate + ageSurcharge);
    const vat = val * 0.16;
    const excise = val * 0.20;
    const total = val + duty + vat + excise;
    document.getElementById('impResult').innerHTML = `
        <div class="import-result">
            <div class="import-item"><span>Vehicle Value</span><span>${formatPrice(val)}</span></div>
            <div class="import-item"><span>Import Duty (${((rate + ageSurcharge) * 100).toFixed(0)}%)</span><span>${formatPrice(duty)}</span></div>
            <div class="import-item"><span>VAT (16%)</span><span>${formatPrice(vat)}</span></div>
            <div class="import-item"><span>Excise Duty (20%)</span><span>${formatPrice(excise)}</span></div>
            <div class="import-total"><span>Total Landed Cost</span><span>${formatPrice(total)}</span></div>
        </div>`;
}

// ============================================
// SHIPPING CALCULATOR
// ============================================
function showShippingCalc() {
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    content.innerHTML = `
        <h2>🚢 Shipping Calculator</h2>
        <div class="finance-form">
            <div class="filter-group"><label>Origin</label>
                <select id="shipOrigin">
                    <option value="1200">Japan</option><option value="1500">Germany</option>
                    <option value="1800">USA</option><option value="900">UK</option>
                    <option value="1100">South Korea</option><option value="800">China</option>
                </select>
            </div>
            <div class="filter-group"><label>Destination</label>
                <select id="shipDest">
                    <option value="1.0">Kenya (Mombasa)</option><option value="1.1">Uganda (Kampala)</option>
                    <option value="1.05">Tanzania (Dar es Salaam)</option><option value="1.2">Rwanda (Kigali)</option>
                    <option value="1.3">DRC (Kinshasa)</option>
                </select>
            </div>
            <div class="filter-group"><label>Vehicle Type</label>
                <select id="shipType">
                    <option value="1.0">Car / SUV</option><option value="0.5">Motorcycle</option>
                    <option value="2.0">Van / Minibus</option><option value="3.5">Bus / Truck</option>
                </select>
            </div>
            <button onclick="calcShipping()" class="calc-btn">Calculate</button>
            <div id="shipResult"></div>
        </div>`;
    modal.classList.remove('hidden');
}

function calcShipping() {
    const base = parseInt(document.getElementById('shipOrigin').value);
    const destMult = parseFloat(document.getElementById('shipDest').value);
    const typeMult = parseFloat(document.getElementById('shipType').value);
    const freight = Math.round(base * destMult * typeMult);
    const insurance = Math.round(freight * 0.02);
    const handling = 350;
    const total = freight + insurance + handling;
    document.getElementById('shipResult').innerHTML = `
        <div class="import-result">
            <div class="import-item"><span>Sea Freight</span><span>${formatPrice(freight)}</span></div>
            <div class="import-item"><span>Marine Insurance (2%)</span><span>${formatPrice(insurance)}</span></div>
            <div class="import-item"><span>Port Handling</span><span>${formatPrice(handling)}</span></div>
            <div class="import-total"><span>Total Shipping</span><span>${formatPrice(total)}</span></div>
        </div>`;
}

// ============================================
// CLOSE MODAL HELPER (defined above)
// ============================================

// ============================================
// INIT EXTRAS (called after main init)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Show stats bar
    setTimeout(showStatsBar, 800);

    // Auto dark mode sync on system change
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            const theme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
        }
    });

    // Close mobile nav when clicking outside
    document.addEventListener('click', (e) => {
        const navTools = document.querySelector('.nav-tools');
        const hamburger = document.querySelector('.hamburger');
        if (navTools && navTools.classList.contains('mobile-open') &&
            !navTools.contains(e.target) && !hamburger.contains(e.target)) {
            navTools.classList.remove('mobile-open');
        }
    });

    // Close mobile nav when any nav-tool button is tapped
    document.querySelector('.nav-tools')?.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
            document.querySelector('.nav-tools')?.classList.remove('mobile-open');
        }
    });

    // Newsletter popup after 30s (only once per session)
    if (!sessionStorage.getItem('nlShown')) {
        setTimeout(() => {
            showNewsletterModal();
            sessionStorage.setItem('nlShown', '1');
        }, 30000);
    }
});

// ============================================
// RACE MODE — NFS Drag + CarX Drift
// ============================================

const raceOpponents = [
    { name: 'Street Rookie', car: 'Honda Civic Si', hp: 200, skill: 0.45, avatar: '🧑' },
    { name: 'Drift King', car: 'Nissan 180SX', hp: 320, skill: 0.65, avatar: '😎' },
    { name: 'Turbo Ghost', car: 'Subaru WRX STI', hp: 450, skill: 0.75, avatar: '👻' },
    { name: 'Neon Racer', car: 'Mitsubishi Evo IX', hp: 500, skill: 0.82, avatar: '🌟' },
    { name: 'The Phantom', car: 'Bugatti Chiron', hp: 1500, skill: 0.95, avatar: '💀' }
];

let raceState = { mode: null, playerCar: null, opponent: null, running: false, driftScore: 0, driftInterval: null };

function showRaceMode() {
    const modal = document.getElementById('raceModeModal');
    document.getElementById('raceModeContent').innerHTML = renderRaceLobby();
    modal.classList.remove('hidden');
}

function renderRaceLobby() {
    const raceCars = inventory.filter(v => v.category === 'Car' && v.horsepower >= 200).slice(0, 12);
    return `
        <div class="race-lobby">
            <div class="race-title-banner">
                <h2>🏎️ RACE MODE</h2>
                <p class="race-subtitle">Need for Speed · CarX Street</p>
            </div>

            <div class="race-mode-pick">
                <div class="race-mode-card ${raceState.mode === 'drag' ? 'race-mode-active' : ''}" onclick="selectRaceMode('drag')">
                    <div class="race-mode-icon">🚦</div>
                    <h3>Drag Race</h3>
                    <p>0–¼ mile sprint. Pure horsepower wins.</p>
                </div>
                <div class="race-mode-card ${raceState.mode === 'drift' ? 'race-mode-active' : ''}" onclick="selectRaceMode('drift')">
                    <div class="race-mode-icon">💨</div>
                    <h3>Drift Battle</h3>
                    <p>CarX style. Tap fast to rack up drift points.</p>
                </div>
            </div>

            <h4 class="race-section-label">🚗 Pick Your Car</h4>
            <div class="race-car-grid">
                ${raceCars.map(c => `
                    <div class="race-car-card ${raceState.playerCar?.id === c.id ? 'race-car-selected' : ''}" onclick="selectRaceCar(${c.id})">
                        <img src="${c.img}" alt="${c.model}" loading="lazy">
                        <div class="race-car-info">
                            <span class="race-car-name">${c.brand} ${c.model}</span>
                            <span class="race-car-hp">⚡ ${c.horsepower} HP</span>
                        </div>
                    </div>
                `).join('')}
            </div>

            <h4 class="race-section-label">👊 Choose Opponent</h4>
            <div class="race-opponents">
                ${raceOpponents.map((o, i) => `
                    <div class="race-opponent-card ${raceState.opponent === i ? 'race-opp-selected' : ''}" onclick="selectOpponent(${i})">
                        <span class="race-opp-avatar">${o.avatar}</span>
                        <div>
                            <div class="race-opp-name">${o.name}</div>
                            <div class="race-opp-car">${o.car} · ${o.hp} HP</div>
                        </div>
                        <div class="race-opp-skill">${['Easy','Easy','Medium','Hard','Insane'][i]}</div>
                    </div>
                `).join('')}
            </div>

            <button class="race-start-btn" onclick="startRace()">🚦 START RACE</button>
        </div>
    `;
}

function selectRaceMode(mode) {
    raceState.mode = mode;
    document.getElementById('raceModeContent').innerHTML = renderRaceLobby();
}

function selectRaceCar(id) {
    raceState.playerCar = inventory.find(v => v.id === id);
    document.getElementById('raceModeContent').innerHTML = renderRaceLobby();
}

function selectOpponent(i) {
    raceState.opponent = i;
    document.getElementById('raceModeContent').innerHTML = renderRaceLobby();
}

function startRace() {
    if (!raceState.mode) return showNotification('Pick a race mode first!', 'error');
    if (!raceState.playerCar) return showNotification('Pick your car first!', 'error');
    if (raceState.opponent === null) return showNotification('Pick an opponent!', 'error');
    raceState.mode === 'drag' ? runDragRace() : runDriftBattle();
}

function runDragRace() {
    const car = raceState.playerCar;
    const opp = raceOpponents[raceState.opponent];
    const content = document.getElementById('raceModeContent');

    content.innerHTML = `
        <div class="race-arena drag-arena">
            <div class="race-arena-header">
                <span>🚦 DRAG RACE</span>
                <span id="raceTimer">0.00s</span>
            </div>
            <div class="drag-track">
                <div class="drag-lane">
                    <span class="drag-label">YOU · ${car.brand} ${car.model}</span>
                    <div class="drag-bar-wrap"><div class="drag-bar player-bar" id="playerBar"></div></div>
                    <span class="drag-speed" id="playerSpeed">0 mph</span>
                </div>
                <div class="drag-lane">
                    <span class="drag-label">${opp.avatar} ${opp.name} · ${opp.car}</span>
                    <div class="drag-bar-wrap"><div class="drag-bar opp-bar" id="oppBar"></div></div>
                    <span class="drag-speed" id="oppSpeed">0 mph</span>
                </div>
            </div>
            <div class="drag-lights" id="dragLights">
                <span class="light red" id="l1"></span>
                <span class="light red" id="l2"></span>
                <span class="light red" id="l3"></span>
                <span class="light green hidden" id="lgo">GO!</span>
            </div>
            <div id="raceResult"></div>
        </div>
    `;

    // Countdown then race
    let count = 0;
    const lights = ['l1','l2','l3'];
    const countInterval = setInterval(() => {
        if (count < 3) {
            document.getElementById(lights[count])?.classList.add('light-on');
            count++;
        } else {
            clearInterval(countInterval);
            document.getElementById('lgo')?.classList.remove('hidden');
            animateDrag(car, opp);
        }
    }, 700);
}

function animateDrag(car, opp) {
    const playerHP = car.horsepower;
    const oppHP = opp.hp;
    const playerFactor = (playerHP / 1500) * 0.85 + Math.random() * 0.15;
    const oppFactor = opp.skill * 0.85 + Math.random() * 0.15;

    let playerPct = 0, oppPct = 0, elapsed = 0;
    const start = Date.now();

    const frame = setInterval(() => {
        elapsed = ((Date.now() - start) / 1000).toFixed(2);
        document.getElementById('raceTimer').innerText = elapsed + 's';

        playerPct = Math.min(100, playerPct + playerFactor * 2.2);
        oppPct = Math.min(100, oppPct + oppFactor * 2.2);

        const pSpeed = Math.round((playerPct / 100) * 180);
        const oSpeed = Math.round((oppPct / 100) * 180);

        document.getElementById('playerBar').style.width = playerPct + '%';
        document.getElementById('oppBar').style.width = oppPct + '%';
        document.getElementById('playerSpeed').innerText = pSpeed + ' mph';
        document.getElementById('oppSpeed').innerText = oSpeed + ' mph';

        if (playerPct >= 100 || oppPct >= 100) {
            clearInterval(frame);
            const won = playerPct >= oppPct;
            showRaceResult(won, elapsed, 'drag');
        }
    }, 50);
}

function runDriftBattle() {
    const car = raceState.playerCar;
    const opp = raceOpponents[raceState.opponent];
    raceState.driftScore = 0;
    raceState.running = true;

    document.getElementById('raceModeContent').innerHTML = `
        <div class="race-arena drift-arena">
            <div class="race-arena-header">
                <span>💨 DRIFT BATTLE · ${car.brand} ${car.model}</span>
                <span id="driftTimer">10</span>
            </div>
            <div class="drift-track">
                <div class="drift-road">
                    <div class="drift-car-wrap" id="driftCarWrap">
                        <img src="${car.img}" class="drift-car-img" id="driftCarImg" alt="${car.model}">
                        <div class="drift-smoke hidden" id="driftSmoke">💨💨</div>
                    </div>
                    <div class="drift-skid" id="driftSkid"></div>
                </div>
            </div>
            <div class="drift-score-panel">
                <div class="drift-score-box">
                    <span>YOUR SCORE</span>
                    <span class="drift-big-score" id="driftScore">0</span>
                </div>
                <div class="drift-score-box">
                    <span>${opp.avatar} ${opp.name}</span>
                    <span class="drift-big-score" id="oppDriftScore">0</span>
                </div>
            </div>
            <button class="drift-tap-btn" id="driftTapBtn" onclick="driftTap()">🔄 DRIFT!</button>
            <p class="drift-hint">Tap as fast as you can to score drift points!</p>
            <div id="raceResult"></div>
        </div>
    `;

    // Opponent auto-scores
    const oppTarget = Math.round(opp.skill * 950 + Math.random() * 200);
    let oppScore = 0;
    let timeLeft = 10;

    const oppInterval = setInterval(() => {
        oppScore = Math.min(oppTarget, oppScore + Math.round(oppTarget / 10));
        document.getElementById('oppDriftScore').innerText = oppScore;
    }, 1000);

    const countdown = setInterval(() => {
        timeLeft--;
        const el = document.getElementById('driftTimer');
        if (el) el.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdown);
            clearInterval(oppInterval);
            raceState.running = false;
            document.getElementById('driftTapBtn').disabled = true;
            const won = raceState.driftScore > oppScore;
            showRaceResult(won, raceState.driftScore, 'drift', oppScore);
        }
    }, 1000);
}

function driftTap() {
    if (!raceState.running) return;
    raceState.driftScore += Math.round(15 + Math.random() * 25);
    document.getElementById('driftScore').innerText = raceState.driftScore;

    // Visual feedback
    const wrap = document.getElementById('driftCarWrap');
    const smoke = document.getElementById('driftSmoke');
    const skid = document.getElementById('driftSkid');
    if (wrap) { wrap.classList.add('drift-shake'); setTimeout(() => wrap.classList.remove('drift-shake'), 200); }
    if (smoke) { smoke.classList.remove('hidden'); setTimeout(() => smoke.classList.add('hidden'), 300); }
    if (skid) {
        const mark = document.createElement('div');
        mark.className = 'skid-mark';
        mark.style.left = Math.random() * 80 + '%';
        skid.appendChild(mark);
        setTimeout(() => mark.remove(), 2000);
    }
}

function showRaceResult(won, stat, mode, oppStat) {
    const discount = won ? (raceState.opponent >= 3 ? 8 : raceState.opponent >= 2 ? 5 : 3) : 0;
    const resultEl = document.getElementById('raceResult');
    if (!resultEl) return;

    let rewardHTML = '';
    if (won && discount) {
        rewardHTML = `
                <div class="race-reward">
                    🎁 You earned a <strong>${discount}% discount</strong> on your next purchase!
                    <br><small>Code: <strong>RACE${discount}WIN</strong></small>
                </div>`;
    } else if (won) {
        rewardHTML = `<div class="race-reward">🎁 You earned a <strong>3% discount</strong>! Code: <strong>RACE3WIN</strong></div>`;
    } else {
        rewardHTML = `<p class="race-lose-msg">Train harder and come back stronger! 💪</p>`;
    }

    let distanceOrScoreHTML = '';
    if (mode === 'drag') {
        distanceOrScoreHTML = `<p>Quarter mile in <strong>${stat}s</strong></p>`;
    } else {
        distanceOrScoreHTML = `<p>Your score: <strong>${stat}</strong> · Opponent: <strong>${oppStat}</strong></p>`;
    }

    resultEl.innerHTML = `
        <div class="race-result ${won ? 'race-win' : 'race-lose'}">
            <div class="race-result-icon">${won ? '🏆' : '💥'}</div>
            <h2>${won ? 'YOU WIN!' : 'YOU LOSE!'}</h2>
            ${distanceOrScoreHTML}
            ${rewardHTML}
            <div class="race-result-btns">
                <button onclick="showRaceMode()" class="btn-secondary">🔄 Race Again</button>
                <button onclick="closeModal('raceModeModal')" class="calc-btn">🛒 Shop Now</button>
            </div>
        </div>
    `;
}

// ============================================
// FEEDBACK SYSTEM
// ============================================

let currentRating = 0;

function setRating(value) {
    currentRating = value;
    document.getElementById('ratingValue').value = value;
    
    // Update star display
    const stars = document.querySelectorAll('.rating-stars .star');
    stars.forEach((star, index) => {
        if (index < value) {
            star.style.color = '#ffc107'; // Gold color for selected stars
        } else {
            star.style.color = '#ccc'; // Default color for unselected stars
        }
    });
}

function showFeedbackModal() {
    // Reset form
    currentRating = 0;
    document.getElementById('ratingValue').value = '0';
    document.getElementById('feedbackType').value = '';
    document.getElementById('feedbackLike').value = '';
    document.getElementById('feedbackImprove').value = '';
    document.getElementById('feedbackRecommend').value = '';
    document.getElementById('feedbackEmail').value = '';
    document.getElementById('feedbackScreenshot').value = '';
    document.getElementById('feedbackResult').innerHTML = '';
    document.getElementById('feedbackFileInfo').innerHTML = '';
    document.getElementById('charCount').innerHTML = '0/500 characters';
    
    // Reset star display
    const stars = document.querySelectorAll('.rating-stars .star');
    stars.forEach(star => {
        star.style.color = '#ccc';
    });
    
    const modal = document.getElementById('feedbackModal');
    modal.classList.remove('hidden');
}

// Add character count functionality
function updateCharCount() {
    const textarea = document.getElementById('feedbackImprove');
    const count = textarea.value.length;
    const max = 500;
    document.getElementById('charCount').innerHTML = `${count}/${max} characters`;
    
    // Change color if over limit
    if (count > max) {
        document.getElementById('charCount').style.color = 'var(--danger)';
    } else {
        document.getElementById('charCount').style.color = 'var(--text-secondary)';
    }
}

// Handle file upload
function handleFileUpload() {
    const fileInput = document.getElementById('feedbackScreenshot');
    const fileInfo = document.getElementById('feedbackFileInfo');
    
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (!validTypes.includes(file.type)) {
            fileInfo.innerHTML = '<p class="error">Please upload a valid image file (JPG, PNG, GIF)</p>';
            fileInput.value = ''; // Clear invalid file
            return;
        }
        
        if (file.size > maxSize) {
            fileInfo.innerHTML = '<p class="error">File size must be less than 5MB</p>';
            fileInput.value = ''; // Clear oversized file
            return;
        }
        
        // Display file info
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        fileInfo.innerHTML = `
            <p class="success">Selected: ${file.name} (${fileSizeMB} MB)</p>
            <button type="button" onclick="removeFile()" class="btn-secondary" style="margin-top:5px;">Remove</button>
        `;
    } else {
        fileInfo.innerHTML = '';
    }
}

function removeFile() {
    document.getElementById('feedbackScreenshot').value = '';
    document.getElementById('feedbackFileInfo').innerHTML = '';
}

// Email validation function
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// ============================================
// SECTION SWITCHING FOR USER ROLES
// ============================================
function showSection(sectionId) {
    // Hide all main sections
    document.querySelectorAll('.main-wrapper, #adminModal, #liaisonModal').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show the requested section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.remove('hidden');
        
        // Special handling for modals
        if (sectionId === 'adminModal' || sectionId === 'liaisonModal') {
            section.classList.remove('hidden');
        }
    }
    
    // If showing admin or liaison sections, also handle their internal tabs
    if (sectionId === 'admin') {
        showAdminTab('list'); // Default to vehicle list for admin
    } else if (sectionId === 'liaison') {
        showLiaisonContent(); // Show liaison dashboard
    }
}

// ============================================
// LIAISON DASHBOARD
// ============================================
function showLiaisonContent() {
    // Show the liaison modal
    showModal('liaisonModal');
    
    // Initialize liaison dashboard content
    const liaisonContent = document.getElementById('liaisonContent');
    liaisonContent.innerHTML = `
        <div class="liaison-dashboard">
            <h2>🤝 Technical Liaison Dashboard</h2>
            <p class="liaison-subtitle">Manage your technical liaison activities</p>
            
            <!-- Liaison Stats -->
            <div class="liaison-stats">
                <div class="stat-box">
                    <div class="stat-number" id="liaisonConnections">0</div>
                    <div class="stat-label">Active Connections</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number" id="liaisonDeals">0</div>
                    <div class="stat-label">Deals Facilitated</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number" id="liaisonEarnings">0</div>
                    <div class="stat-label">Estimated Earnings (KES)</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number" id="liaisonRating">0.0</div>
                    <div class="stat-label">Satisfaction Rating</div>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="liaison-actions">
                <h3>Quick Actions</h3>
                <div class="action-grid">
                    <button onclick="showListVehicleModal()" class="liaison-action-btn">
                        <span>🚗</span>
                        <span>List Vehicle</span>
                        <p>Help clients list their vehicles</p>
                    </button>
                    <button onclick="showVinCheck()" class="liaison-action-btn">
                        <span>🔍</span>
                        <span>VIN Check</span>
                        <p>Run vehicle history checks</p>
                    </button>
                    <button onclick="showFinancingCalc()" class="liaison-action-btn">
                        <span>💰</span>
                        <span>Financing Calc</span>
                        <p>Calculate payment options</p>
                    </button>
                    <button onclick="showPriceAlerts()" class="liaison-action-btn">
                        <span>🔔</span>
                        <span>Price Alerts</span>
                        <p>Set up price notifications</p>
                    </button>
                </div>
            </div>
            
            <!-- Recent Activity -->
            <div class="liaison-recent">
                <h3>Recent Activity</h3>
                <div id="liaisonActivityFeed">
                    <p class="liaison-no-activity">No recent activity yet</p>
                </div>
            </div>
            
            <!-- Tools & Resources -->
            <div class="liaison-tools">
                <h3>Tools & Resources</h3>
                <div class="tool-grid">
                    <button onclick="showImportCalc()" class="liaison-tool-btn">
                        <span>📦</span>
                        <span>Import Calculator</span>
                    </button>
                    <button onclick="showTradeInCalc()" class="liaison-tool-btn">
                        <span>🔄</span>
                        <span>Trade-In Value</span>
                    </button>
                    <button onclick="showInsuranceCalc()" class="liaison-tool-btn">
                        <span>🛡️</span>
                        <span>Insurance Quotes</span>
                    </button>
                    <button onclick="showShippingCalc()" class="liaison-tool-btn">
                        <span>🚢</span>
                        <span>Shipping Calculator</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Initialize liaison stats (in a real app, this would come from API)
    initializeLiaisonStats();
}

// Initialize liaison dashboard stats
function initializeLiaisonStats() {
    // In a real app, these would come from user's actual data via API
    // For demo, we'll use random values or localStorage
    
    const connections = Math.floor(Math.random() * 50) + 5;
    const deals = Math.floor(Math.random() * 20) + 2;
    const earnings = (deals * 15000) + Math.floor(Math.random() * 50000);
    const rating = (Math.random() * 2 + 3.5).toFixed(1); // Between 3.5 and 5.5
    
    document.getElementById('liaisonConnections').textContent = connections;
    document.getElementById('liaisonDeals').textContent = deals;
    document.getElementById('liaisonEarnings').textContent = formatPrice(earnings);
    document.getElementById('liaisonRating').textContent = rating;
}

// ============================================
// USER ROLE HANDLING (Enhanced)
// ============================================
function handleUserLogin(userType, username) {
    // Close login modal
    closeLoginModal();
    
    // Show success message
    showNotification(`Welcome, ${username}! You are logged in as ${userType}.`, 'success');
    
    // Route to appropriate section based on user type
    setTimeout(() => {
        if (userType === 'admin') {
            showSection('admin');
            showAdminTab('list'); // Default to vehicle list
        } else if (userType === 'dealer') {
            showSection('dealers');
        } else if (userType === 'liaison') {
            showSection('liaison');
            showLiaisonContent(); // Initialize liaison dashboard
        } else if (userType === 'client') {
            // For clients, show the main vehicle showroom
            document.querySelector('.main-wrapper').classList.remove('hidden');
            setView('grid'); // Default to grid view
            highlightBottomNav(document.querySelector('.bottom-nav-item[onclick*="setView(\'grid\')"]));
            // Show welcome message for new clients
            showNotification(`Welcome to OmniDrive, ${username}! Start browsing vehicles to find your dream car.`, 'info');
        }
    }, 500);
}

function submitFeedback() {
    const rating = document.getElementById('ratingValue').value;
    const type = document.getElementById('feedbackType').value;
    const like = document.getElementById('feedbackLike').value;
    const improve = document.getElementById('feedbackImprove').value;
    const recommend = document.getElementById('feedbackRecommend').value;
    const email = document.getElementById('feedbackEmail').value;
    const screenshotFile = document.getElementById('feedbackScreenshot').files[0];
    
    // Validation
    if (!rating || rating === '0') {
        showFeedbackResult('Please select a rating', 'error');
        return;
    }
    
    if (!type) {
        showFeedbackResult('Please select a feedback type', 'error');
        return;
    }
    
    if (!like) {
        showFeedbackResult('Please select what you like most', 'error');
        return;
    }
    
    if (!recommend) {
        showFeedbackResult('Please indicate if you would recommend us', 'error');
        return;
    }
    
    // Validate email if provided
    if (email && !validateEmail(email)) {
        showFeedbackResult('Please enter a valid email address', 'error');
        return;
    }
    
    // Validate screenshot if provided (optional)
    if (screenshotFile) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(screenshotFile.type)) {
            showFeedbackResult('Please upload a valid image file (JPG, PNG, GIF)', 'error');
            return;
        }
        
        // Optional: Check file size (e.g., max 5MB)
        if (screenshotFile.size > 5 * 1024 * 1024) {
            showFeedbackResult('File size must be less than 5MB', 'error');
            return;
        }
    }
    
    // In a real app, this would send to a server API
    console.log('Feedback submitted:', {
        rating: parseInt(rating),
        type,
        like,
        improve,
        recommend: recommend || '',
        email: email || null,
        hasScreenshot: !!screenshotFile,
        timestamp: new Date().toISOString()
    });
    
    // Simulate successful submission
    showFeedbackResult('Thank you for your feedback!', 'success');
    
    // Optionally close after delay
    setTimeout(() => {
        closeModal('feedbackModal');
    }, 2000);
}

function showFeedbackResult(message, type) {
    const resultDiv = document.getElementById('feedbackResult');
    resultDiv.innerHTML = `<p class="${type}">${message}</p>`;
    resultDiv.style.display = 'block';
    
    // Auto-hide after 3 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            resultDiv.style.display = 'none';
        }, 3000);
    }
}
}
