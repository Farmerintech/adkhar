import * as Notifications from 'expo-notifications';

export async function sendPushNotification(
  title: string,
  body: string,
  data?: Record<string, any>
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null,
  });
}

export const notifySuccess = () =>
  sendPushNotification(
    'Success',
    'Operation completed successfully.'
  );

export const notifyLogin = () =>
  sendPushNotification(
    'Welcome Back',
    'You have successfully logged in.'
  );

  export const notifyReg = () =>
  sendPushNotification(
    'Welcome',
    'You have successfully Registered on Dutycalc.'
  );