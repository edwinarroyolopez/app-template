package com.pulsocop

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Nombre del componente principal registrado en JS
   */
  override fun getMainComponentName(): String = "TemplateApp"

  /**
   * 🔧 FIX CRASH release + react-native-screens
   * Evita restauración automática de fragments que rompe la app
   */
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }

  /**
   * Delegate de React Activity
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
    DefaultReactActivityDelegate(
      this,
      mainComponentName,
      fabricEnabled
    )
}
