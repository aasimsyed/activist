<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<template>
  <div class="px-4 sm:px-6 md:px-8 xl:px-24 2xl:px-36">
    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="text-primary-text">
        {{ $t("i18n.pages.auth.reset_password.validating_token") }}
      </div>
    </div>

    <div v-else-if="isTokenValid">
      <Form
        @submit="handlePasswordReset"
        id="reset-password-form"
        class="space-y-4"
        :schema="resetPasswordSchema"
        submit-label="i18n._global.auth.set_new_password"
      >
        <h2 class="mb-4 text-2xl font-bold text-primary-text">
          {{ $t("i18n._global.auth.set_new_password") }}
        </h2>

        <p class="mb-6 text-primary-text">
          {{ $t("i18n.pages.auth.reset_password.set_new_password_info") }}
        </p>

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
            data-testid="reset-password-new-password"
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
            data-testid="reset-password-confirm-password"
          >
            <template #icons>
              <span>
                <Icon
                  :name="doPasswordsMatch ? IconMap.CHECK : IconMap.X_LG"
                  size="1.2em"
                  :color="doPasswordsMatch ? '#3BA55C' : '#BA3D3B'"
                  aria-hidden="false"
                  aria-labelledby="reset-password-confirm-password-match"
                />
                <title
                  id="reset-password-confirm-password-match"
                  class="sr-only"
                >
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

    <div v-else class="py-8 text-center">
      <h2 class="mb-4 text-2xl font-bold text-red-600">
        {{ $t("i18n.pages.auth.reset_password.invalid_token_title") }}
      </h2>
      <p class="mb-6 text-primary-text">
        {{ $t("i18n.pages.auth.reset_password.invalid_token_info") }}
      </p>
      <div class="link-text text-xl font-extrabold">
        <NuxtLink :to="localePath('/auth/reset-password')">
          {{ $t("i18n.pages.auth.reset_password.request_new_reset") }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FetchError } from "ofetch";
import { z } from "zod";

import { IconMap } from "~/types/icon-map";

const { t } = useI18n();
const localePath = useLocalePath();
const { showSuccess, showError } = useToaster();
const route = useRoute();

const isLoading = ref(true);
const isTokenValid = ref(false);
const password = ref("");
const isPasswordFocused = ref(false);

const { isPasswordMatch, isAllRulesValid } = usePasswordRules();

const resetPasswordSchema = z
  .object({
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

// Validate token on page load
onMounted(async () => {
  try {
    const token = route.params.token as string;

    if (!token) {
      isTokenValid.value = false;
      isLoading.value = false;
      return;
    }

    // Validate the reset token with the backend
    await $fetch(`/api/auth/validate-reset-token/${token}`, {
      method: "GET",
    });

    isTokenValid.value = true;
  } catch (error) {
    isTokenValid.value = false;
    if (error instanceof FetchError) {
      if (error?.response?.status === 404) {
        showError(t("i18n.pages.auth.reset_password.token_not_found"));
      } else if (error?.response?.status === 410) {
        showError(t("i18n.pages.auth.reset_password.token_expired"));
      }
    }
  } finally {
    isLoading.value = false;
  }
});

const handlePasswordReset = async (values: Record<string, unknown>) => {
  try {
    const { password: newPassword } = values;
    const token = route.params.token as string;

    // Submit the new password
    await $fetch("/api/auth/password-reset", {
      method: "POST",
      body: {
        token,
        password: newPassword as string,
      },
    });

    showSuccess(t("i18n.pages.auth.reset_password.password_reset_success"));

    // Redirect to sign-in page
    await navigateTo(localePath("/auth/sign-in"));
  } catch (error) {
    if (error instanceof FetchError) {
      if (error?.response?.status === 404) {
        showError(t("i18n.pages.auth.reset_password.token_not_found"));
      } else if (error?.response?.status === 410) {
        showError(t("i18n.pages.auth.reset_password.token_expired"));
      } else {
        showError(t("i18n.pages.auth._global.error_occurred"));
      }
    } else {
      showError(t("i18n.pages.auth._global.error_occurred"));
    }
  }
};
</script>
