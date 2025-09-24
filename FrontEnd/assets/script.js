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


// --- Logic for User Registration (frontend -> backend) ---
document.addEventListener('DOMContentLoaded', () => {

    const signupForm = document.getElementById("signupForm");

    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = {
                fullName: document.getElementById("signup-name").value.trim(),
                username: document.getElementById("signup-username").value.trim(),
                email: document.getElementById("signup-email").value.trim(),
                password: document.getElementById("signup-password").value.trim(),
            };

            try {
                const response = await fetch("http://localhost:8000/api/v1/users/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });

                const data = await response.json();

                if (response.ok) {
                    Toastify({
                        text: data.message || "User registered successfully!",
                        duration: 3000,
                        gravity: "top",
                        position: "right",
                        backgroundColor: "#4CAF50", // green for success
                    }).showToast();

                    // Redirect after 2.5s so user sees the toast
                    setTimeout(() => {
                        window.location.href = "index.html"; // your home page
                    }, 2000);

                } else {
                    Toastify({
                        text: data.message || "User already exits!",
                        duration: 3000,
                        gravity: "top",
                        position: "right",
                        backgroundColor: "#FF6B6B", // red for error
                    }).showToast();
                }

            } catch (err) {
                console.error(err);
                Toastify({
                    text: "Error connecting to server!",
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    backgroundColor: "#FF6B6B",
                }).showToast();
            }
        });
    }

});


document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) {
    console.error("Login form not found (id=loginForm)");
    return;
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    try {
      const res = await fetch("http://localhost:8000/api/v1/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // keep if backend sets cookies
        body: JSON.stringify({ email, password }),
      });

      // Debug logs
      console.log("HTTP status:", res.status, res.statusText);
      console.log("Response headers:", Array.from(res.headers.entries()));

      // Try parse JSON, fallback to text
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch (err) { data = text; }

      console.log("Response body:", data);

      if (res.ok) {
        // success
        Toastify({ text: data?.message || "Login successful", duration: 3000, gravity: "top", position: "right", backgroundColor: "#4CAF50" }).showToast();
        // store token if present
        const token = data?.data?.accessToken || data?.accessToken || null;
        if (token) localStorage.setItem("accessToken", token);
        setTimeout(()=> window.location.href = "index.html", 1200);
      } else {
        // show server reason if present
        const errMsg = (data && (data.message || data.msg || JSON.stringify(data))) || `HTTP ${res.status}`;
        Toastify({ text: errMsg, duration: 3500, gravity: "top", position: "right", backgroundColor: "#FF6B6B" }).showToast();
      }
    } catch (err) {
      console.error("Fetch/network error:", err);
      Toastify({ text: "Network or CORS error — check console", duration: 4000, gravity: "top", position: "right", backgroundColor: "#FF6B6B" }).showToast();
    }
  });
});

