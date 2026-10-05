import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/theme';
import { CustomInput } from '../../components/CustomeInput';
import { ScreenProps } from '../../navigation/types';

const attendanceData = [
  { id: 'att1', guardName: 'Amit Verma', site: 'City Mall', timeIn: '08:55 AM', status: 'Checked In' },
  { id: 'att2', guardName: 'Rohit Singh', site: 'Corporate Office', timeIn: '09:10 AM', status: 'Late' },
  { id: 'att3', guardName: 'Vikram Yadav', site: 'Warehouse', timeIn: '--:--', status: 'Absent' },
  { id: 'att4', guardName: 'Sandeep Kumar', site: 'Industrial Area', timeIn: '08:45 AM', status: 'Checked In' },
];

export const AttendanceMonitoringScreen: React.FC<ScreenProps<'AttendanceMonitoring'>> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAttendance = attendanceData.filter(
    (item) =>
      item.guardName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.site.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        {...(Platform.OS === 'android' ? { backgroundColor: COLORS.white } : {})}
      />

      <View style={styles.headerBar}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance Monitoring</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.searchSection}>
        <CustomInput
          placeholder="Search guard or site..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search-outline"
          autoCapitalize="none"
          containerStyle={{ marginBottom: 0 }}
          inputContainerStyle={{ height: 44 }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.listContainer}>
          {filteredAttendance.map((item) => (
            <View key={item.id} style={styles.recordCard}>
              <View style={styles.recordInfo}>
                <View style={[
                  styles.iconBox,
                  item.status === 'Checked In' && { backgroundColor: '#DCFCE7' },
                  item.status === 'Late' && { backgroundColor: '#FEF3C7' },
                  item.status === 'Absent' && { backgroundColor: '#FEE2E2' },
                ]}>
                  <Ionicons 
                    name="finger-print-outline" 
                    size={18} 
                    color={
                      item.status === 'Checked In' ? '#15803D' :
                      item.status === 'Late' ? '#B45309' : '#DC2626'
                    } 
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.guardNameText}>{item.guardName}</Text>
                  <Text style={styles.siteText}>Site: {item.site}</Text>
                  <Text style={styles.timeText}>Check-In: {item.timeIn}</Text>
                </View>
              </View>
              <View style={[
                styles.statusBadge,
                item.status === 'Checked In' && { backgroundColor: '#DCFCE7' },
                item.status === 'Late' && { backgroundColor: '#FEF3C7' },
                item.status === 'Absent' && { backgroundColor: '#FEE2E2' },
              ]}>
                <Text style={[
                  styles.statusText,
                  item.status === 'Checked In' && { color: '#15803D' },
                  item.status === 'Late' && { color: '#B45309' },
                  item.status === 'Absent' && { color: '#DC2626' },
                ]}>{item.status}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AttendanceMonitoringScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  listContainer: {
    gap: 12,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
  },
  recordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guardNameText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  siteText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
});