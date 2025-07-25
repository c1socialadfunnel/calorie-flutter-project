import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function DashboardScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Progress</Text>
        <Text style={styles.subtitle}>Keep up the great work!</Text>
      </View>

      <View style={styles.content}>
        {/* Calorie Progress Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily Calories</Text>
          <View style={styles.calorieDisplay}>
            <Text style={styles.calorieNumber}>1,247</Text>
            <Text style={styles.calorieTarget}>of 1,800 calories</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '69%' }]} />
          </View>
          <Text style={styles.remaining}>553 calories remaining</Text>
        </View>

        {/* Macros Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Macros</Text>
          <View style={styles.macrosContainer}>
            <View style={styles.macro}>
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={[styles.macroValue, { color: '#f59e0b' }]}>156g</Text>
            </View>
            <View style={styles.macro}>
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={[styles.macroValue, { color: '#3b82f6' }]}>89g</Text>
            </View>
            <View style={styles.macro}>
              <Text style={styles.macroLabel}>Fat</Text>
              <Text style={[styles.macroValue, { color: '#10b981' }]}>42g</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.primaryAction}
            onPress={() => navigation.navigate('FoodLogger' as never)}
          >
            <Ionicons name="camera" size={24} color="white" />
            <Text style={styles.primaryActionText}>AI Calorie Count</Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.secondaryAction}>
              <Ionicons name="add" size={20} color="#7c3aed" />
              <Text style={styles.secondaryActionText}>Add Food</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.secondaryAction}
              onPress={() => navigation.navigate('HealthCoach' as never)}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#7c3aed" />
              <Text style={styles.secondaryActionText}>Ask Coach</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Meals */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Meals</Text>
          <View style={styles.mealsList}>
            <View style={styles.meal}>
              <Text style={styles.mealName}>Breakfast</Text>
              <Text style={styles.mealCalories}>324 cal</Text>
            </View>
            <View style={styles.meal}>
              <Text style={styles.mealName}>Lunch</Text>
              <Text style={styles.mealCalories}>567 cal</Text>
            </View>
            <View style={styles.meal}>
              <Text style={styles.mealName}>Snack</Text>
              <Text style={styles.mealCalories}>156 cal</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  calorieDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  calorieNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  calorieTarget: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 4,
  },
  remaining: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macro: {
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionsContainer: {
    gap: 12,
  },
  primaryAction: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  secondaryActionText: {
    color: '#7c3aed',
    fontSize: 14,
    fontWeight: '500',
  },
  mealsList: {
    gap: 12,
  },
  meal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  mealName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7c3aed',
  },
});
