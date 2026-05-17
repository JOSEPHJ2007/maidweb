// DOM Elements
const navLinks = document.querySelectorAll('.nav-item');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-item');
const sections = document.querySelectorAll('.page-section');
const hamburger = document.getElementById('hamburger');
const navLinksContainer = document.getElementById('navLinks');

// Navigation Logic
function navigateTo(sectionId) {
    // Hide all sections
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all desktop and mobile links
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    mobileNavLinks.forEach(link => {
        link.classList.remove('active');
    });

    // Show target section
    document.getElementById(sectionId).classList.add('active');

    // Add active class to corresponding link
    const activeLink = document.querySelector(`.nav-item[data-target="${sectionId}"]`);
    if(activeLink) activeLink.classList.add('active');

    const activeMobileLink = document.querySelector(`.mobile-nav-item[data-target="${sectionId}"]`);
    if(activeMobileLink) activeMobileLink.classList.add('active');

    // Close hamburger menu on mobile
    if (window.innerWidth <= 768) {
        navLinksContainer.classList.remove('show');
    }

    // If navigating to available section, reload data
    if (sectionId === 'available-section') {
        loadMaids();
    }
}

// Event Listeners for Navigation (Desktop & Mobile)
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = link.getAttribute('data-target');
        navigateTo(targetSection);
    });
});

mobileNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = link.getAttribute('data-target');
        navigateTo(targetSection);
    });
});

// Hamburger Menu Toggle
hamburger.addEventListener('click', () => {
    navLinksContainer.classList.toggle('show');
});

// -------------------------------------------------------------
// Maid Registration & Data Management (localStorage)
// -------------------------------------------------------------

const maidForm = document.getElementById('maidForm');
const maidsGrid = document.getElementById('maidsGrid');
const noMaidsMessage = document.getElementById('noMaidsMessage');
const searchLocation = document.getElementById('searchLocation');
const filterWorkType = document.getElementById('filterWorkType');

// Handle form submission
maidForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Get form values
    const newMaid = {
        id: Date.now().toString(), // Unique ID
        name: document.getElementById('fullName').value,
        age: document.getElementById('age').value,
        gender: document.getElementById('gender').value,
        location: document.getElementById('location').value,
        phone: document.getElementById('phone').value,
        workType: document.getElementById('workType').value,
        experience: document.getElementById('experience').value,
        availableTime: document.getElementById('availableTime').value,
        expectedSalary: document.getElementById('expectedSalary').value,
        description: document.getElementById('description').value
    };

    // Save to localStorage
    let maids = JSON.parse(localStorage.getItem('maids')) || [];
    maids.push(newMaid);
    localStorage.setItem('maids', JSON.stringify(maids));

    // Show alert and reset form
    alert('Maid details added successfully');
    maidForm.reset();

    // Navigate to available maids page to see the new entry
    navigateTo('available-section');
});

// Load maids from localStorage and display them
function loadMaids() {
    const maids = JSON.parse(localStorage.getItem('maids')) || [];
    
    // Apply filters
    const searchTerm = searchLocation.value.toLowerCase();
    const filterType = filterWorkType.value;

    const filteredMaids = maids.filter(maid => {
        const matchesLocation = maid.location.toLowerCase().includes(searchTerm);
        const matchesType = (filterType === 'All') || (maid.workType === filterType);
        return matchesLocation && matchesType;
    });

    renderMaids(filteredMaids);
}

// Render maid cards to the DOM
function renderMaids(maidsArray) {
    maidsGrid.innerHTML = ''; // Clear current grid

    if (maidsArray.length === 0) {
        noMaidsMessage.style.display = 'block';
    } else {
        noMaidsMessage.style.display = 'none';
        
        maidsArray.forEach(maid => {
            const card = document.createElement('div');
            card.className = 'maid-card';
            
            card.innerHTML = `
                <div class="maid-header">
                    <div class="maid-title">
                        <h3>${maid.name}</h3>
                        <p><i class="fa-solid fa-location-dot"></i> ${maid.location}</p>
                    </div>
                    <span class="maid-badge">${maid.workType}</span>
                </div>
                <div class="maid-body">
                    <div class="maid-info">
                        <div class="info-block">
                            <span>Age / Gender</span>
                            <strong>${maid.age} Yrs, ${maid.gender}</strong>
                        </div>
                        <div class="info-block">
                            <span>Experience</span>
                            <strong>${maid.experience} Years</strong>
                        </div>
                        <div class="info-block">
                            <span>Available</span>
                            <strong>${maid.availableTime}</strong>
                        </div>
                        <div class="info-block">
                            <span>Salary</span>
                            <strong>${maid.expectedSalary}</strong>
                        </div>
                    </div>
                    <div class="maid-desc">
                        ${maid.description}
                    </div>
                </div>
                <div class="maid-footer">
                    <a href="tel:${maid.phone}" class="btn btn-secondary">
                        <i class="fa-solid fa-phone"></i> Call Now
                    </a>
                    <button class="btn btn-danger" onclick="deleteMaid('${maid.id}')">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>
            `;
            
            maidsGrid.appendChild(card);
        });
    }
}

// Delete a maid
function deleteMaid(id) {
    if (confirm('Are you sure you want to delete this maid profile?')) {
        let maids = JSON.parse(localStorage.getItem('maids')) || [];
        maids = maids.filter(maid => maid.id !== id);
        localStorage.setItem('maids', JSON.stringify(maids));
        loadMaids(); // Reload the grid
    }
}

// Event listeners for search and filter
searchLocation.addEventListener('input', loadMaids);
filterWorkType.addEventListener('change', loadMaids);

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    // Optional: Add some dummy data if empty for demo purposes
    // (As requested, keeping simple. If user wants empty, we leave it empty)
    
    // loadMaids() is called when navigating to the section, 
    // but let's just initialize it in background
    // loadMaids();
});

// Contact Form Prevent Default (Demo)
document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    e.target.reset();
});

// Register Service Worker for PWA (Mobile/Desktop App Capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registered successfully!', reg))
            .catch(err => console.log('Service Worker registration failed:', err));
    });
}
