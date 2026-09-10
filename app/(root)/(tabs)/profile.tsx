import { useAuth, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  
  const handleSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/sign-in");
        },
      },
    ]);
  };
  return (
    <SafeAreaView className="flex-1 bg-brand-body" edges={["top"]}>
      <TouchableOpacity>
        <Text onPress={handleSignOut}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
