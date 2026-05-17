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
// Maid Registration & Data Management (ExtendsClass Free Cloud Database / localStorage fallback)
// -------------------------------------------------------------

const maidForm = document.getElementById('maidForm');
const maidsGrid = document.getElementById('maidsGrid');
const noMaidsMessage = document.getElementById('noMaidsMessage');
const searchLocation = document.getElementById('searchLocation');
const filterWorkType = document.getElementById('filterWorkType');

// Free ExtendsClass JSON Bin Configuration
const API_URL = 'https://extendsclass.com/api/json-storage/bin/bbbabfa';
const API_HEADERS = {
    'Content-Type': 'application/json',
    'Security-key': 'homehelp123'
};

// Helper to load all maids from cloud database
async function getMaids() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Database not reachable");
        const json = await response.json();
        
        // Ensure we handle standard return format or fallback to empty array
        const maids = json.data || [];
        
        // Keep a copy in localStorage for backup
        localStorage.setItem('maids', JSON.stringify(maids));
        return maids;
    } catch (e) {
        console.warn("Cloud DB unavailable. Falling back to LocalStorage:", e);
        return JSON.parse(localStorage.getItem('maids')) || [];
    }
}

// Helper to overwrite the entire maids list (for both adding and deleting)
async function overwriteMaids(updatedList) {
    // Save to local storage instantly as backup
    localStorage.setItem('maids', JSON.stringify(updatedList));
    
    try {
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: API_HEADERS,
            body: JSON.stringify({ data: updatedList })
        });
        if (!response.ok) throw new Error("Cloud update failed");
        return true;
    } catch (e) {
        console.warn("Overwrite failed, relying on LocalStorage:", e);
        return true;
    }
}

// Helper to save a single new maid
async function saveMaid(newMaid) {
    const maids = await getMaids();
    maids.push(newMaid);
    return await overwriteMaids(maids);
}

// Handle form submission
maidForm.addEventListener('submit', async function(e) {
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
        availableTime: `${document.getElementById('availableTimeStart').value} to ${document.getElementById('availableTimeEnd').value}`,
        expectedSalary: document.getElementById('expectedSalary').value,
        description: document.getElementById('description').value
    };

    // Save using cloud DB
    await saveMaid(newMaid);

    // Show alert and reset form
    alert('Maid details added successfully');
    maidForm.reset();

    // Navigate to available maids page to see the new entry
    navigateTo('available-section');
});

// Load maids and display them
async function loadMaids() {
    const maids = await getMaids();
    
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
async function deleteMaid(id) {
    if (confirm('Are you sure you want to delete this maid profile?')) {
        let maids = await getMaids();
        maids = maids.filter(maid => maid.id !== id);
        await overwriteMaids(maids);
        loadMaids(); // Reload the grid
    }
}

// Event listeners for search and filter
searchLocation.addEventListener('input', loadMaids);
filterWorkType.addEventListener('change', loadMaids);

// Initial Load & Custom Validations
document.addEventListener('DOMContentLoaded', () => {
    // DOM Inputs for validation
    const fullName = document.getElementById('fullName');
    const contactName = document.getElementById('contactName');
    const contactEmail = document.getElementById('contactEmail');
    const age = document.getElementById('age');
    const phone = document.getElementById('phone');

    // Custom Name Validation Helper
    const setupNameValidation = (inputElement) => {
        if (!inputElement) return;
        const validate = () => {
            if (inputElement.validity.patternMismatch) {
                inputElement.setCustomValidity("Please enter a valid name (alphabets, spaces, dots, hyphens, or apostrophes only).");
            } else {
                inputElement.setCustomValidity("");
            }
        };
        inputElement.addEventListener('input', validate);
        inputElement.addEventListener('invalid', validate);
    };

    // Custom Email Validation Helper
    const setupEmailValidation = (inputElement) => {
        if (!inputElement) return;
        const validate = () => {
            if (inputElement.validity.patternMismatch) {
                inputElement.setCustomValidity("Please enter a valid Gmail address (e.g. user@gmail.com).");
            } else {
                inputElement.setCustomValidity("");
            }
        };
        inputElement.addEventListener('input', validate);
        inputElement.addEventListener('invalid', validate);
    };

    // Custom Age Validation Helper
    const setupAgeValidation = (inputElement) => {
        if (!inputElement) return;
        const validate = () => {
            if (inputElement.validity.rangeUnderflow || inputElement.validity.rangeOverflow) {
                inputElement.setCustomValidity("Age must be between 18 and 70.");
            } else {
                inputElement.setCustomValidity("");
            }
        };
        inputElement.addEventListener('input', validate);
        inputElement.addEventListener('invalid', validate);
    };

    // Custom Time Range Validation
    const setupTimeValidation = () => {
        const startTimeSelect = document.getElementById('availableTimeStart');
        const endTimeSelect = document.getElementById('availableTimeEnd');
        if (!startTimeSelect || !endTimeSelect) return;

        const parseTime = (timeStr) => {
            if (!timeStr) return 0;
            const [time, modifier] = timeStr.split(' ');
            let [hours, minutes] = time.split(':');
            hours = parseInt(hours);
            if (modifier === 'PM' && hours !== 12) {
                hours += 12;
            }
            if (modifier === 'AM' && hours === 12) {
                hours = 0;
            }
            return hours;
        };

        const validate = () => {
            const startHour = parseTime(startTimeSelect.value);
            const endHour = parseTime(endTimeSelect.value);

            if (startTimeSelect.value && endTimeSelect.value) {
                if (endHour <= startHour) {
                    endTimeSelect.setCustomValidity("End time must be later than start time.");
                } else {
                    endTimeSelect.setCustomValidity("");
                }
            }
        };

        startTimeSelect.addEventListener('change', validate);
        endTimeSelect.addEventListener('change', validate);
    };

    // Custom Phone Validation Helper
    const setupPhoneValidation = (inputElement) => {
        if (!inputElement) return;
        const validate = () => {
            if (inputElement.validity.patternMismatch) {
                inputElement.setCustomValidity("Please enter a valid phone number (e.g. +91 9876543210 or 9876543210).");
            } else {
                inputElement.setCustomValidity("");
            }
        };
        inputElement.addEventListener('input', validate);
        inputElement.addEventListener('invalid', validate);
    };

    // Apply validations
    setupNameValidation(fullName);
    setupNameValidation(contactName);
    setupEmailValidation(contactEmail);
    setupAgeValidation(age);
    setupPhoneValidation(phone);
    setupTimeValidation();
});

// Contact Form Prevent Default (Demo)
document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    e.target.reset();
});

// Register Service Worker for PWA (Mobile/Desktop App Capabilities) with Cache-Busting Version Query
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js?v=3')
            .then(reg => {
                console.log('Service Worker registered successfully!', reg);
                // Listen for updates
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('New service worker available, prompting reload...');
                                window.location.reload();
                            }
                        });
                    }
                });
            })
            .catch(err => console.log('Service Worker registration failed:', err));
    });

    // Handle service worker updates immediately
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            refreshing = true;
            window.location.reload();
        }
    });
}
