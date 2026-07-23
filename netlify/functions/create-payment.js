exports.handler = async (event) => {

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({
                error: "Method Not Allowed"
            })
        };
    }


    try {

        const body = JSON.parse(event.body || "{}");


        console.log("RECEIVED BODY:", body);


        if (!body.amount) {

            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: "Amount missing",
                    received: body
                })
            };

        }


        if (!process.env.INTASEND_PUBLIC_KEY) {

            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: "Missing IntaSend key"
                })
            };

        }


        const response = await fetch(
            "https://sandbox.intasend.com/api/v1/checkout/",
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-IntaSend-Public-API-Key":
                        process.env.INTASEND_PUBLIC_KEY
                },


                body: JSON.stringify({

                    public_key:
                        process.env.INTASEND_PUBLIC_KEY,

                    amount:
                        Number(body.amount),

                    currency:
                        "KES",

                    email:
                        body.email,

                    first_name:
                        body.name || "Customer",

                    last_name:
                        "Customer",

                    api_ref:
                        body.bookingId || Date.now()

                })

            }
        );

        const text = await response.text();

console.log("INTASEND RAW RESPONSE:", text);

let result;

try {
    result = JSON.parse(text);
}
catch {
    result = {
        raw:text
    };
}




        console.log("INTASEND RESPONSE:", result);


        if(!response.ok){

            return {
                statusCode:400,
                body:JSON.stringify({
                    error:"IntaSend failed",
                    details:result
                })
            };

        }


        return {

            statusCode:200,

            body:JSON.stringify({

                success:true,

                url:
                result.url ||
                result.invoice_url ||
                result.payment_url,

                raw:result

            })

        };


    } catch(error){


        console.error(error);


        return {

            statusCode:500,

            body:JSON.stringify({

                error:error.message

            })

        };

    }

};