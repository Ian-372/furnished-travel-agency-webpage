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

const ADMIN_EMAIL = "ianmutuli36@gmail.com";

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "admin-login.html";
        return;
    }

    console.log(user);
    console.log("Email verified:", user.emailVerified);

    // ==========================
    // USER NOT LOGGED IN
    // ==========================
    if (!user) {

        window.location.href = "admin-login.html";

        return;

    }

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
    if (user.email !== ADMIN_EMAIL) {

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

    console.log("✅ Admin authenticated:", user.email);

});


// ==========================
// ELEMENTS
// ==========================

const bookingsTable = document.getElementById("bookingsTable");

const totalBookings = document.getElementById("totalBookings");

const pendingBookings = document.getElementById("pendingBookings");

const completedBookings = document.getElementById("completedBookings");

const logoutBtn = document.getElementById("logoutBtn");
const currentAdminEmail =
    document.getElementById("currentAdminEmail");


const changePasswordBtn =
    document.getElementById("changePasswordBtn");
const customersTable = document.getElementById("customersTable");
const paymentsTable = document.getElementById("paymentsTable");




// ==========================
// STORE BOOKINGS
// ==========================

let allBookings = {};

let destinationData = {};

let serviceData = {};

let selectedBookingId = null;

// ==========================
// LOAD BOOKINGS
// ==========================

onSnapshot(collection(db, "bookings"), (snapshot) => {


    bookingsTable.innerHTML = "";


    if (customersTable) customersTable.innerHTML = "";
    if (paymentsTable) paymentsTable.innerHTML = "";


    let total = 0;

    let pending = 0;

    let completed = 0;

    let quoted = 0;



    snapshot.forEach((document) => {


        total++;


        const booking = document.data();
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




        if (booking.status === "Pending") {

            pending++;

        }



        if (booking.status === "Completed") {

            completed++;

        }

        if (booking.status === "Quoted") {

            quoted++;

        }





        bookingsTable.innerHTML += `


        <tr>


            <td>${booking.fullName}</td>


            <td>${booking.destination}</td>


            <td>${booking.service}</td>


            <td>${booking.travelDate}</td>



            <td>

                <span class="status ${booking.status.toLowerCase()}">

                    ${booking.status}

                </span>

            </td>



            <td>


                <button 
                class="viewBtn"
                onclick="viewBooking('${document.id}')">

                    View

                </button>



                <button
                class="confirmBtn"
                onclick="confirmBooking('${document.id}')">

                    Confirm

                </button>




                <button
                class="deleteBtn"
                onclick="deleteBooking('${document.id}')">

                    Delete

                </button>


            </td>



        </tr>


        `;
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
        </tr>
    `;

        }


    });



    totalBookings.textContent = total;

    pendingBookings.textContent = pending;

    completedBookings.textContent = completed;
    loadCharts();



});




// ==========================
// CONFIRM BOOKING
// ==========================

window.confirmBooking = async function (id) {


    try {


        await updateDoc(
            doc(db, "bookings", id),
            {

                status: "Completed"

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

                    data: Object.values(destinationData)

                }]


            },


            options: {

                responsive: true

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

                    data: Object.values(serviceData)

                }]


            },


            options: {


                responsive: true,


                scales: {


                    y: {


                        beginAtZero: true


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
            "service_ekdc1xn",
            "template_rmzvqlc",
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