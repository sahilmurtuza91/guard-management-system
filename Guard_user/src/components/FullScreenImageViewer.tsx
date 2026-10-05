import React, { useRef } from 'react';
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

interface Props {
  visible: boolean;
  imageUri?: string;
  onClose: () => void;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export const FullScreenImageViewer: React.FC<Props> = ({ visible, imageUri, onClose }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const currentScale = useRef(1);
  const currentTranslate = useRef({ x: 0, y: 0 });
  const initialPinchDistance = useRef<number | null>(null);
  const initialPinchScale = useRef(1);
  const lastTapTime = useRef(0);

  const getDistance = (touches: readonly { pageX: number; pageY: number }[]) => {
    const [a, b] = touches;
    return Math.sqrt(Math.pow(a.pageX - b.pageX, 2) + Math.pow(a.pageY - b.pageY, 2));
  };

  const resetZoom = () => {
    currentScale.current = 1;
    currentTranslate.current = { x: 0, y: 0 };
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
    ]).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2,

      onPanResponderGrant: (evt) => {
        if (evt.nativeEvent.touches.length === 2) {
          initialPinchDistance.current = getDistance(evt.nativeEvent.touches);
          initialPinchScale.current = currentScale.current;
        }
      },

      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;

        if (touches.length === 2) {
          const distance = getDistance(touches);
          if (initialPinchDistance.current) {
            const nextScale = Math.min(
              5,
              Math.max(1, initialPinchScale.current * (distance / initialPinchDistance.current))
            );
            currentScale.current = nextScale;
            scale.setValue(nextScale);
          }
        } else if (touches.length === 1 && currentScale.current > 1) {
          translateX.setValue(currentTranslate.current.x + gestureState.dx);
          translateY.setValue(currentTranslate.current.y + gestureState.dy);
        }
      },

      onPanResponderRelease: (evt, gestureState) => {
        initialPinchDistance.current = null;

        if (currentScale.current <= 1) {
          resetZoom();
          return;
        }

        currentTranslate.current = {
          x: currentTranslate.current.x + gestureState.dx,
          y: currentTranslate.current.y + gestureState.dy,
        };

        if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
          const now = Date.now();
          if (now - lastTapTime.current < 300) {
            resetZoom();
          }
          lastTapTime.current = now;
        }
      },
    })
  ).current;

  const handleBackgroundDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapTime.current < 300) {
      if (currentScale.current > 1) {
        resetZoom();
      } else {
        currentScale.current = 2.5;
        Animated.spring(scale, { toValue: 2.5, useNativeDriver: true }).start();
      }
    }
    lastTapTime.current = now;
  };

  if (!imageUri) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.imageWrapper} {...panResponder.panHandlers}>
          <TouchableOpacity activeOpacity={1} onPress={handleBackgroundDoubleTap}>
            <Animated.Image
              source={{ uri: imageUri }}
              resizeMode="contain"
              style={[
                styles.image,
                {
                  transform: [
                    { translateX },
                    { translateY },
                    { scale },
                  ],
                },
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 48,
    right: 20,
    zIndex: 10,
    padding: 6,
  },
  imageWrapper: {
    width: SCREEN_W,
    height: SCREEN_H,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_W,
    height: SCREEN_H * 0.85,
  },
});
