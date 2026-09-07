import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import "../global.css";

const properties = [
  { id: "1", title: "Modern Villa", city: "Mumbai", price: "1.2Cr" },
  { id: "2", title: "Sea View Port", city: "Mumbai", price: "85L" },
  { id: "3", title: "Studio Loft", city: "Bangalore", price: "32L" },
];

export default function RootLayout() {
  return (
    <SafeAreaView className="bg-blue-50 p-4 flex-1">
      <View>
        <Text className="text-lg font-bold text-slate-800">
          Subscribe to RoadsideCoder
        </Text>

        <TextInput
          placeholder="Search City..."
          placeholderTextColor={"#999"}
          className="border border-slate-200 rounded-xl px-4 py-3 mt-3 bg-white"
        />

        <TouchableOpacity
          onPress={() => alert("Searching!")}
          className="bg-blue-600 py-3 rounded-xl mt-3 items-center shadow-md shadow-blue-600/30"
        >
          <Text className="text-white font-bold">Search</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(index * 150).springify()}
            className="bg-white rounded-2xl p-4 mb-4 border border-slate-100 shadow-sm shadow-slate-300"
          >
            <Text className="font-bold text-base text-slate-900">
              {item.title}
            </Text>
            <Text className="text-slate-500 mt-1">{item.city}</Text>
            <Text className="text-blue-600 font-semibold mt-2">
              ₹{item.price}
            </Text>
          </Animated.View>
        )}
      />
    </SafeAreaView>
  );
}