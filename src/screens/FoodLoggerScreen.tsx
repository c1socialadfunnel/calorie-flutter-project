import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';

export default function FoodLoggerScreen() {
  const [mode, setMode] = useState<'scan' | 'type'>('type');
  const [description, setDescription] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
    }
  };

  const analyzeFood = async () => {
    if (mode === 'type' && !description.trim()) {
      Alert.alert('Error', 'Please describe your food');
      return;
    }

    if (mode === 'scan' && !capturedImage) {
      Alert.alert('Error', 'Please take a photo first');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsAnalyzing(false);
      Alert.alert('Analysis Complete', 'Food analyzed successfully!');
    }, 2000);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Calorie Count</Text>
        <Text style={styles.subtitle}>Analyze your food with AI</Text>
      </View>

      <View style={styles.content}>
        {/* Mode Selection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How would you like to log your food?</Text>
          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'scan' && styles.modeButtonActive]}
              onPress={() => setMode('scan')}
            >
              <Ionicons 
                name="camera" 
                size={24} 
                color={mode === 'scan' ? 'white' : '#7c3aed'} 
              />
              <Text style={[
                styles.modeButtonText, 
                mode === 'scan' && styles.modeButtonTextActive
              ]}>
                Scan
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'type' && styles.modeButtonActive]}
              onPress={() => setMode('type')}
            >
              <Ionicons 
                name="create" 
                size={24} 
                color={mode === 'type' ? 'white' : '#7c3aed'} 
              />
              <Text style={[
                styles.modeButtonText, 
                mode === 'type' && styles.modeButtonTextActive
              ]}>
                Type
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Input Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {mode === 'scan' ? 'Take a Photo' : 'Describe Your Food'}
          </Text>

          {mode === 'scan' ? (
            <View style={styles.cameraSection}>
              {capturedImage ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
                  <TouchableOpacity
                    style={styles.retakeButton}
                    onPress={() => setCapturedImage(null)}
                  >
                    <Ionicons name="refresh" size={20} color="white" />
                    <Text style={styles.retakeButtonText}>Retake</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.cameraActions}>
                  <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
                    <Ionicons name="camera" size={24} color="white" />
                    <Text style={styles.cameraButtonText}>Open Camera</Text>
                  </TouchableOpacity>
                  <Text style={styles.orText}>or</Text>
                  <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                    <Ionicons name="image" size={24} color="#7c3aed" />
                    <Text style={styles.uploadButtonText}>Upload Photo</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.textSection}>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., grilled chicken breast with rice and vegetables"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
            onPress={analyzeFood}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <Text style={styles.analyzeButtonText}>Analyzing...</Text>
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="white" />
                <Text style={styles.analyzeButtonText}>Analyze Food</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#7c3aed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  modeButtonActive: {
    backgroundColor: '#7c3aed',
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7c3aed',
  },
  modeButtonTextActive: {
    color: 'white',
  },
  cameraSection: {
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  capturedImage: {
    width: 300,
    height: 200,
    borderRadius: 12,
  },
  retakeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  retakeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  cameraActions: {
    alignItems: 'center',
    gap: 16,
  },
  cameraButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 200,
    justifyContent: 'center',
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  orText: {
    fontSize: 14,
    color: '#6b7280',
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#7c3aed',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 200,
    justifyContent: 'center',
  },
  uploadButtonText: {
    color: '#7c3aed',
    fontSize: 16,
    fontWeight: '600',
  },
  textSection: {
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  analyzeButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
