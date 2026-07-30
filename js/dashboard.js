import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }
    console.log("Current logged in UID:", user.uid);

    const userDoc = await getDoc(doc(db, "users", user.uid));

    console.log("User document:", userDoc.data());

    if (userDoc.exists()) {

        document.getElementById("customerName").textContent =
            userDoc.data().name || "Customer";

    }
    const bookingsContainer =
        document.getElementById("bookingsContainer");


    const q = query(
        collection(db, "bookings"),
        where("userId", "==", user.uid)
    );


    const snapshot = await getDocs(q);

    console.log("Bookings found:", snapshot.size);


    bookingsContainer.innerHTML = "";


    if (snapshot.empty) {

        bookingsContainer.innerHTML =
            "<p>No bookings yet.</p>";

    }

    else {

        snapshot.forEach((bookingDoc) => {

            const booking =
                bookingDoc.data();

            console.log("Booking data:", booking);

            bookingsContainer.innerHTML += `

<div class="booking-card">

<h3>
${booking.destination}
</h3>

<p>
Service:
${booking.service}
</p>

<p>
Travel Date:
${booking.travelDate}
</p>

<p>
Status:
${booking.status}
</p>

${booking.quotation?.sent

                    ?

                    `

<p>
<strong>
Quotation:
</strong>

KES ${Number(booking.quotation.amount).toLocaleString()}

</p>

<p>
<strong>
Payment Status:
</strong>

${booking.payment?.status || "Pending"}

</p>

<button
class="payBtn"
data-id="${bookingDoc.id}"
data-amount="${booking.quotation.amount}"
${booking.payment?.status === "Paid" ? "disabled" : ""}>

${booking.payment?.status === "Paid"

                        ?

                        "✓ Payment Received"

                        :

                        "Pay via M-Pesa"

                    }

</button>

`

                    :

                    `

<p>
Quotation not available yet.
</p>

<p>
Please wait while Little Monks Safaris prepares your quotation.
</p>

<button
class="payBtn"
disabled>

Pay via M-Pesa

</button>

`

                }

</div>

`;

        });

    }

});
// ==========================
// LOGOUT SYSTEM
// ==========================

const logoutBtn = document.getElementById("logoutBtn");


if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        try {

            await signOut(auth);

            alert("Logged out successfully.");

            window.location.href = "index.html";

        }

        catch (error) {

            console.error("Logout error:", error);

            alert("Logout failed.");

        }

    });

}

// ==========================
// MPESA PAYMENT
// ==========================

document.addEventListener("click", async (event) => {

    if (!event.target.classList.contains("payBtn")) return;

    const amount = event.target.dataset.amount;
    const bookingId = event.target.dataset.id;

    const phone = prompt(
        "Enter your M-Pesa phone number\nExample: 254712345678"
    );

    if (!phone) return;

    event.target.disabled = true;
    event.target.textContent = "Sending STK Push...";

    try {

        const response = await fetch(
            "https://daraja-worker.ianmutuli36.workers.dev/stkpush",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    bookingId,

                    amount,

                    phone

                })

            }
        );

        const result = await response.json();

        if (response.ok) {

            alert(
                "STK Push sent successfully.\nPlease check your phone."
            );

        }

        else {

            alert(
                result.message || "Payment request failed."
            );

        }

    }

    catch (error) {

        console.error(error);

        alert("Unable to connect to payment server.");

    }

    finally {

        event.target.disabled = false;
        event.target.textContent = "Pay via M-Pesa";

    }

});