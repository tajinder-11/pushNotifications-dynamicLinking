import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
} from "react-native";
import dynamicLinks from "@react-native-firebase/dynamic-links";
import axios from "react-native-axios";

import COLORS from "../utils/constants/colors";

async function sendPushNotification({ token, senderUid, chatId, name }) {
  const message = {
    to: token,
    sound: "default",
    title: "You have got a notification",
    body: "And here is the body!",
    data: { token: token, senderUid: senderUid, chatId: chatId, name: name },
  };

  try {
    await axios.post("https://exp.host/--/api/v2/push/send", message, {
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
    });
    Alert.alert("PushNotification sent successfully");
  } catch (error) {
    throw new Error("Error sending push notification:", error);
  }
}

function Messages({ route }) {
  const { name, token, uid, chatId } = route.params;
  const BASE_URL = "https://pushdynamiclinktest.page.link/";

  async function sendEmail() {
    try {
      await axios.post("https://mandrillapp.com/api/1.0/messages/send.json", {
        key: "md-19QucTyOBA67d_ZA7MV2iA",
        message: {
          from_email: "info@nudiance.com",
          subject: "Hello world",
          text: "Welcome to Mailchimp Transactional!",
          to: [
            {
              email: "info@nudiance.com",
              type: "to",
            },
          ],
        },
      });
      Alert.alert("Success", "Email sent successfully");
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }

  const onShare = async ({ uid, chatId, name, token }) => {
    try {
      const link = await dynamicLinks().buildShortLink({
        link: `${BASE_URL}?name=${name}&uid=${uid}&chatId=${chatId}&token=${token}`,
        domainUriPrefix: BASE_URL,
        android: {
          packageName: "com.tajinder12.pushnotifications",
        },
      });

      if (link) {
        await Share.share({
          message: `Check out ${name}'s profile: ${link}`,
          url: link,
        });
      }   
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Messages with {name}</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>UID:</Text>
        <Text style={styles.info}>{uid}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.pushButton]}
        onPress={() => sendPushNotification(token, uid, chatId, name)}
      >
        <Text style={styles.buttonText}>Send Push Notification</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.shareButton]}
        onPress={() => onShare(uid, chatId, name, token)}
      >
        <Text style={styles.buttonText}>Share</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.emailButton]}
        onPress={sendEmail}
      >
        <Text style={styles.buttonText}>Email</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 10,
    minWidth: 200,
    alignItems: "center",
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  pushButton: {
    backgroundColor: COLORS.royalBlue,
  },
  shareButton: {
    backgroundColor: COLORS.parrotGreen,
  },
  emailButton: {
    backgroundColor: COLORS.orange,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: COLORS.royalBlue,
  },
  infoContainer: {
    flexDirection: "row",
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
    color: COLORS.darkgrey,
  },
  info: {
    fontSize: 16,
    color: COLORS.black,
  },
});

export default Messages;
