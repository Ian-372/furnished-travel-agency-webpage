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
		// GET /health or /debug
		// ==========================
		if (url.pathname === "/health" || url.pathname === "/debug") {
			const hasAuth = Boolean(getPayHeroAuth(env));
			const channelId = env.PAYHERO_CHANNEL_ID || 12173;
			const firebaseConfigured = Boolean(
				env.FIREBASE_PROJECT_ID &&
				env.FIREBASE_CLIENT_EMAIL &&
				env.FIREBASE_PRIVATE_KEY
			);

			return json({
				status: "PayHero Worker Running",
				payhero: {
					authConfigured: hasAuth,
					channelId: channelId,
				},
				firebase: {
					configured: firebaseConfigured,
					projectId: env.FIREBASE_PROJECT_ID || "Not set",
				},
				timestamp: new Date().toISOString(),
			});
		}

		// ==========================
		// POST /stkpush or /payhero (PayHero STK Push)
		// ==========================
		if (
			(url.pathname === "/stkpush" ||
				url.pathname === "/payhero" ||
				url.pathname === "/payhero/stkpush" ||
				url.pathname === "/payhero/payments") &&
			request.method === "POST"
		) {
			try {
				const body = await request.json();

				const bookingId = body.bookingId || body.external_reference;
				const rawPhone = body.phone || body.phone_number;
				const amount = Number(body.amount);
				const customerName = body.customerName || body.name || "Customer";

				if (!bookingId || !rawPhone || !amount) {
					return json(
						{
							error: "Missing required fields: bookingId, phone, and amount are required.",
						},
						400
					);
				}

				const phone = normalizePhone(rawPhone);
				const authHeader = getPayHeroAuth(env);

				if (!authHeader) {
					return json(
						{
							error: "PayHero authentication credentials not configured in worker environment (PAYHERO_API_USERNAME & PAYHERO_API_PASSWORD or PAYHERO_API_KEY).",
						},
						500
					);
				}

				const channelId = Number(
					env.PAYHERO_CHANNEL_ID || body.channelId || body.channel_id || 12173
				);

				const callbackUrl =
					env.PAYHERO_CALLBACK_URL || `${url.origin}/callback`;

				// Support both PayHero v2 parameters and payload schema
				const payheroPayload = {
					request_type: "payment",
					amount: amount,
					phone_number: phone,
					phone: phone,
					currency: "KES",
					country: "KE",
					channel_id: channelId,
					provider: "m-pesa",
					reference: String(bookingId),
					external_reference: String(bookingId),
					description: `Payment for booking ${bookingId}`,
					customer_name: customerName,
					customer: {
						first_name: customerName.split(" ")[0] || "Customer",
						last_name: customerName.split(" ").slice(1).join(" ") || "Booking",
						phone: phone,
					},
					callback_url: callbackUrl,
				};

				console.log("Initiating PayHero STK Push:", payheroPayload);

				const response = await fetch(
					"https://backend.payhero.co.ke/api/v2/payments",
					{
						method: "POST",
						headers: {
							Authorization: authHeader,
							"Content-Type": "application/json",
						},
						body: JSON.stringify(payheroPayload),
					}
				);

				const data = await response.json();
				console.log("PayHero response status:", response.status);
				console.log("PayHero response data:", data);

				const isInitiated =
					response.ok &&
					(data.status === "Success" ||
						data.status === "Pending" ||
						data.status === "OK" ||
						data.success === true ||
						data.reference);

				// Update booking payment record in Firestore
				if (isInitiated && env.FIREBASE_PROJECT_ID) {
					try {
						await updateBookingPayment(env, bookingId, {
							status: "Pending",
							reference: data.reference || data.CheckoutRequestID || "",
							checkoutRequestID:
								data.CheckoutRequestID ||
								data.checkout_request_id ||
								data.reference ||
								"",
							merchantRequestID:
								data.MerchantRequestID ||
								data.merchant_request_id ||
								"",
							phone: phone,
							amount: amount,
						});
					} catch (firestoreError) {
						console.error("Firestore update error:", firestoreError);
					}
				}

				return json(
					{
						status: response.status,
						success: isInitiated,
						message:
							data.message ||
							(isInitiated
								? "STK Push sent successfully via PayHero. Please check your phone."
								: "Payment initiation failed."),
						response: data,
					},
					response.status
				);
			} catch (err) {
				console.error("STK Push error:", err);
				return json(
					{
						error: err.message,
					},
					500
				);
			}
		}

		// ==========================
		// POST /callback or /webhook (PayHero Callback)
		// ==========================
		if (
			(url.pathname === "/callback" ||
				url.pathname === "/payhero/callback" ||
				url.pathname === "/webhook") &&
			request.method === "POST"
		) {
			try {
				const body = await request.json();

				console.log("PayHero Callback Received:", JSON.stringify(body, null, 2));

				if (env.FIREBASE_PROJECT_ID) {
					await processPayHeroCallback(env, body);
				}

				return json({
					status: "success",
					message: "PayHero callback processed successfully",
				});
			} catch (err) {
				console.error("Callback Error:", err);
				return json(
					{
						status: "error",
						message: err.message,
					},
					200
				);
			}
		}

		// Default fallback
		return new Response("PayHero Payment Worker Running", {
			headers: corsHeaders(),
		});
	},
};

// ======================================
// Helpers
// ======================================

function getPayHeroAuth(env) {
	if (env.PAYHERO_BASIC_AUTH) {
		return env.PAYHERO_BASIC_AUTH.startsWith("Basic ")
			? env.PAYHERO_BASIC_AUTH
			: `Basic ${env.PAYHERO_BASIC_AUTH}`;
	}

	if (env.PAYHERO_API_USERNAME && (env.PAYHERO_API_PASSWORD || env.PAYHERO_ACCOUNT_ID || env.PAYHERO_API_KEY)) {
		const secret = env.PAYHERO_API_PASSWORD || env.PAYHERO_ACCOUNT_ID || env.PAYHERO_API_KEY;
		return `Basic ${btoa(`${env.PAYHERO_API_USERNAME}:${secret}`)}`;
	}

	if (env.PAYHERO_API_KEY) {
		return `Basic ${btoa(`${env.PAYHERO_API_KEY}:`)}`;
	}

	if (env.PAYHERO_ACCOUNT_ID) {
		return `Basic ${btoa(`${env.PAYHERO_ACCOUNT_ID}:`)}`;
	}

	if (env.PAYHERO_API_TOKEN) {
		return `Bearer ${env.PAYHERO_API_TOKEN}`;
	}

	return null;
}

function normalizePhone(phone) {
	if (!phone) return "";
	const clean = String(phone).replace(/\D/g, "");

	if (clean.startsWith("0") && clean.length === 10) {
		return "254" + clean.slice(1);
	}
	if ((clean.startsWith("7") || clean.startsWith("1")) && clean.length === 9) {
		return "254" + clean;
	}
	if (clean.startsWith("254") && clean.length === 12) {
		return clean;
	}
	return clean;
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

// ======================================
// Firestore Helpers
// ======================================

async function updateBookingPayment(env, bookingId, paymentInfo) {
	const url =
		`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/bookings/${bookingId}` +
		`?updateMask.fieldPaths=payment`;

	const body = {
		fields: {
			payment: {
				mapValue: {
					fields: {
						status: {
							stringValue: paymentInfo.status || "Pending",
						},
						method: {
							stringValue: "PayHero M-Pesa",
						},
						reference: {
							stringValue: String(paymentInfo.reference || ""),
						},
						checkoutRequestID: {
							stringValue: String(paymentInfo.checkoutRequestID || ""),
						},
						merchantRequestID: {
							stringValue: String(paymentInfo.merchantRequestID || ""),
						},
						amount: {
							integerValue: String(paymentInfo.amount || 0),
						},
						phone: {
							stringValue: String(paymentInfo.phone || ""),
						},
						updatedAt: {
							stringValue: new Date().toISOString(),
						},
					},
				}
			}
		}
	};

	console.log("Updating booking payment in Firestore:", bookingId);

	const accessToken = await getFirebaseAccessToken(env);
	const response = await fetch(url, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${accessToken}`,
		},
		body: JSON.stringify(body),
	});

	const result = await response.json();
	console.log("Firestore response status:", response.status);

	if (!response.ok) {
		throw new Error(`Firestore update failed: ${JSON.stringify(result)}`);
	}
}

async function processPayHeroCallback(env, payload) {
	const data = payload.response || payload.data || payload;

	const status = String(
		payload.status || data.status || (payload.success ? "Success" : "")
	).toLowerCase();

	const isSuccess =
		status === "success" ||
		status === "complete" ||
		payload.success === true ||
		payload.ResultCode === 0;

	const bookingId =
		payload.external_reference ||
		data.external_reference ||
		payload.account_reference ||
		data.account_reference ||
		payload.reference ||
		data.reference ||
		"";

	const receipt =
		payload.mpesa_code ||
		payload.receipt ||
		payload.receipt_number ||
		data.mpesa_code ||
		data.receipt ||
		data.receipt_number ||
		"";

	const amount = payload.amount || data.amount || 0;
	const phone = payload.phone || payload.phone_number || data.phone || data.phone_number || "";
	const checkoutRequestID =
		payload.CheckoutRequestID ||
		payload.checkout_request_id ||
		data.CheckoutRequestID ||
		data.checkout_request_id ||
		payload.reference ||
		data.reference ||
		"";
	const merchantRequestID =
		payload.MerchantRequestID ||
		payload.merchant_request_id ||
		data.MerchantRequestID ||
		data.merchant_request_id ||
		"";

	console.log("Extracted PayHero callback data:", {
		isSuccess,
		bookingId,
		receipt,
		amount,
		phone,
		checkoutRequestID,
	});

	const accessToken = await getFirebaseAccessToken(env);

	// Attempt 1: Direct document update if bookingId is known
	if (bookingId) {
		const directDocUrl = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/bookings/${bookingId}`;
		const checkResp = await fetch(directDocUrl, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});

		if (checkResp.ok) {
			console.log("Found booking directly by external_reference:", bookingId);
			await patchBookingDocument(
				directDocUrl,
				accessToken,
				isSuccess,
				checkoutRequestID,
				merchantRequestID,
				receipt,
				amount,
				phone
			);
			return;
		}
	}

	// Attempt 2: Search by payment.checkoutRequestID or payment.reference
	const searchUrl = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery`;

	const query = {
		structuredQuery: {
			from: [{ collectionId: "bookings" }],
			where: {
				fieldFilter: {
					field: { fieldPath: "payment.checkoutRequestID" },
					op: "EQUAL",
					value: { stringValue: checkoutRequestID },
				},
			},
			limit: 1,
		},
	};

	const searchResponse = await fetch(searchUrl, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(query),
	});

	const searchResult = await searchResponse.json();

	if (!searchResult.length || !searchResult[0].document) {
		console.log("Booking document not found for callback:", checkoutRequestID);
		return;
	}

	const docPath = `https://firestore.googleapis.com/v1/${searchResult[0].document.name}`;
	await patchBookingDocument(
		docPath,
		accessToken,
		isSuccess,
		checkoutRequestID,
		merchantRequestID,
		receipt,
		amount,
		phone
	);
}

async function patchBookingDocument(
	docUrl,
	accessToken,
	isSuccess,
	checkoutRequestID,
	merchantRequestID,
	receipt,
	amount,
	phone
) {
	const updateUrl =
		`${docUrl}?updateMask.fieldPaths=payment&updateMask.fieldPaths=status`;

	const body = {
		fields: {
			payment: {
				mapValue: {
					fields: {
						status: {
							stringValue: isSuccess ? "Paid" : "Failed",
						},
						method: {
							stringValue: "PayHero M-Pesa",
						},
						checkoutRequestID: {
							stringValue: String(checkoutRequestID || ""),
						},
						merchantRequestID: {
							stringValue: String(merchantRequestID || ""),
						},
						receipt: {
							stringValue: String(receipt || ""),
						},
						amount: {
							integerValue: String(amount || 0),
						},
						phone: {
							stringValue: String(phone || ""),
						},
						paidAt: {
							stringValue: new Date().toISOString(),
						},
					},
				},
			},
			status: {
				stringValue: isSuccess ? "Confirmed" : "Payment Failed",
			},
		},
	};

	const updateResponse = await fetch(updateUrl, {
		method: "PATCH",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});

	const responseData = await updateResponse.json();
	console.log("Firestore Patch Result:", responseData);
}

async function getFirebaseAccessToken(env) {
	const header = {
		alg: "RS256",
		typ: "JWT",
	};

	const now = Math.floor(Date.now() / 1000);

	const payload = {
		iss: env.FIREBASE_CLIENT_EMAIL,
		sub: env.FIREBASE_CLIENT_EMAIL,
		aud: "https://oauth2.googleapis.com/token",
		iat: now,
		exp: now + 3600,
		scope: "https://www.googleapis.com/auth/datastore",
	};

	const base64url = (obj) =>
		btoa(JSON.stringify(obj))
			.replace(/=/g, "")
			.replace(/\+/g, "-")
			.replace(/\//g, "_");

	const unsignedToken = `${base64url(header)}.${base64url(payload)}`;

	const privateKey = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");

	const key = await crypto.subtle.importKey(
		"pkcs8",
		pemToArrayBuffer(privateKey),
		{
			name: "RSASSA-PKCS1-v1_5",
			hash: "SHA-256",
		},
		false,
		["sign"]
	);

	const signature = await crypto.subtle.sign(
		"RSASSA-PKCS1-v1_5",
		key,
		new TextEncoder().encode(unsignedToken)
	);

	const signatureBase64 = btoa(
		String.fromCharCode(...new Uint8Array(signature))
	)
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");

	const jwt = `${unsignedToken}.${signatureBase64}`;

	const response = await fetch("https://oauth2.googleapis.com/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
	});

	const data = await response.json();
	return data.access_token;
}

function pemToArrayBuffer(pem) {
	const b64 = pem
		.replace(/-----BEGIN PRIVATE KEY-----/, "")
		.replace(/-----END PRIVATE KEY-----/, "")
		.replace(/\s/g, "");

	const binary = atob(b64);
	const bytes = new Uint8Array(binary.length);

	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}

	return bytes.buffer;
}
