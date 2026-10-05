import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { COLORS } from '../constants/theme';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import AttendanceHistoryScreen from '../screens/Attendence/AttendanceHistoryScreen';
import MyShiftsScreen from '../screens/Shifts/MyShiftsScreen';
import IncidentListScreen from '../screens/Incidents/IncidentListScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';


const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={22}
                color={focused ? COLORS.primary : COLORS.textMuted}
              />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Shifts"
        component={MyShiftsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons
                name={focused ? 'calendar' : 'calendar-outline'}
                size={22}
                color={focused ? COLORS.primary : COLORS.textMuted}
              />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Attendance"
        component={AttendanceHistoryScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons
                name={focused ? 'clipboard' : 'clipboard-outline'}
                size={22}
                color={focused ? COLORS.primary : COLORS.textMuted}
              />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Incidents"
        component={IncidentListScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons
                name={focused ? 'warning' : 'warning-outline'}
                size={22}
                color={focused ? COLORS.primary : COLORS.textMuted}
              />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={22}
                color={focused ? COLORS.primary : COLORS.textMuted}
              />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 68,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  iconContainer: {
    alignItems: 'center',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 2,
  },
  center: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
});