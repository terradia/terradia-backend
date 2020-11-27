import { Expo, ExpoPushMessage, ExpoPushToken } from "expo-server-sdk";

export declare type TerradiaPushMessage = {
  data?: object;
  title?: string;
  subtitle?: string;
  body?: string;
  sound?:
    | "default"
    | null
    | {
        critical?: boolean;
        name?: "default" | null;
        volume?: number;
      };
  ttl?: number;
  expiration?: number;
  priority?: "default" | "normal" | "high";
  badge?: number;
  channelId?: string;
};

/**
 * message = {
            sound: 'default',
            body: 'This is a test notification',
            data: { withSome: 'data' },
 * }
 * @param somePushTokens
 * @param message
 */

const createMobileNotifications = (
  somePushTokens: ExpoPushToken | ExpoPushToken[],
  message: TerradiaPushMessage
): void => {
  // Create a new Expo SDK client
  const expo = new Expo();

  // Create the messages that you want to send to clents
  const messages = [];
  for (const pushToken of somePushTokens) {
    // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }
    // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications)
    messages.push({
      to: pushToken,
      sound: message.sound,
      body: message.body,
      data: message.data
    });
  }

  // The Expo push notification service accepts batches of notifications so
  // that you don't need to send 1000 requests to send 1000 notifications. We
  // recommend you batch your notifications to reduce the number of requests
  // and to compress them (notifications with similar content will get
  // compressed).
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  (async () => {
    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The error codes are listed in the Expo
        // documentation:
        // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
      } catch (error) {
        console.error(error);
      }
    }
  })();
};

export { createMobileNotifications };
