import { db, auth } from "./js/firebase-config.js";

import {
    collection,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


import {
    onAuthStateChanged,
    signOut,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ==========================
// AUTH CHECK
// ==========================

let currentAdmin = null;

const ADMIN_EMAIL = "littlemonksltd@gmail.com";
const isAdminEmail = (email) =>
    email?.trim().toLowerCase() === ADMIN_EMAIL;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "admin-login.html";
        return;
    }

    console.log(user);
    console.log("Email verified:", user.emailVerified);


    // ==========================
    // EMAIL NOT VERIFIED
    // ==========================
    if (!user.emailVerified) {

        alert("Please verify your email before accessing the admin dashboard.");

        await signOut(auth);

        window.location.href = "admin-login.html";

        return;

    }

    // ==========================
    // NOT THE ADMIN ACCOUNT
    // ==========================
    if (!isAdminEmail(user.email)) {

        alert("Access denied. Administrator privileges required.");

        await signOut(auth);

        window.location.href = "admin-login.html";

        return;

    }

    // ==========================
    // AUTHORIZED ADMIN
    // ==========================
    currentAdmin = user;

    if (currentAdminEmail) {

        currentAdminEmail.textContent = user.email;

    }
    document.body.style.display = "flex";
    console.log("✅ Admin authenticated:", user.email);

});


// ==========================
// ELEMENTS
// ==========================

const bookingsTable = document.getElementById("bookingsTable");

const totalBookings = document.getElementById("totalBookings");

const pendingBookings = document.getElementById("pendingBookings");

const completedBookings = document.getElementById("completedBookings");
const confirmedBookings =
    document.getElementById("confirmedBookings");
const paidRevenue = document.getElementById("paidRevenue");
const liveStatus = document.getElementById("liveStatus");
const actionQueue = document.getElementById("actionQueue");
const attentionCount = document.getElementById("attentionCount");
const railQuoteRequests = document.getElementById("railQuoteRequests");
const railReceivable = document.getElementById("railReceivable");
const railPaidRevenue = document.getElementById("railPaidRevenue");

const logoutBtn = document.getElementById("logoutBtn");
const currentAdminEmail =
    document.getElementById("currentAdminEmail");


const changePasswordBtn =
    document.getElementById("changePasswordBtn");
const customersTable = document.getElementById("customersTable");
const paymentsTable = document.getElementById("paymentsTable");
const clearBookingFilters = document.getElementById("clearBookingFilters");




// ==========================
// STORE BOOKINGS
// ==========================

let allBookings = {};

let destinationData = {};

let serviceData = {};

let selectedBookingId = null;
let bookingDocuments = [];
let activeBookingFilter = "all";

function isAwaitingQuote(booking) {
    return ["pending", "pending quote"].includes(
        (booking.status || "").toLowerCase()
    );
}

function renderBookings() {
    const searchTerm = document.getElementById("searchBooking").value.trim().toLowerCase();
    const statusFilter = document.getElementById("statusFilter").value;
    const destinationFilter = document.getElementById("destinationFilter").value;
    const filteredBookings = bookingDocuments.filter(({ booking }) => {
        const matchesSearch = [booking.fullName, booking.email, booking.phone]
            .some((value) => value?.toLowerCase().includes(searchTerm));
        const matchesKpi = activeBookingFilter === "all" ||
            (activeBookingFilter === "pending quote" && isAwaitingQuote(booking)) ||
            (activeBookingFilter === "payment pending" &&
                booking.quotation?.sent && booking.payment?.status !== "Paid") ||
            booking.status?.toLowerCase() === activeBookingFilter;
        const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
        const matchesDestination = destinationFilter === "all" || booking.destination === destinationFilter;

        return matchesSearch && matchesKpi && matchesStatus && matchesDestination;
    });

    bookingsTable.innerHTML = "";

    filteredBookings.forEach(({ id, booking }) => {
        bookingsTable.innerHTML += `
        <tr>
            <td>${booking.fullName}</td>
            <td>${booking.destination}</td>
            <td>${booking.service}</td>
            <td>${booking.travelDate}</td>
            <td><span class="status ${(booking.status || "Pending").toLowerCase()}">${booking.status}</span></td>
            <td>
                <button class="viewBtn" onclick="viewBooking('${id}')">View</button>
                <button class="confirmBtn" onclick="confirmBooking('${id}')">Confirm</button>
                <button class="deleteBtn" onclick="deleteBooking('${id}')">Delete</button>
            </td>
        </tr>`;
    });

    document.getElementById("bookingResultCount").textContent =
        `${filteredBookings.length} of ${bookingDocuments.length} booking${bookingDocuments.length === 1 ? "" : "s"}`;
}

function setBookingFilter(filter) {
    activeBookingFilter = filter;
    document.getElementById("statusFilter").value = "all";

    document.querySelectorAll("[data-booking-filter]").forEach((card) => {
        const isSelected = card.dataset.bookingFilter === filter;
        card.classList.toggle("is-selected", isSelected);
        card.setAttribute("aria-pressed", String(isSelected));
    });

    renderBookings();
}

function clearFilters() {
    activeBookingFilter = "all";
    document.getElementById("searchBooking").value = "";
    document.getElementById("statusFilter").value = "all";
    document.getElementById("destinationFilter").value = "all";

    document.querySelectorAll("[data-booking-filter]").forEach((card) => {
        const isSelected = card.dataset.bookingFilter === "all";
        card.classList.toggle("is-selected", isSelected);
        card.setAttribute("aria-pressed", String(isSelected));
    });

    renderBookings();
}

function populateDestinationFilter() {
    const destinationFilter = document.getElementById("destinationFilter");
    const selectedDestination = destinationFilter.value;
    const destinations = [...new Set(
        bookingDocuments
            .map(({ booking }) => booking.destination)
            .filter(Boolean)
    )].sort();

    destinationFilter.replaceChildren(new Option("All Destinations", "all"));
    destinations.forEach((destination) => {
        destinationFilter.add(new Option(destination, destination));
    });

    destinationFilter.value = destinations.includes(selectedDestination)
        ? selectedDestination
        : "all";
}

function getAttentionState(booking) {
    if (isAwaitingQuote(booking)) {
        return "Quotation needed";
    }

    if (booking.quotation?.sent && booking.payment?.status !== "Paid") {
        return "Payment pending";
    }

    if (booking.status === "Confirmed") {
        return "Upcoming journey";
    }

    return "Booking update";
}

function renderActionQueue() {
    const priorityBookings = bookingDocuments
        .filter(({ booking }) => isAwaitingQuote(booking) ||
            (booking.quotation?.sent && booking.payment?.status !== "Paid") ||
            booking.status === "Confirmed")
        .slice(0, 5);

    attentionCount.textContent = priorityBookings.length;
    actionQueue.replaceChildren();

    if (priorityBookings.length === 0) {
        const emptyState = document.createElement("p");
        emptyState.className = "queue-empty";
        emptyState.textContent = bookingDocuments.length === 0
            ? "No bookings have been received yet. New requests will appear here automatically."
            : "Nothing needs immediate action. Your booking queue is up to date.";
        actionQueue.appendChild(emptyState);
        return;
    }

    priorityBookings.forEach(({ id, booking }) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "queue-item";
        item.dataset.bookingId = id;

        const details = document.createElement("span");
        details.className = "queue-details";
        const name = document.createElement("strong");
        name.textContent = booking.fullName || "Unnamed customer";
        const journey = document.createElement("span");
        journey.textContent = booking.destination || booking.service || "Journey details pending";
        details.append(name, journey);

        const state = document.createElement("span");
        state.className = "queue-state";
        state.textContent = getAttentionState(booking);
        item.append(details, state);
        actionQueue.appendChild(item);
    });
}

// ==========================
// LOAD BOOKINGS
// ==========================

onSnapshot(
    collection(db, "bookings"),
    (snapshot) => {

        liveStatus.textContent = "Live data connected";
        liveStatus.parentElement.classList.remove("is-error");

        destinationData = {};
        serviceData = {};
        allBookings = {};
        bookingDocuments = [];


        if (customersTable) customersTable.innerHTML = "";
        if (paymentsTable) paymentsTable.innerHTML = "";

        let total = 0;

        let pending = 0;

        let confirmed = 0;

        let completed = 0;

        let quoted = 0;
        let revenue = 0;
        let receivable = 0;



        snapshot.forEach((document) => {


            total++;


            const booking = document.data();
            console.log(document.id, JSON.stringify(booking, null, 2));
            // Analytics counting


            if (destinationData[booking.destination]) {

                destinationData[booking.destination]++;

            }
            else {

                destinationData[booking.destination] = 1;

            }



            if (serviceData[booking.service]) {

                serviceData[booking.service]++;

            }
            else {

                serviceData[booking.service] = 1;

            }



            // Save booking locally for viewing

            allBookings[document.id] = booking;
            bookingDocuments.push({ id: document.id, booking });



            if (
                booking.status === "Pending" ||
                booking.status === "Pending Quote"
            ) {
                pending++;
            }


            if (booking.status === "Confirmed") {
                confirmed++;
            }


            if (booking.status === "Completed") {
                completed++;
            }

            if (booking.payment?.status === "Paid") {
                revenue += Number(booking.quotation?.amount) || 0;
            }

            if (booking.quotation?.sent && booking.payment?.status !== "Paid") {
                receivable += Number(booking.quotation?.amount) || 0;
            }


            if (customersTable) {

                customersTable.innerHTML += `
        <tr>
            <td>${booking.fullName}</td>
            <td>${booking.email}</td>
            <td>${booking.phone}</td>
            <td>${booking.destination}</td>
        </tr>
    `;

            }

            if (paymentsTable) {

                paymentsTable.innerHTML += `
<tr>
    <td>${booking.fullName}</td>
    <td>KES ${booking.quotation?.amount || 0}</td>
    <td>${booking.payment?.status || "Unpaid"}</td>
    <td>${booking.payment?.method || "-"}</td>
    <td>${booking.payment?.receipt || "-"}</td>
    <td>${booking.payment?.paidAt || "-"}</td>
</tr>
`;

            }


        });



        totalBookings.textContent = total;

        pendingBookings.textContent = pending;

        confirmedBookings.textContent = confirmed;

        completedBookings.textContent = completed;

        paidRevenue.textContent = `KES ${revenue.toLocaleString("en-KE")}`;
        railQuoteRequests.textContent = pending;
        railReceivable.textContent = `KES ${receivable.toLocaleString("en-KE")}`;
        railPaidRevenue.textContent = `KES ${revenue.toLocaleString("en-KE")}`;

        populateDestinationFilter();
        renderBookings();
        renderActionQueue();

        loadCharts();

    },
    (error) => {

        console.error("Firestore listener error:", error);
        liveStatus.textContent = "Live data unavailable";
        liveStatus.parentElement.classList.add("is-error");
        attentionCount.textContent = "!";
        actionQueue.replaceChildren();
        const errorState = document.createElement("p");
        errorState.className = "queue-empty";
        errorState.textContent = "Bookings could not be loaded. Check the Firestore rules and your administrator access, then refresh.";
        actionQueue.appendChild(errorState);





    });

document.querySelectorAll("[data-booking-filter]").forEach((card) => {
    card.addEventListener("click", () => {
        setBookingFilter(card.dataset.bookingFilter);
        document.querySelector('[data-section="bookings"]').click();
    });
});

document.getElementById("searchBooking").addEventListener("input", renderBookings);
document.getElementById("statusFilter").addEventListener("change", renderBookings);
document.getElementById("destinationFilter").addEventListener("change", renderBookings);
clearBookingFilters.addEventListener("click", clearFilters);

actionQueue.addEventListener("click", (event) => {
    const queueItem = event.target.closest("[data-booking-id]");
    if (queueItem) window.viewBooking(queueItem.dataset.bookingId);
});




// ==========================
// CONFIRM BOOKING
// ==========================

window.confirmBooking = async function (id) {


    try {


        await updateDoc(
            doc(db, "bookings", id),
            {

                status: "Confirmed"

            }
        );


        alert("Booking confirmed");


    }
    catch (error) {

        console.error(error);

    }


};





// ==========================
// DELETE BOOKING
// ==========================

window.deleteBooking = async function (id) {


    if (confirm("Delete this booking?")) {


        try {


            await deleteDoc(
                doc(db, "bookings", id)
            );


            alert("Booking deleted");


        }
        catch (error) {

            console.error(error);

        }


    }


};





// ==========================
// VIEW BOOKING DETAILS
// ==========================

window.viewBooking = function (id) {
    selectedBookingId = id;
    const booking = allBookings[id];
    document.getElementById("bookingDetails").innerHTML = `



    <p><strong>Name:</strong> ${booking.fullName}</p>

    <p><strong>Email:</strong> ${booking.email}</p>

    <p><strong>Phone:</strong> ${booking.phone}</p>

    <p><strong>Service:</strong> ${booking.service}</p>
    <p><strong>Vehicle Reserved:</strong>
${booking.vehicleReservation || "None"}
</p>

    <p><strong>Destination:</strong> ${booking.destination}</p>

    <p><strong>Travel Date:</strong> ${booking.travelDate}</p>

    <p><strong>Return Date:</strong> ${booking.returnDate}</p>

    <p><strong>Passengers:</strong> ${booking.passengers}</p>

    <p><strong>Pickup:</strong> ${booking.pickup}</p>

    <p><strong>Drop-off:</strong> ${booking.dropoff}</p>

    <p><strong>Payment:</strong> ${booking.paymentMethod}</p>

    <p><strong>Promo Code:</strong> ${booking.promoCode || "None"}</p>

    <p><strong>Special Requests:</strong> ${booking.specialRequests || "None"}</p>

    <p><strong>Status:</strong> ${booking.status}</p>
    <hr>

<h3>Quotation</h3>

<p>
<strong>Amount:</strong>
KES ${booking.quotation?.amount || 0}
</p>

<p>
<p><strong>Payment Status:</strong>
${booking.payment?.status || "Unpaid"}
</p>


<hr>

<h3>Create Quotation</h3>

<div class="quotation-box">

<input 
type="number"
id="quoteAmount"
placeholder="Amount in KES">


<button 
id="sendQuoteBtn"
class="confirmBtn">

Send Quote

</button>

</div>


`;



    document.getElementById("bookingModal").style.display = "flex";


};





// ==========================
// CLOSE MODAL
// ==========================

const closeModal = document.getElementById("closeModal");


closeModal.onclick = function () {


    document.getElementById("bookingModal").style.display = "none";


};





window.onclick = function (event) {


    const modal = document.getElementById("bookingModal");


    if (event.target === modal) {


        modal.style.display = "none";


    }


};





// ==========================
// LOGOUT
// ==========================

if (logoutBtn) {


    logoutBtn.addEventListener("click", async () => {


        await signOut(auth);


        window.location.href = "admin-login.html";


    });


}
let destinationChart;
let serviceChart;



function loadCharts() {


    const destinationCtx =
        document.getElementById("destinationChart");

    const serviceCtx =
        document.getElementById("serviceChart");



    if (destinationChart) {

        destinationChart.destroy();

    }


    if (serviceChart) {

        serviceChart.destroy();

    }
    destinationChart = new Chart(
        destinationCtx,
        {

            type: "doughnut",

            data: {


                labels: Object.keys(destinationData),


                datasets: [{

                    label: "Bookings",

                    data: Object.values(destinationData),

                    backgroundColor: [
                        "#c9a227",
                        "#0b5a34",
                        "#e4c766",
                        "#48745e",
                        "#7f915f",
                        "#8b6b32"
                    ],

                    borderColor: "#062e1b",

                    borderWidth: 3

                }]


            },


            options: {

                responsive: true,

                plugins: {
                    legend: {
                        labels: {
                            color: "#f8f3e7"
                        }
                    }
                }

            }


        });
    serviceChart = new Chart(
        serviceCtx,
        {


            type: "bar",


            data: {


                labels: Object.keys(serviceData),


                datasets: [{

                    label: "Requests",

                    data: Object.values(serviceData),

                    backgroundColor: "#c9a227",

                    borderRadius: 3

                }]


            },


            options: {


                responsive: true,


                scales: {


                    y: {

                        beginAtZero: true,

                        ticks: {
                            color: "#c9d0cb",
                            precision: 0
                        },

                        grid: {
                            color: "rgba(248, 243, 231, .12)"
                        }

                    },

                    x: {
                        ticks: {
                            color: "#c9d0cb"
                        },

                        grid: {
                            display: false
                        }


                    }


                }


            }


        });


}
// ==========================
// SEND QUOTATION
// ==========================

document.getElementById("bookingDetails").addEventListener("click", async (event) => {


    if (event.target.id !== "sendQuoteBtn") {

        return;

    }



    const amount =
        document.getElementById("quoteAmount").value;



    if (!amount) {

        alert("Enter quotation amount");

        return;

    }



    try {


        const booking = allBookings[selectedBookingId];



        if (!booking) {

            throw new Error("Select a booking before sending quotation");

        }



        event.target.disabled = true;

        event.target.textContent = "Sending...";



        // UPDATE FIRESTORE WITH QUOTATION ONLY

        await updateDoc(

            doc(db, "bookings", selectedBookingId),

            {

                quotation: {

                    amount: Number(amount),

                    currency: "KES",

                    sent: true,

                    sentAt: new Date().toISOString()

                },

                payment: {

                    status: "Pending",

                    amount: Number(amount),

                    method: "M-Pesa",

                    receipt: "",

                    phone: "",

                    paidAt: ""

                },

                status: "Quoted"

            }

        );
        await emailjs.send(
            "service_d869q6m",
            "template_2pc3qfh",
            {
                ...booking,
                quotationAmount: amount
            }
        );

        alert(
            "Quotation sent successfully"
        );



        document.getElementById("bookingModal").style.display = "none";


    }



    catch (error) {


        console.error(error);


        alert(
            error.message
        );


    }



    finally {


        event.target.disabled = false;

        event.target.textContent = "Send Quote";


    }



});
// ==========================
// SIDEBAR NAVIGATION
// ==========================

const navItems = document.querySelectorAll(".nav-item");

const sections = {
    dashboard: document.getElementById("dashboardSection"),
    bookings: document.getElementById("bookingsSection"),
    customers: document.getElementById("customersSection"),
    payments: document.getElementById("paymentsSection"),
    settings: document.getElementById("settingsSection")
};

navItems.forEach(item => {

    item.addEventListener("click", () => {

        // Active menu
        navItems.forEach(nav => nav.classList.remove("active"));
        item.classList.add("active");

        // Hide all sections
        Object.values(sections).forEach(section => {
            section.style.display = "none";
        });

        // Show selected section
        sections[item.dataset.section].style.display = "block";

    });

});

// ==========================
// PASSWORD STRENGTH CHECK
// ==========================

function validatePassword(password) {

    const errors = [];

    if (password.length < 10) {
        errors.push("• At least 10 characters");
    }

    if (!/[A-Z]/.test(password)) {
        errors.push("• One uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
        errors.push("• One lowercase letter");
    }

    if (!/[0-9]/.test(password)) {
        errors.push("• One number");
    }

    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
        errors.push("• One special character");
    }

    return errors;

}
const passwordInput =
    document.getElementById("newPassword");

const passwordStrength =
    document.getElementById("passwordStrength");

if (passwordInput) {

    passwordInput.addEventListener("input", () => {

        const password = passwordInput.value;

        let score = 0;

        if (password.length >= 10) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

        if (score <= 2) {

            passwordStrength.textContent =
                "Password strength: Weak";

            passwordStrength.style.color = "#e74c3c";

        }

        else if (score === 3 || score === 4) {

            passwordStrength.textContent =
                "Password strength: Medium";

            passwordStrength.style.color = "#f39c12";

        }

        else {

            passwordStrength.textContent =
                "Password strength: Strong";

            passwordStrength.style.color = "#27ae60";

        }

    });

}

// ==========================
// CHANGE PASSWORD
// ==========================

if (changePasswordBtn) {


    changePasswordBtn.addEventListener("click", async () => {


        const currentPassword =
            document.getElementById("currentPassword").value;


        const newPassword =
            document.getElementById("newPassword").value;



        if (!currentPassword || !newPassword) {

            alert("Fill in both password fields");

            return;

        }



        const passwordErrors = validatePassword(newPassword);

        if (passwordErrors.length > 0) {

            alert(
                `Your password is not strong enough.

                 It must contain:

                   ${passwordErrors.join("\n")}`
            );

            return;

        }



        try {


            const credential =
                EmailAuthProvider.credential(
                    currentAdmin.email,
                    currentPassword
                );



            await reauthenticateWithCredential(
                currentAdmin,
                credential
            );



            await updatePassword(
                currentAdmin,
                newPassword
            );



            alert("Password changed successfully");



            document.getElementById("currentPassword").value = "";
            document.getElementById("newPassword").value = "";


        }


        catch (error) {


            console.error(error);


            if (error.code === "auth/wrong-password") {

                alert("Current password is incorrect");

            }


            else {

                alert(error.message);

            }


        }



    });


}
// ==========================
// PASSWORD VISIBILITY TOGGLE
// ==========================


const togglePasswords =
    document.querySelectorAll(".toggle-password");


togglePasswords.forEach(toggle => {


    toggle.addEventListener("click", () => {


        const targetId =
            toggle.dataset.target;


        const input =
            document.getElementById(targetId);



        if (input.type === "password") {

            input.type = "text";

            toggle.textContent = "🙈";

        }

        else {

            input.type = "password";

            toggle.textContent = "👁️";

        }


    });


});

document.querySelectorAll("[data-sidebar-filter]").forEach((metric) => {
    metric.addEventListener("click", () => {
        setBookingFilter(metric.dataset.sidebarFilter);
        document.querySelector('[data-section="bookings"]').click();
    });
});