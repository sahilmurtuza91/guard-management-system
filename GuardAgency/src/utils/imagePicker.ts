import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';

export interface PickedImage {
  uri: string;
  name: string;
  type: string;
}

const getPickedImage = (asset?: Asset): PickedImage | null => {
  if (!asset?.uri) return null;
  return {
    uri: asset.uri,
    name: asset.fileName || `photo_${Date.now()}.jpg`,
    type: asset.type || 'image/jpeg',
  };
};

const cameraPermission = async () => {
  if (Platform.OS !== 'android') return true;
  const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
  return result === PermissionsAndroid.RESULTS.GRANTED;
};

export const pickFromGallery = async (): Promise<PickedImage | null> => {
  const response = await launchImageLibrary({
    mediaType: 'photo',
    quality: 0.8,
    selectionLimit: 1
  });
  return getPickedImage(response.assets?.[0]);
};

export const pickFromCamera = async (): Promise<PickedImage | null> => {
  const permission = await cameraPermission();
  if (!permission) {
    Alert.alert('Permission needed', 'Camera permission is required to take a photo.');
    return null;
  }
  const response = await launchCamera({ mediaType: 'photo', quality: 0.8, saveToPhotos: false });
  return getPickedImage(response.assets?.[0]);
};
