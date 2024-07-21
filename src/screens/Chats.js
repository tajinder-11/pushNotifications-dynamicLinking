import React, { useEffect, useRef, useState } from "react";
import dynamicLinks from "@react-native-firebase/dynamic-links";
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import * as Device from "expo-device";

import COLORS from "../utils/constants/colors";
import { SCREEN_NAMES } from "../utils/constants/navigationConstants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function Chats({ navigation }) {
  const [expoPushToken, setExpoPushToken] = useState("");
  const notificationResponseListener = useRef();

  const chatData = [
    {
      name: "Android1",
      uid: "U1",
      token: expoPushToken,
      chatId: "chat1",
    },
    {
      name: "Ios",
      uid: "U2",
      token: expoPushToken,
      chatId: "chat2",
    },
  ];

  useEffect(() => {
    registerForPushNotificationsAsync();

    handleInitialNotification();

    notificationResponseListener.current =
      Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse
      );

    const unsubscribeDynamicLinkListener = initializeDynamicLinks();

    return () => {
      if (notificationResponseListener.current) {
        Notifications.removeNotificationSubscription(
          notificationResponseListener.current
        );
      }
      if (unsubscribeDynamicLinkListener) {
        unsubscribeDynamicLinkListener();
      }
    };
  }, []);

  const handleNotificationResponse = (response) => {
    try {
      const { data } = response.notification.request.content;
      navigation.navigate(SCREEN_NAMES.Messages, {
        token: data.token,
        uid: data.senderUid,
        chatId: data.chatId,
        name: data.name,
      });

      if (data.sender && data.chatId) {
        Alert.alert("chat Id", `${data.chatId}`);
      }
    } catch (error) {
      throw new Error("Error", error);
    }
  };

  const initializeDynamicLinks = () => {
    dynamicLinks().getInitialLink().then(handleDynamicLink);

    return dynamicLinks().onLink(handleDynamicLink);
  };

  const handleDynamicLink = (link) => {
    if (link.url) {
      const url = new URL(link.url);
      const params = new URLSearchParams(url.search);
      const name = params.get("name");
      const uid = params.get("uid");
      const chatId = params.get("chatId");
      const token = params.get("token");
      navigation.navigate(SCREEN_NAMES.Messages, {
        name: name,
        uid: uid,
        chatId: chatId,
        token: token,
      });
      Alert.alert("chat Id", `${chatId}`);
    }
  };

  function handleRegistrationError(errorMessage) {
    Alert.alert(errorMessage);
    throw new Error(errorMessage);
  }

  async function registerForPushNotificationsAsync() {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: COLORS.lightRed,
      });
    }

    if (!Device.isDevice) {
      handleRegistrationError(
        "Must use physical device for push notifications"
      );
      return;
    }
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      handleRegistrationError(
        "Permission not granted to get push token for push notification!"
      );
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID not found");
      return;
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      setExpoPushToken(pushTokenString);
      Alert.alert("Push Token String", pushTokenString);
    } catch (e) {
      handleRegistrationError(`"The ERROR",${e}`);
    }
  }

  async function handleInitialNotification() {
    try {
      const initialNotification =
        await Notifications.getLastNotificationResponseAsync();
      if (initialNotification) {
        const { data } = initialNotification.notification.request.content;
        navigation.navigate(SCREEN_NAMES.Messages, {
          token: data.token,
          uid: data.senderUid,
          chatId: data.chatId,
          name: data.name,
        });
      }
    } catch (error) {
      console.error("Error getting last notification response:", error);
    }
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate(SCREEN_NAMES.Messages, item)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
      </View>
      <View style={styles.chatInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.name}>{item.uid}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chats</Text>
      <FlatList
        data={chatData}
        renderItem={renderItem}
        keyExtractor={(item) => item.uid}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundWhite,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 20,
    backgroundColor: COLORS.white,
  },
  list: {
    flex: 1,
  },
  chatItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderBottomColor,
    backgroundColor: COLORS.white,
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.royalBlue,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  chatInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.darkgrey,
  },
});

export default Chats;
