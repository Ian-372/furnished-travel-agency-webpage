import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

console.log("Booking module loaded");

const bookingForm = document.getElementById("bookingForm");

bookingForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const destination =
        document.getElementById("destination").value === "other"
            ? document.getElementById("otherDestination").value
            : document.getElementById("destination").value;


    const booking = {

        fullName: document.getElementById("fullName").value,

        email: document.getElementById("email").value,

        phone: document.getElementById("phone").value,

        service: document.getElementById("service").value,

        destination: destination,

        travelDate: document.getElementById("travelDate").value,

        returnDate: document.getElementById("returnDate").value,

        passengers: Number(document.getElementById("passengers").value),

        pickup: document.getElementById("pickup").value,

        dropoff: document.getElementById("dropoff").value,

        paymentMethod: document.getElementById("paymentMethod").value,

        promoCode: document.getElementById("promoCode").value,

        specialRequests: document.getElementById("specialRequests").value,


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


        document.getElementById("otherDestination").style.display = "none";


    }


    catch (error) {


        console.error(error);


        alert("Booking failed.");

    }


});