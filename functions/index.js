const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
exports.mpesaCallback = onRequest(async (req, res) => {

    try {

        console.log(
            "M-Pesa Callback Received:",
            JSON.stringify(req.body, null, 2)
        );


        const callback =
            req.body.Body.stkCallback;


        const checkoutRequestID =
            callback.CheckoutRequestID;


        const resultCode =
            callback.ResultCode;


        console.log(
            "Checkout ID:",
            checkoutRequestID
        );


        console.log(
            "Result Code:",
            resultCode
        );


        res.status(200).json({
            ResultCode: 0,
            ResultDesc: "Accepted"
        });


    }

    catch(error){

        console.error(
            "Callback Error:",
            error
        );


        res.status(500).json({
            error: error.message
        });

    }

});