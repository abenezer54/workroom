type GoogleCredentialResponse = {
  credential?: string;
  select_by?: string;
};

type GoogleButtonText = "signin_with" | "signup_with" | "continue_with";

type GoogleButtonOptions = {
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  type?: "standard" | "icon";
  shape?: "rectangular" | "pill" | "circle" | "square";
  text?: GoogleButtonText;
  width?: number;
};

interface Window {
  google?: {
    accounts: {
      id: {
        initialize(options: {
          client_id: string;
          callback(response: GoogleCredentialResponse): void;
          auto_select?: boolean;
          cancel_on_tap_outside?: boolean;
        }): void;
        renderButton(parent: HTMLElement, options: GoogleButtonOptions): void;
        cancel(): void;
      };
    };
  };
}
