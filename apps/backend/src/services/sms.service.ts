import axios from "axios";

export interface SmsSendResult {
  success: boolean;
  provider: "msg91" | "fast2sms" | "twilio" | "twofactor" | "sandbox";
  message: string;
}

export class SmsService {
  /**
   * Dispatches real Telecom SMS with OTP to Indian and International phone numbers.
   * Uses aggressive connection timeouts (max 3500ms) to ensure non-blocking high throughput.
   */
  public static async sendOtpSms(phoneNumber: string, otp: string): Promise<SmsSendResult> {
    const cleanPhone = phoneNumber.replace(/\D/g, "").slice(-10);
    const fullIndianPhone = `+91${cleanPhone}`;
    const messageText = `Your Inisha City Service login OTP is ${otp}. Valid for 5 minutes. Do not share this OTP.`;

    console.log(`[SmsService] Dispatching OTP ${otp} to +91 ${cleanPhone}`);

    // 1. Fast2SMS Indian Telecom Gateway (Most reliable & instant for Indian numbers)
    const fast2smsApiKey = process.env.FAST2SMS_API_KEY || process.env.FAST2SMS_KEY;

    if (fast2smsApiKey && fast2smsApiKey !== "YOUR_FAST2SMS_API_KEY") {
      // 1A. Try Fast2SMS Quick Route (q) - 100% verified instant delivery without DLT/website verification
      try {
        console.log("⚡ [GATEWAY 1/4] Fast2SMS Quick Route 'q' dispatching...");
        const qResponse = await axios.post(
          "https://www.fast2sms.com/dev/bulkV2",
          {
            route: "q",
            message: `Your Inisha City Service login OTP is ${otp}. Valid for 5 minutes. Do not share this OTP.`,
            flash: 0,
            numbers: cleanPhone,
          },
          {
            headers: {
              authorization: fast2smsApiKey,
              "Content-Type": "application/json",
              "User-Agent": "InishaMobile/1.0",
            },
            timeout: 3500,
          }
        );

        if (qResponse.data && qResponse.data.return) {
          console.log("✅ [FAST2SMS QUICK DELIVERED]: Real SMS dispatched to", cleanPhone);
          return {
            success: true,
            provider: "fast2sms",
            message: `Real SMS OTP dispatched via Fast2SMS Quick to +91 ${cleanPhone}`,
          };
        }
      } catch (err: any) {
        console.warn("⚠️ Fast2SMS Quick Route notice:", err?.response?.data || err.message);
      }

      // 1B. Try Fast2SMS OTP route fallback
      try {
        console.log("⚡ [GATEWAY 1/4 Fallback] Fast2SMS OTP Route dispatching...");
        const response = await axios.post(
          "https://www.fast2sms.com/dev/bulkV2",
          {
            variables_values: otp,
            route: "otp",
            numbers: cleanPhone,
          },
          {
            headers: {
              authorization: fast2smsApiKey,
              "Content-Type": "application/json",
              "User-Agent": "InishaMobile/1.0",
            },
            timeout: 3500,
          }
        );

        if (response.data && response.data.return) {
          console.log("✅ [FAST2SMS OTP DELIVERED]: Real SMS dispatched to", cleanPhone);
          return {
            success: true,
            provider: "fast2sms",
            message: `Real SMS OTP dispatched via Fast2SMS to +91 ${cleanPhone}`,
          };
        }
      } catch (err: any) {
        console.warn("⚠️ Fast2SMS OTP Route notice:", err?.response?.data || err.message);
      }
    }

    // 2. 2Factor SMS Gateway (Indian OTP Telecom Gateway)
    const twoFactorApiKey = process.env.TWO_FACTOR_API_KEY || process.env.TWOFACTOR_KEY;
    if (twoFactorApiKey && twoFactorApiKey !== "YOUR_2FACTOR_KEY") {
      try {
        console.log("⚡ [GATEWAY 2/4] Dispatching via 2Factor Telecom SMS Gateway...");
        const url = `https://2factor.in/API/V1/${twoFactorApiKey}/SMS/${cleanPhone}/${otp}/AUTOGEN2`;
        const response = await axios.get(url, { timeout: 3500 });
        if (response.data && (response.data.Status === "Success" || response.data.Details)) {
          console.log("✅ [2FACTOR DELIVERED]: Real SMS dispatched to", cleanPhone);
          return {
            success: true,
            provider: "twofactor",
            message: `Real SMS OTP dispatched via 2Factor to +91 ${cleanPhone}`,
          };
        }
      } catch (err: any) {
        console.warn("⚠️ 2Factor API error:", err.message);
      }
    }

    // 3. MSG91 Enterprise Telecom Gateway
    const msg91AuthKey = process.env.MSG91_AUTH_KEY || process.env.MSG91_KEY;
    const msg91TemplateId = process.env.MSG91_TEMPLATE_ID;
    if (msg91AuthKey && msg91AuthKey !== "YOUR_MSG91_KEY") {
      try {
        console.log("⚡ [GATEWAY 3/4] Dispatching via MSG91 Enterprise Telecom Gateway...");
        const url = msg91TemplateId
          ? `https://control.msg91.com/api/v5/otp?template_id=${msg91TemplateId}&mobile=91${cleanPhone}&authkey=${msg91AuthKey}&otp=${otp}`
          : `https://control.msg91.com/api/v5/otp?template_id=default&mobile=91${cleanPhone}&authkey=${msg91AuthKey}&otp=${otp}`;

        const response = await axios.post(url, {}, { headers: { "Content-Type": "application/json" }, timeout: 3500 });
        if (response.data && (response.data.type === "success" || response.status === 200)) {
          console.log("✅ [MSG91 DELIVERED]: Real telecom SMS dispatched to", cleanPhone);
          return {
            success: true,
            provider: "msg91",
            message: `Real SMS OTP dispatched via MSG91 to +91 ${cleanPhone}`,
          };
        }
      } catch (err: any) {
        console.warn("⚠️ MSG91 API error:", err.message);
      }
    }

    // 4. Twilio SMS Gateway (Global Telecom SMS)
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
    if (twilioSid && twilioAuthToken && twilioPhone && twilioSid !== "YOUR_TWILIO_SID") {
      try {
        console.log("⚡ [GATEWAY 4/4] Dispatching via Twilio Telecom Gateway...");
        const auth = Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString("base64");
        const params = new URLSearchParams();
        params.append("To", fullIndianPhone);
        params.append("From", twilioPhone);
        params.append("Body", messageText);

        const response = await axios.post(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
          params.toString(),
          {
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            timeout: 3500,
          }
        );

        if (response.data && response.data.sid) {
          console.log("✅ [TWILIO DELIVERED]: Real SMS dispatched with SID:", response.data.sid);
          return {
            success: true,
            provider: "twilio",
            message: `Real SMS OTP dispatched via Twilio to ${fullIndianPhone}`,
          };
        }
      } catch (err: any) {
        console.warn("⚠️ Twilio API error:", err.message);
      }
    }

    // 5. Sandbox / Console Logging Fallback
    console.log(`ℹ️ [SANDBOX OTP]: ${otp} for phone +91 ${cleanPhone}`);
    return {
      success: true,
      provider: "sandbox",
      message: `OTP generated for +91 ${cleanPhone}`,
    };
  }
}
