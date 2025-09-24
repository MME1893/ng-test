import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

export type LogLevel = 'info' | 'success' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  detail?: string;
}

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
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzGridModule,
    NzInputModule,
    NzNotificationModule,
    NzTagModule,
    NzTypographyModule,
  ],
  templateUrl: './temp-auth.component.html',
  styleUrls: ['./temp-auth.component.scss'],
})
export class TempAuthComponent implements OnInit {
  @ViewChild('logContainer') private logContainer?: ElementRef<HTMLDivElement>;

  apiBase = 'http://localhost:8001/api';

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

  authToken?: string;
  lastAuthResponse?: AuthResponse;
  session?: SessionResponse;

  logs: LogEntry[] = [];

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

  ngOnInit(): void {
    this.log('برای شروع، یکی از فرم‌های ثبت‌نام یا ورود را تکمیل کنید.');
  }

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

  async submitSignUp(): Promise<void> {
    this.loading.signUp = true;
    this.log('ارسال درخواست ثبت‌نام کاربر', this.signUpForm);
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
      await this.handleAuthSuccess(data, 'ثبت‌نام');
      this.notification.success('ثبت‌نام موفق', 'حساب کاربری ایجاد شد.');
    } catch (error) {
      this.handleError('ثبت‌نام ناموفق بود', error);
    } finally {
      this.loading.signUp = false;
    }
  }

  async submitSignIn(): Promise<void> {
    this.loading.signIn = true;
    this.log('ارسال درخواست ورود کاربر', this.signInForm);
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
      await this.handleAuthSuccess(data, 'ورود');
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
    this.log('دریافت اطلاعات کاربر احراز هویت شده');
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
      this.logSuccess('اطلاعات کاربر با موفقیت دریافت شد', data);
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
    this.log('شروع فرآیند ثبت دستگاه WebAuthn');
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
      await this.handleAuthSuccess(data, 'ثبت دستگاه');
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
    this.log('شروع فرآیند احراز هویت با WebAuthn');
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
      await this.handleAuthSuccess(data, 'احراز هویت با دستگاه');
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

  clearLogs(): void {
    this.logs = [];
  }

  get state(): AuthState | undefined {
    return this.session ?? this.lastAuthResponse;
  }

  private async handleAuthSuccess(response: AuthResponse, context: string): Promise<void> {
    this.setToken(response);
    this.lastAuthResponse = response;
    this.logSuccess(`${context} با موفقیت انجام شد`, response);
    await this.refreshSession();
  }

  private setToken(response: AuthResponse): void {
    const tokenType = response.token_type || 'Bearer';
    this.authToken = `${tokenType} ${response.access_token}`;
  }

  private ensureToken(): boolean {
    if (!this.authToken) {
      this.notification.warning('نیاز به ورود', 'ابتدا وارد حساب خود شوید.');
      this.logError('هیچ توکن احراز هویتی در دسترس نیست');
      return false;
    }
    return true;
  }

  private ensureWebAuthnAvailable(): boolean {
    if (!('credentials' in navigator)) {
      this.notification.error('خطا', 'مرورگر شما از WebAuthn پشتیبانی نمی‌کند.');
      this.logError('WebAuthn API در دسترس نیست');
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
    this.logError(message, err);
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
    this.log(`HTTP ${options?.method || 'GET'} ${url}`, options?.body);
    const response = await fetch(url, options);
    this.logSuccess(`HTTP ${response.status} ${url}`);
    return response;
  }

  private async readJson<T>(response: Response): Promise<T> {
    const text = await response.text();
    if (!text) {
      return {} as T;
    }
    try {
      return JSON.parse(text) as T;
    } catch (error) {
      this.logError('تجزیه JSON با خطا مواجه شد', error as Error);
      throw error;
    }
  }

  private log(message: string, meta?: unknown, level: LogLevel = 'info'): void {
    const entry: LogEntry = {
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour12: false }),
      level,
      message,
      detail: this.formatMeta(meta),
    };

    this.logs = [...this.logs, entry];
    this.scheduleLogScroll();
  }

  private logSuccess(message: string, meta?: unknown): void {
    this.log(message, meta, 'success');
  }

  private logError(message: string, meta?: unknown): void {
    this.log(message, meta, 'error');
  }

  private scheduleLogScroll(): void {
    const scheduler = typeof queueMicrotask === 'function' ? queueMicrotask : (cb: () => void) => Promise.resolve().then(cb);
    scheduler(() => this.scrollLogsToBottom());
  }

  private scrollLogsToBottom(): void {
    const element = this.logContainer?.nativeElement;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }

  private formatMeta(meta: unknown): string | undefined {
    if (meta instanceof Error) {
      return `${meta.name}: ${meta.message}`;
    }
    if (meta === undefined || meta === null || meta === '') {
      return undefined;
    }
    if (typeof meta === 'string') {
      return meta;
    }
    try {
      return JSON.stringify(meta, null, 2);
    } catch {
      return '(unserializable data)';
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
