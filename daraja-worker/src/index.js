export default {
	async fetch(request, env) {
		// Handle CORS
		if (request.method === "OPTIONS") {
			return new Response(null, {
				headers: corsHeaders(),
			});
		}

		const url = new URL(request.url);

		// ==========================
		// GET /oauth
		// ==========================
		if (url.pathname === "/oauth") {
			try {
				const token = await getAccessToken(env);

				return json({
					access_token: token.access_token,
					expires_in: token.expires_in,
				});
			} catch (err) {
				return json(
					{
						error: err.message,
					},
					500
				);
			}
		}

		// ==========================
		// POST /stkpush
		// ==========================
		if (url.pathname === "/stkpush" && request.method === "POST") {
			try {
				const body = await request.json();

				const bookingId = body.bookingId;
				const phone = body.phone;
				const amount = body.amount;

				const accountReference =
					body.accountReference || bookingId;

				const transactionDesc =
					body.transactionDesc || "Safari Booking";

				const token = await getAccessToken(env);

				const timestamp = getTimestamp();

				const password = btoa(
					env.SHORTCODE + env.PASSKEY + timestamp
				);

				const response = await fetch(
					"https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
					{
						method: "POST",
						headers: {
							Authorization: `Bearer ${token.access_token}`,
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							BusinessShortCode: env.SHORTCODE,
							Password: password,
							Timestamp: timestamp,
							TransactionType: "CustomerPayBillOnline",
							Amount: amount,
							PartyA: phone,
							PartyB: env.SHORTCODE,
							PhoneNumber: phone,
							CallBackURL:
								"https://daraja-worker.ianmutuli36.workers.dev/callback",
							AccountReference: accountReference,
							TransactionDesc: transactionDesc,
						}),
					}
				);

				const data = await response.json();

				console.log("Daraja response:", data);
				console.log("Booking ID received:", bookingId);


				// Save Daraja IDs in Firestore
				if (
					response.ok &&
					data.ResponseCode === "0"
				) {

					await updateBookingPayment(
						env,
						bookingId,
						data
					);

				}


				return json({
					status: response.status,
					response: data,
				});
			} catch (err) {
				return json(
					{
						error: err.message,
					},
					500
				);
			}
		}

		// ==========================
		// POST /callback
		// ==========================
		if (
			url.pathname === "/callback" &&
			request.method === "POST"
		) {

			try {

				const body = await request.json();

				console.log(
					"Daraja Callback:",
					JSON.stringify(body, null, 2)
				);

				const callback = body.Body?.stkCallback;

				if (!callback) {

					return json({
						ResultCode: 0,
						ResultDesc: "Accepted"
					});

				}

				await processCallback(
					env,
					callback
				);

				return json({
					ResultCode: 0,
					ResultDesc: "Accepted"
				});

			}

			catch (err) {

				console.error(
					"Callback Error:",
					err
				);

				return json({
					ResultCode: 0,
					ResultDesc: "Accepted"
				});

			}

		}

		// ==========================
		// DEBUG
		// ==========================
		if (url.pathname === "/debug") {

			const timestamp = getTimestamp();

			const password = btoa(
				env.SHORTCODE + env.PASSKEY + timestamp
			);

			return json({
				shortcode: env.SHORTCODE,
				timestamp,
				password,
				passkeyLength: env.PASSKEY.length
			});

		}

		// ==========================
		// DEBUG...fixed
		// ==========================

		return new Response("Daraja Worker Running");
	},
};

// ======================================

async function getAccessToken(env) {
	const credentials = btoa(
		`${env.CONSUMER_KEY}:${env.CONSUMER_SECRET}`
	);

	const response = await fetch(
		"https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
		{
			headers: {
				Authorization: `Basic ${credentials}`,
			},
		}
	);

	return await response.json();
}

function getTimestamp() {
	const now = new Date();

	const pad = (n) => String(n).padStart(2, "0");

	return (
		now.getFullYear() +
		pad(now.getMonth() + 1) +
		pad(now.getDate()) +
		pad(now.getHours()) +
		pad(now.getMinutes()) +
		pad(now.getSeconds())
	);
}

function json(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			...corsHeaders(),
			"Content-Type": "application/json",
		},
	});
}

function corsHeaders() {
	return {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Headers": "*",
		"Access-Control-Allow-Methods": "GET,POST,OPTIONS",
	};
}
async function updateBookingPayment(
	env,
	bookingId,
	data
) {

	const url =
		`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/bookings/${bookingId}` +
		`?updateMask.fieldPaths=payment`;

	const body = {

		fields: {

			payment: {

				mapValue: {

					fields: {

						status: {
							stringValue: "Pending"
						},

						method: {
							stringValue: "M-Pesa"
						},

						checkoutRequestID: {
							stringValue:
								data.CheckoutRequestID
						},

						merchantRequestID: {
							stringValue:
								data.MerchantRequestID
						}

					}

				}

			}

		}

	};




	console.log(
		"Updating booking:",
		bookingId
	);

	const accessToken =
		await getFirebaseAccessToken(env);
	const response = await fetch(
		url,
		{
			method: "PATCH",

			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${accessToken}`
			},

			body: JSON.stringify(body)

		}
	);

	const result = await response.json();

	console.log("Firestore response status:", response.status);
	console.log("Firestore response body:", result);

	if (!response.ok) {
		throw new Error(
			`Firestore update failed: ${JSON.stringify(result)}`
		);
	}
}
async function getFirebaseAccessToken(env) {

	const header = {
		alg: "RS256",
		typ: "JWT"
	};


	const now = Math.floor(Date.now() / 1000);


	const payload = {

		iss: env.FIREBASE_CLIENT_EMAIL,

		sub: env.FIREBASE_CLIENT_EMAIL,

		aud: "https://oauth2.googleapis.com/token",

		iat: now,

		exp: now + 3600,

		scope:
			"https://www.googleapis.com/auth/datastore"

	};


	const base64url = (obj) =>
		btoa(JSON.stringify(obj))
			.replace(/=/g, "")
			.replace(/\+/g, "-")
			.replace(/\//g, "_");


	const unsignedToken =
		`${base64url(header)}.${base64url(payload)}`;


	const privateKey =
		env.FIREBASE_PRIVATE_KEY
			.replace(/\\n/g, "\n");


	const key =
		await crypto.subtle.importKey(
			"pkcs8",
			pemToArrayBuffer(privateKey),
			{
				name: "RSASSA-PKCS1-v1_5",
				hash: "SHA-256"
			},
			false,
			["sign"]
		);


	const signature =
		await crypto.subtle.sign(
			"RSASSA-PKCS1-v1_5",
			key,
			new TextEncoder()
				.encode(unsignedToken)
		);


	const signatureBase64 =
		btoa(
			String.fromCharCode(
				...new Uint8Array(signature)
			)
		)
			.replace(/=/g, "")
			.replace(/\+/g, "-")
			.replace(/\//g, "_");


	const jwt =
		`${unsignedToken}.${signatureBase64}`;


	const response =
		await fetch(
			"https://oauth2.googleapis.com/token",
			{
				method: "POST",

				headers: {
					"Content-Type":
						"application/x-www-form-urlencoded"
				},

				body:
					`grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
			}
		);


	const data =
		await response.json();



	return data.access_token;

}
function pemToArrayBuffer(pem) {

	const b64 =
		pem
			.replace(/-----BEGIN PRIVATE KEY-----/, "")
			.replace(/-----END PRIVATE KEY-----/, "")
			.replace(/\s/g, "");


	const binary =
		atob(b64);


	const bytes =
		new Uint8Array(binary.length);


	for (
		let i = 0;
		i < binary.length;
		i++
	) {

		bytes[i] =
			binary.charCodeAt(i);

	}


	return bytes.buffer;

}

async function processCallback(
	env,
	callback
) {

	const checkoutRequestID =
		callback.CheckoutRequestID;

	const resultCode =
		callback.ResultCode;

	const items =
		callback.CallbackMetadata?.Item || [];

	const getValue = (name) => {

		const item = items.find(
			x => x.Name === name
		);

		return item ? item.Value : "";

	};

	const receipt =
		getValue("MpesaReceiptNumber");

	const phone =
		getValue("PhoneNumber");

	const amount =
		getValue("Amount");

	const transactionDate =
		getValue("TransactionDate");

	console.log(
		"Searching booking with CheckoutRequestID:",
		checkoutRequestID
	);

	const accessToken =
		await getFirebaseAccessToken(env);

	const searchUrl =
		`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery`;

	const query = {
		structuredQuery: {
			from: [
				{
					collectionId: "bookings"
				}
			],
			where: {
				fieldFilter: {
					field: {
						fieldPath: "payment.checkoutRequestID"
					},
					op: "EQUAL",
					value: {
						stringValue: checkoutRequestID
					}
				}
			},
			limit: 1
		}
	};

	const searchResponse =
		await fetch(searchUrl, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${accessToken}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(query)
		});

	const searchResult =
		await searchResponse.json();

	console.log(
		"Search Result:",
		searchResult
	);

	if (
		!searchResult.length ||
		!searchResult[0].document
	) {

		console.log(
			"Booking not found."
		);

		return;

	}

	const documentName =
		searchResult[0].document.name;

	const updateUrl =
		`https://firestore.googleapis.com/v1/${documentName}` +
		`?updateMask.fieldPaths=payment` +
		`&updateMask.fieldPaths=status`;

	const body = {

		fields: {

			payment: {

				mapValue: {

					fields: {

						status: {
							stringValue:
								resultCode === 0
									? "Paid"
									: "Failed"
						},

						method: {
							stringValue: "M-Pesa"
						},

						checkoutRequestID: {
							stringValue:
								checkoutRequestID
						},

						merchantRequestID: {
							stringValue:
								callback.MerchantRequestID || ""
						},

						receipt: {
							stringValue:
								receipt
						},

						amount: {
							integerValue:
								String(amount || 0)
						},

						phone: {
							stringValue:
								String(phone || "")
						},

						paidAt: {
							stringValue:
								String(transactionDate || "")
						}

					}

				}

			},

			status: {

				stringValue:
					resultCode === 0
						? "Confirmed"
						: "Payment Failed"

			}

		}

	};

	const updateResponse =
		await fetch(updateUrl, {

			method: "PATCH",

			headers: {

				"Authorization":
					`Bearer ${accessToken}`,

				"Content-Type":
					"application/json"

			},

			body: JSON.stringify(body)

		});

	console.log(
		"Firestore Update:",
		await updateResponse.json()
	);

	console.log(
		"Document Name:",
		documentName
	);

}