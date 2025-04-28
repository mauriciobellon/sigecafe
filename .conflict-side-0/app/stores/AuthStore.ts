import { defineStore } from "pinia";
import { nextTick } from "vue";
import type { SignupDTO, AuthResponseDTO } from "~/types/api";

// Add type definitions
type FormType = "auth" | "signup";
type StepType = "name" | "celular" | "password";

interface AuthState {
  name: string;
  celular: string;
  password: string;
  loading: boolean;
  error: string;
  step: StepType;
  formType: FormType;
}

export const useAuthStore = defineStore("Auth", {
  state: (): AuthState => ({
    name: "",
    celular: "",
    password: "",
    loading: false,
    error: "",
    step: "name",
    formType: "auth",
  }),

  actions: {
    setError(message: string) {
      this.error = message;
    },

    clearError() {
      this.error = "";
    },

    setLoading(value: boolean) {
      this.loading = value;
    },

    resetForm() {
      this.name = "";
      this.celular = "";
      this.password = "";
      this.error = "";
      this.loading = false;
      this.step = "name";
    },

    setFormType(type: FormType) {
      this.resetForm();
      this.formType = type;
      this.step = type === "auth" ? "celular" : "name";
    },

    async handleSignup() {
      try {
        const signupData: SignupDTO = {
          name: this.name,
          celular: this.celular.replace(/\D/g, ''), // Send only digits
          password: this.password,
        };

        const response = await $fetch<AuthResponseDTO>("/api/auth/signup", {
          method: "POST",
          body: signupData,
        });

        if (response.success) {
          const { signIn } = useAuth();
          const result = await signIn("credentials", {
            redirect: false,
            celular: signupData.celular,
            password: this.password,
          });

          if (result?.error) {
            throw new Error(result.error);
          }

          return navigateTo("/app");
        }

        if (response.errorCode === "USER_EXISTS") {
          this.setError(
            'Número de celular já cadastrado, <a href="/auth/login" class="login-link">clique aqui para fazer login</a>'
          );
        } else {
          this.setError("Problema ao cadastrar tente novamente mais tarde");
        }
      } catch (e) {
        this.setError("Problema ao cadastrar tente novamente mais tarde");
      } finally {
        this.resetForm();
      }
    },

    async handleLogin() {
      try {
        // Extract only the digits for authentication
        const celularDigits = this.celular.replace(/\D/g, '');

        const { signIn } = useAuth();
        const result = await signIn("credentials", {
          redirect: false,
          celular: celularDigits, // Send only digits
          password: this.password,
        });

        if (result?.error) {
          throw new Error(result.error);
        }
        return navigateTo("/app");
      } catch (e) {
        this.setError("Número de celular ou senha inválidos");
        this.step = "celular";
        this.celular = "";
        this.password = "";
        this.loading = false;
      }
    },

    maskPhoneNumber(event?: InputEvent) {
      // Check if backspace was pressed
      const isBackspace = event?.inputType === 'deleteContentBackward';
      const previousValue = this.celular || '';

      // Store original cursor position
      const input = event?.target as HTMLInputElement;
      const cursorPos = input?.selectionStart || 0;

      // For debugging
      const previousDigits = previousValue.replace(/\D/g, '');

      // If backspace is pressed and we're at a formatting character, carefully handle it
      if (isBackspace) {
        // Special case: backspacing right after hyphen
        if (cursorPos > 0 && previousValue.charAt(cursorPos - 1) === '-') {
          // Only remove the hyphen, not the digit
          const digitsOnly = previousValue.replace(/\D/g, '');

          // Reformat with the same number of digits
          this.celular = this.formatPhoneNumber(digitsOnly);

          // Position cursor before the hyphen would be
          nextTick(() => {
            // Find where the hyphen would be (after 7th digit + format chars)
            const newPos = this.findPositionBeforeHyphen(this.celular);
            input?.setSelectionRange(newPos, newPos);
          });

          return;
        }

        // General case: cursor is right after a non-digit character (handles other format chars)
        if (cursorPos > 0 && /\D/.test(previousValue.charAt(cursorPos - 1))) {
          // Remove the last digit before this format character
          const beforeCursor = previousValue.substring(0, cursorPos - 1);
          const afterCursor = previousValue.substring(cursorPos);

          // Find the last digit before cursor and remove it
          const newValue = beforeCursor.replace(/(\d)([^\d]*)$/, '') + afterCursor;
          this.celular = newValue;

          // Position cursor at the right place
          nextTick(() => {
            const newPos = Math.max(0, cursorPos - 2);
            input?.setSelectionRange(newPos, newPos);
          });

          return;
        }
      }

      // Get only digits
      const digitsOnly = (this.celular || '').replace(/\D/g, '');

      // Limit to 11 digits maximum (common format for Brazilian phone numbers)
      const limitedDigits = digitsOnly.substring(0, 11);

      // Format using our helper method
      this.celular = this.formatPhoneNumber(limitedDigits);

      // Restore cursor position
      if (input) {
        nextTick(() => {
          // If not backspacing, try to maintain cursor relative to digits
          if (!isBackspace) {
            // Count digits before cursor in the original value
            let originalDigitsBeforeCursor = 0;
            for (let i = 0; i < cursorPos; i++) {
              if (/\d/.test(previousValue.charAt(i))) {
                originalDigitsBeforeCursor++;
              }
            }

            // Limit the count to 11 digits
            originalDigitsBeforeCursor = Math.min(originalDigitsBeforeCursor, 11);

            // Find position with the same number of digits in new value
            let newPos = 0;
            let digitsCount = 0;
            for (let i = 0; i < this.celular.length; i++) {
              if (digitsCount === originalDigitsBeforeCursor) {
                newPos = i;
                break;
              }
              if (/\d/.test(this.celular.charAt(i))) {
                digitsCount++;
              }
              newPos = i + 1;
            }

            input.setSelectionRange(newPos, newPos);
          }
          // If backspacing, position cursor more carefully
          else if (cursorPos > 0) {
            // Check if we're backspacing from the end of the string
            if (cursorPos >= previousValue.length) {
              // Position at the end of the new formatted value
              input.setSelectionRange(this.celular.length, this.celular.length);
            } else {
              // Count digits before cursor in the original value
              let digitsBeforeCursor = 0;
              for (let i = 0; i < cursorPos; i++) {
                if (/\d/.test(previousValue.charAt(i))) {
                  digitsBeforeCursor++;
                }
              }

              // If the cursor was right after a digit that was removed, adjust
              if (/\d/.test(previousValue.charAt(cursorPos - 1))) {
                digitsBeforeCursor = Math.max(0, digitsBeforeCursor - 1);
              }

              // Find the corresponding position in the new formatted string
              let newPos = 0;
              let digitCount = 0;
              for (let i = 0; i < this.celular.length; i++) {
                if (digitCount === digitsBeforeCursor) {
                  newPos = i;
                  break;
                }
                if (/\d/.test(this.celular.charAt(i))) {
                  digitCount++;
                }
                newPos = i + 1;
              }

              input.setSelectionRange(newPos, newPos);
            }
          }
        });
      }
    },

    // Helper method to format a phone number given just digits
    formatPhoneNumber(digits: string): string {
      let formatted = '';
      if (digits.length > 0) {
        // Add area code with parentheses
        formatted = `(${digits.substring(0, Math.min(2, digits.length))}`;

        if (digits.length > 2) {
          // Add closing parenthesis and first digit
          formatted += `) ${digits.substring(2, 3)}`;

          if (digits.length > 3) {
            // Add middle digits
            formatted += ` ${digits.substring(3, Math.min(7, digits.length))}`;

            if (digits.length > 7) {
              // Add final digits with hyphen
              formatted += `-${digits.substring(7, digits.length)}`;
            }
          }
        }
      }
      return formatted;
    },

    // Find the position right before where the hyphen would be
    findPositionBeforeHyphen(formattedNumber: string): number {
      // Find the position right before the hyphen would be placed
      // (After the 7th digit)
      let digitCount = 0;
      for (let i = 0; i < formattedNumber.length; i++) {
        if (/\d/.test(formattedNumber.charAt(i))) {
          digitCount++;
          if (digitCount === 7) {
            return i + 1; // Position after the 7th digit
          }
        }
      }
      return formattedNumber.length; // If no hyphen, position at the end
    },

    async validateAndProceed(event: Event) {
      event.preventDefault();
      this.clearError();

      if (this.formType === "signup" && this.step === "name") {
        if (!this.name.trim()) {
          this.setError("Nome não pode ser vazio");
          return;
        }
        this.setLoading(true);
        await nextTick();
        setTimeout(() => {
          this.step = "celular";
          this.setLoading(false);
        }, 500);
      } else if (this.step === "celular") {
        const phoneDigits = this.celular.replace(/\D/g, '');
        if (!this.celular.trim() || phoneDigits.length !== 11) {
          this.setError("Digite um número de celular válido (11 dígitos)");
          return;
        }
        this.setLoading(true);
        await nextTick();
        setTimeout(() => {
          this.step = "password";
          this.setLoading(false);
        }, 500);
      } else if (this.step === "password") {
        if (!this.password.trim()) {
          this.setError("Senha não pode ser vazia");
          return;
        }
        this.setLoading(true);
        // Call appropriate handler based on form type
        await (this.formType === "auth" ? this.handleLogin() : this.handleSignup());
      }
    }
  }
});
