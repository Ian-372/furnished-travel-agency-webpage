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

KES ${booking.quotation.amount}

</p>

<p>
Your quotation has been prepared. 
Little Monks Safaris will contact you with the next steps.
</p>

`

                    :

                    `

<p>
Quotation not available yet.
</p>

`

                }
</div>
`;

        });

    }

});
