import { auth, db } from "./js/firebase-config.js";
import { ADMIN_EMAIL } from "./js/admin-config.js";
import {
    collection,
    doc,
    onSnapshot,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import {
    EmailAuthProvider,
    onAuthStateChanged,
    reauthenticateWithCredential,
    signOut,
    updatePassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const STATUS_OPTIONS = ["Pending Quote", "Quoted", "Confirmed", "Completed", "Cancelled"];
const state = { bookings: [], filter: "all", destinationChart: null, serviceChart: null };
const element = (id) => document.getElementById(id);
const money = (amount) => `KES ${(Number(amount) || 0).toLocaleString("en-KE")}`;
const normalise = (value) => (value || "").trim().toLowerCase();

const elements = {
    liveStatus: element("liveStatus"),
    accessStatus: element("adminAccessStatus"),
    totalBookings: element("totalBookings"),
    pendingBookings: element("pendingBookings"),
    confirmedBookings: element("confirmedBookings"),
    completedBookings: element("completedBookings"),
    paidRevenue: element("paidRevenue"),
    upcomingTrips: element("upcomingTrips"),
    railQuoteRequests: element("railQuoteRequests"),
    railReceivable: element("railReceivable"),
    railPaidRevenue: element("railPaidRevenue"),
    bookingsTable: element("bookingsTable"),
    customersTable: element("customersTable"),
    paymentsTable: element("paymentsTable"),
    bookingResultCount: element("bookingResultCount"),
    actionQueue: element("actionQueue"),
    attentionCount: element("attentionCount"),
    destinationFilter: element("destinationFilter"),
    modal: element("bookingModal"),
    bookingDetails: element("bookingDetails")
};

function isAwaitingQuote(booking) {
    return ["pending", "pending quote"].includes(normalise(booking.status));
}

function isPaymentPending(booking) {
    return Boolean(booking.quotation?.sent) && normalise(booking.payment?.status) !== "paid";
}

function dateValue(value) {
    const timestamp = new Date(`${value || ""}T00:00:00`).getTime();
    return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
}

function createNode(tagName, text, className) {
    const node = document.createElement(tagName);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
}

function showSection(name) {
    document.querySelectorAll(".content-section").forEach((section) => {
        section.style.display = section.id === `${name}Section` ? "block" : "none";
    });
    document.querySelectorAll(".nav-item").forEach((button) => {
        button.classList.toggle("active", button.dataset.section === name);
    });
}

function updateFilterSelection() {
    document.querySelectorAll("[data-booking-filter]").forEach((button) => {
        const selected = button.dataset.bookingFilter === state.filter;
        button.classList.toggle("is-selected", selected);
        button.setAttribute("aria-pressed", String(selected));
    });
}

function setBookingFilter(filter) {
    state.filter = filter;
    element("statusFilter").value = "all";
    updateFilterSelection();
    renderBookings();
}

function getFilteredBookings() {
    const search = normalise(element("searchBooking").value);
    const status = element("statusFilter").value;
    const destination = elements.destinationFilter.value;
    const payment = element("paymentFilter").value;
    const sort = element("sortBookings").value;
    const filtered = state.bookings.filter(({ booking }) => {
        const matchesSearch = [booking.fullName, booking.email, booking.phone]
            .some((value) => normalise(value).includes(search));
        const matchesKpi = state.filter === "all" ||
            (state.filter === "pending quote" && isAwaitingQuote(booking)) ||
            (state.filter === "payment pending" && isPaymentPending(booking)) ||
            normalise(booking.status) === state.filter;
        const matchesStatus = status === "all" || booking.status === status;
        const matchesDestination = destination === "all" || booking.destination === destination;
        const matchesPayment = payment === "all" || normalise(booking.payment?.status) === payment;
        return matchesSearch && matchesKpi && matchesStatus && matchesDestination && matchesPayment;
    });

    return filtered.sort((left, right) => {
        const a = left.booking;
        const b = right.booking;
        if (sort === "travelDateDesc") return dateValue(b.travelDate) - dateValue(a.travelDate);
        if (sort === "amountDesc") return (Number(b.quotation?.amount) || 0) - (Number(a.quotation?.amount) || 0);
        if (sort === "amountAsc") return (Number(a.quotation?.amount) || 0) - (Number(b.quotation?.amount) || 0);
        if (sort === "nameAsc") return (a.fullName || "").localeCompare(b.fullName || "");
        return dateValue(a.travelDate) - dateValue(b.travelDate);
    });
}

function appendCell(row, text) {
    row.appendChild(createNode("td", text || "-"));
}

function renderBookings() {
    const records = getFilteredBookings();
    elements.bookingsTable.replaceChildren();
    records.forEach(({ id, booking }) => {
        const row = document.createElement("tr");
        appendCell(row, booking.fullName);
        appendCell(row, booking.destination);
        appendCell(row, booking.service);
        appendCell(row, booking.travelDate);
        const statusCell = document.createElement("td");
        statusCell.appendChild(createNode("span", booking.status || "Pending Quote", `status ${normalise(booking.status).replaceAll(" ", "-")}`));
        row.appendChild(statusCell);
        const actions = document.createElement("td");
        [
            ["View", "viewBtn", "view"],
            ["Confirm", "confirmBtn", "confirm"],
            ["Delete", "deleteBtn", "delete"]
        ].forEach(([label, className, action]) => {
            const button = createNode("button", label, className);
            button.type = "button";
            button.dataset.action = action;
            button.dataset.bookingId = id;
            if (action === "confirm" && booking.status === "Confirmed") button.disabled = true;
            actions.appendChild(button);
        });
        row.appendChild(actions);
        elements.bookingsTable.appendChild(row);
    });
    elements.bookingResultCount.textContent = `${records.length} of ${state.bookings.length} booking${state.bookings.length === 1 ? "" : "s"}`;
}

function renderCustomers() {
    const search = normalise(element("searchCustomer").value);
    const customers = new Map();
    state.bookings.forEach(({ booking }) => {
        const key = normalise(booking.email) || normalise(booking.phone) || booking.fullName;
        const customer = customers.get(key) || { name: booking.fullName, email: booking.email, phone: booking.phone, trips: 0, destinations: new Set(), paid: 0 };
        customer.trips += 1;
        if (booking.destination) customer.destinations.add(booking.destination);
        if (normalise(booking.payment?.status) === "paid") customer.paid += Number(booking.quotation?.amount) || 0;
        customers.set(key, customer);
    });
    elements.customersTable.replaceChildren();
    [...customers.values()].filter((customer) => [customer.name, customer.email, customer.phone].some((value) => normalise(value).includes(search))).forEach((customer) => {
        const row = document.createElement("tr");
        appendCell(row, customer.name);
        appendCell(row, customer.email);
        appendCell(row, customer.phone);
        appendCell(row, `${customer.trips} trip${customer.trips === 1 ? "" : "s"}`);
        appendCell(row, money(customer.paid));
        elements.customersTable.appendChild(row);
    });
}

function renderPayments() {
    const filter = element("paymentRecordFilter").value;
    elements.paymentsTable.replaceChildren();
    state.bookings.filter(({ booking }) => filter === "all" || normalise(booking.payment?.status) === filter).forEach(({ booking }) => {
        const row = document.createElement("tr");
        appendCell(row, booking.fullName);
        appendCell(row, money(booking.quotation?.amount));
        appendCell(row, booking.payment?.status || "Pending quote");
        appendCell(row, booking.payment?.method || "-");
        appendCell(row, booking.payment?.receipt || booking.payment?.transactionId || "-");
        appendCell(row, booking.payment?.paidAt || "-");
        elements.paymentsTable.appendChild(row);
    });
}

function renderQueue() {
    const priorities = state.bookings.filter(({ booking }) => isAwaitingQuote(booking) || isPaymentPending(booking) || booking.status === "Confirmed").slice(0, 5);
    elements.attentionCount.textContent = priorities.length;
    elements.actionQueue.replaceChildren();
    if (!priorities.length) {
        elements.actionQueue.appendChild(createNode("p", state.bookings.length ? "Nothing needs immediate action." : "No booking activity yet. New requests will appear here live.", "queue-empty"));
        return;
    }
    priorities.forEach(({ id, booking }) => {
        const button = createNode("button", undefined, "queue-item");
        button.type = "button";
        button.dataset.bookingId = id;
        const details = createNode("span", undefined, "queue-details");
        details.append(createNode("strong", booking.fullName || "Unnamed customer"), createNode("span", booking.destination || booking.service || "Journey details pending"));
        const queueState = isAwaitingQuote(booking) ? "Quotation needed" : isPaymentPending(booking) ? "Payment pending" : "Upcoming journey";
        button.append(details, createNode("span", queueState, "queue-state"));
        elements.actionQueue.appendChild(button);
    });
}

function renderMetrics() {
    const now = new Date();
    const horizon = new Date(now);
    horizon.setDate(horizon.getDate() + 30);
    const pending = state.bookings.filter(({ booking }) => isAwaitingQuote(booking));
    const confirmed = state.bookings.filter(({ booking }) => booking.status === "Confirmed");
    const completed = state.bookings.filter(({ booking }) => booking.status === "Completed");
    const receivable = state.bookings.filter(({ booking }) => isPaymentPending(booking)).reduce((total, { booking }) => total + (Number(booking.quotation?.amount) || 0), 0);
    const paid = state.bookings.filter(({ booking }) => normalise(booking.payment?.status) === "paid").reduce((total, { booking }) => total + (Number(booking.quotation?.amount) || 0), 0);
    const upcoming = state.bookings.filter(({ booking }) => {
        const travelDate = new Date(`${booking.travelDate || ""}T00:00:00`);
        return !Number.isNaN(travelDate.getTime()) && travelDate >= now && travelDate <= horizon;
    });
    elements.totalBookings.textContent = state.bookings.length;
    elements.pendingBookings.textContent = pending.length;
    elements.confirmedBookings.textContent = confirmed.length;
    elements.completedBookings.textContent = completed.length;
    elements.paidRevenue.textContent = money(paid);
    elements.upcomingTrips.textContent = upcoming.length;
    elements.railQuoteRequests.textContent = pending.length;
    elements.railReceivable.textContent = money(receivable);
    elements.railPaidRevenue.textContent = money(paid);
}

function populateDestinations() {
    const selected = elements.destinationFilter.value;
    const destinations = [...new Set(state.bookings.map(({ booking }) => booking.destination).filter(Boolean))].sort();
    elements.destinationFilter.replaceChildren(new Option("All Destinations", "all"));
    destinations.forEach((destination) => elements.destinationFilter.add(new Option(destination, destination)));
    elements.destinationFilter.value = destinations.includes(selected) ? selected : "all";
}

function renderCharts() {
    const tally = (field) => state.bookings.reduce((totals, { booking }) => {
        const key = booking[field] || "Not specified";
        totals[key] = (totals[key] || 0) + 1;
        return totals;
    }, {});
    const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: "#f8f3e7" } } } };
    const renderChart = (property, canvasId, type, data) => {
        if (state[property]) state[property].destroy();
        state[property] = new Chart(element(canvasId), { type, data, options: type === "bar" ? { ...chartOptions, scales: { x: { ticks: { color: "#c9d0cb" }, grid: { display: false } }, y: { beginAtZero: true, ticks: { color: "#c9d0cb", precision: 0 }, grid: { color: "rgba(248,243,231,.12)" } } } } : chartOptions });
    };
    const destinations = tally("destination");
    renderChart("destinationChart", "destinationChart", "doughnut", { labels: Object.keys(destinations), datasets: [{ data: Object.values(destinations), backgroundColor: ["#c9a227", "#0b5a34", "#e4c766", "#48745e", "#7f915f"], borderColor: "#062e1b", borderWidth: 3 }] });
    const services = tally("service");
    renderChart("serviceChart", "serviceChart", "bar", { labels: Object.keys(services), datasets: [{ label: "Requests", data: Object.values(services), backgroundColor: "#c9a227", borderRadius: 3 }] });
}

function openBooking(id) {
    const record = state.bookings.find((item) => item.id === id);
    if (!record) return;
    const { booking } = record;
    elements.bookingDetails.replaceChildren();
    const details = createNode("div", undefined, "booking-detail-grid");
    [["Customer", booking.fullName], ["Email", booking.email], ["Phone", booking.phone], ["Journey", booking.destination], ["Service", booking.service], ["Travel date", booking.travelDate], ["Travellers", booking.passengers], ["Quotation", money(booking.quotation?.amount)], ["Payment", booking.payment?.status || "Pending quote"]].forEach(([label, value]) => {
        const item = createNode("div", undefined, "detail-item");
        item.append(createNode("span", label), createNode("strong", value || "-"));
        details.appendChild(item);
    });
    elements.bookingDetails.appendChild(details);
    const lifecycle = createNode("div", undefined, "booking-editor");
    lifecycle.appendChild(createNode("h3", "Manage booking"));
    const statusSelect = createNode("select");
    statusSelect.id = "modalStatus";
    STATUS_OPTIONS.forEach((status) => statusSelect.add(new Option(status, status, false, status === booking.status)));
    const saveStatus = createNode("button", "Update status", "confirmBtn");
    saveStatus.type = "button";
    saveStatus.dataset.modalAction = "status";
    const quoteInput = document.createElement("input");
    quoteInput.id = "quoteAmount";
    quoteInput.type = "number";
    quoteInput.min = "1";
    quoteInput.placeholder = "Quotation amount in KES";
    quoteInput.value = booking.quotation?.amount || "";
    const sendQuote = createNode("button", booking.quotation?.sent ? "Update quotation" : "Send quotation", "confirmBtn");
    sendQuote.type = "button";
    sendQuote.dataset.modalAction = "quote";
    lifecycle.append(statusSelect, saveStatus, quoteInput, sendQuote);
    elements.bookingDetails.appendChild(lifecycle);
    elements.bookingDetails.dataset.bookingId = id;
    elements.modal.style.display = "flex";
}

async function updateBookingStatus(id, status) {
    await updateDoc(doc(db, "bookings", id), { status });
}

async function sendQuotation(id, amount) {
    if (!amount || Number(amount) <= 0) throw new Error("Enter a valid quotation amount.");
    const booking = state.bookings.find((item) => item.id === id)?.booking;
    await updateDoc(doc(db, "bookings", id), {
        quotation: { amount: Number(amount), currency: "KES", sent: true, sentAt: new Date().toISOString() },
        payment: { ...(booking?.payment || {}), status: normalise(booking?.payment?.status) === "paid" ? "Paid" : "Pending", amount: Number(amount), method: booking?.payment?.method || "M-Pesa" },
        status: booking?.status === "Confirmed" || booking?.status === "Completed" ? booking.status : "Quoted"
    });
    if (window.emailjs && booking) await window.emailjs.send("service_d869q6m", "template_2pc3qfh", { ...booking, quotationAmount: amount });
}

function csvDownload(name, headers, rows) {
    const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = `little-monks-${name}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
}

function exportData(type) {
    if (type === "bookings") return csvDownload("bookings", ["Customer", "Email", "Phone", "Destination", "Service", "Travel Date", "Status", "Quotation", "Payment Status"], getFilteredBookings().map(({ booking }) => [booking.fullName, booking.email, booking.phone, booking.destination, booking.service, booking.travelDate, booking.status, booking.quotation?.amount || 0, booking.payment?.status || "Pending quote"]));
    if (type === "payments") return csvDownload("payments", ["Customer", "Amount", "Status", "Method", "Receipt", "Paid At"], state.bookings.map(({ booking }) => [booking.fullName, booking.quotation?.amount || 0, booking.payment?.status || "Pending quote", booking.payment?.method || "", booking.payment?.receipt || booking.payment?.transactionId || "", booking.payment?.paidAt || ""]));
    const customers = new Map();
    state.bookings.forEach(({ booking }) => { const key = normalise(booking.email) || normalise(booking.phone); const value = customers.get(key) || [booking.fullName, booking.email, booking.phone, 0]; value[3] += 1; customers.set(key, value); });
    csvDownload("customers", ["Customer", "Email", "Phone", "Bookings"], [...customers.values()]);
}

onAuthStateChanged(auth, async (user) => {
    if (!user || normalise(user.email) !== ADMIN_EMAIL || !user.emailVerified) {
        if (user) await signOut(auth);
        window.location.href = "admin-login.html";
        return;
    }
    element("currentAdminEmail").textContent = user.email;
    elements.accessStatus.textContent = "Verified administrator";
    document.body.style.display = "flex";
});

onSnapshot(collection(db, "bookings"), (snapshot) => {
    state.bookings = snapshot.docs.map((bookingDoc) => ({ id: bookingDoc.id, booking: bookingDoc.data() }));
    elements.liveStatus.textContent = "Live data connected";
    elements.liveStatus.parentElement.classList.remove("is-error");
    renderMetrics(); populateDestinations(); renderBookings(); renderCustomers(); renderPayments(); renderQueue(); renderCharts();
}, () => {
    elements.liveStatus.textContent = "Live data unavailable";
    elements.liveStatus.parentElement.classList.add("is-error");
    elements.actionQueue.replaceChildren(createNode("p", "Bookings could not be loaded. Check Firestore rules and administrator access.", "queue-empty"));
});

document.querySelectorAll(".nav-item").forEach((button) => button.addEventListener("click", () => showSection(button.dataset.section)));
document.querySelectorAll("[data-booking-filter]").forEach((button) => button.addEventListener("click", () => { setBookingFilter(button.dataset.bookingFilter); showSection("bookings"); }));
document.querySelectorAll("[data-sidebar-filter]").forEach((button) => button.addEventListener("click", () => { setBookingFilter(button.dataset.sidebarFilter); showSection("bookings"); }));
["searchBooking", "statusFilter", "destinationFilter", "paymentFilter", "sortBookings"].forEach((id) => element(id).addEventListener(id === "searchBooking" ? "input" : "change", renderBookings));
element("searchCustomer").addEventListener("input", renderCustomers);
element("paymentRecordFilter").addEventListener("change", renderPayments);
element("clearBookingFilters").addEventListener("click", () => { state.filter = "all"; ["searchBooking", "statusFilter", "destinationFilter", "paymentFilter"].forEach((id) => element(id).value = "all"); element("searchBooking").value = ""; updateFilterSelection(); renderBookings(); });
document.querySelectorAll("[data-export]").forEach((button) => button.addEventListener("click", () => exportData(button.dataset.export)));
elements.bookingsTable.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const { action, bookingId } = button.dataset;
    if (action === "view") return openBooking(bookingId);
    if (action === "delete" && confirm("Delete this booking permanently?")) await deleteDoc(doc(db, "bookings", bookingId));
    if (action === "confirm") await updateBookingStatus(bookingId, "Confirmed");
});
elements.actionQueue.addEventListener("click", (event) => { const item = event.target.closest("[data-booking-id]"); if (item) openBooking(item.dataset.bookingId); });
elements.bookingDetails.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-modal-action]");
    if (!button) return;
    try {
        button.disabled = true;
        const id = elements.bookingDetails.dataset.bookingId;
        if (button.dataset.modalAction === "status") await updateBookingStatus(id, element("modalStatus").value);
        if (button.dataset.modalAction === "quote") await sendQuotation(id, element("quoteAmount").value);
        elements.modal.style.display = "none";
    } catch (error) { alert(error.message || "The booking could not be updated."); }
    finally { button.disabled = false; }
});
element("closeModal").addEventListener("click", () => elements.modal.style.display = "none");
elements.modal.addEventListener("click", (event) => { if (event.target === elements.modal) elements.modal.style.display = "none"; });
element("logoutBtn").addEventListener("click", async () => { await signOut(auth); window.location.href = "admin-login.html"; });
element("changePasswordBtn").addEventListener("click", async () => {
    const currentPassword = element("currentPassword").value;
    const newPassword = element("newPassword").value;
    if (newPassword.length < 10) return alert("Use a new password with at least 10 characters.");
    try { await reauthenticateWithCredential(auth.currentUser, EmailAuthProvider.credential(auth.currentUser.email, currentPassword)); await updatePassword(auth.currentUser, newPassword); element("currentPassword").value = ""; element("newPassword").value = ""; alert("Password updated."); } catch (error) { alert(error.message || "Password could not be updated."); }
});

document.querySelectorAll(".toggle-password[data-target]").forEach((toggle) => {
    toggle.addEventListener("click", () => {
        const passwordInput = element(toggle.dataset.target);
        const isVisible = passwordInput.type === "text";
        passwordInput.type = isVisible ? "password" : "text";
        toggle.textContent = isVisible ? "Show" : "Hide";
        toggle.setAttribute("aria-label", isVisible ? "Show password" : "Hide password");
    });
});