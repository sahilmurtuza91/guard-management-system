import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    StatusBar,
    Image,
    Platform,
} from 'react-native';
import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { PrimaryButton } from '../../components/PrimaryButton';

export const WelcomeScreen: React.FC<ScreenProps<'Welcome'>> = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})}
            />

            <View style={styles.content}>
                <View style={styles.illustrationWrapper}>
                    <Image
                        source={{
                            uri: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600',
                        }}
                        style={styles.bannerImage}
                        resizeMode="cover"
                    />
                </View>
                <View style={styles.dotsRow}>
                    <View style={[styles.dot, styles.activeDot]} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                </View>

                <Text style={styles.title}>Your Safety{'\n'}Our Priority</Text>
                <Text style={styles.description}>
                    Hire verified security guards quickly and easily for your home, commercial property, or events.
                </Text>
            </View>

            <View style={styles.buttonGroup}>
                <PrimaryButton
                    title="Get Started"
                    onPress={() => navigation.navigate('SignUp')}
                    style={styles.getStartedBtn}
                />
                <PrimaryButton
                    title="Login"
                    onPress={() => navigation.navigate('Login')}
                    style={styles.loginOutlineBtn}
                    textStyle={styles.loginBtnText}
                />
            </View>
        </SafeAreaView>
    );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    illustrationWrapper: {
        width: '100%',
        height: 280,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#F1F5F9',
        marginBottom: 24,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    dotsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E2E8F0',
    },
    activeDot: {
        width: 24,
        backgroundColor: COLORS.primary,
    },
    title: {
        fontSize: 26,
        fontWeight: '900',
        color: COLORS.primary,
        textAlign: 'center',
        lineHeight: 34,
    },
    description: {
        fontSize: 13,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 20,
        paddingHorizontal: 14,
    },
    buttonGroup: {
        paddingHorizontal: 24,
        paddingBottom: 28,
        gap: 12,
    },
    getStartedBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        height: 52,
    },
    loginOutlineBtn: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        height: 52,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    loginBtnText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '800',
    },
});