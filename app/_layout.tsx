import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import "../global.css";
import { Slot } from "expo-router";

const properties = [
  { id: "1", title: "Modern Villa", city: "Mumbai", price: "1.2Cr" },
  { id: "2", title: "Sea View Port", city: "Mumbai", price: "85L" },
  { id: "3", title: "Studio Loft", city: "Bangalore", price: "32L" },
];

export default function RootLayout() {
  return (
    <Slot />
  );
}