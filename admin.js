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
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ==========================
// AUTH CHECK
// ==========================

onAuthStateChanged(auth, (user)=>{

    if(!user){

        window.location.href="admin-login.html";

    }

});



// ==========================
// ELEMENTS
// ==========================

const bookingsTable = document.getElementById("bookingsTable");

const totalBookings = document.getElementById("totalBookings");

const pendingBookings = document.getElementById("pendingBookings");

const completedBookings = document.getElementById("completedBookings");

const logoutBtn = document.getElementById("logoutBtn");




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

onSnapshot(collection(db,"bookings"),(snapshot)=>{


    bookingsTable.innerHTML="";


    let total = 0;

    let pending = 0;

    let completed = 0;

    let quoted = 0;



    snapshot.forEach((document)=>{


        total++;


        const booking = document.data();
        // Analytics counting


if(destinationData[booking.destination]){

    destinationData[booking.destination]++;

}
else{

    destinationData[booking.destination]=1;

}



if(serviceData[booking.service]){

    serviceData[booking.service]++;

}
else{

    serviceData[booking.service]=1;

}



        // Save booking locally for viewing

        allBookings[document.id] = booking;




        if(booking.status === "Pending"){

            pending++;

        }



        if(booking.status === "Completed"){

            completed++;

        }

        if(booking.status === "Quoted"){

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


    });



    totalBookings.textContent = total;

    pendingBookings.textContent = pending;

    completedBookings.textContent = completed;
    loadCharts();



});




// ==========================
// CONFIRM BOOKING
// ==========================

window.confirmBooking = async function(id){


    try{


        await updateDoc(
            doc(db,"bookings",id),
            {

                status:"Completed"

            }
        );


        alert("Booking confirmed");


    }
    catch(error){

        console.error(error);

    }


};





// ==========================
// DELETE BOOKING
// ==========================

window.deleteBooking = async function(id){


    if(confirm("Delete this booking?")){


        try{


            await deleteDoc(
                doc(db,"bookings",id)
            );


            alert("Booking deleted");


        }
        catch(error){

            console.error(error);

        }


    }


};





// ==========================
// VIEW BOOKING DETAILS
// ==========================

window.viewBooking = function(id){
       selectedBookingId = id;
    const booking = allBookings[id];
    document.getElementById("bookingDetails").innerHTML = `



    <p><strong>Name:</strong> ${booking.fullName}</p>

    <p><strong>Email:</strong> ${booking.email}</p>

    <p><strong>Phone:</strong> ${booking.phone}</p>

    <p><strong>Service:</strong> ${booking.service}</p>

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



    document.getElementById("bookingModal").style.display="flex";


};





// ==========================
// CLOSE MODAL
// ==========================

const closeModal = document.getElementById("closeModal");


closeModal.onclick = function(){


    document.getElementById("bookingModal").style.display="none";


};





window.onclick = function(event){


    const modal = document.getElementById("bookingModal");


    if(event.target === modal){


        modal.style.display="none";


    }


};





// ==========================
// LOGOUT
// ==========================

if(logoutBtn){


logoutBtn.addEventListener("click",async()=>{


    await signOut(auth);


    window.location.href="admin-login.html";


});


}
let destinationChart;
let serviceChart;



function loadCharts(){


const destinationCtx =
document.getElementById("destinationChart");

const serviceCtx =
document.getElementById("serviceChart");



if(destinationChart){

    destinationChart.destroy();

}


if(serviceChart){

    serviceChart.destroy();

}





destinationChart = new Chart(
destinationCtx,
{

type:"doughnut",

data:{


labels:Object.keys(destinationData),


datasets:[{

label:"Bookings",

data:Object.values(destinationData)

}]


},


options:{

responsive:true

}


});






serviceChart = new Chart(
serviceCtx,
{


type:"bar",


data:{


labels:Object.keys(serviceData),


datasets:[{

label:"Requests",

data:Object.values(serviceData)

}]


},


options:{


responsive:true,


scales:{


y:{


beginAtZero:true


}


}


}


});


}
// ==========================
// SEND QUOTATION + PAYMENT LINK
// ==========================

document.getElementById("bookingDetails").addEventListener("click", async(event)=>{

    if(event.target.id !== "sendQuoteBtn"){

        return;

    }


    const amount =
    document.getElementById("quoteAmount").value;


    if(!amount){

        alert("Enter quotation amount");

        return;

    }


    try{


        const booking = allBookings[selectedBookingId];


        if(!booking){

            throw new Error("Select a booking before sending a quotation");

        }


        event.target.disabled = true;
        event.target.textContent = "Sending...";


        // CREATE PAYMENT SESSION

        const paymentResponse = await fetch(
            "/.netlify/functions/create-payment",
            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },


                body:JSON.stringify({

                    amount:Number(amount),

                    email:booking.email,

                    name:booking.fullName,

                    bookingId:selectedBookingId

                })

            }
        );



        const paymentBody = await paymentResponse.text();
        let paymentData = {};


        try{

            paymentData = paymentBody ? JSON.parse(paymentBody) : {};

        }
        catch{

            throw new Error("The payment service returned an invalid response");

        }



        console.log(
            "Payment Link:",
            paymentData
        );



        if(!paymentResponse.ok || !paymentData.url){

            throw new Error(
                paymentData.error || paymentData.detail || "Payment link was not created"
            );

        }



        // UPDATE FIRESTORE


        await updateDoc(
            doc(db,"bookings",selectedBookingId),
            {


                quotation:{


                    amount:Number(amount),

                    currency:"KES",

                    sent:true


                },


                payment:{


                    status:"Pending",

                    method:"IntaSend",

                    transactionId:"",

                    paymentUrl:paymentData.url


                },


                status:"Quoted"


            }

        );



        // SEND EMAIL TO CUSTOMER


        await emailjs.send(
            "service_ekdc1xn",
            "template_rmzvqlc",
            {


                ...booking,


                quotationAmount:amount,


                paymentLink:paymentData.url


            }

        );



        alert(
            "Quotation sent with payment link"
        );


        document.getElementById("bookingModal").style.display="none";


    }


    catch(error){


        console.error("FULL ERROR:");


        alert(
            JSON.stringify(error,null,2)
        );


    }


    finally{

        event.target.disabled = false;
        event.target.textContent = "Send Quote";

    }


});
