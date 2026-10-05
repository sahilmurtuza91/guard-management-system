import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../constants/them';
import { ScreenProps } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { CustomInput } from '../../components/CustomeInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { RootState } from '../../app/store';
import { updateHireDraft } from '../../redux/hireGuardSlice';
import { useHireOptions } from '../../hooks/useHireOptions';
import { LoadingState } from '../../components/LoadingState';

const TIME_REGEX = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s*(AM|PM|am|pm)$/;

const DateTimeSchema = Yup.object().shape({
  customDuration: Yup.string().when('$bookingType', {
    is: 'Long Term / Monthly',
    then: (schema) =>
      schema
        .trim()
        .matches(/^\d+\s*(days|months|weeks|yrs|years)?$/i, 'Please enter a valid duration (e.g., 30 Days)')
        .required('Duration cannot be empty'),
    otherwise: (schema) => schema.notRequired(),
  }),
  customStartTime: Yup.string().when('$selectedSlot', {
    is: 'Custom Timing',
    then: (schema) => schema.trim().matches(TIME_REGEX, 'Use format e.g. 09:00 PM').required('Start time is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  customEndTime: Yup.string().when('$selectedSlot', {
    is: 'Custom Timing',
    then: (schema) => schema.trim().matches(TIME_REGEX, 'Use format e.g. 06:00 AM').required('End time is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

type DateTimeForm = Yup.InferType<typeof DateTimeSchema>;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const SelectDateTimeScreen: React.FC<ScreenProps<'SelectDateTime'>> = ({
  navigation,
}) => {
  const dispatch = useDispatch();
  const draft = useSelector((state: RootState) => (state as any).hireGuard?.draft || {});

  const [bookingType, setBookingType] = useState<'Single Day' | 'Long Term / Monthly'>(
    draft.bookingType || 'Single Day'
  );
  
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());

  const [selectedDate, setSelectedDate] = useState(
    draft.selectedDate || `${today.getDate()} ${MONTH_NAMES[today.getMonth()]} ${today.getFullYear()}`
  );
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(today.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  
  const { options, isLoading: isOptionsLoading } = useHireOptions();
  const [selectedSlot, setSelectedSlot] = useState<string>(draft.timeSlot || '');

  const { control, handleSubmit, formState: { errors } } = useForm<DateTimeForm>({
    resolver: yupResolver(DateTimeSchema) as any,
    context: { bookingType, selectedSlot },
    defaultValues: {
      customDuration: draft.customDuration || '',
      customStartTime: draft.startTime || '',
      customEndTime: draft.endTime || '',
    },
  });

  React.useEffect(() => {
    if (options && !selectedSlot) {
      setSelectedSlot(options.timeSlots[options.defaults.timeSlotIndex] || options.timeSlots[0] || '');
    }
  }, [options]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    calendarDays.push(d);
  }

  const handleNext = (data: DateTimeForm) => {
    const customStartTime = data.customStartTime || '';
    const customEndTime = data.customEndTime || '';
    const customDuration = data.customDuration || '';

    const finalTimeSlot =
      selectedSlot === 'Custom Timing'
        ? `${customStartTime} to ${customEndTime}`
        : selectedSlot;

    const [presetStart, presetEnd] = selectedSlot.split(' - ');
    const finalStartTime = selectedSlot === 'Custom Timing' ? customStartTime : presetStart;
    const finalEndTime = selectedSlot === 'Custom Timing' ? customEndTime : presetEnd;

    const isoDate = `${selectedYear}-${String(selectedMonthIdx + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

    dispatch(
      updateHireDraft({
        bookingType,
        selectedDate,
        selectedDateISO: isoDate,
        customDuration: bookingType === 'Long Term / Monthly' ? customDuration : '1 Day',
        timeSlot: finalTimeSlot,
        startTime: finalStartTime,
        endTime: finalEndTime,
      })
    );
    navigation.navigate('GuardCountRequirements');
  };

  if (isOptionsLoading || !options) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScreenHeader title="Select Date & Time" onBackPress={() => navigation.goBack()} />
        <LoadingState message="Loading options..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader title="Select Date & Time" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Requirement Duration</Text>
        <View style={styles.tabToggle}>
          {(['Single Day', 'Long Term / Monthly'] as const).map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.toggleBtn, bookingType === type && styles.activeToggleBtn]}
              onPress={() => {
                setBookingType(type);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, bookingType === type && styles.activeToggleText]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {bookingType === 'Single Day' ? (
          <>
            <Text style={styles.label}>Select Service Date</Text>
            
            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={handlePrevMonth} style={styles.arrowBtn} activeOpacity={0.7}>
                  <Ionicons name="chevron-back" size={18} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.monthYearTitle}>
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </Text>
                <TouchableOpacity onPress={handleNextMonth} style={styles.arrowBtn} activeOpacity={0.7}>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>

              <View style={styles.weekDaysRow}>
                {DAYS_OF_WEEK.map((day, idx) => (
                  <Text key={idx} style={styles.weekDayText}>{day}</Text>
                ))}
              </View>

              <View style={styles.daysGrid}>
                {calendarDays.map((dayNum, index) => {
                  if (dayNum === null) {
                    return <View key={`empty-${index}`} style={styles.dayCellEmpty} />;
                  }

                  const formattedDateStr = `${dayNum} ${MONTH_NAMES[currentMonth]} ${currentYear}`;
                  const isSelected = selectedDate === formattedDateStr;
                  const cellDate = new Date(currentYear, currentMonth, dayNum);
                  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                  const isPast = cellDate < todayMidnight;

                  return (
                    <TouchableOpacity
                      key={`day-${dayNum}`}
                      style={[styles.dayCell, isSelected && styles.activeDayCell, isPast && styles.disabledDayCell]}
                      disabled={isPast}
                      onPress={() => {
                        setSelectedDate(formattedDateStr);
                        setSelectedDay(dayNum);
                        setSelectedMonthIdx(currentMonth);
                        setSelectedYear(currentYear);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.dayCellText, isSelected && styles.activeDayCellText, isPast && styles.disabledDayCellText]}>
                        {dayNum}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.label}>Duration / Number of Days</Text>
            <Controller
              control={control}
              name="customDuration"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  placeholder="e.g., 30 Days or 3 Months"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.customDuration?.message}
                  touched={Boolean(errors.customDuration)}
                />
              )}
            />
          </>
        )}

        <Text style={[styles.label, { marginTop: 24 }]}>Select Shift Time Slot</Text>
        <View style={styles.slotsList}>
          {(options?.timeSlots || []).map(slot => {
            const isSelected = selectedSlot === slot;
            return (
              <TouchableOpacity
                key={slot}
                style={[styles.slotCard, isSelected && styles.activeSlotCard]}
                onPress={() => setSelectedSlot(slot)}
                activeOpacity={0.8}
              >
                <View style={[styles.radioCircle, isSelected && styles.activeRadio]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.slotText, isSelected && styles.activeSlotText]}>{slot}</Text>
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={isSelected ? COLORS.primary : COLORS.textMuted}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedSlot === 'Custom Timing' && (
          <View style={styles.customTimeRow}>
            <View style={styles.flexOneInput}>
              <Text style={styles.subLabel}>Start Time</Text>
              <Controller
                control={control}
                name="customStartTime"
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                    placeholder="e.g. 09:00 PM"
                    value={value ?? ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.customStartTime?.message}
                    touched={Boolean(errors.customStartTime)}
                  />
                )}
              />
            </View>
            <View style={styles.flexOneInput}>
              <Text style={styles.subLabel}>End Time</Text>
              <Controller
                control={control}
                name="customEndTime"
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                    placeholder="e.g. 06:00 AM"
                    value={value ?? ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.customEndTime?.message}
                    touched={Boolean(errors.customEndTime)}
                  />
                )}
              />
            </View>
          </View>
        )}

        <PrimaryButton title="Next" onPress={handleSubmit(handleNext)} style={styles.nextBtn} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SelectDateTimeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  subLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 4 },
  errorText: { fontSize: 11, color: '#DC2626', fontWeight: '700', marginTop: 4, marginLeft: 4 },
  tabToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 20,
  },
  toggleBtn: { flex: 1, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  activeToggleBtn: { backgroundColor: COLORS.primary },
  toggleText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  activeToggleText: { color: COLORS.white },
  
  calendarContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthYearTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayText: {
    width: '14%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellEmpty: {
    width: '14.28%',
    height: 38,
  },
  dayCell: {
    width: '14.28%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginBottom: 4,
  },
  activeDayCell: {
    backgroundColor: COLORS.primary,
  },
  disabledDayCell: {
    opacity: 0.35,
  },
  disabledDayCellText: {
    color: COLORS.textMuted,
  },
  dayCellText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  activeDayCellText: {
    color: COLORS.white,
    fontWeight: '900',
  },

  slotsList: { gap: 10 },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeSlotCard: { borderColor: COLORS.primary, backgroundColor: COLORS.accentLight },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activeRadio: { borderColor: COLORS.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  slotText: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  activeSlotText: { color: COLORS.primary },
  customTimeRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
  flexOneInput: { flex: 1 },
  nextBtn: { marginTop: 30 },
});