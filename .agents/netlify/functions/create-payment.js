exports.handler = async (event) => {

    try {

        console.log(
            "PUBLIC KEY CHECK:",
            process.env.INTASEND_PUBLIC_KEY
                ? process.env.INTASEND_PUBLIC_KEY.substring(0, 25)
                : "NO KEY FOUND"
        );

        const body = JSON.parse(event.body);

        console.log("Payment request:", body);

        const response = await fetch(
            "https://sandbox.intasend.com/api/v1/checkout/",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-IntaSend-Public-API-Key": process.env.INTASEND_PUBLIC_KEY
                },

                body: JSON.stringify({

                    public_key: process.env.INTASEND_PUBLIC_KEY,

                    amount: Number(body.amount),

                    currency: "KES",

                    email: body.email,

                    first_name: body.name || "Customer",

                    last_name: "User",

                    api_ref: body.bookingId || `booking-${Date.now()}`,

                    host: "https://littlemonks.netlify.app",

                    redirect_url:
                        "https://littlemonks.netlify.app/payment-success.html"

                })
            }
        );

        const text = await response.text();

        console.log("IntaSend response:", text);

        let data;

        try {

            data = JSON.parse(text);

        } catch {

            data = {
                rawResponse: text
            };

        }

        const errors = data.errors || data.error || data.detail || data.message;
        const errorMessage = typeof errors === "object"
            ? Object.values(errors).flat().join(" ")
            : errors;

        return {

            statusCode: response.status,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(
                response.ok
                    ? data
                    : { error: errorMessage || "IntaSend could not create the payment link" }
            )

        };

    } catch (error) {

        console.error("Payment error:", error);

        return {

            statusCode: 500,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                error: error.message

            })

        };

    }

};
