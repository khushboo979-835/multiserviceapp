import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { FormField, BookingFormConfig, FormFieldOption } from "../../types";
import { Check, Calendar, MapPin, Upload, Compass } from "lucide-react-native";
import { LocationService } from "../../services/location.service";

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
  const [gpsLoading, setGpsLoading] = useState(false);

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
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label} {field.validation.required && <Text style={styles.requiredStar}>*</Text>}
            </Text>
            <TextInput
              value={value || ""}
              onChangeText={(text) => handleInputChange(field.id, field.type === "NUMBER" ? text.replace(/[^0-9]/g, "") : text)}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              placeholderTextColor="#94a3b8"
              keyboardType={field.type === "NUMBER" ? "numeric" : "default"}
              style={[
                styles.textInput,
                error ? styles.textInputError : null,
              ]}
              editable={!isLoading}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        );

      case "SELECT":
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label} {field.validation.required && <Text style={styles.requiredStar}>*</Text>}
            </Text>
            <View style={styles.chipsWrap}>
              {field.options?.map((opt: FormFieldOption) => {
                const isSelected = value === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => handleInputChange(field.id, opt.value)}
                    disabled={isLoading}
                    activeOpacity={0.8}
                    style={[
                      styles.selectChip,
                      isSelected ? styles.selectChipActive : null,
                    ]}
                  >
                    <Text style={[
                      styles.selectChipText,
                      isSelected ? styles.selectChipTextActive : null,
                    ]}>
                      {opt.label} {opt.priceModifier ? `(+₹${opt.priceModifier})` : ""}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        );

      case "MULTI_SELECT":
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label} {field.validation.required && <Text style={styles.requiredStar}>*</Text>}
            </Text>
            <View style={styles.multiSelectCol}>
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
                    activeOpacity={0.8}
                    style={[
                      styles.multiSelectItem,
                      isSelected ? styles.multiSelectItemActive : null,
                    ]}
                  >
                    <View style={styles.multiSelectLeft}>
                      <View style={[
                        styles.checkboxBox,
                        isSelected ? styles.checkboxBoxActive : null,
                      ]}>
                        {isSelected && <Check size={12} color="#ffffff" />}
                      </View>
                      <Text style={[
                        styles.multiSelectText,
                        isSelected ? styles.multiSelectTextActive : null,
                      ]}>
                        {opt.label}
                      </Text>
                    </View>
                    {opt.priceModifier ? (
                      <Text style={styles.priceModifierText}>+₹{opt.priceModifier}</Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        );

      case "DATE":
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label} {field.validation.required && <Text style={styles.requiredStar}>*</Text>}
            </Text>
            <TouchableOpacity
              onPress={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const dateStr = tomorrow.toISOString().split("T")[0];
                handleInputChange(field.id, dateStr);
              }}
              disabled={isLoading}
              style={[
                styles.dateButton,
                error ? styles.dateButtonError : null,
              ]}
            >
              <Text style={[styles.dateText, value ? styles.dateTextFilled : null]}>
                {value || "Select Preferred Date"}
              </Text>
              <Calendar size={18} color="#ef4444" />
            </TouchableOpacity>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label} {field.validation.required && <Text style={styles.requiredStar}>*</Text>}
            </Text>
            <View style={styles.multiSelectCol}>
              {slots.map((slot) => {
                const isSelected = value === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    onPress={() => handleInputChange(field.id, slot)}
                    disabled={isLoading}
                    style={[
                      styles.slotItem,
                      isSelected ? styles.slotItemActive : null,
                    ]}
                  >
                    <Text style={[
                      styles.slotItemText,
                      isSelected ? styles.slotItemTextActive : null,
                    ]}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        );

      case "ADDRESS_GPS":
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label} {field.validation.required && <Text style={styles.requiredStar}>*</Text>}
            </Text>
            <View style={[styles.addressBox, error ? styles.addressBoxError : null]}>
              <View style={styles.addressHeaderRow}>
                <View style={styles.addressTitleRow}>
                  <MapPin size={18} color="#ef4444" />
                  <Text style={styles.addressTitleText} numberOfLines={1}>
                    {value?.city ? `${value.city} Location` : "Service Address"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={async () => {
                    setGpsLoading(true);
                    try {
                      const loc = await LocationService.getCurrentLocation();
                      handleInputChange(field.id, loc);
                    } finally {
                      setGpsLoading(false);
                    }
                  }}
                  disabled={isLoading || gpsLoading}
                  style={styles.gpsDetectButton}
                >
                  {gpsLoading ? (
                    <ActivityIndicator size="small" color="#ef4444" />
                  ) : (
                    <>
                      <Compass size={14} color="#ef4444" />
                      <Text style={styles.gpsDetectText}>Auto-Detect GPS</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <TextInput
                value={value?.formattedAddress || ""}
                onChangeText={(txt) =>
                  handleInputChange(field.id, {
                    ...(value || {}),
                    formattedAddress: txt,
                    latitude: value?.latitude || 28.4901,
                    longitude: value?.longitude || 77.0805,
                  })
                }
                placeholder="Tap 'Auto-Detect GPS' or enter street, house/flat no."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={2}
                style={styles.addressInput}
                editable={!isLoading}
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        );

      case "IMAGE":
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label} {field.validation.required && <Text style={styles.requiredStar}>*</Text>}
            </Text>
            <TouchableOpacity
              onPress={() => {
                handleInputChange(field.id, "https://s3.amazonaws.com/mock-bucket/issue_photo.jpg");
              }}
              disabled={isLoading}
              style={[
                styles.uploadBox,
                error ? styles.uploadBoxError : null,
              ]}
            >
              {value ? (
                <View style={styles.uploadInner}>
                  <Check size={22} color="#16a34a" />
                  <Text style={styles.uploadSuccessText}>Photo Attached Successfully</Text>
                </View>
              ) : (
                <View style={styles.uploadInner}>
                  <Upload size={22} color="#ef4444" />
                  <Text style={styles.uploadPromptText}>Upload Device Photo (Optional)</Text>
                </View>
              )}
            </TouchableOpacity>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {formConfig.fields.map((field) => renderField(field))}

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isLoading}
        activeOpacity={0.85}
        style={[styles.submitButton, isLoading ? styles.submitButtonDisabled : null]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.submitButtonText}>{submitButtonText}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 6,
  },
  requiredStar: {
    color: "#ef4444",
  },
  textInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  textInputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  errorText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ef4444",
    marginTop: 4,
    marginLeft: 4,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    alignItems: "center",
  },
  selectChipActive: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  selectChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  selectChipTextActive: {
    color: "#ef4444",
    fontWeight: "800",
  },
  multiSelectCol: {
    gap: 8,
  },
  multiSelectItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  multiSelectItemActive: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  multiSelectLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 8,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#94a3b8",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  checkboxBoxActive: {
    borderColor: "#ef4444",
    backgroundColor: "#ef4444",
  },
  multiSelectText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  multiSelectTextActive: {
    color: "#0f172a",
    fontWeight: "800",
  },
  priceModifierText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ef4444",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateButtonError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  dateText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#94a3b8",
  },
  dateTextFilled: {
    color: "#0f172a",
    fontWeight: "700",
  },
  slotItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    alignItems: "center",
  },
  slotItemActive: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  slotItemText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  slotItemTextActive: {
    color: "#ef4444",
    fontWeight: "800",
  },
  addressBox: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 18,
    padding: 14,
  },
  addressBoxError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  addressHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  addressTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 8,
  },
  addressTitleText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
    marginLeft: 6,
  },
  gpsDetectButton: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fca5a5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  gpsDetectText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ef4444",
    marginLeft: 4,
  },
  addressInput: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 10,
    minHeight: 52,
    textAlignVertical: "top",
  },
  uploadBox: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#cbd5e1",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadBoxError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  uploadInner: {
    alignItems: "center",
  },
  uploadSuccessText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#16a34a",
    marginTop: 6,
  },
  uploadPromptText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    marginTop: 6,
  },
  submitButton: {
    backgroundColor: "#ef4444",
    borderRadius: 18,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.2,
  },
});

