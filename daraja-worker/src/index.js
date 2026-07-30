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

				const phone = body.phone;
				const amount = body.amount;
				const accountReference =
					body.accountReference || "LittleMonks";
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