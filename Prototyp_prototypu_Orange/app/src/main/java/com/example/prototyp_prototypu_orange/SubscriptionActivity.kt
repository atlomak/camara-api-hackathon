package com.example.prototyp_prototypu_orange

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.FirebaseApp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.functions.FirebaseFunctions
import com.google.firebase.messaging.FirebaseMessaging
import java.util.UUID


class SubscriptionActivity : AppCompatActivity() {

    private lateinit var phoneNumberEditText: EditText
    private lateinit var subscribeButton: Button
    private val db = FirebaseFirestore.getInstance()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_subscription)

        phoneNumberEditText = findViewById(R.id.phoneNumberEditText)
        subscribeButton = findViewById(R.id.subscribeButton)

        subscribeButton.setOnClickListener {
            val phoneNumber = phoneNumberEditText.text.toString().trim()

            if (phoneNumber.isEmpty() || phoneNumber.length < 9) {
                Toast.makeText(this, "Wprowadź poprawny numer telefonu!", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }
            val formattedPhoneNumber = formatPhoneNumber(phoneNumber)
            createSubscription(formattedPhoneNumber)
        }
    }

    private fun createSubscription(phoneNumber: String) {
        val userId = FirebaseAuth.getInstance().currentUser?.uid ?: UUID.randomUUID().toString()

        FirebaseMessaging.getInstance().token
            .addOnCompleteListener { task ->
                if (!task.isSuccessful) {
                    Log.w("FCM", "Fetching FCM registration token failed", task.exception)
                    return@addOnCompleteListener
                }

                val fcmToken = task.result

                val userSubscription = hashMapOf(
                    "userId" to userId,
                    "phoneNumber" to phoneNumber,
                    "fcmToken" to fcmToken,
                    "subscribedAt" to FieldValue.serverTimestamp()
                )

                Log.d("triggerSubscription", "Dane subskrybcji: $userId | $phoneNumber | $fcmToken")

                db.collection("subscriptions").document(userId)
                    .set(userSubscription)
                    .addOnSuccessListener {
                        triggerGeofenceSubscription(userId, phoneNumber)
                    }
                    .addOnFailureListener { e ->
                        Toast.makeText(this, "Błąd zapisu do bazy: ${e.message}", Toast.LENGTH_LONG).show()
                    }
            }
    }


    private fun triggerGeofenceSubscription(userId: String, phoneNumber: String) {

        Log.d("GeofenceSubscription", "Dane subskrybcji: $userId | $phoneNumber")

        val functions = FirebaseFunctions.getInstance()
        val requestData = hashMapOf(
            "userId" to userId,
            "phoneNumber" to phoneNumber
        )

        functions.getHttpsCallable("triggerOrangeGeofencing")
            .call(requestData)
            .addOnSuccessListener {
                Log.d("FirebaseFunction", "Subskrypcja utworzona pomyślnie!")
                Toast.makeText(this, "Subskrypcja utworzona!", Toast.LENGTH_LONG).show()
                startActivity(Intent(this, MainActivity::class.java))
                finish()
            }
            .addOnFailureListener { e ->
                Log.e("FirebaseFunction", "Błąd subskrypcji: ${e.message}", e)
                Toast.makeText(this, "Błąd subskrypcji: ${e.message}", Toast.LENGTH_LONG).show()
            }

    }

    private fun formatPhoneNumber(phoneNumber: String): String {
        return if (!phoneNumber.startsWith("+")) {
            "+$phoneNumber"
        } else {
            phoneNumber
        }
    }
}
