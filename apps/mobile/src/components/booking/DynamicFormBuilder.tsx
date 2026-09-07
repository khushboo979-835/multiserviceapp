import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { FormField, BookingFormConfig, FormFieldOption } from "../../types";
import { Check, Calendar, MapPin, Upload, ChevronDown } from "lucide-react-native";

interface DynamicFormBuilderProps {
  formConfig: BookingFormConfig;
  onSubmit: (values: Record<string, any>) => void;
  basePrice: number;
  onPriceChange: (newPrice: number) => void;
  submitButtonText?: string;
  isLoading?: boolean;
}

export default function DynamicFormBuilder({
  formConfig,
  onSubmit,
  basePrice,
  onPriceChange,
  submitButtonText = "Book Service",
  isLoading = false,
}: DynamicFormBuilderProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Recalculate price modifications whenever form values change
  useEffect(() => {
    let priceModifierSum = 0;
    
    formConfig.fields.forEach((field) => {
      const val = formValues[field.id];
      if (!val) return;

      if (field.type === "SELECT" && field.options) {
        const selectedOpt = field.options.find((opt) => opt.value === val);
        if (selectedOpt?.priceModifier) {
          priceModifierSum += selectedOpt.priceModifier;
        }
      } else if (field.type === "MULTI_SELECT" && Array.isArray(val) && field.options) {
        val.forEach((selectedVal) => {
          const selectedOpt = field.options?.find((opt) => opt.value === selectedVal);
          if (selectedOpt?.priceModifier) {
            priceModifierSum += selectedOpt.priceModifier;
          }
        });
      }
    });

    onPriceChange(basePrice + priceModifierSum);
  }, [formValues, formConfig.fields, basePrice, onPriceChange]);

  const handleInputChange = (fieldId: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[fieldId];
        return copy;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    formConfig.fields.forEach((field) => {
      const val = formValues[field.id];
      const isRequired = field.validation.required;

      if (isRequired) {
        if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
          newErrors[field.id] = `${field.label} is required`;
        }
      }

      if (val && field.validation.min !== undefined) {
        if (typeof val === "string" && val.length < field.validation.min) {
          newErrors[field.id] = `${field.label} must be at least ${field.validation.min} characters`;
        } else if (typeof val === "number" && val < field.validation.min) {
          newErrors[field.id] = `${field.label} must be at least ${field.validation.min}`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formValues);
    }
  };

  const renderField = (field: FormField) => {
    const error = errors[field.id];
    const value = formValues[field.id];

    switch (field.type) {
      case "TEXT":
      case "NUMBER":
        return (
          <View key={field.id} className="mb-5">
            <Text className="text-dark-300 text-sm font-semibold mb-2">
              {field.label} {field.validation.required && <Text className="text-rose-500">*</Text>}
            </Text>
            <TextInput
              value={value || ""}
              onChangeText={(text) => handleInputChange(field.id, field.type === "NUMBER" ? text.replace(/[^0-9]/g, "") : text)}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              placeholderTextColor="#475569"
              keyboardType={field.type === "NUMBER" ? "numeric" : "default"}
              className={`bg-dark-950 text-white border ${
                error ? "border-rose-500" : "border-dark-800 focus:border-primary-500"
              } rounded-2xl px-4 py-3.5 text-base font-medium`}
              editable={!isLoading}
            />
            {error ? <Text className="text-rose-500 text-xs mt-1.5 font-medium">{error}</Text> : null}
          </View>
        );

      case "SELECT":
        return (
          <View key={field.id} className="mb-5">
            <Text className="text-dark-300 text-sm font-semibold mb-2">
              {field.label} {field.validation.required && <Text className="text-rose-500">*</Text>}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {field.options?.map((opt: FormFieldOption) => {
                const isSelected = value === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => handleInputChange(field.id, opt.value)}
                    disabled={isLoading}
                    className={`px-4 py-3 rounded-2xl border ${
                      isSelected
                        ? "bg-primary-950/20 border-primary-500 shadow-md shadow-primary-500/10"
                        : "bg-dark-950 border-dark-800"
                    } items-center`}
                  >
                    <Text className={`font-semibold ${isSelected ? "text-primary-400" : "text-dark-300"}`}>
                      {opt.label} {opt.priceModifier ? `(+₹${opt.priceModifier})` : ""}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {error ? <Text className="text-rose-500 text-xs mt-1.5 font-medium">{error}</Text> : null}
          </View>
        );

      case "MULTI_SELECT":
        return (
          <View key={field.id} className="mb-5">
            <Text className="text-dark-300 text-sm font-semibold mb-2">
              {field.label} {field.validation.required && <Text className="text-rose-500">*</Text>}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {field.options?.map((opt: FormFieldOption) => {
                const list = Array.isArray(value) ? value : [];
                const isSelected = list.includes(opt.value);
                
                const toggleSelect = () => {
                  if (isSelected) {
                    handleInputChange(
                      field.id,
                      list.filter((v) => v !== opt.value)
                    );
                  } else {
                    handleInputChange(field.id, [...list, opt.value]);
                  }
                };

                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={toggleSelect}
                    disabled={isLoading}
                    className={`flex-row items-center px-4 py-3 rounded-2xl border ${
                      isSelected
                        ? "bg-primary-950/20 border-primary-500 shadow-md shadow-primary-500/10"
                        : "bg-dark-950 border-dark-800"
                    }`}
                  >
                    <View className={`w-4 h-4 rounded border ${isSelected ? 'border-primary-500 bg-primary-600' : 'border-dark-700'} items-center justify-center mr-2`}>
                      {isSelected && <Check size={10} color="#fff" />}
                    </View>
                    <Text className={`font-semibold ${isSelected ? "text-primary-400" : "text-dark-300"}`}>
                      {opt.label} {opt.priceModifier ? `(+₹${opt.priceModifier})` : ""}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {error ? <Text className="text-rose-500 text-xs mt-1.5 font-medium">{error}</Text> : null}
          </View>
        );

      case "DATE":
        return (
          <View key={field.id} className="mb-5">
            <Text className="text-dark-300 text-sm font-semibold mb-2">
              {field.label} {field.validation.required && <Text className="text-rose-500">*</Text>}
            </Text>
            <TouchableOpacity
              onPress={() => {
                // In production, we'd trigger the native date picker
                // For demonstration/simulation, we set tomorrow's date
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const dateStr = tomorrow.toISOString().split("T")[0];
                handleInputChange(field.id, dateStr);
              }}
              disabled={isLoading}
              className={`flex-row items-center justify-between bg-dark-950 border ${
                error ? "border-rose-500" : "border-dark-800"
              } rounded-2xl px-4 py-3.5`}
            >
              <Text className={`font-semibold ${value ? "text-white" : "text-dark-500"}`}>
                {value || "Select Date"}
              </Text>
              <Calendar size={18} color="#94a3b8" />
            </TouchableOpacity>
            {error ? <Text className="text-rose-500 text-xs mt-1.5 font-medium">{error}</Text> : null}
          </View>
        );

      case "TIME_SLOT":
        const slots = [
          "09:00 AM - 11:00 AM",
          "11:00 AM - 01:00 PM",
          "02:00 PM - 04:00 PM",
          "04:00 PM - 06:00 PM",
          "06:00 PM - 08:00 PM"
        ];
        return (
          <View key={field.id} className="mb-5">
            <Text className="text-dark-300 text-sm font-semibold mb-2">
              {field.label} {field.validation.required && <Text className="text-rose-500">*</Text>}
            </Text>
            <View className="flex-col gap-2">
              {slots.map((slot) => {
                const isSelected = value === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    onPress={() => handleInputChange(field.id, slot)}
                    disabled={isLoading}
                    className={`px-4 py-3.5 rounded-2xl border ${
                      isSelected
                        ? "bg-primary-950/20 border-primary-500"
                        : "bg-dark-950 border-dark-800"
                    }`}
                  >
                    <Text className={`font-semibold text-center ${isSelected ? "text-primary-400" : "text-dark-300"}`}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {error ? <Text className="text-rose-500 text-xs mt-1.5 font-medium">{error}</Text> : null}
          </View>
        );

      case "ADDRESS_GPS":
        return (
          <View key={field.id} className="mb-5">
            <Text className="text-dark-300 text-sm font-semibold mb-2">
              {field.label} {field.validation.required && <Text className="text-rose-500">*</Text>}
            </Text>
            <TouchableOpacity
              onPress={() => {
                // Simulate fetching current location and address
                handleInputChange(field.id, {
                  formattedAddress: "7A, Cyber City, Phase III, Sector 24, Gurugram, Haryana 122002",
                  latitude: 28.4901,
                  longitude: 77.0805,
                });
              }}
              disabled={isLoading}
              className={`flex-row items-center justify-between bg-dark-950 border ${
                error ? "border-rose-500" : "border-dark-800"
              } rounded-2xl px-4 py-3.5`}
            >
              <Text className={`font-semibold flex-1 pr-4 ${value ? "text-white" : "text-dark-500"}`} numberOfLines={1}>
                {value ? value.formattedAddress : "Tap to select address via GPS"}
              </Text>
              <MapPin size={18} color="#94a3b8" />
            </TouchableOpacity>
            {error ? <Text className="text-rose-500 text-xs mt-1.5 font-medium">{error}</Text> : null}
          </View>
        );

      case "IMAGE":
        return (
          <View key={field.id} className="mb-5">
            <Text className="text-dark-300 text-sm font-semibold mb-2">
              {field.label} {field.validation.required && <Text className="text-rose-500">*</Text>}
            </Text>
            <TouchableOpacity
              onPress={() => {
                // Mocking file upload selection
                handleInputChange(field.id, "https://s3.amazonaws.com/mock-bucket/issue_photo.jpg");
              }}
              disabled={isLoading}
              className={`flex-row items-center justify-center bg-dark-950 border-2 border-dashed ${
                error ? "border-rose-500" : "border-dark-800"
              } rounded-2xl p-6`}
            >
              {value ? (
                <View className="items-center">
                  <Check size={24} color="#10b981" />
                  <Text className="text-emerald-400 font-semibold text-xs mt-2">Upload Complete</Text>
                </View>
              ) : (
                <View className="items-center">
                  <Upload size={24} color="#64748b" />
                  <Text className="text-dark-400 text-sm mt-2 font-medium">Upload photos/documents</Text>
                </View>
              )}
            </TouchableOpacity>
            {error ? <Text className="text-rose-500 text-xs mt-1.5 font-medium">{error}</Text> : null}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
      {formConfig.fields.map((field) => renderField(field))}

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isLoading}
        className={`w-full bg-primary-600 active:bg-primary-700 py-4.5 rounded-2xl items-center justify-center shadow-lg shadow-primary-600/30 mt-4 ${
          isLoading ? "opacity-50" : ""
        }`}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text className="text-white text-base font-bold">{submitButtonText}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
