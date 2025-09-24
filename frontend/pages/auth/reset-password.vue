<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<template>
  <div class="px-4 sm:px-6 md:px-8 xl:px-24 2xl:px-36">
    <Form
      @submit="handlePasswordResetRequest"
      id="reset-password-request"
      class="space-y-4"
      :schema="resetPasswordSchema"
      submit-label="i18n._global.auth.reset_password"
    >
      <p class="text-primary-text">
        {{ $t("i18n.pages.auth.reset_password.index.reset_password_info") }}
      </p>

      <FormItem
        v-slot="{ id, handleChange, handleBlur, errorMessage, value }"
        name="email"
      >
        <!-- prettier-ignore-attribute :modelValue -->
        <FormTextInput
          @input="handleChange"
          @blur="handleBlur"
          :id="id"
          :modelValue="(value.value as string)"
          :hasError="!!errorMessage.value"
          :label="$t('i18n.pages.auth.reset_password.enter_username_mail')"
          type="email"
          data-testid="reset-password-email"
        />
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

const { t } = useI18n();
const localePath = useLocalePath();
const { showSuccess, showError } = useToaster();

const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, t("i18n.pages.auth._global.required"))
    .email(t("i18n.pages.auth._global.invalid_email")),
});

const handlePasswordResetRequest = async (values: Record<string, unknown>) => {
  try {
    const { email } = values;

    // Call the password reset request API
    await $fetch("/api/auth/password-reset-request", {
      method: "POST",
      body: {
        email: email as string,
      },
    });

    showSuccess(t("i18n.pages.auth.reset_password.email_sent_success"));

    // Redirect to sign-in page after successful request
    await navigateTo(localePath("/auth/sign-in"));
  } catch (error) {
    if (error instanceof FetchError) {
      if (error?.response?.status === 404) {
        showError(t("i18n.pages.auth.reset_password.email_not_found"));
      } else if (error?.response?.status === 429) {
        showError(t("i18n.pages.auth.reset_password.too_many_requests"));
      } else {
        showError(t("i18n.pages.auth._global.error_occurred"));
      }
    } else {
      showError(t("i18n.pages.auth._global.error_occurred"));
    }
  }
};
</script>
