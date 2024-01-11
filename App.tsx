import * as React from "react";

import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { screenshotsStatusUpdate } from "react-native-disable-enable-screenshots";
import axios from "axios";
import DeviceInfo from "react-native-device-info";
import { useNetInfo } from "@react-native-community/netinfo";

export default function App() {
  const [result, setResult] = React.useState<string | undefined>();
  const [isScreenshotDisable, setScreenShotDisable] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const netInfo = useNetInfo();

  const submitDeviceInfo = async (res: String) => {
    try {
      const deviceInfo = {
        os: Platform.OS,
        deviceName: DeviceInfo.getModel(),
        deviceMAC: await DeviceInfo.getMacAddress(),
        IMEI: await DeviceInfo.getUniqueId(),
        location: "location", //TBD through geolocation npm
        publicIP: await getPublicIPAddress(),
        screenshotStatus: res,
      };
      console.log(deviceInfo);

      // Make API call with device details
      const response = await axios.post(
        "https://your-api-endpoint.com/submitDeviceInfo",
        deviceInfo
      );

      // Handle the API response if needed
      console.log(response.data);
    } catch (error) {
      console.error("Error submitting device info:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPublicIPAddress = async () => {
    try {
      // Implement logic to get public IP address (can use an external service)
      const response = await axios.get("https://api64.ipify.org?format=json");
      return response.data.ip;
    } catch (error) {
      console.error("Error getting public IP address:", error);
      return null;
    }
  };

  const toggleScreeshot = async () => {
    if (!netInfo.isConnected) {
      setResult("Please check your connection.");
      return;
    }
    setLoading(true);
    try {
      const res = await screenshotsStatusUpdate(!isScreenshotDisable);
      console.log(res);
      setResult(res);
      submitDeviceInfo(res);
      setScreenShotDisable(!isScreenshotDisable);
    } catch (e) {
      setLoading(false);
      if (typeof e === "string") {
        console.log("String error:", e);
        setResult(e);
      } else if (e instanceof Error) {
        console.log("Error object:", e.message);
        setResult(e.message);
      } else {
        console.log("Unknown error type:", e);
        setResult(JSON.stringify(e));
      }
    }
  };

  return (
    <SafeAreaView style={styles.backgroundStyle}>
      <View style={styles.container}>
        <Image source={require("./assets/img/logo.png")} style={styles.logo} />

        <TouchableOpacity
          disabled={loading}
          style={
            loading
              ? styles.disableButton
              : isScreenshotDisable
              ? styles.activateButton
              : styles.activatedButton
          }
          onPress={toggleScreeshot}
        >
          <Text style={styles.buttonText}>
            {isScreenshotDisable ? "Activate" : "Activated"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.resultText}> {result}</Text>

        {loading && <ActivityIndicator size="large" />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backgroundStyle: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  rowcontainer: {
    flexDirection: "row",
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    borderRadius: 15,
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "blue",
    borderRadius: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  resultText: {
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  activateButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "green",
    borderRadius: 5,
  },
  activatedButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "blue",
    borderRadius: 5,
  },
  disableButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "gray",
    borderRadius: 5,
  },
});
