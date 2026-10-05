import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { BottomTabNavigator } from './BottomTabNavigator';

import { SplashScreen } from '../screens/Splash/SplashScreen';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { SignupScreen } from '../screens/Auth/SignupScreen';
import { ForgotPasswordScreen } from '../screens/Auth/ForgotPasswordScreen';
import { OTPVerificationScreen } from '../screens/Auth/OTPVerificationScreen';
import { ResetPasswordScreen } from '../screens/Auth/ResetPasswordScreen';

import { GuardsListScreen } from '../screens/Guards/GuardsListScreen';
import { GuardProfileScreen } from '../screens/Guards/GuardProfileScreen';
import AddGuardScreen from '../screens/Guards/AddGuardScreen';
import { EditGuardScreen } from '../screens/Guards/EditGuardScreen';
import { AvailabilityCalendarScreen } from '../screens/Guards/AvailabilityCalendarScreen';
import { GuardDocumentsScreen } from '../screens/Guards/GuardDocumentsScreen';
import { GuardAttendanceScreen } from '../screens/Guards/GuardAttendanceScreen';
import { ShiftHistoryScreen } from '../screens/Guards/ShiftHistoryScreen';

import { ClientsListScreen } from '../screens/Clients/ClientsListScreen';
import { ClientDetailsScreen } from '../screens/Clients/ClientDetailsScreen';
import { SitesListScreen } from '../screens/Clients/SitesListScreen';
import { SiteDetailsScreen } from '../screens/Clients/SiteDetailsScreen';
import { AddEditSiteScreen } from '../screens/Clients/AddEditSiteScreen';
import { SiteMapGeofenceScreen } from '../screens/Clients/SiteMapGeofenceScreen';

import { ShiftCalendarScreen } from '../screens/Operations/ShiftCalendarScreen';
import { ShiftsListScreen } from '../screens/Operations/ShiftsListScreen';
import { CreateShiftScreen } from '../screens/Operations/CreateShiftScreen';
import { ShiftDetailsScreen } from '../screens/Operations/ShiftDetailsScreen';
import { EditCancelShiftScreen } from '../screens/Operations/EditCancelShiftScreen';
import { AttendanceMonitoringScreen } from '../screens/Operations/AttendanceMonitoringScreen';
import { IncidentReportsScreen } from '../screens/Operations/IncidentReportsScreen';

import { ClarificationScreen } from '../screens/Requests/ClarificationScreen';
import { LiveGuardsMapScreen } from '../screens/Operations/LiveGuardsMapScreen';
import { AgencyIncidentDetailsScreen } from '../screens/Operations/AgencyIncidentDetailsScreen';
import EditAgencyProfileScreen from '../screens/Profile/EditAgencyProfileScreen';
import ReportsDashboardScreen from '../screens/Profile/ReportsDashboardScreen';
import ReportDetailsScreen from '../screens/Profile/ReportDetailsScreen';
import TeamMembersScreen from '../screens/Profile/TeamMembersScreen';
import RolesPermissionsScreen from '../screens/Profile/RolesPermissionsScreen';
import NotificationSettingsScreen from '../screens/Profile/NotificationSettingsScreen';
import HelpSupportScreen from '../screens/Profile/HelpSupportScreen';

import { AssignGuardsScreen } from '../screens/Requests/AssignGuardsScreen';
import { AssignmentReviewScreen } from '../screens/Requests/AssignmentReviewScreen';
import { AssignmentSuccessScreen } from '../screens/Requests/AssignmentSuccessScreen';
import { RequestDetailsScreen } from '../screens/Requests/RequestDetailsScreen';
import { NotificationsScreen } from '../screens/Notification/NotificationsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />

        <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} />
        <Stack.Screen name="AssignGuards" component={AssignGuardsScreen} />
        <Stack.Screen name="AssignmentReview" component={AssignmentReviewScreen} />
        <Stack.Screen name="AssignmentSuccess" component={AssignmentSuccessScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />

        <Stack.Screen name="GuardsList" component={GuardsListScreen} />
        <Stack.Screen name="GuardProfile" component={GuardProfileScreen} />
        <Stack.Screen name="AddGuard" component={AddGuardScreen} />
        <Stack.Screen name="EditGuard" component={EditGuardScreen} />
        <Stack.Screen name="AvailabilityCalendar" component={AvailabilityCalendarScreen} />
        <Stack.Screen name="GuardDocuments" component={GuardDocumentsScreen} />
        <Stack.Screen name="GuardAttendance" component={GuardAttendanceScreen} />
        <Stack.Screen name="ShiftHistory" component={ShiftHistoryScreen} />

        <Stack.Screen name="ClientsList" component={ClientsListScreen} />
        <Stack.Screen name="ClientDetails" component={ClientDetailsScreen} />
        <Stack.Screen name="SitesList" component={SitesListScreen} />
        <Stack.Screen name="SiteDetails" component={SiteDetailsScreen} />
        <Stack.Screen name="AddEditSite" component={AddEditSiteScreen} />
        <Stack.Screen name="SiteMapGeofence" component={SiteMapGeofenceScreen} />

        <Stack.Screen name="ShiftCalendar" component={ShiftCalendarScreen} />
        <Stack.Screen name="ShiftsList" component={ShiftsListScreen} />
        <Stack.Screen name="CreateShift" component={CreateShiftScreen} />
        <Stack.Screen name="ShiftDetails" component={ShiftDetailsScreen} />
        <Stack.Screen name="EditCancelShift" component={EditCancelShiftScreen} />
        <Stack.Screen name="AttendanceMonitoring" component={AttendanceMonitoringScreen} />
        <Stack.Screen name="IncidentReports" component={IncidentReportsScreen} />

        <Stack.Screen name="ClarificationScreen" component={ClarificationScreen} />
        <Stack.Screen name="LiveGuardsMap" component={LiveGuardsMapScreen} />
        <Stack.Screen name="IncidentDetails" component={AgencyIncidentDetailsScreen} />
        <Stack.Screen name="ReportsDashboard" component={ReportsDashboardScreen} />
        <Stack.Screen name="ReportDetails" component={ReportDetailsScreen} />
        <Stack.Screen name="EditAgencyProfile" component={EditAgencyProfileScreen} />
        <Stack.Screen name="TeamMembers" component={TeamMembersScreen} />
        <Stack.Screen name="RolesPermissions" component={RolesPermissionsScreen} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;