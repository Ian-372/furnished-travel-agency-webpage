import { db, auth } from "./firebase-config.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

console.log("Booking module loaded");


// =====================================================
// BOOKING PAGE INITIALIZATION
// =====================================================

window.addEventListener("DOMContentLoaded", () => {

    // =================================================
    // RESTORE BOOKING AFTER LOGIN
    // =================================================

    const savedBooking = sessionStorage.getItem("pendingBooking");

    if (savedBooking) {

        try {

            const data = JSON.parse(savedBooking);

            Object.keys(data).forEach((key) => {

                const field = document.getElementById(key);

                if (field) {
                    field.value = data[key];
                }

            });

            sessionStorage.removeItem("pendingBooking");

            console.log("Previous booking details restored");

        } catch (error) {

            console.error(
                "Could not restore previous booking:",
                error
            );

        }
    }


    // =================================================
    // DYNAMIC DESTINATION
    // =================================================

    const destination =
        document.getElementById("destination");

    const otherDestination =
        document.getElementById("otherDestination");


    if (destination && otherDestination) {

        destination.addEventListener("change", () => {

            if (destination.value === "other") {

                otherDestination.style.display = "block";
                otherDestination.required = true;

            } else {

                otherDestination.style.display = "none";
                otherDestination.required = false;
                otherDestination.value = "";

            }

        });

    }


    // =================================================
    // DYNAMIC SERVICE FIELDS
    // =================================================

    const service =
        document.getElementById("service");

    const dynamicFields =
        document.getElementById("dynamicFields");


    if (service && dynamicFields) {

        service.addEventListener("change", () => {

            dynamicFields.innerHTML = "";


            switch (service.value) {


                // =====================================
                // SAFARI PACKAGE
                // =====================================

                case "Safari Package":

                    dynamicFields.innerHTML = `

                        <div class="input-group">

                            <input
                                type="number"
                                id="days"
                                min="1"
                                placeholder="Number of Days"
                            >

                            <select id="accommodation">

                                <option value="">
                                    Accommodation Type
                                </option>

                                <option value="Budget">
                                    Budget
                                </option>

                                <option value="Mid-range">
                                    Mid-range
                                </option>

                                <option value="Luxury">
                                    Luxury
                                </option>

                            </select>

                        </div>

                    `;

                    break;


                // =====================================
                // AIRPORT TRANSFER
                // =====================================

                case "Airport Transfer":

                    dynamicFields.innerHTML = `

                        <div class="input-group">

                            <input
                                type="text"
                                id="flightNumber"
                                placeholder="Flight Number"
                            >

                            <input
                                type="time"
                                id="arrivalTime"
                            >

                        </div>

                    `;

                    break;


                // =====================================
                // HOTEL TRANSFER
                // =====================================

                case "Hotel Transfer":

                    dynamicFields.innerHTML = `

                        <div class="input-group">

                            <input
                                type="text"
                                id="hotelName"
                                placeholder="Hotel Name"
                            >

                            <input
                                type="text"
                                id="hotelLocation"
                                placeholder="Hotel Location"
                            >

                        </div>

                    `;

                    break;


                // =====================================
                // CORPORATE TRANSPORT
                // =====================================

                case "Corporate Transport":

                    dynamicFields.innerHTML = `

                        <div class="input-group">

                            <input
                                type="text"
                                id="companyName"
                                placeholder="Company Name"
                            >

                            <input
                                type="number"
                                id="employees"
                                min="1"
                                placeholder="Number of Passengers"
                            >

                        </div>

                    `;

                    break;


                // =====================================
                // VEHICLE RESERVATION
                // =====================================

                case "Vehicle Reservation":

                    dynamicFields.innerHTML = `

                        <h3 class="dynamic-title">
                            Vehicle Reservation Details
                        </h3>

                        <div class="input-group">

                            <select id="vehicleType">

                                <option value="">
                                    Select Vehicle Category
                                </option>

                                <option value="Safari Land Cruiser">
                                    Safari Land Cruiser
                                </option>

                                <option value="Safari Vans">
                                    Safari Vans
                                </option>

                                <option value="Executive Transport">
                                    Executive Transport
                                </option>

                            </select>


                            <input
                                type="time"
                                id="pickupTime"
                            >

                        </div>


                        <div class="input-group">

                            <select id="driverRequired">

                                <option value="">
                                    Service Option
                                </option>

                                <option value="Professional Chauffeur">
                                    Professional Chauffeur
                                </option>

                                <option value="Self Drive">
                                    Self Drive
                                </option>

                            </select>


                            <input
                                type="number"
                                id="hireDays"
                                min="1"
                                placeholder="Hire Duration (Days)"
                            >

                        </div>

                    `;

                    break;


                // =====================================
                // DAY TRIP
                // =====================================

                case "Day Trip":

                    dynamicFields.innerHTML = `

                        <div class="input-group">

                            <input
                                type="text"
                                id="dayTripActivity"
                                placeholder="Preferred Day Trip / Activity"
                            >

                        </div>

                    `;

                    break;


                // =====================================
                // CUSTOM TOUR
                // =====================================

                case "Custom Tour":

                    dynamicFields.innerHTML = `

                        <textarea
                            id="tourPlan"
                            placeholder="Describe your dream tour..."
                        ></textarea>

                    `;

                    break;

            }

        });

    }

});



// =====================================================
// BOOKING ELEMENTS
// =====================================================

const bookingForm =
    document.getElementById("bookingForm");

const bookJourneyBtn =
    document.getElementById("bookJourneyBtn");

const phoneInput =
    document.getElementById("phone");

const countryCode =
    document.getElementById("countryCode");



// =====================================================
// FORCE LOGIN BEFORE BOOKING
// =====================================================

if (bookJourneyBtn) {

    bookJourneyBtn.addEventListener("click", () => {

        const user = auth.currentUser;

        console.log("Book button clicked");
        console.log("Current user:", user);


        if (!user) {

            // Save current form information
            const formData =
                Object.fromEntries(
                    new FormData(bookingForm)
                );


            sessionStorage.setItem(
                "pendingBooking",
                JSON.stringify(formData)
            );


            // Return to the NEW booking page
            sessionStorage.setItem(
                "redirectAfterLogin",
                "booking.html"
            );


            window.location.href =
                "login.html";

            return;
        }


        bookingForm.requestSubmit();

    });

}



// =====================================================
// BOOKING SUBMISSION
// =====================================================

if (bookingForm) {

    bookingForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            const submitBtn =
                document.getElementById("bookJourneyBtn");


            // =========================================
            // PREVENT DOUBLE SUBMISSION
            // =========================================

            submitBtn.disabled = true;

            submitBtn.innerHTML = `
                <span class="loader"></span>
                Processing your booking...
            `;


            // =========================================
            // PHONE VALIDATION
            // =========================================

            if (!phoneInput || !countryCode) {

                alert(
                    "Phone input system not loaded."
                );

                submitBtn.disabled = false;
                submitBtn.textContent =
                    "Book My Journey";

                return;

            }


            const enteredNumber =
                phoneInput.value.trim();


            const fullPhone =
                countryCode.value +
                enteredNumber.replace(/^0+/, "");


            console.log(
                "Final Phone:",
                fullPhone
            );


            const digits =
                enteredNumber.replace(/\D/g, "");


            if (
                digits.length < 7 ||
                digits.length > 12
            ) {

                alert(
                    "Please enter a valid phone number."
                );

                submitBtn.disabled = false;
                submitBtn.textContent =
                    "Book My Journey";

                return;

            }



            // =========================================
            // CHECK LOGIN
            // =========================================

            const user =
                auth.currentUser;


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
                    "booking.html"
                );


                window.location.href =
                    "login.html";

                return;

            }



            // =========================================
            // DESTINATION
            // =========================================

            const destinationField =
                document.getElementById("destination");


            const destination =
                destinationField.value === "other"

                    ? document
                        .getElementById(
                            "otherDestination"
                        )
                        .value.trim()

                    : destinationField.value;



            // =========================================
            // BUILD BOOKING OBJECT
            // =========================================

            const booking = {

                userId: user.uid,

                customerEmail: user.email,


                fullName:
                    document.getElementById(
                        "fullName"
                    ).value.trim(),


                email:
                    document.getElementById(
                        "email"
                    ).value.trim(),


                phone:
                    fullPhone,


                service:
                    document.getElementById(
                        "service"
                    ).value,


                vehicleReservation:
                    document.getElementById(
                        "vehicleReservation"
                    )?.value || "",


                destination:
                    destination,


                travelDate:
                    document.getElementById(
                        "travelDate"
                    ).value,


                returnDate:
                    document.getElementById(
                        "returnDate"
                    ).value,


                passengers:
                    Number(
                        document.getElementById(
                            "passengers"
                        ).value
                    ),


                pickup:
                    document.getElementById(
                        "pickup"
                    ).value.trim(),


                dropoff:
                    document.getElementById(
                        "dropoff"
                    ).value.trim(),


                paymentMethod:
                    document.getElementById(
                        "paymentMethod"
                    ).value,


                promoCode:
                    document.getElementById(
                        "promoCode"
                    ).value.trim(),


                specialRequests:
                    document.getElementById(
                        "specialRequests"
                    ).value.trim(),



                // =====================================
                // VEHICLE RESERVATION DETAILS
                // =====================================

                vehicleType:
                    document.getElementById(
                        "vehicleType"
                    )?.value || "",


                pickupTime:
                    document.getElementById(
                        "pickupTime"
                    )?.value || "",


                driverRequired:
                    document.getElementById(
                        "driverRequired"
                    )?.value || "",


                hireDays:
                    document.getElementById(
                        "hireDays"
                    )?.value || "",



                // =====================================
                // STATUS
                // =====================================

                status:
                    "Pending Quote",



                // =====================================
                // QUOTATION
                // =====================================

                quotation: {

                    amount: 0,

                    currency: "KES",

                    sent: false

                },



                // =====================================
                // PAYMENT
                // =====================================

                payment: {

                    status:
                        "Pending Quote",

                    method: "",

                    transactionId: ""

                },



                // =====================================
                // TIMESTAMP
                // =====================================

                createdAt:
                    serverTimestamp()

            };



            // =================================================
            // SAVE TO FIRESTORE
            // =================================================

            try {

                const docRef =
                    await addDoc(
                        collection(
                            db,
                            "bookings"
                        ),
                        booking
                    );


                console.log(
                    "Booking ID:",
                    docRef.id
                );



                // =================================================
                // EMAIL CUSTOMER
                // =================================================

                await emailjs.send(

                    "service_d869q6m",

                    "template_2ewt3fs",

                    booking

                );



                // =================================================
                // EMAIL COMPANY
                // =================================================

                await emailjs.send(

                    "service_d869q6m",

                    "template_2pc3qfh",

                    {

                        ...booking,

                        bookingDate:
                            new Date()
                                .toLocaleString()

                    }

                );



                // =================================================
                // SUCCESS
                // =================================================

                alert(
                    "✅ Booking request received! Little Monks Safaris will review your request and send you a quotation shortly."
                );


                submitBtn.disabled = false;

                submitBtn.textContent =
                    "Book My Journey";


                bookingForm.reset();


                // Clear dynamic fields
                const dynamicFields =
                    document.getElementById(
                        "dynamicFields"
                    );


                if (dynamicFields) {

                    dynamicFields.innerHTML =
                        "";

                }


                // Hide other destination
                const otherDestination =
                    document.getElementById(
                        "otherDestination"
                    );


                if (otherDestination) {

                    otherDestination.style.display =
                        "none";

                    otherDestination.required =
                        false;

                }

            }



            // =================================================
            // ERROR
            // =================================================

            catch (error) {

                console.error(
                    "Booking submission error:",
                    error
                );


                alert(
                    "Booking failed. Please try again."
                );


                submitBtn.disabled = false;

                submitBtn.textContent =
                    "Book My Journey";

            }

        }
    );

}