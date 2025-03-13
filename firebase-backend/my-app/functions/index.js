const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();

let TOKEN = "enter_token_for_development"

// Funkcja pobierająca dynamicznie OAuth Token z Orange API
async function getOAuthToken() {
    try {
        const response = await axios.post(
            "https://api.orange.com/oauth/v3/token",
            "grant_type=client_credentials",
            {
                headers: {
                    "Authorization": TOKEN,
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json"
                }
            }
        );

        console.log("OAuth Token:", response.data.access_token);
        return response.data.access_token;
    } catch (error) {
        console.error("Error fetching OAuth Token:", error.response?.data || error.message);
        throw new Error("Failed to obtain OAuth Token");
    }
}

exports.triggerOrangeGeofencing = functions.https.onRequest(async (req, res) => {
    try {
        console.log("Received event:", JSON.stringify(req.body));
        await db.collection("logs").add({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            event: req.body
        });

        // Pobieramy numer telefonu z zapytania
        const phoneNumber = req.body.data?.phoneNumber;
        if (!phoneNumber) {
            throw new Error("Missing phoneNumber in request body");
        }

        // Pobieramy token OAuth
        const oauthToken = await getOAuthToken();

        // Definicja payloadu
        const payload = {
            "protocol": "HTTP",
            "sink": "https://us-central1-orangehackathon-9d5d7.cloudfunctions.net/receiveEvent",
            "types": [
                "org.camaraproject.geofencing-subscriptions.v0.area-entered"
            ],
            "config": {
                "subscriptionDetail": {
                    "device": {
                        "phoneNumber": phoneNumber
                    },
                    "area": {
                        "areaType": "CIRCLE",
                        "center": {
                            "latitude": "48.80",
                            "longitude": "2.29"
                        },
                        "radius": 2000
                    }
                },
                "initialEvent": true,
                "subscriptionMaxEvents": 10,
                "subscriptionExpireTime": "2025-03-22T05:40:58.469Z"
            }
        };

        // Wysyłamy zapytanie do Orange API z dynamicznie pobranym tokenem
        const response = await axios.post(
            "https://api.orange.com/camara/geofencing/orange-lab/v0/subscriptions/simulated",
            payload,
            {
                headers: {
                    "Authorization": `Bearer ${oauthToken}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("Orange API Response:", response.data);
        await db.collection("logs").add({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            response: response.data
        });

        return res.status(200).json({ data: response.data });
    } catch (error) {
        console.error("Error triggering Orange API:", error.response?.data || error.message);
        await db.collection("logs").add({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            error: error.message
        });
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// Endpoint do odbierania zdarzeń od Orange API i wysyłania powiadomień push
exports.receiveEvent = functions.https.onRequest(async (req, res) => {
    try {
        console.log("Received event on /receiveEvent:", JSON.stringify(req.body));
        await db.collection("event_logs").add({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            event: req.body
        });

        const eventData = req.body.data;
        if (!eventData || !eventData.device || !eventData.device.phoneNumber || !eventData.area) {
            throw new Error("Invalid event data format");
        }

        const phoneNumber = eventData.device.phoneNumber;
        const latitude = eventData.area.center.latitude;
        const longitude = eventData.area.center.longitude;

        // Pobranie FCM Tokena dla użytkownika
        const userDoc = await db.collection("subscriptions").where("phoneNumber", "==", phoneNumber).get();
        if (userDoc.empty) {
            console.log("No user found with phone number:", phoneNumber);
            return res.status(404).send("User not found");
        }

        const fcmToken = userDoc.docs[0].data().fcmToken;
        if (!fcmToken) {
            console.log("No FCM token found for user:", phoneNumber);
            return res.status(400).send("No FCM token found");
        }

        // Wysyłanie powiadomienia push
        const message = {
            token: fcmToken,
            notification: {
                title: "Advert",
                body: `Advert for area at (${latitude}, ${longitude})`
            },
            data: {
                latitude: latitude.toString(),
                longitude: longitude.toString()
            }
        };

        await admin.messaging().send(message);
        console.log("Push notification sent successfully");
        res.status(200).send("Event processed and notification sent");
    } catch (error) {
        console.error("Error processing event:", error);
        res.status(500).send("Error processing event");
    }
});
