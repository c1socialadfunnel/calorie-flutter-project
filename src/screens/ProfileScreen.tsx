import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        },
      ]
    );
  };

  const handleRateUs = () => {
    Alert.alert('Rate Us', 'Please rate us on your device\'s app store!');
  };

  const handleInvite = () => {
    Alert.alert('Invite Friends', 'Share Calorie.Help with your friends!');
  };

  const handleLanguage = () => {
    Alert.alert('Language Settings', 'Multiple language support coming soon!');
  };

  const handleDietaryPreference = () => {
    Alert.alert('Dietary Preferences', 'Dietary preference settings coming soon!');
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'Opening privacy policy...');
  };

  const handleTerms = () => {
    Alert.alert('Terms & Conditions', 'Opening terms and conditions...');
  };

  const handleSupport = () => {
    Alert.alert('Contact Support', 'Opening support contact...');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deletion', 'Account deletion feature coming soon!');
          }
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account and preferences</Text>
      </View>

      <View style={styles.content}>
        {/* User Plan Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person" size={20} color="#7c3aed" />
            <Text style={styles.cardTitle}>Your Plan</Text>
          </View>
          <View style={styles.planInfo}>
            <View style={styles.planItem}>
              <Text style={styles.planLabel}>Current Plan</Text>
              <Text style={styles.planValue}>Steady Plan</Text>
            </View>
            <View style={styles.planItem}>
              <Text style={styles.planLabel}>Daily Calories</Text>
              <Text style={styles.planValue}>1,800</Text>
            </View>
            <View style={styles.planItem}>
              <Text style={styles.planLabel}>Current Weight</Text>
              <Text style={styles.planValue}>75 kg</Text>
            </View>
            <View style={styles.planItem}>
              <Text style={styles.planLabel}>Target Weight</Text>
              <Text style={styles.planValue}>68 kg</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.adjustButton}>
            <Ionicons name="settings-outline" size={16} color="#7c3aed" />
            <Text style={styles.adjustButtonText}>Adjust Plan</Text>
          </TouchableOpacity>
        </View>

        {/* Subscription Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="card" size={20} color="#7c3aed" />
            <Text style={styles.cardTitle}>Subscription</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Active</Text>
            </View>
          </View>
          <Text style={styles.subscriptionInfo}>Next billing date: Jan 25, 2025</Text>
          <TouchableOpacity style={styles.adjustButton}>
            <Ionicons name="card-outline" size={16} color="#7c3aed" />
            <Text style={styles.adjustButtonText}>Manage Billing</Text>
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Settings</Text>
          <View style={styles.menuItems}>
            <TouchableOpacity style={styles.menuItem} onPress={handleDietaryPreference}>
              <Ionicons name="restaurant-outline" size={20} color="#6b7280" />
              <Text style={styles.menuItemText}>My dietary preference</Text>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleRateUs}>
              <Ionicons name="star-outline" size={20} color="#6b7280" />
              <Text style={styles.menuItemText}>Rate Us</Text>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleLanguage}>
              <Ionicons name="globe-outline" size={20} color="#6b7280" />
              <Text style={styles.menuItemText}>Language</Text>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleInvite}>
              <Ionicons name="share-outline" size={20} color="#6b7280" />
              <Text style={styles.menuItemText}>Invite Friends</Text>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Legal & Support */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Legal & Support</Text>
          <View style={styles.menuItems}>
            <TouchableOpacity style={styles.menuItem} onPress={handlePrivacyPolicy}>
              <Ionicons name="shield-outline" size={20} color="#6b7280" />
              <Text style={styles.menuItemText}>Privacy Policy</Text>
              <Ionicons name="open-outline" size={16} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleTerms}>
              <Ionicons name="document-text-outline" size={20} color="#6b7280" />
              <Text style={styles.menuItemText}>Terms & Conditions</Text>
              <Ionicons name="open-outline" size={16} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleSupport}>
              <Ionicons name="mail-outline" size={20} color="#6b7280" />
              <Text style={styles.menuItemText}>Contact Support</Text>
              <Ionicons name="open-outline" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>
          <View style={styles.menuItems}>
            <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text style={[styles.menuItemText, { color: '#ef4444' }]}>Sign Out</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAccount}>
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
              <Text style={[styles.menuItemText, { color: '#ef4444' }]}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Calorie.Help v1.0.0</Text>
          <Text style={styles.appInfoText}>Your personal nutrition coach</Text>
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  badge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#166534',
  },
  planInfo: {
    gap: 12,
    marginBottom: 16,
  },
  planItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  planValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  subscriptionInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  adjustButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
  },
  adjustButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7c3aed',
  },
  menuItems: {
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  appInfo: {
    alignItems: 'center',
    gap: 4,
    marginTop: 20,
  },
  appInfoText: {
    fontSize: 12,
    color: '#6b7280',
  },
});
