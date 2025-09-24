<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<template>
  <div class="px-4 sm:px-6 md:px-8 xl:px-24 2xl:px-36">
    <Form
      @submit="handleSetPassword"
      id="set-password"
      class="space-y-4"
      :schema="setPasswordSchema"
      submit-label="i18n.pages.auth.set_password.set_password"
    >
      <h2 class="mb-4 text-2xl font-bold text-primary-text">
        {{ $t("i18n.pages.auth.set_password.set_password") }}
      </h2>

      <p class="mb-6 text-primary-text">
        {{ $t("i18n.pages.auth.set_password.info") }}
      </p>

      <FormItem
        v-slot="{ id, handleChange, handleBlur, errorMessage, value }"
        name="userName"
      >
        <!-- prettier-ignore-attribute :modelValue -->
        <FormTextInput
          @input="handleChange"
          @blur="handleBlur"
          :id="id"
          :modelValue="(value.value as string)"
          :hasError="!!errorMessage.value"
          :label="$t('i18n.pages.auth._global.enter_a_user_name')"
          :data-testid="$t('i18n.pages.auth._global.enter_a_user_name')"
        />
      </FormItem>

      <FormItem
        v-slot="{ id, value: passwordRef, handleBlur, errorMessage }"
        class-item="space-y-4"
        name="password"
      >
        <!-- prettier-ignore-attribute :modelValue -->
        <FormTextInputPassword
          @input="handlePasswordInput"
          @blur="handleBlur"
          @focus="isPasswordFocused = true"
          :id="id"
          :modelValue="(passwordRef.value as string)"
          :hasError="!!errorMessage.value || showPasswordError.border"
          :label="$t('i18n._global.enter_password')"
          :data-testid="$t('i18n._global.enter_password')"
        />
        <IndicatorPasswordStrength :password-value="password" />
      </FormItem>

      <FormItem
        v-slot="{ id, handleChange, handleBlur, errorMessage, value }"
        name="confirmPassword"
      >
        <!-- prettier-ignore-attribute :modelValue -->
        <FormTextInputPassword
          @input="handleChange"
          @blur="handleBlur"
          :id="id"
          :modelValue="(value.value as string)"
          :hasError="!!errorMessage.value"
          :label="$t('i18n._global.repeat_password')"
          :data-testid="$t('i18n._global.repeat_password')"
        >
          <template #icons>
            <span>
              <Icon
                :name="doPasswordsMatch ? IconMap.CHECK : IconMap.X_LG"
                size="1.2em"
                :color="doPasswordsMatch ? '#3BA55C' : '#BA3D3B'"
                aria-hidden="false"
                aria-labelledby="set-password-confirm-password-match"
              />
              <title id="set-password-confirm-password-match" class="sr-only">
                {{
                  doPasswordsMatch
                    ? $t("i18n.pages.auth._global.passwords_match")
                    : $t("i18n.pages.auth._global.passwords_do_not_match")
                }}
              </title>
            </span>
          </template>
        </FormTextInputPassword>
      </FormItem>

      <div class="link-text pt-4 text-center text-xl font-extrabold">
        <NuxtLink :to="localePath('/auth/sign-in')">
          {{ $t("i18n.pages.auth._global.back_to_sign_in") }}
        </NuxtLink>
      </div>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { FetchError } from "ofetch";
import { z } from "zod";

import { IconMap } from "~/types/icon-map";

const { t } = useI18n();
const localePath = useLocalePath();
const { showSuccess, showError } = useToaster();

const password = ref("");
const isPasswordFocused = ref(false);

const { isPasswordMatch, isAllRulesValid } = usePasswordRules();

const setPasswordSchema = z
  .object({
    userName: z.string().min(1, t("i18n.pages.auth._global.required")),
    password: z
      .string()
      .min(1, t("i18n.pages.auth._global.required"))
      .refine(
        (val) => isAllRulesValid(val),
        t("i18n.pages.auth._global.password_requirements_not_met")
      ),
    confirmPassword: z.string().min(1, t("i18n.pages.auth._global.required")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: t("i18n.pages.auth._global.passwords_do_not_match"),
    path: ["confirmPassword"],
  });

const doPasswordsMatch = computed<boolean>(() =>
  isPasswordMatch(password.value, password.value)
);

const showPasswordError = computed<{ border: boolean; tooltip: boolean }>(
  () => {
    const error = password.value.length > 0 && !isAllRulesValid(password.value);
    return {
      border: !isPasswordFocused.value && error,
      tooltip: isPasswordFocused.value && error,
    };
  }
);

const handlePasswordInput = (event: Event & { target: HTMLInputElement }) => {
  password.value = event.target.value;
};

const handleSetPassword = async (values: Record<string, unknown>) => {
  try {
    const { userName, password: newPassword } = values;

    // Call the set password API
    await $fetch("/api/auth/set-password", {
      method: "POST",
      body: {
        username: userName as string,
        password: newPassword as string,
      },
    });

    showSuccess(t("i18n.pages.auth.set_password.password_set_success"));

    // Redirect to sign-in page
    await navigateTo(localePath("/auth/sign-in"));
  } catch (error) {
    if (error instanceof FetchError) {
      if (error?.response?.status === 404) {
        showError(t("i18n.pages.auth.set_password.user_not_found"));
      } else if (error?.response?.status === 400) {
        showError(t("i18n.pages.auth.set_password.invalid_request"));
      } else {
        showError(t("i18n.pages.auth._global.error_occurred"));
      }
    } else {
      showError(t("i18n.pages.auth._global.error_occurred"));
    }
  }
};
</script>
