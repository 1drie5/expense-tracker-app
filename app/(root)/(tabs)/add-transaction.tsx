import { AIActionCard } from "@/components/AIActionCard";
import { AI_GRADIENT, AI_GRADIENT_REVERSE } from "@/constants/theme";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/constants/categories";
import { useCreateTransaction } from "@/hooks/mutations/useTransactionMutations";
import { useAccountsQuery } from "@/hooks/queries/useAccountQuery";
import {
  TransactionFormValues,
  transactionSchema,
} from "@/lib/schemas/transactions";
import { Account } from "@/lib/services/accounts";
import { InputMethod } from "@/types/transaction";
import { useUser } from "@clerk/expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";

const DEFAULT_VALUES = (accounts: Account[]): TransactionFormValues => ({
  type: "EXPENSE",
  amount: "",
  category: "food",
  accountId: accounts[0]?.id ?? "",
  description: "",
  date: new Date(),
});

export default function AddTransactionScreen() {
  const { user } = useUser();
  const router = useRouter();
  const params = useLocalSearchParams<{ action?: string }>();

  const {
    data: accounts = [],
    isLoading: loadingAccounts,
    isError: accountsError,
  } = useAccountsQuery();
  const { mutateAsync: createTransaction, isPending: saving } =
    useCreateTransaction();

  const [error, setError] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [inputMethod, setInputMethod] = useState<InputMethod>("MANUAL");
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset: resetForm,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    mode: "onBlur",
    defaultValues: DEFAULT_VALUES([]),
  });

  const type = watch("type");
  const category = watch("category");
  const accountId = watch("accountId");
  const date = watch("date");

  const categories = type === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  useEffect(() => {
    if (accounts.length > 0) resetForm(DEFAULT_VALUES(accounts));
  }, [accounts, resetForm]);

  return (
    <SafeAreaView className="flex-1 bg-brand-body" edges={["top"]}>
      <View className="px-5 pt-3 pb-2">
        <Text className="text-brand-bg text-xl font-semibold">
          Add transaction
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {loadingAccounts ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#4A9EFF"/>
          </View>
        ) :accountsError ? (
          <View className="flex-1 items-center justify-center px-10">
            <Feather name="alert-circle" size={32} color="#FF6B4A" />
            <Text className="text-brand-text-muted text-sm mt-3 text-center">
              Couldn&apos;t load your accounts.
            </Text>
          </View>
        ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 100,
          }}
        >
          <View className="flex-row gap-2.5 mb-4">
              <AIActionCard
                icon="camera"
                title="Scan receipt"
                subtitle="Snap a photo"
                colors={AI_GRADIENT}
                onPress={() => setScannerOpen(true)}
              />
              <AIActionCard
                icon="mic"
                title="Voice log"
                subtitle="Just say it"
                colors={AI_GRADIENT_REVERSE}
                onPress={() => setVoiceModalOpen(true)}
              />
            </View>
        </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
