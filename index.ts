/**
 * @format
 */

import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import messaging from '@react-native-firebase/messaging';
enableScreens();


import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

messaging().setBackgroundMessageHandler(async () => {
  // Se procesa la navegación al abrir la notificación.
});

AppRegistry.registerComponent(appName, () => App);
