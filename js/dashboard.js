import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    getDocs,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const bookingsContainer = document.getElementById("bookingsContainer");
const summaryFilters = document.querySelectorAll(".summary-item[data-filter]");
let activeBookingFilter = "all";
let liveBookingDocs = [];

function formatTravelDate(value) {
    if (!value) return "Date to be confirmed";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric"
    }).format(date);
}

function getBookingState(booking) {
    const paymentStatus = booking.payment?.status?.toLowerCase();

    if (paymentStatus === "paid") {
        return { label: "Payment received", className: "is-paid", stage: 3 };
    }

    if (booking.quotation?.sent) {
        return { label: "Quotation ready", className: "", stage: 2 };
    }

    return { label: "Awaiting quotation", className: "is-awaiting", stage: 1 };
}

function appendTextElement(parent, tagName, text, className) {
    const element = document.createElement(tagName);
    element.textContent = text;

    if (className) element.className = className;

    parent.appendChild(element);
    return element;
}

function createStage(booking, stage) {
    const journeyStage = document.createElement("div");
    journeyStage.className = "journey-stage";
    journeyStage.setAttribute("aria-label", `Journey status: ${stage.label}`);

    ["Request", "Quotation", "Payment", "Confirmed"].forEach((label, index) => {
        const stageItem = document.createElement("span");
        stageItem.className = "stage";

        if (index < stage.stage) stageItem.classList.add("is-complete");
        if (index === stage.stage) stageItem.classList.add("is-current");

        stageItem.textContent = label;
        journeyStage.appendChild(stageItem);

        if (index < 3) {
            const line = document.createElement("span");
            line.className = "stage-line";
            if (index < stage.stage) line.classList.add("is-complete");
            journeyStage.appendChild(line);
        }
    });

    return journeyStage;
}

function createBookingCard(bookingDoc) {
    const booking = bookingDoc.data();
    const stage = getBookingState(booking);
    const card = document.createElement("article");
    card.className = "booking-card";

    const details = document.createElement("div");
    appendTextElement(details, "p", booking.service || "Tailored journey", "booking-overline");
    appendTextElement(details, "h3", booking.destination || "Your Kenya journey");

    const bookingDetails = document.createElement("div");
    bookingDetails.className = "booking-details";
    appendTextElement(bookingDetails, "span", `Travel date: ${formatTravelDate(booking.travelDate)}`);

    if (booking.passengers) {
        appendTextElement(bookingDetails, "span", `${booking.passengers} traveller${booking.passengers === 1 ? "" : "s"}`);
    }

    details.appendChild(bookingDetails);
    details.appendChild(createStage(booking, stage));

    const side = document.createElement("div");
    side.className = "booking-side";
    appendTextElement(side, "span", stage.label, `status-badge ${stage.className}`.trim());

    if (booking.quotation?.sent) {
        const quote = document.createElement("p");
        quote.className = "quote-line";
        quote.textContent = "Your quotation";
        appendTextElement(
            quote,
            "strong",
            `${booking.quotation.currency || "KES"} ${Number(booking.quotation.amount || 0).toLocaleString("en-KE")}`
        );
        side.appendChild(quote);

        const payButton = document.createElement("button");
        const isPaid = booking.payment?.status === "Paid";
        payButton.className = "payBtn";
        payButton.type = "button";
        payButton.dataset.id = bookingDoc.id;
        payButton.dataset.amount = booking.quotation.amount;
        payButton.disabled = isPaid;
        payButton.textContent = isPaid ? "Payment received" : "Pay via M-Pesa";
        side.appendChild(payButton);
    }

    card.append(details, side);
    return card;
}

function renderEmptyState() {
    bookingsContainer.replaceChildren();
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";

    const isFiltered = activeBookingFilter !== "all";
    const heading = activeBookingFilter === "awaiting"
        ? "No journeys are awaiting a quotation."
        : activeBookingFilter === "payment"
            ? "No journeys are ready for payment."
            : "Your next journey starts here.";
    const message = isFiltered
        ? "Select Your journeys to see all of your booking requests."
        : "Tell us where you would like to go and we will prepare a journey around you.";

    appendTextElement(emptyState, "h3", heading);
    appendTextElement(emptyState, "p", message);
    const bookingLink = document.createElement("a");
    bookingLink.href = "booking.html";
    bookingLink.textContent = isFiltered ? "View all journeys" : "Plan a journey";

    if (isFiltered) {
        bookingLink.href = "#tripsHeading";
        bookingLink.addEventListener("click", () => setBookingFilter("all"));
    }

    emptyState.appendChild(bookingLink);
    bookingsContainer.appendChild(emptyState);
}

function getFilteredBookings() {
    if (activeBookingFilter === "awaiting") {
        return liveBookingDocs.filter((bookingDoc) => !bookingDoc.data().quotation?.sent);
    }

    if (activeBookingFilter === "payment") {
        return liveBookingDocs.filter((bookingDoc) => {
            const booking = bookingDoc.data();
            return booking.quotation?.sent && booking.payment?.status !== "Paid";
        });
    }

    return liveBookingDocs;
}

function renderFilteredBookings() {
    const bookingDocs = getFilteredBookings();

    if (bookingDocs.length === 0) {
        renderEmptyState();
        return;
    }

    bookingsContainer.replaceChildren(...bookingDocs.map(createBookingCard));
}

function setBookingFilter(filter) {
    activeBookingFilter = filter;

    summaryFilters.forEach((filterButton) => {
        const isSelected = filterButton.dataset.filter === filter;
        filterButton.classList.toggle("is-selected", isSelected);
        filterButton.setAttribute("aria-pressed", String(isSelected));
    });

    renderFilteredBookings();
}

summaryFilters.forEach((filterButton) => {
    filterButton.addEventListener("click", () => {
        setBookingFilter(filterButton.dataset.filter);
    });
});

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }
    console.log("Current logged in UID:", user.uid);

    const userRef = doc(db, "users", user.uid);

    let userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {

        const bookingQuery = query(
            collection(db, "bookings"),
            where("userId", "==", user.uid)
        );

        const bookingSnapshot = await getDocs(bookingQuery);

        let customerName = "Customer";

        if (!bookingSnapshot.empty) {

            customerName =
                bookingSnapshot.docs[0].data().fullName || "Customer";

        }

        await setDoc(userRef, {
            name: customerName,
            email: user.email,
            phone: "",
            country: "",
            role: "customer",
            createdAt: new Date()
        });

        userDoc = await getDoc(userRef);

    }

    document.getElementById("customerName").textContent =
        userDoc.data().name;
    const q = query(
        collection(db, "bookings"),
        where("userId", "==", user.uid)
    );


    onSnapshot(q, (snapshot) => {
        console.log("Bookings found:", snapshot.size);

        const bookings = snapshot.docs.map((bookingDoc) => bookingDoc.data());
        document.getElementById("totalBookings").textContent = bookings.length;
        document.getElementById("awaitingQuote").textContent = bookings.filter((booking) => !booking.quotation?.sent).length;
        document.getElementById("readyForPayment").textContent = bookings.filter((booking) => booking.quotation?.sent && booking.payment?.status !== "Paid").length;

        liveBookingDocs = snapshot.docs;
        renderFilteredBookings();
    }, (error) => {
        console.error("Unable to load live bookings:", error);
        bookingsContainer.replaceChildren();
        appendTextElement(
            bookingsContainer,
            "p",
            "We could not load your journeys. Please refresh the page and try again.",
            "loading-state"
        );
    });

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