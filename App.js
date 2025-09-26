import { Camera, CameraView } from "expo-camera";
import { useEffect, useState } from "react";
import { Audio } from "expo-av";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [sound, setSound] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    })();
  }, []);

  useEffect(() => {
    return sound ? () => sound.unloadAsync() : undefined;
  }, [sound]);

  const playAudio = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }

    const { sound: s } = await Audio.Sound.createAsync(
      require("./assets/audio.mp3")
    );
    setSound(s);
    await s.playAsync();
  };

  const handleBarcodeScanned = async (result) => {
    if (!scanned && result?.data === "MEU_QR_CODE") {
      setScanned(true);
      await playAudio();
    }
  };

  if (hasPermission === null) return <View />;
  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Text>Precisamos da permissão da câmera</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
          }}
        >
          <Text style={styles.label}>Conceder permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={handleBarcodeScanned}
      >
        {scanned && (
          <View style={styles.overlay}>
            <Text style={styles.label}>
              🎵 QRCode reconhecido! Tocando música...
            </Text>
          </View>
        )}
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "blue",
    borderRadius: 5,
  },
  text: { color: "#fff" },
  overlay: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 15,
    borderRadius: 10,
  },
  label: { color: "#fff", fontSize: 16 },
});
