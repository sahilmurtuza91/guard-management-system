import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Splash: undefined;
  LoginScreen: undefined;
  ForgotPassword: undefined;
  OtpVerification: {
    target: string;
    flowType?: 'forgot_password' | 'phone_login';
  };
  SetPassword: {
    target?: string;
  };
  Dashboard: undefined;
  Shifts: undefined;
  ShiftDetails: { shiftId: string };
  DutyLocationMap: { shiftId?: string } | undefined;
  Attendance: undefined;
  Incidents: undefined;
  ReportIncident: undefined;
  IncidentDetails: { incidentId: string };
  Notifications: undefined;
  Profile: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  HelpSupport: undefined;
};

export type SplashScreenProps = NativeStackScreenProps<RootStackParamList, 'Splash'>;
export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'LoginScreen'>;
export type ForgotPasswordScreenProps = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;
export type OtpVerificationScreenProps = NativeStackScreenProps<RootStackParamList, 'OtpVerification'>;
export type SetPasswordScreenProps = NativeStackScreenProps<RootStackParamList, 'SetPassword'>;
export type DashboardScreenProps = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;
export type ShiftsScreenProps = NativeStackScreenProps<RootStackParamList, 'Shifts'>;
export type ShiftDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'ShiftDetails'>;
export type DutyLocationMapScreenProps = NativeStackScreenProps<RootStackParamList, 'DutyLocationMap'>;
export type AttendanceScreenProps = NativeStackScreenProps<RootStackParamList, 'Attendance'>;
export type IncidentsScreenProps = NativeStackScreenProps<RootStackParamList, 'Incidents'>;
export type ReportIncidentScreenProps = NativeStackScreenProps<RootStackParamList, 'ReportIncident'>;
export type IncidentDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'IncidentDetails'>;
export type NotificationsScreenProps = NativeStackScreenProps<RootStackParamList, 'Notifications'>;
export type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;
export type EditProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;
export type ChangePasswordScreenProps = NativeStackScreenProps<RootStackParamList, 'ChangePassword'>;