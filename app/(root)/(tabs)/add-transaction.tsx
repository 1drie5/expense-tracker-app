import { AIActionCard } from "@/components/AIActionCard";
import { CalendarPicker } from "@/components/CalendarPicker";
import { AI_GRADIENT, AI_GRADIENT_REVERSE } from "@/constants/theme";
import { PillGroup } from "@/components/PillGroup";
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
import { format, isValid } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput, 
  TouchableOpacity,
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

const TYPE_OPTIONS = [
  { key: "EXPENSE" as const, label: "Expense" },
  { key: "INCOME" as const, label: "Income" },
];

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

  const onSubmit = async (values: TransactionFormValues) => {
    if (!user) return;

    setError("");

    const parsed = parseFloat(values.amount.replace(/,/g, ""));

    const { error: createError } = await createTransaction({
      user_id: user.id,
      account_id: values.accountId,
      type: values.type,
      amount: parsed,
      category: values.category,
      description: values.description?.trim() || null,
      date: values.date.toISOString(),
      input_method: inputMethod,
      voice_transcript: inputMethod === "VOICE" ? voiceTranscript : null,
    });

    if (createError) {
      setError("Something went wrong. Please try again.");
      return;
    }

    resetForm(DEFAULT_VALUES(accounts));
    setInputMethod("MANUAL");
    setVoiceTranscript(null);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(root)/(tabs)/transactions");
    }
  };
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

            <View className="flex-row bg-white rounded-xl border border-[#E8E6DF] p-1 mb-4">
              {TYPE_OPTIONS.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  onPress={() => {
                    setValue("type", t.key);
                    setValue(
                      "category",
                      t.key === "INCOME"
                        ? INCOME_CATEGORIES[0].key
                        : EXPENSE_CATEGORIES[0].key
                    );
                  }}
                  className={`flex-1 py-2 rounded-lg items-center ${
                    type === t.key ? "bg-brand-bg" : ""
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      type === t.key
                        ? "text-white"
                        : "text-brand-text-secondary"
                    }`}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-brand-bg text-xs font-medium mb-1.5">
              Amount
            </Text>
            <Controller
              control={control}
              name="amount"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  value={value}
                  onChangeText={(v) => {
                    setError("");
                    onChange(v);
                  }}
                  onBlur={onBlur}
                  placeholder="0"
                  placeholderTextColor="#8A8D96"
                  keyboardType="numeric"
                  className="bg-white border border-[#E8E6DF] rounded-xl px-4 py-3.5 text-sm text-brand-bg"
                />
              )}
            />
            {errors.amount && (
              <Text className="text-brand-coral text-xs mt-1.5">
                {errors.amount.message}
              </Text>
            )}
            <View className="mb-4" />  

            <Text className="text-brand-bg text-xs font-medium mb-1.5">
              Category
            </Text>
            <View className="mb-4">
              <PillGroup
                options={categories.map((c) => ({
                  key: c.key,
                  label: c.label,
                  icon: c.icon,
                }))}
                value={category}
                onChange={(key) => setValue("category", key)}
              />
            </View>

            <Text className="text-brand-bg text-xs font-medium mb-1.5">
              Account
            </Text>
            <View className="mb-1">
              <PillGroup
                options={accounts.map((a) => ({ key: a.id, label: a.name }))}
                value={accountId}
                onChange={(key) => setValue("accountId", key)}
              />
            </View>
            {errors.accountId && (
              <Text className="text-brand-coral text-xs mb-3">
                {errors.accountId.message}
              </Text>
            )}
            <View className="mb-3" />

            <Text className="text-brand-bg text-xs font-medium mb-1.5">
              Date
            </Text>
            <TouchableOpacity
              onPress={() => setDatePickerOpen((v) => !v)}
              className="flex-row items-center justify-between bg-white border border-[#E8E6DF] rounded-xl px-4 py-3.5 mb-1"
            >
              <Text className="text-sm text-brand-bg">
                {format(date, "d MMM yyyy")}
              </Text>
              <Feather name="calendar" size={16} color="#5C5F68" />
            </TouchableOpacity>

            {datePickerOpen && (
              <View className="bg-white border border-[#E8E6DF] rounded-xl mb-4 overflow-hidden">
                <CalendarPicker
                  value={date}
                  maximumDate={new Date()}
                  onChange={(selectedDate) => {
                    setValue("date", selectedDate);
                    setDatePickerOpen(false);
                  }}
                />
              </View>
            )}
            {!datePickerOpen && <View className="mb-4" />}

            <Text className="text-brand-bg text-xs font-medium mb-1.5">
              Description (optional)
            </Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="e.g. Swiggy order"
                  placeholderTextColor="#8A8D96"
                  className="bg-white border border-[#E8E6DF] rounded-xl px-4 py-3.5 mb-4 text-sm text-brand-bg"
                />
              )}
            />

            {error ? (
              <Text className="text-brand-coral text-xs mb-4">{error}</Text>
            ) : null}

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={saving}
              className="bg-brand-bg rounded-xl py-4 items-center mb-2"
              activeOpacity={0.85}
            >
              <Text className="text-white text-sm font-semibold">
                {saving ? "Saving…" : "Save transaction"}
              </Text>
            </TouchableOpacity>

        </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
