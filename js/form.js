// ================================
// DYNAMIC BOOKING FORM
// ================================

document.addEventListener("DOMContentLoaded", () => {

    // Destination
    const destination = document.getElementById("destination");
    const otherDestination = document.getElementById("otherDestination");

    destination.addEventListener("change", () => {

        if (destination.value === "other") {
            otherDestination.style.display = "block";
        } else {
            otherDestination.style.display = "none";
            otherDestination.value = "";
        }

    });

    // Service
    const service = document.getElementById("service");
    const dynamicFields = document.getElementById("dynamicFields");

    service.addEventListener("change", () => {

        dynamicFields.innerHTML = "";

        switch (service.value) {

            case "Safari Package":

                dynamicFields.innerHTML = `

                    <div class="input-group">

                        <input
                            type="number"
                            id="days"
                            placeholder="Number of Days">

                        <select id="accommodation">

                            <option>Accommodation Type</option>

                            <option>Budget</option>
                            <option>Mid-range</option>
                            <option>Luxury</option>

                        </select>

                    </div>

                `;
                break;

            case "Airport Transfer":

                dynamicFields.innerHTML = `

                    <div class="input-group">

                        <input
                            type="text"
                            id="flightNumber"
                            placeholder="Flight Number">

                        <input
                            type="time"
                            id="arrivalTime">

                    </div>

                `;
                break;

            case "Hotel Transfer":

                dynamicFields.innerHTML = `

                    <div class="input-group">

                        <input
                            type="text"
                            id="hotelName"
                            placeholder="Hotel Name">

                        <input
                            type="text"
                            id="hotelLocation"
                            placeholder="Hotel Location">

                    </div>

                `;
                break;

            case "Corporate Transport":

                dynamicFields.innerHTML = `

                    <div class="input-group">

                        <input
                            type="text"
                            id="companyName"
                            placeholder="Company Name">

                        <input
                            type="number"
                            id="employees"
                            placeholder="Number of Passengers">

                    </div>

                `;
                break;
            case "Vehicle Reservation":

                dynamicFields.innerHTML = `

        <h3 style="margin:20px 0 10px;">
            Vehicle Reservation Details
        </h3>

        <div class="input-group">

            <select id="vehicleType">

                <option value="">Select Vehicle Category</option>

                <option>Safari Land Cruiser</option>

                <option>Safari Vans</option>

                <option>Executive Transport</option>

            </select>

            <input
                type="time"
                id="pickupTime">

        </div>

        <div class="input-group">

            <select id="driverRequired">

                <option value="">Service Option</option>

                <option>Professional Chauffeur</option>

                <option>Self Drive</option>

            </select>

            <input
                type="number"
                id="hireDays"
                placeholder="Hire Duration (Days)">

        </div>

    `;

                break;

            case "Custom Tour":

                dynamicFields.innerHTML = `

                    <textarea
                        id="tourPlan"
                        placeholder="Describe your dream tour...">
                    </textarea>

                `;
                break;

        }

    });

});