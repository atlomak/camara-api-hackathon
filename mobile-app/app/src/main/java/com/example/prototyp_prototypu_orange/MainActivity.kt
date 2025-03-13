package com.example.prototyp_prototypu_orange

import android.content.Context
import android.content.Intent
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.FirebaseApp
import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Sprawdzamy dostępność internetu
        if (!isInternetAvailable()) {
            Toast.makeText(this, "Brak połączenia z internetem!", Toast.LENGTH_LONG).show()
            return
        }

        // Sprawdzamy uprawnienia do powiadomień
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) { // Android 13+
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED
            ) {
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                    101
                )
            } else {
                // Jeśli uprawnienia już są przyznane, przechodzimy do SubscriptionActivity
                goToSubscriptionActivity()
            }
        } else {
            // Dla starszych wersji Androida przechodzimy od razu do SubscriptionActivity
            goToSubscriptionActivity()
        }
    }

    private fun isInternetAvailable(): Boolean {
        val connectivityManager =
            getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false

        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) &&
                capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
    }

    private fun goToSubscriptionActivity() {
        startActivity(Intent(this, SubscriptionActivity::class.java))
        finish()
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)

        if (requestCode == 101) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Toast.makeText(this, "Powiadomienia włączone!", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(this, "Powiadomienia wyłączone, możesz je włączyć w ustawieniach.", Toast.LENGTH_LONG).show()
            }
            // Po sprawdzeniu uprawnień przechodzimy dalej
            goToSubscriptionActivity()
        }
    }
}
