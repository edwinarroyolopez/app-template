package com.pulsocop

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import androidx.core.content.getSystemService
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.pulsocop.audio.AudioRecorderPackage;


class MainApplication : Application(), ReactApplication {

  private fun ensureDefaultNotificationChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

    val manager = getSystemService<NotificationManager>() ?: return
    val channel = NotificationChannel(
      getString(R.string.default_notification_channel_id),
      getString(R.string.default_notification_channel_name),
      NotificationManager.IMPORTANCE_HIGH,
    ).apply {
      description = "General app notifications"
      enableVibration(true)
    }

    manager.createNotificationChannel(channel)
  }

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
          add(AudioRecorderPackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    ensureDefaultNotificationChannel()
    loadReactNative(this)
  }
}
