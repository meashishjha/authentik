import "@goauthentik/elements/forms/FormElement";
import "@goauthentik/flow/components/ak-flow-card.js";
import { BaseDeviceStage } from "@goauthentik/flow/stages/authenticator_validate/base";
import { PasswordManagerPrefill } from "@goauthentik/flow/stages/identification/IdentificationStage";

import { msg, str } from "@lit/localize";
import { CSSResult, TemplateResult, css, html } from "lit";
import { customElement } from "lit/decorators.js";

import {
    AuthenticatorValidationChallenge,
    AuthenticatorValidationChallengeResponseRequest,
    DeviceClassesEnum,
} from "@goauthentik/api";

@customElement("ak-stage-authenticator-validate-code")
export class AuthenticatorValidateStageWebCode extends BaseDeviceStage<
    AuthenticatorValidationChallenge,
    AuthenticatorValidationChallengeResponseRequest
> {
    static get styles(): CSSResult[] {
        return super.styles.concat(css`
            .icon-description {
                display: flex;
            }
            .icon-description i {
                font-size: 2em;
                padding: 0.25em;
                padding-right: 0.5em;
            }
        `);
    }

    deviceMessage(): string {
        switch (this.deviceChallenge?.deviceClass) {
            case DeviceClassesEnum.Email: {
                const email = this.deviceChallenge.challenge?.email;
                return msg(str`A code has been sent to you via email${email ? ` ${email}` : ""}`);
            }
            case DeviceClassesEnum.Sms:
                return msg("A code has been sent to you via SMS.");
            case DeviceClassesEnum.Totp:
                return msg(
                    "Open your two-factor authenticator app to view your authentication code.",
                );
            case DeviceClassesEnum.Static:
                return msg("Enter a one-time recovery code for this user.");
        }

        return msg("Enter the code from your authenticator device.");
    }

    deviceIcon(): string {
        switch (this.deviceChallenge?.deviceClass) {
            case DeviceClassesEnum.Email:
                return "fa-envelope-o";
            case DeviceClassesEnum.Sms:
                return "fa-mobile-alt";
            case DeviceClassesEnum.Totp:
                return "fa-clock";
            case DeviceClassesEnum.Static:
                return "fa-key";
        }

        return "fa-mobile-alt";
    }

    render(): TemplateResult {
        return html`<ak-flow-card .challenge=${this.challenge}>
            <form
                class="pf-c-form"
                @submit=${(e: Event) => {
                    this.submitForm(e);
                }}
            >
                ${this.renderUserInfo()}
                <div class="icon-description">
                    <i class="fa ${this.deviceIcon()}" aria-hidden="true"></i>
                    <p>${this.deviceMessage()}</p>
                </div>
                <ak-form-element
                    label="${this.deviceChallenge?.deviceClass === DeviceClassesEnum.Static
                        ? msg("Static token")
                        : msg("Authentication code")}"
                    required
                    class="pf-c-form__group"
                    .errors=${(this.challenge?.responseErrors || {}).code}
                >
                    <!-- @ts-ignore -->
                    <input
                        type="text"
                        name="code"
                        inputmode="${this.deviceChallenge?.deviceClass === DeviceClassesEnum.Static
                            ? "text"
                            : "numeric"}"
                        pattern="${this.deviceChallenge?.deviceClass === DeviceClassesEnum.Static
                            ? "[0-9a-zA-Z]*"
                            : "[0-9]*"}"
                        placeholder="${msg("Please enter your code")}"
                        autofocus=""
                        autocomplete="one-time-code"
                        class="pf-c-form-control"
                        value="${PasswordManagerPrefill.totp || ""}"
                        required
                    />
                </ak-form-element>

                <div class="pf-c-form__group pf-m-action">
                    <button type="submit" class="pf-c-button pf-m-primary pf-m-block">
                        ${msg("Continue")}
                    </button>
                    ${this.renderReturnToDevicePicker()}
                </div>
            </form>
        </ak-flow-card>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "ak-stage-authenticator-validate-code": AuthenticatorValidateStageWebCode;
    }
}
