import { db, auth } from "./firebase-config.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";




console.log("Booking module loaded");
window.addEventListener("DOMContentLoaded", () => {


    const savedBooking =
        sessionStorage.getItem("pendingBooking");


    if (savedBooking) {


        const data =
            JSON.parse(savedBooking);


        Object.keys(data).forEach((key) => {


            const field =
                document.getElementById(key);


            if (field) {

                field.value = data[key];

            }


        });


        sessionStorage.removeItem(
            "pendingBooking"
        );


        console.log(
            "Previous booking details restored"
        );

    }


});


// ==========================
// FORCE LOGIN BEFORE BOOKING
// ==========================



const bookingForm = document.getElementById("bookingForm");
const bookJourneyBtn =
    document.getElementById("bookJourneyBtn");
console.log("Book button:", bookJourneyBtn);


if (bookJourneyBtn) {

    bookJourneyBtn.addEventListener("click", () => {


        const user = auth.currentUser;


        console.log("Button clicked");
        console.log("Current user:", user);


        if (!user) {

            sessionStorage.setItem(
                "redirectAfterLogin",
                "index.html#booking"
            );


            window.location.href = "login.html";


            return;

        }


        bookingForm.requestSubmit();


    });

}


// ==========================
// PHONE INPUT SYSTEM
// ==========================

const phoneInput = document.querySelector("#phone");
const countryCode = document.querySelector("#countryCode");




// ==========================
// SHOW/HIDE VEHICLE FIELDS
// ==========================

const serviceSelect = document.getElementById("service");
const vehicleFields = document.getElementById("vehicleFields");

if (serviceSelect && vehicleFields) {
    serviceSelect.addEventListener("change", () => {
        if (serviceSelect.value === "Vehicle Reservation") {
            vehicleFields.style.display = "block";
        } else {
            vehicleFields.style.display = "none";
        }
    });
}
bookingForm.addEventListener("submit", async (e) => {

    e.preventDefault();
    // ==========================
    // PHONE VALIDATION
    // ==========================


    if (!phoneInput || !countryCode) {

        alert("Phone input system not loaded");

        return;

    }
    const enteredNumber = phoneInput.value.trim();

    const fullPhone =
        countryCode.value + enteredNumber.replace(/^0+/, "");



    console.log("Typed:", enteredNumber);
    console.log("Country Code:", countryCode.value);
    console.log("Final Phone:", fullPhone);


    // basic validation
    const digits = enteredNumber.replace(/\D/g, "");

    if (digits.length < 7 || digits.length > 12) {

        alert("Please enter a valid phone number.");
        return;

    }
    const user = auth.currentUser;

    if (!user) {


        const formData =
            Object.fromEntries(
                new FormData(bookingForm)
            );


        sessionStorage.setItem(
            "pendingBooking",
            JSON.stringify(formData)
        );


        sessionStorage.setItem(
            "redirectAfterLogin",
            "index.html#booking"
        );


        window.location.href =
            "login.html";


        return;

    }



    const destination =
        document.getElementById("destination").value === "other"
            ? document.getElementById("otherDestination").value
            : document.getElementById("destination").value;


    const booking = {
        userId: user.uid,

        customerEmail: user.email,

        fullName: document.getElementById("fullName").value,

        email: document.getElementById("email").value,

        phone: fullPhone,
        service: document.getElementById("service").value,
        vehicleReservation:
            document.getElementById("vehicleReservation").value,

        destination: destination,

        travelDate: document.getElementById("travelDate").value,

        returnDate: document.getElementById("returnDate").value,

        passengers: Number(document.getElementById("passengers").value),

        pickup: document.getElementById("pickup").value,

        dropoff: document.getElementById("dropoff").value,

        paymentMethod: document.getElementById("paymentMethod").value,

        promoCode: document.getElementById("promoCode").value,

        specialRequests: document.getElementById("specialRequests").value,
        // Vehicle Reservation Details

        vehicleType:
            document.getElementById("vehicleType")?.value || "",

        pickupTime:
            document.getElementById("pickupTime")?.value || "",

        driverRequired:
            document.getElementById("driverRequired")?.value || "",

        hireDays:
            document.getElementById("hireDays")?.value || "",


        // Booking awaiting quotation
        status: "Pending Quote",


        quotation: {

            amount: 0,

            currency: "KES",

            sent: false

        },


        payment: {

            status: "Pending Quote",

            method: "",

            transactionId: ""

        },


        createdAt: serverTimestamp()

    };


    try {


        // ==========================
        // SAVE BOOKING TO FIRESTORE
        // ==========================


        const docRef = await addDoc(
            collection(db, "bookings"),
            booking
        );


        console.log("Booking ID:", docRef.id);



        // ==========================
        // EMAIL CUSTOMER
        // ==========================


        await emailjs.send(
            "service_ekdc1xn",
            "template_rmzvqlc",
            booking
        );



        // ==========================
        // EMAIL COMPANY
        // ==========================


        await emailjs.send(
            "service_ekdc1xn",
            "template_z6szxdk",
            {
                ...booking,
                bookingDate: new Date().toLocaleString()
            }
        );



        // ==========================
        // SUCCESS MESSAGE
        // ==========================

        alert(
            "✅ Booking request received! Little Monks Safaris will review your request and send you a quotation shortly."
        );

        bookingForm.reset();

        if (vehicleFields) {
            vehicleFields.style.display = "none";
        }

        const otherDestination = document.getElementById("otherDestination");

        if (otherDestination) {
            otherDestination.style.display = "none";
        }


    }


    catch (error) {


        console.error(error);


        alert("Booking failed.");

    }


});