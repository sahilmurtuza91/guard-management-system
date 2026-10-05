import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    Linking,
    Platform
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/theme';
import { ScreenHeader } from '../../components/ScreenHeader';

const FAQS = [
    {
        q: 'Check-in is not working. What should I do?',
        a: 'Make sure location permission is enabled and GPS and internet are turned on. If the problem still occurs, contact the agency directly using the call option on this screen.',
    },
    {
        q: 'I missed my shift. What will happen now?',
        a: 'Contact your supervisor immediately. The missed shift will automatically appear as "Absent" in your attendance until it is reviewed.',
    },
    {
        q: 'How do I submit an incident report?',
        a: 'Go to the Incidents tab, tap "Report Incident", select the type and priority, enter the description, and attach a photo if required.',
    },
    {
        q: 'I forgot my password. How can I reset it?',
        a: 'On the login screen, tap "Forgot Password", enter your registered phone number or email, and reset your password using the OTP.',
    },
    {
        q: 'How do I check my assigned shifts?',
        a: 'Open the Shifts section from the app menu. You can view your upcoming, current, and completed shifts along with their date, time, and location.',
    },
    {
        q: 'How do I check my attendance?',
        a: 'Open the Attendance section to view your check-in time, check-out time, working hours, and attendance status for each shift.',
    },
    {
        q: 'What should I do if my assigned shift details are incorrect?',
        a: 'Contact your agency or supervisor immediately and explain the issue. Do not check in for a shift if the assigned details are incorrect.',
    },
    {
        q: 'Why is my check-out not working?',
        a: 'Make sure your location permission is enabled, GPS is turned on, and you have an active internet connection. If the issue continues, contact your supervisor.',
    },
    {
        q: 'Can I cancel or skip an assigned shift?',
        a: 'Shift cancellation or skipping depends on your agency policy. Contact your supervisor or agency before missing an assigned shift.',
    },
    {
        q: 'What should I do if I cannot reach my assigned location?',
        a: 'Check the shift location and route details in the app. If you are still unable to reach the location, contact your supervisor as soon as possible.',
    },
    {
        q: 'How do I update my profile information?',
        a: 'Open the Profile section and select the option to edit your personal information. Save the changes after updating your details.',
    },
    {
        q: 'How can I contact my agency?',
        a: 'Use the Call Agency or Email Support options on this screen to contact your agency directly.',
    },
    {
        q: 'What should I do if I receive an unexpected notification?',
        a: 'Open the Notifications section and check the notification details. If you do not recognize the notification, contact your agency or supervisor.',
    },
    {
        q: 'What should I do if the app is not loading properly?',
        a: 'Check your internet connection and restart the app. If the problem continues, update the app if an update is available or contact your agency for support.',
    },
    {
        q: 'How do I report a safety or security issue?',
        a: 'Open the Incidents section and submit a report with the incident type, priority, description, and photo if required. For emergencies, contact the appropriate emergency service immediately.',
    },
];

export const HelpSupportScreen: React.FC<any> = ({ navigation }) => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})}
            />
            <ScreenHeader
                title="Help & Support"
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.sectionLabel}>Contact Agency</Text>

                <View style={styles.contactRow}>
                    <TouchableOpacity
                        style={styles.contactCard}
                        onPress={() => Linking.openURL('tel:9999900000')}
                        activeOpacity={0.75}
                    >
                        <Ionicons
                            name="call"
                            size={22}
                            color={COLORS.primary}
                        />

                        <Text style={styles.contactLabel}>
                            Call Agency
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.contactCard}
                        onPress={() =>
                            Linking.openURL('mailto:contact@secureshield.com')
                        }
                        activeOpacity={0.75}
                    >
                        <Ionicons
                            name="mail"
                            size={22}
                            color={COLORS.primary}
                        />

                        <Text style={styles.contactLabel}>
                            Email Support
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionLabel}>
                    Frequently Asked Questions
                </Text>

                {FAQS.map((item, index) => {
                    const isExpanded = expandedIndex === index;

                    return (
                        <TouchableOpacity
                            key={item.q}
                            activeOpacity={0.7}
                            onPress={() =>
                                setExpandedIndex(isExpanded ? null : index)
                            }
                            style={styles.faqCard}
                        >
                            <View style={styles.faqRow}>
                                <Text style={styles.faqQuestion}>
                                    {item.q}
                                </Text>

                                <Ionicons
                                    name={
                                        isExpanded
                                            ? 'chevron-up'
                                            : 'chevron-down'
                                    }
                                    size={18}
                                    color={COLORS.textMuted}
                                />
                            </View>

                            {isExpanded && (
                                <Text style={styles.faqAnswer}>
                                    {item.a}
                                </Text>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
};

export default HelpSupportScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        paddingTop:
            Platform.OS === 'android'
                ? StatusBar.currentHeight
                : 0,
    },

    scrollContent: {
        padding: 20,
        paddingBottom: 32,
    },

    sectionLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.textMuted,
        marginBottom: 12,
        marginTop: 8,
        textTransform: 'uppercase',
    },

    contactRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },

    contactCard: {
        flex: 1,
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 16,
        paddingVertical: 16,
        backgroundColor: COLORS.accentLight,
    },

    contactLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.primary,
    },

    faqCard: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 8,
        padding: 16,
    },

    faqRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    faqQuestion: {
        flex: 1,
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginRight: 8,
    },

    faqAnswer: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 8,
        lineHeight: 18,
    },
});
