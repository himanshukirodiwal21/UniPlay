/*
const loginToggle = document.getElementById("loginToggle");
const signupToggle = document.getElementById("signupToggle");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

signupToggle.addEventListener("click", () => {
  loginToggle.classList.remove("active");
  signupToggle.classList.add("active");
  loginForm.style.display = "none";
  signupForm.style.display = "block";
});

loginToggle.addEventListener("click", () => {
  signupToggle.classList.remove("active");
  loginToggle.classList.add("active");
  signupForm.style.display = "none";
  loginForm.style.display = "block";
});

// Wait for the entire page to load before running any scripts
document.addEventListener('DOMContentLoaded', function () {

    // --- Code for Login/Signup Page ---
    // This code will only run if an element with the ID "loginForm" exists.
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        const loginToggle = document.getElementById("loginToggle");
        const signupToggle = document.getElementById("signupToggle");
        const signupForm = document.getElementById("signupForm");

        signupToggle.addEventListener("click", () => {
            loginToggle.classList.remove("active");
            signupToggle.classList.add("active");
            loginForm.style.display = "none";
            signupForm.style.display = "block";
        });

        loginToggle.addEventListener("click", () => {
            signupToggle.classList.remove("active");
            loginToggle.classList.add("active");
            signupForm.style.display = "none";
            loginForm.style.display = "block";
        });
    }


    // --- Code for Team Registration Page ---
    // This code will only run if an element with the ID "registrationForm" exists.
    const registrationForm = document.getElementById("registrationForm");
    if (registrationForm) {
        const addMemberBtn = document.getElementById('add-member-btn');
        const teamMembersList = document.getElementById('team-members-list');
        const successMessage = document.getElementById('success-message');
        let memberCount = 1;

        addMemberBtn.addEventListener('click', function () {
            memberCount++;
            const newMemberGroup = document.createElement('div');
            newMemberGroup.classList.add('member-group');
            newMemberGroup.innerHTML = `
                <input type="text" name="memberName[]" placeholder="Member ${memberCount}: Full Name" required>
                <input type="text" name="memberId[]" placeholder="Member ${memberCount}: Student ID" required>
            `;
            teamMembersList.appendChild(newMemberGroup);
        });

        registrationForm.addEventListener('submit', function (event) {
            event.preventDefault();
            registrationForm.style.display = 'none';
            document.querySelector('.form-header').style.display = 'none';
            successMessage.classList.remove('hidden');
        });
    }
    
    // --- You can add any other code for your main index.html page here ---
    // For example, if you have a mobile menu, its code would go here,
    // possibly inside its own check like: if (document.querySelector('.mobile-menu-button')) { ... }

});

*/


// UniPlay Combined JavaScript

document.addEventListener('DOMContentLoaded', () => {


    // for date select in create_event.html



    // --- Logic for Login/Signup Page (login.html) ---
    const loginToggle = document.getElementById("loginToggle");
    const signupToggle = document.getElementById("signupToggle");
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    // Check if the toggle buttons exist before adding listeners
    if (loginToggle && signupToggle) {
        signupToggle.addEventListener("click", () => {
            loginToggle.classList.remove("active");
            signupToggle.classList.add("active");
            loginForm.style.display = "none";
            signupForm.style.display = "block";
        });

        loginToggle.addEventListener("click", () => {
            signupToggle.classList.remove("active");
            loginToggle.classList.add("active");
            signupForm.style.display = "none";
            loginForm.style.display = "block";
        });
    }


    // --- Logic for Creating Events (create_event.html) ---
    const eventForm = document.getElementById('createEventForm');

    // Check if the event creation form exists
    if (eventForm) {
        const successMessage = document.getElementById('successMessage');

        eventForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent page reload

            // Get values from the form
            const newEvent = {
                name: document.getElementById('eventName').value.trim(),
                date: document.getElementById('eventDate').value.trim(),
                location: document.getElementById('eventLocation').value.trim(),
                image: document.getElementById('eventImage').value.trim(),
            };

            // Save the new event to localStorage
            saveEventToStorage(newEvent);

            // Show success message and clear the form
            successMessage.classList.remove('hidden');
            eventForm.reset();

            setTimeout(() => {
                successMessage.classList.add('hidden');
            }, 5000);
        });
    }

    // Function to save an event to localStorage
    function saveEventToStorage(eventObject) {
        const events = JSON.parse(localStorage.getItem('uniplay_events')) || [];
        events.unshift(eventObject); // Add new event to the beginning
        localStorage.setItem('uniplay_events', JSON.stringify(events));
    }


    // --- Logic for Displaying Events (index.html) ---
    const eventsGrid = document.querySelector('#events .card-grid');

    // Check if the events grid exists on the page
    if (eventsGrid) {
        const savedEvents = JSON.parse(localStorage.getItem('uniplay_events')) || [];

        savedEvents.forEach(event => {
            const card = document.createElement('div');
            card.className = 'card';

            card.innerHTML = `
                <img src="${event.image}" alt="${event.name}">
                <div class="card-content">
                    <h3>${event.name}</h3>
                    <p><i class="fa-regular fa-calendar-alt"></i> Starts: ${event.date}</p>
                    <p><i class="fa-solid fa-location-dot"></i> ${event.location}</p>
                    <a href="#" class="btn btn-secondary">View Details</a>
                </div>
            `;
            // prepend adds the new card to the beginning of the grid
            eventsGrid.prepend(card);
        });
    }
});