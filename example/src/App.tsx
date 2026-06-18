import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MapScreen } from './screens/MapScreen';
import { SearchScreen } from './screens/SearchScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [permissionGranted, setPermissionGranted] = useState(
    Platform.OS !== 'android',
  );
  const [checkingPermission, setCheckingPermission] = useState(
    Platform.OS === 'android',
  );

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    // React Native's Geolocation polyfill handles permissions via watchPosition
    setPermissionGranted(true);
    setCheckingPermission(false);
  }, []);

  if (checkingPermission) return null;

  if (!permissionGranted) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Vui lòng cấp quyền truy cập vị trí để sử dụng ứng dụng.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{ headerShown: false, gestureEnabled: false }}
        >
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen
            name="Search"
            component={SearchScreen}
            options={{ presentation: 'modal' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f7f9fb',
  },
  errorText: {
    fontSize: 16,
    color: '#1a2332',
    textAlign: 'center',
  },
});
