import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Platform,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useDispatch } from 'react-redux';
import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { storage } from '../../utils/storage';
import { authApi } from '../../api/endpoints';
import { setClientLogin } from '../../redux/authSlice';
import { connectSocket } from '../../services/socket';

export const SplashScreen: React.FC<ScreenProps<'Splash'>> = ({ navigation }) => {
    const dispatch = useDispatch(); 

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;

        const checkInitialAuth = async () => {
            const token = await storage.getToken(); 

            if (!token) {
                timer = setTimeout(() => navigation.replace('Welcome'), 2000);
                return;
            }

            try {
                const response = await authApi.getMe();
                const user = response.data.data.user;
                dispatch(setClientLogin({ user, token }));
                connectSocket(token);
                timer = setTimeout(() => navigation.replace('MainTabs'), 2000);
            } catch (error) {
                await storage.clear();
                timer = setTimeout(() => navigation.replace('Welcome'), 2000);
            }
        };

        checkInitialAuth();

        return () => clearTimeout(timer);
    }, [navigation, dispatch]);

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                {...(Platform.OS === 'android' ? { backgroundColor: '#0B1936' } : {})}
            />

            <View style={styles.centerContent}>
                <View style={styles.shieldBadge}>
                    <Ionicons name="shield-checkmark" size={62} color="#3B82F6" />
                </View>

                <Text style={styles.brandTitle}>SECURE</Text>
                <Text style={styles.tagline}>Safety You Can Trust</Text>
            </View>

            <View style={styles.footer}>
                <Text style={styles.poweredText}>Powered by</Text>
                <Text style={styles.companyName}>SecureGuard</Text>
            </View>
        </View>
    );
};

export default SplashScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B1936',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 50,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shieldBadge: {
        width: 104,
        height: 104,
        borderRadius: 52,
        backgroundColor: 'rgba(59, 130, 246, 0.14)',
        borderWidth: 2,
        borderColor: 'rgba(59, 130, 246, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    brandTitle: {
        fontSize: 30,
        fontWeight: '900',
        color: COLORS.white,
        letterSpacing: 2,
    },
    tagline: {
        fontSize: 13,
        color: '#94A3B8',
        fontWeight: '500',
        marginTop: 6,
        letterSpacing: 0.5,
    },
    footer: {
        alignItems: 'center',
    },
    poweredText: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '500',
    },
    companyName: {
        fontSize: 14,
        color: COLORS.white,
        fontWeight: '800',
        marginTop: 2,
        letterSpacing: 0.5,
    },
});