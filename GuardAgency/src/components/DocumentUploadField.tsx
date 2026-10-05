import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../constants/theme';
import { PickedImage, pickFromCamera, pickFromGallery } from '../utils/imagePicker';

interface DocumentUploadFieldProps {
  label: string;
  value: PickedImage | null;
  onChange: (image: PickedImage | null) => void;
}

export const DocumentUploadField: React.FC<DocumentUploadFieldProps> = ({
  label,
  value,
  onChange
}) => {
  const handleCamera = async () => {
    const image = await pickFromCamera();
    if (image) onChange(image);
  };

  const handleGallery = async () => {
    const image = await pickFromGallery();
    if (image) onChange(image);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        {value ? (
          <TouchableOpacity onPress={() => onChange(null)} activeOpacity={0.7}>
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {value ? (
        <Image source={{ uri: value.uri }} style={styles.preview} resizeMode="cover" />
      ) : (
        <View style={styles.emptyBox}>
          <Ionicons name="cloud-upload-outline" size={24} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No file selected</Text>
        </View>
      )}

      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.optionBtn} onPress={handleCamera} activeOpacity={0.8}>
          <Ionicons name="camera-outline" size={18} color={COLORS.primary} />
          <Text style={styles.optionText}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionBtn} onPress={handleGallery} activeOpacity={0.8}>
          <Ionicons name="images-outline" size={18} color={COLORS.primary} />
          <Text style={styles.optionText}>Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DocumentUploadField;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  label: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary
  },
  removeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626'
  },
  preview: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    backgroundColor: COLORS.borderLight
  },
  emptyBox: {
    height: 90,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  emptyText: {
    fontSize: 11,
    color: COLORS.textMuted
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10
  },
  optionBtn: {
    flex: 1,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary
  },
});
