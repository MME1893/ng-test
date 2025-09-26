import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';

interface AuthState {
  auth_stage: string;
  webauthn_required: boolean;
  webauthn_registered: boolean;
  webauthn_completed: boolean;
  next_step: string;
}

interface AuthResponse extends AuthState {
  access_token: string;
  token_type: string;
}

interface SessionResponse extends AuthState {
  username: string;
  email: string;
  id: number;
  created_at: string;
}

@Component({
  selector: 'app-temp-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzCardModule, NzInputModule, NzNotificationModule],
  templateUrl: './temp-auth.component.html',
  styleUrls: ['./temp-auth.component.scss'],
})
export class TempAuthComponent {
  apiBase = 'http://digcity.ir/api';

  signUpForm = {
    username: '',
    email: '',
    password: '',
  };

  signInForm = {
    username: '',
    password: '',
  };

  deviceName = '';

  cardStep: 'credentials' | 'device' = 'credentials';
  authMode: 'signIn' | 'signUp' = 'signIn';

  authToken?: string;
  lastAuthResponse?: AuthResponse;
  session?: SessionResponse;

  loading = {
    signUp: false,
    signIn: false,
    session: false,
    register: false,
    authenticate: false,
  };

  private readonly notification = inject(NzNotificationService);

  private readonly nextStepDictionary: Record<string, string> = {
    webauthn_register: 'ثبت دستگاه با WebAuthn',
    webauthn_authenticate: 'احراز هویت با دستگاه',
    authenticated: 'احراز هویت کامل شده است',
  };

  get nextStepDescription(): string {
    const step = this.state?.next_step;
    if (!step) {
      return 'مرحله بعدی مشخص نیست.';
    }
    return this.nextStepDictionary[step] ?? `مرحله بعد: ${step}`;
  }

  get requiresRegistration(): boolean {
    const state = this.state;
    return !!state && state.webauthn_required && !state.webauthn_registered;
  }

  get requiresAuthentication(): boolean {
    const state = this.state;
    return !!state && state.webauthn_required && state.webauthn_registered && !state.webauthn_completed;
  }

  get fullyAuthenticated(): boolean {
    return !!this.state?.webauthn_completed;
  }

  get statusMessage(): string {
    if (!this.state) {
      return 'برای شروع، با نام کاربری و رمز عبور خود وارد شوید یا ثبت‌نام کنید.';
    }
    if (this.fullyAuthenticated) {
      return 'کاربر و دستگاه با موفقیت احراز شدند.';
    }
    if (this.requiresRegistration) {
      return 'دستگاه شما هنوز ثبت نشده است. برای ادامه آن را ثبت کنید.';
    }
    if (this.requiresAuthentication) {
      return 'دستگاه شما ثبت شده است. برای تکمیل احراز هویت، از دستگاه خود استفاده کنید.';
    }
    return 'اطلاعات ورود شما ثبت شد. مرحله بعدی را ادامه دهید.';
  }

  switchToSignUp(): void {
    this.authMode = 'signUp';
  }

  switchToSignIn(): void {
    this.authMode = 'signIn';
  }

  async submitSignUp(): Promise<void> {
    this.loading.signUp = true;
    try {
      const response = await this.fetchWithLogging(this.getApiUrl('/authentication/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.signUpForm),
      });

      if (!response.ok) {
        await this.handleHttpError('ثبت‌نام با خطا مواجه شد', response);
        return;
      }

      const data = await this.readJson<AuthResponse>(response);
      await this.handleAuthSuccess(data);
      this.notification.success('ثبت‌نام موفق', 'حساب کاربری ایجاد شد.');
    } catch (error) {
      this.handleError('ثبت‌نام ناموفق بود', error);
    } finally {
      this.loading.signUp = false;
    }
  }

  async submitSignIn(): Promise<void> {
    this.loading.signIn = true;
    try {
      const body = new URLSearchParams({
        username: this.signInForm.username,
        password: this.signInForm.password,
      });
      const response = await this.fetchWithLogging(this.getApiUrl('/authentication/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        await this.handleHttpError('ورود با خطا مواجه شد', response);
        return;
      }

      const data = await this.readJson<AuthResponse>(response);
      await this.handleAuthSuccess(data);
      this.notification.success('ورود موفق', 'احراز هویت اولیه تکمیل شد.');
    } catch (error) {
      this.handleError('ورود ناموفق بود', error);
    } finally {
      this.loading.signIn = false;
    }
  }

  async refreshSession(): Promise<void> {
    if (!this.ensureToken()) {
      return;
    }

    this.loading.session = true;
    try {
      const response = await this.fetchWithLogging(this.getApiUrl('/authentication/me'), {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await this.handleHttpError('دریافت اطلاعات کاربر با خطا مواجه شد', response);
        return;
      }

      const data = await this.readJson<SessionResponse>(response);
      this.session = data;
    } catch (error) {
      this.handleError('عدم موفقیت در دریافت اطلاعات کاربر', error);
    } finally {
      this.loading.session = false;
    }
  }

  async registerDevice(): Promise<void> {
    if (!this.ensureToken() || !this.ensureWebAuthnAvailable()) {
      return;
    }

    this.loading.register = true;
    try {
      const startResponse = await this.fetchWithLogging(this.getApiUrl('/webauthn/registration/start'), {
        method: 'POST',
        headers: this.getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({}),
      });

      if (!startResponse.ok) {
        await this.handleHttpError('شروع ثبت دستگاه با خطا مواجه شد', startResponse);
        return;
      }

      const { publicKey } = await this.readJson<{ publicKey: any }>(startResponse);
      const options = this.normaliseRegistrationOptions(publicKey);
      const credential = await navigator.credentials.create({ publicKey: options });

      if (!credential || credential.type !== 'public-key') {
        throw new Error('گواهی بازگشتی برای ثبت دستگاه معتبر نبود');
      }

      const payload = this.publicKeyCredentialToJSON(credential as PublicKeyCredential);
      if (this.deviceName.trim()) {
        payload['device_name'] = this.deviceName.trim();
      }

      const finishResponse = await this.fetchWithLogging(this.getApiUrl('/webauthn/registration/complete'), {
        method: 'POST',
        headers: this.getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      });

      if (!finishResponse.ok) {
        await this.handleHttpError('تکمیل ثبت دستگاه با خطا مواجه شد', finishResponse);
        return;
      }

      const data = await this.readJson<AuthResponse>(finishResponse);
      await this.handleAuthSuccess(data);
      this.deviceName = '';
      this.notification.success('ثبت دستگاه موفق', 'دستگاه شما با موفقیت ثبت شد.');
    } catch (error) {
      if ((error as Error)?.name === 'NotAllowedError') {
        this.handleError('فرآیند ثبت دستگاه توسط کاربر لغو شد یا منقضی گردید.', error);
      } else {
        this.handleError('ثبت دستگاه با خطا روبرو شد', error);
      }
    } finally {
      this.loading.register = false;
    }
  }

  async authenticateDevice(): Promise<void> {
    if (!this.ensureToken() || !this.ensureWebAuthnAvailable()) {
      return;
    }

    this.loading.authenticate = true;
    try {
      const startResponse = await this.fetchWithLogging(this.getApiUrl('/webauthn/authentication/start'), {
        method: 'POST',
        headers: this.getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({}),
      });

      if (!startResponse.ok) {
        await this.handleHttpError('شروع احراز هویت دستگاه با خطا مواجه شد', startResponse);
        return;
      }

      const { publicKey } = await this.readJson<{ publicKey: any }>(startResponse);
      const options = this.normaliseAuthenticationOptions(publicKey);
      const credential = await navigator.credentials.get({ publicKey: options });

      if (!credential || credential.type !== 'public-key') {
        throw new Error('گواهی بازگشتی برای احراز هویت معتبر نبود');
      }

      const payload = this.publicKeyAssertionToJSON(credential as PublicKeyCredential);
      const finishResponse = await this.fetchWithLogging(this.getApiUrl('/webauthn/authentication/complete'), {
        method: 'POST',
        headers: this.getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      });

      if (!finishResponse.ok) {
        await this.handleHttpError('تکمیل احراز هویت دستگاه با خطا مواجه شد', finishResponse);
        return;
      }

      const data = await this.readJson<AuthResponse>(finishResponse);
      await this.handleAuthSuccess(data);
      this.notification.success('احراز هویت موفق', 'ورود شما تکمیل شد.');
    } catch (error) {
      if ((error as Error)?.name === 'NotAllowedError') {
        this.handleError('فرآیند احراز هویت دستگاه لغو شد یا منقضی گردید.', error);
      } else {
        this.handleError('احراز هویت دستگاه با خطا روبرو شد', error);
      }
    } finally {
      this.loading.authenticate = false;
    }
  }

  get state(): AuthState | undefined {
    return this.session ?? this.lastAuthResponse;
  }

  private async handleAuthSuccess(response: AuthResponse): Promise<void> {
    this.setToken(response);
    this.lastAuthResponse = response;
    this.cardStep = 'device';
    await this.refreshSession();
  }

  private setToken(response: AuthResponse): void {
    const tokenType = response.token_type || 'Bearer';
    this.authToken = `${tokenType} ${response.access_token}`;
  }

  private ensureToken(): boolean {
    if (!this.authToken) {
      this.notification.warning('نیاز به ورود', 'ابتدا وارد حساب خود شوید.');
      return false;
    }
    return true;
  }

  private ensureWebAuthnAvailable(): boolean {
    if (!('credentials' in navigator)) {
      this.notification.error('خطا', 'مرورگر شما از WebAuthn پشتیبانی نمی‌کند.');
      return false;
    }
    return true;
  }

  private async handleHttpError(message: string, response: Response): Promise<void> {
    const detail = await response.text();
    const error = new Error(detail || response.statusText);
    this.handleError(message, error);
  }

  private handleError(message: string, error: unknown): void {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(message, err);
    this.notification.error('خطا', err.message);
  }

  private getApiUrl(path: string): string {
    const base = this.apiBase.replace(/\/?$/, '');
    const suffix = path.startsWith('/') ? path : `/${path}`;
    return `${base}${suffix}`;
  }

  private getAuthHeaders(extra: HeadersInit = {}): HeadersInit {
    return {
      Authorization: this.authToken ?? '',
      ...extra,
    };
  }

  private async fetchWithLogging(url: string, options?: RequestInit): Promise<Response> {
    return fetch(url, options);
  }

  private async readJson<T>(response: Response): Promise<T> {
    const text = await response.text();
    if (!text) {
      return {} as T;
    }
    try {
      return JSON.parse(text) as T;
    } catch (error) {
      throw error;
    }
  }

  private normaliseRegistrationOptions(publicKey: any): PublicKeyCredentialCreationOptions {
    const copy: any = typeof structuredClone === 'function' ? structuredClone(publicKey) : JSON.parse(JSON.stringify(publicKey));
    copy.challenge = this.bufferDecode(copy.challenge);
    if (copy.user?.id) {
      copy.user.id = this.bufferDecode(copy.user.id);
    }

    const exclude = copy.exclude_credentials ?? copy.excludeCredentials ?? [];
    exclude.forEach((cred: any) => {
      cred.id = this.bufferDecode(cred.id);
    });

    this.convertProperty(copy, 'pub_key_cred_params', 'pubKeyCredParams');
    this.convertProperty(copy, 'authenticator_selection', 'authenticatorSelection');
    this.convertProperty(copy, 'exclude_credentials', 'excludeCredentials');

    if (copy.authenticatorSelection) {
      this.convertProperty(copy.authenticatorSelection, 'user_verification', 'userVerification');
      this.convertProperty(copy.authenticatorSelection, 'resident_key', 'residentKey');
      this.convertProperty(copy.authenticatorSelection, 'require_resident_key', 'requireResidentKey');
    }

    if (copy.user) {
      this.convertProperty(copy.user, 'display_name', 'displayName');
    }

    return copy as PublicKeyCredentialCreationOptions;
  }

  private normaliseAuthenticationOptions(publicKey: any): PublicKeyCredentialRequestOptions {
    const copy: any = typeof structuredClone === 'function' ? structuredClone(publicKey) : JSON.parse(JSON.stringify(publicKey));
    copy.challenge = this.bufferDecode(copy.challenge);

    const allow = (copy.allow_credentials ?? copy.allowCredentials ?? []).map((cred: any) => ({
      ...cred,
      id: this.toBufferSource(cred.id),
    }));
    copy.allowCredentials = allow;
    delete copy.allow_credentials;

    if (copy.authenticator_selection) {
      this.convertProperty(copy, 'authenticator_selection', 'authenticatorSelection');
    }

    if (copy.authenticatorSelection) {
      this.convertProperty(copy.authenticatorSelection, 'user_verification', 'userVerification');
      this.convertProperty(copy.authenticatorSelection, 'resident_key', 'residentKey');
      this.convertProperty(copy.authenticatorSelection, 'require_resident_key', 'requireResidentKey');
    }

    return copy as PublicKeyCredentialRequestOptions;
  }

  private publicKeyCredentialToJSON(credential: PublicKeyCredential): Record<string, unknown> {
    const attestation = credential.response as AuthenticatorAttestationResponse;
    return {
      id: credential.id,
      rawId: this.bufferEncode(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: this.bufferEncode(attestation.clientDataJSON),
        attestationObject: this.bufferEncode(attestation.attestationObject),
      },
    };
  }

  private publicKeyAssertionToJSON(credential: PublicKeyCredential): Record<string, unknown> {
    const assertion = credential.response as AuthenticatorAssertionResponse;
    return {
      id: credential.id,
      rawId: this.bufferEncode(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: this.bufferEncode(assertion.clientDataJSON),
        authenticatorData: this.bufferEncode(assertion.authenticatorData),
        signature: this.bufferEncode(assertion.signature),
        userHandle: assertion.userHandle ? this.bufferEncode(assertion.userHandle) : null,
      },
    };
  }

  private convertProperty(object: Record<string, any>, from: string, to: string): void {
    if (object && Object.hasOwn(object, from)) {
      object[to] = object[from];
      delete object[from];
    }
  }

  private bufferDecode(value: string): Uint8Array {
    return Uint8Array.from(atob(value.replace(/_/g, '/').replace(/-/g, '+')), (c) => c.charCodeAt(0));
  }

  private bufferEncode(value: ArrayBuffer | ArrayBufferView): string {
    const buffer = value instanceof ArrayBuffer ? new Uint8Array(value) : new Uint8Array(value.buffer);
    let binary = '';
    buffer.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  private toBufferSource(value: unknown): ArrayBuffer | ArrayBufferView | null {
    if (!value) {
      return null;
    }
    if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
      return value;
    }
    if (typeof value === 'string') {
      return this.bufferDecode(value);
    }
    throw new TypeError('Unsupported credential buffer value');
  }
}
