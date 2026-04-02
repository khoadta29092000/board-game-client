"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslations } from "next-intl";
import { useAuth } from "@/src/redux/global/selectors";
import { Eye, EyeOff, KeyRound, Loader2, Save, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import useApi from "@/src/hook/useApi";
import { TChangePassword } from "@/src/types/player";

type Tab = "info" | "password";

// ─── Update Info Form ─────────────────────────────────────────────────────────
type InfoFormData = {
  name: string;
  username: string;
};

type Props = {
  isChange?: boolean;
}

export function UpdateInfoTab({isChange = true}: Props) {
  const t = useTranslations();
  const profile = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);



  const schema = yup.object().shape({
     name: yup
      .string()
      .matches(/^[a-zA-Z0-9]+$/, t("profile_name_invalid"))
      .max(16, t("profile_name_max"))
      .min(2, t("profile_name_min"))
      .required(t("profile_name_required")),
    
    username: yup
      .string()
      .email(t("profile_email_invalid"))
      .required(t("profile_email_required"))
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset
  } = useForm<InfoFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: profile?.Name ?? "",
      username: profile?.Email ?? ""
    }
  });

  useEffect(() => {
  if (profile?.Name || profile?.Email) {
    reset({
      name: profile.Name ?? "",
      username: profile.Email ?? ""
    });
  }
}, [profile?.Name, profile?.Email, reset]);

  const onSubmit = async (data: InfoFormData) => {
    try {
      setIsSubmitting(true);
      // TODO: call API update profile
      console.log("Update info:", data);
      await new Promise(r => setTimeout(r, 800)); // mock
      toast.success(t("profile_update_success"));
    } catch {
      toast.error(t("profile_update_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Avatar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {profile?.Name?.charAt(0).toUpperCase() ?? "?"}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-base">{profile?.Name}</p>
          <p className="text-sm text-gray-500">{profile?.Email}</p>
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {t("profile_email_lbl")} <span className="text-red-500">*</span>
        </label>
        <input
          disabled
          {...register("username")}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          placeholder={t("profile_email_placeholder")}
        />
        {errors.username && (
          <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
        )}
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {t("profile_name_lbl")} <span className="text-red-500">*</span>
        </label>
        <input
          disabled={!isChange}
          {...register("name")}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          placeholder={t("profile_name_placeholder")}
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      
      {
        isChange &&   <Button
        type="submit"
        disabled={isSubmitting || !isDirty}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" />{t("profile_saving")}</>
        ) : (
          <><Save className="h-4 w-4" />{t("profile_save")}</>
        )}
      </Button>
      }
    
    </form>
  );
}

// ─── Change Password Form ─────────────────────────────────────────────────────
type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

function ChangePasswordTab() {
  const {changePassword, loading} = useApi()
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [show, setShow] = useState({ current: false, newPwd: false, confirm: false });

  const schema = yup.object().shape({
    currentPassword: yup.string().required(t("profile_pwd_current_required")),
    newPassword: yup
      .string()
      .min(6, t("profile_pwd_new_min"))
      .required(t("profile_pwd_new_required")),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("newPassword")], t("profile_pwd_confirm_mismatch"))
      .required(t("profile_pwd_confirm_required"))
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<PasswordFormData>({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: PasswordFormData) => {
    try {
      setIsSubmitting(true);
      const body: TChangePassword = {
        newPassword: data.newPassword,
        oldPassword: data.currentPassword,
      }
       await changePassword(body);
    
    }  finally {
      setIsSubmitting(false);
    }
  };

  const PasswordField = ({
    label,
    field,
    showKey,
    placeholder,
    error
  }: {
    label: string;
    field: keyof PasswordFormData;
    showKey: keyof typeof show;
    placeholder: string;
    error?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          {...register(field)}
          type={show[showKey] ? "text" : "password"}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShow(prev => ({ ...prev, [showKey]: !prev[showKey] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show[showKey] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <PasswordField
        label={t("profile_pwd_current_lbl")}
        field="currentPassword"
        showKey="current"
        placeholder={t("profile_pwd_current_placeholder")}
        error={errors.currentPassword?.message}
      />
      <PasswordField
        label={t("profile_pwd_new_lbl")}
        field="newPassword"
        showKey="newPwd"
        placeholder={t("profile_pwd_new_placeholder")}
        error={errors.newPassword?.message}
      />
      <PasswordField
        label={t("profile_pwd_confirm_lbl")}
        field="confirmPassword"
        showKey="confirm"
        placeholder={t("profile_pwd_confirm_placeholder")}
        error={errors.confirmPassword?.message}
      />

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" />{t("profile_saving")}</>
        ) : (
          <><KeyRound className="h-4 w-4" />{t("profile_pwd_change_btn")}</>
        )}
      </Button>
    </form>
  );
}

// ─── Main ContentProfile ──────────────────────────────────────────────────────
export default function ContentProfile() {
  const t = useTranslations();
  const profile = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("info");

   const isGuest = profile?.Email?.startsWith("guest_") ?? false;

   const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "info", label: t("profile_tab_info"), icon: <User className="h-4 w-4" /> },
    ...(!isGuest
      ? [{ key: "password" as Tab, label: t("profile_tab_password"), icon: <KeyRound className="h-4 w-4" /> }]
      : [])
  ];
  return (
   <div className="min-h-[calc(80vh)] bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {t("profile_title")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{t("profile_subtitle")}</p>

          {/* ✅ Guest warning banner */}
          {isGuest && (
            <div className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm">
              <span>⚠️</span>
              <span>{t("profile_guest_warning")}</span>
            </div>
          )}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs - ẩn tab bar nếu chỉ có 1 tab */}
          {!isGuest && (
            <div className="flex border-b border-gray-100">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Tab Content */}
          <div className="p-6 sm:p-8">
            {activeTab === "info" || isGuest
              ? <UpdateInfoTab isChange={!isGuest} />
              : <ChangePasswordTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
