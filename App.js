import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";

export default function CameraGalleryApp() {
  const [permission, requestPermission] = useCameraPermissions();
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
  const [facing, setFacing] = useState("back");
  const [capturedImage, setCapturedImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef(null);
  const [showSavedText, setShowSavedText] = useState(false);

  useEffect(() => {
    requestGalleryPermission();
  }, []);

  const requestGalleryPermission = async () => {
    const galleryStatus =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    setHasGalleryPermission(galleryStatus.status === "granted");

    if (galleryStatus.status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Se necesita permiso para acceder a la galería de fotos."
      );
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        setCapturedImage(photo.uri);
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        setShowCamera(false);
        setShowSavedText(true);
      } catch (error) {
        Alert.alert("Error", "No se pudo tomar la foto.");
        console.error(error);
      }
    }
  };
  const pickImageFromGallery = async () => {
    if (!hasGalleryPermission) {
      Alert.alert(
        "Error",
        "No tienes permisos para acceder a la galería de fotos."
      );
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo seleccionar la foto.");
      console.error(error);
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Solicitando permisos de cámara...</Text>
      </View>
    );
  }
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Se ha negado el permiso a la cámara.</Text>
        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Conceder permiso a la cámara</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (showCamera) {
    return (
      <View style={styles.fullScreen}>
        <CameraView style={styles.fullScreen} ref={cameraRef} facing={facing}>
          <View style={styles.cameraButtonContainer}>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={toggleCameraFacing}
            >
              <Text style={styles.cameraButtonText}>Voltear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setShowCamera(false)}
            >
              <Text style={styles.cameraButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }
  if (showSavedText){
    setTimeout(() => {
      setShowSavedText(false);
    }, 2000);
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Cámara y Galería</Text>
        <Text style={styles.text}>¡Imagen guardada en la galería! 📁</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cámara y Galería</Text>
      {capturedImage && (
        <Image source={{ uri: capturedImage }} style={styles.preview} />
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowCamera(true)}
      >
        <Text style={styles.buttonText}>Abrir Cámara 🎦</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={pickImageFromGallery}>
        <Text style={styles.buttonText}>Seleccionar de la Galería 🖼</Text>
      </TouchableOpacity>
      {capturedImage && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => setCapturedImage(null)}
        >
          <Text style={styles.buttonText}>Limpiar Imagen 🧹</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  fullScreen: {
    flex: 1,
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  button: {
    backgroundColor: "#007aff",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 10,
    minWidth: 200,
    alignItems: "center",
  },
  clearButton: {
    backgroundColor: "#ff4444",
    padding: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  preview: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  camera: {
    flex: 1,
  },
  cameraButtonContainer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  cameraButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  cameraButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#000",
  },

  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ff0000",
  },
});