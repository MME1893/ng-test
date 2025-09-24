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

type LogLevel = 'info' | 'success' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  detail?: string;
}

interface WebAuthnDevice {
  credential_id: string;
  sign_count: number;
  device_name?: string;
  created_at?: string;
  last_used?: string;
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
  styleUrls: ['./temp-auth.component.scss']
})
export class TempAuthComponent implements OnInit {
  @ViewChild('logContainer') private logContainer?: ElementRef<HTMLDivElement>;

  apiBase = 'http://localhost:8001/api';
  authToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJtb2hhbW1hZCIsImF1dGhfc3RhZ2UiOiJwYXNzd29yZF92ZXJpZmllZCIsIndlYmF1dGhuX3JlcXVpcmVkIjp0cnVlLCJ3ZWJhdXRobl9jb21wbGV0ZWQiOmZhbHNlLCJleHAiOjE3NTg5MTAzNzJ9.uIehYsRMdzxf4rBqm9W6ddkfOknP3WpSJV-KDdbC1hk';
  credentialId = '';

  logs: LogEntry[] = [];
  devices: WebAuthnDevice[] = [];

  loading = {
    register: false,
    authenticate: false,
    list: false,
    delete: false,
    getMe: false,
  };

  private readonly notification = inject(NzNotificationService);

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.listDevices();
    }
  }

  logColor(level: LogLevel): string {
    switch (level) {
      case 'success':
        return 'green';
      case 'error':
        return 'red';
      default:
        return 'blue';
    }
  }

  async startRegistration(retrying = false): Promise<void> {
    if (!('credentials' in navigator)) {
      this.logError('WebAuthn API در دسترس نیست', new Error('navigator.credentials not available'));
      this.notification.error('خطا', 'مرورگر شما از WebAuthn پشتیبانی نمی‌کند.');
      return;
    }

    this.loading.register = true;
    this.log('شروع فرآیند ثبت نام');
    try {
      const response = await this.fetchWithLogging(`${this.getApiBase()}/webauthn/registration/start`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const body = await response.text();
        this.logError('registration/start با خطا مواجه شد', new Error(body || response.statusText));
        return;
      }

      const { publicKey } = await this.readJson<{ publicKey: any }>(response);
      const excludedIds = (publicKey?.exclude_credentials ?? publicKey?.excludeCredentials ?? []).map((cred: any) => cred.id as string);

      if (excludedIds.length) {
        const cleared = await this.handleExcludedCredentials(excludedIds);
        if (!cleared) {
          return;
        }

        if (!retrying) {
          this.log('تلاش مجدد برای ثبت‌نام پس از حذف اطلاعات قبلی');
          await this.startRegistration(true);
          return;
        }
      }

      const options = this.normaliseRegistrationOptions(publicKey);
      this.log('در حال فراخوانی navigator.credentials.create', options);
      const credential = await navigator.credentials.create({ publicKey: options });
      this.logSuccess('گواهی جدید ساخته شد', credential);

      if (!credential || credential.type !== 'public-key') {
        this.logError('گواهی بازگشتی نامعتبر بود', new Error('Unsupported credential type'));
        return;
      }

      const publicKeyCredential = credential as PublicKeyCredential;

      const payload = {
        id: publicKeyCredential.id,
        rawId: this.bufferEncode(publicKeyCredential.rawId),
        type: publicKeyCredential.type,
        response: {
          clientDataJSON: this.bufferEncode(publicKeyCredential.response.clientDataJSON),
          attestationObject: this.bufferEncode((publicKeyCredential.response as AuthenticatorAttestationResponse).attestationObject),
        },
      };

      this.log('ارسال اطلاعات تکمیل ثبت‌نام', payload);
      const finish = await this.fetchWithLogging(`${this.getApiBase()}/webauthn/registration/complete`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const result = await this.readJson(finish);
      if (!finish.ok) {
        this.logError('registration/complete با خطا مواجه شد', new Error(JSON.stringify(result)));
        return;
      }

      this.logSuccess('ثبت‌نام با موفقیت تکمیل شد', result);
      this.notification.success('ثبت‌نام موفق', 'دستگاه با موفقیت ثبت شد.');
      await this.listDevices();
    } catch (error) {
      if ((error as Error)?.name === 'InvalidStateError') {
        this.logError('این دستگاه قبلاً ثبت شده است.', error as Error);
        this.notification.warning('هشدار', 'این دستگاه قبلاً ثبت شده است. ابتدا آن را حذف کنید.');
      } else if ((error as Error)?.name === 'NotAllowedError') {
        this.logError('فرآیند ثبت‌نام لغو یا منقضی شد.', error as Error);
      } else {
        this.logError('خطا در startRegistration', error as Error);
      }
    } finally {
      this.loading.register = false;
    }
  }

  async startAuthentication(): Promise<void> {
    if (!('credentials' in navigator)) {
      this.logError('WebAuthn API در دسترس نیست', new Error('navigator.credentials not available'));
      this.notification.error('خطا', 'مرورگر شما از WebAuthn پشتیبانی نمی‌کند.');
      return;
    }

    this.loading.authenticate = true;
    this.log('شروع فرآیند احراز هویت');
    try {
      const response = await this.fetchWithLogging(`${this.getApiBase()}/webauthn/authentication/start`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const body = await response.text();
        this.logError('authentication/start با خطا مواجه شد', new Error(body || response.statusText));
        return;
      }

      const { publicKey } = await this.readJson<{ publicKey: PublicKeyCredentialRequestOptions & Record<string, unknown> }>(response);
      const options = this.normaliseAuthenticationOptions(publicKey);
      this.log('در حال فراخوانی navigator.credentials.get', options);
      const credential = await navigator.credentials.get({ publicKey: options });
      this.logSuccess('داده احراز هویت دریافت شد', credential);

      if (!credential || credential.type !== 'public-key') {
        this.logError('گواهی بازگشتی نامعتبر بود', new Error('Unsupported credential type'));
        return;
      }

      const assertion = credential as PublicKeyCredential;
      const authResponse = assertion.response as AuthenticatorAssertionResponse;

      const payload = {
        id: assertion.id,
        rawId: this.bufferEncode(assertion.rawId),
        type: assertion.type,
        response: {
          authenticatorData: this.bufferEncode(authResponse.authenticatorData),
          clientDataJSON: this.bufferEncode(authResponse.clientDataJSON),
          signature: this.bufferEncode(authResponse.signature),
          userHandle: authResponse.userHandle ? this.bufferEncode(authResponse.userHandle) : null,
        },
      };

      this.log('ارسال اطلاعات تکمیل احراز هویت', payload);
      const finish = await this.fetchWithLogging(`${this.getApiBase()}/webauthn/authentication/complete`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const result = await this.readJson(finish);
      if (!finish.ok) {
        this.logError('authentication/complete با خطا مواجه شد', new Error(JSON.stringify(result)));
        return;
      }

      this.logSuccess('احراز هویت با موفقیت انجام شد', result);
      this.notification.success('احراز هویت موفق', 'ورود با موفقیت انجام شد.');
    } catch (error) {
      if ((error as Error)?.name === 'NotAllowedError') {
        this.logError('فرآیند احراز هویت لغو یا منقضی شد.', error as Error);
      } else {
        this.logError('خطا در startAuthentication', error as Error);
      }
    } finally {
      this.loading.authenticate = false;
    }
  }

  async listDevices(): Promise<void> {
    this.loading.list = true;
    this.log('دریافت فهرست دستگاه‌ها');
    try {
      const response = await this.fetchWithLogging(`${this.getApiBase()}/webauthn/devices`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.readJson<WebAuthnDevice[]>(response);
      if (!response.ok) {
        this.logError('دریافت دستگاه‌ها با خطا مواجه شد', new Error(JSON.stringify(result)));
        return;
      }

      this.devices = Array.isArray(result) ? result : [];
      this.logSuccess('دستگاه‌ها با موفقیت دریافت شدند', result);
    } catch (error) {
      this.logError('خطا در listDevices', error as Error);
    } finally {
      this.loading.list = false;
    }
  }

  async deleteDevice(): Promise<void> {
    if (!this.credentialId.trim()) {
      this.logError('شناسه اعتبارنامه الزامی است', new Error('Credential id is required'));
      this.notification.warning('هشدار', 'لطفاً شناسه اعتبارنامه را وارد کنید.');
      return;
    }

    this.loading.delete = true;
    this.log('حذف دستگاه با شناسه وارد شده');
    try {
      const deleted = await this.deleteCredentialById(this.credentialId.trim());
      if (!deleted) {
        return;
      }

      this.notification.success('حذف موفق', 'دستگاه با موفقیت حذف شد.');
      this.credentialId = '';
      await this.listDevices();
    } catch (error) {
      this.logError('خطا در deleteDevice', error as Error);
    } finally {
      this.loading.delete = false;
    }
  }

  async getMe(): Promise<void> {
    this.loading.getMe = true;
    this.log('دریافت اطلاعات کاربر جاری');
    try {
      const response = await this.fetchWithLogging(`${this.getApiBase()}/authentication/me`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.readJson(response);
      if (!response.ok) {
        this.logError('دریافت اطلاعات کاربر با خطا مواجه شد', new Error(JSON.stringify(result)));
        return;
      }

      this.logSuccess('اطلاعات کاربر دریافت شد', result);
      this.notification.info('اطلاعات کاربر', JSON.stringify(result, null, 2));
    } catch (error) {
      this.logError('خطا در getMe', error as Error);
    } finally {
      this.loading.getMe = false;
    }
  }

  clearLog(): void {
    this.log('پاکسازی گزارش‌ها فراخوانی شد');
    this.logs = [];
    this.notification.info('گزارش‌ها پاک شدند', 'تاریخچه وقایع حذف شد.');
  }

  private getApiBase(): string {
    return this.apiBase.trim().replace(/\/$/, '');
  }

  private getAuthHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.authToken.trim();
    if (token) {
      headers['Authorization'] = token;
    }

    this.log('هدرهای احراز هویت آماده شد', headers);
    return headers;
  }

  private timestamp(): string {
    return new Date().toISOString().replace('T', ' ').replace('Z', '');
  }

  private log(message: string, meta?: unknown, level: LogLevel = 'info'): void {
    if (meta instanceof Error) {
      console.error(`[${this.timestamp()}]`, message, meta);
    } else {
      console.log(`[${this.timestamp()}]`, message, meta ?? '');
    }

    const entry: LogEntry = {
      timestamp: this.timestamp(),
      level,
      message,
      detail: this.formatMeta(meta),
    };

    this.logs = [...this.logs, entry];
    this.scheduleLogScroll();
  }

  private logError(message: string, error?: unknown): void {
    this.log(message, error, 'error');
  }

  private logSuccess(message: string, data?: unknown): void {
    this.log(message, data, 'success');
  }

  private scheduleLogScroll(): void {
    const scheduler = typeof queueMicrotask === 'function'
      ? queueMicrotask
      : (cb: () => void) => Promise.resolve().then(cb);
    scheduler(() => this.scrollLogToBottom());
  }

  private scrollLogToBottom(): void {
    const element = this.logContainer?.nativeElement;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }

  private formatMeta(meta?: unknown): string | undefined {
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

  private async fetchWithLogging(url: string, options?: RequestInit): Promise<Response> {
    let bodyForLog: unknown;
    if (options?.body && typeof options.body === 'string') {
      try {
        bodyForLog = JSON.parse(options.body);
      } catch {
        bodyForLog = '(body not JSON)';
      }
    } else if (options?.body) {
      bodyForLog = options.body;
    }

    this.log(`HTTP ${options?.method || 'GET'} ${url}`, bodyForLog);
    const response = await fetch(url, options);
    this.logSuccess(`HTTP ${response.status} ${url}`);
    return response;
  }

  private async deleteCredentialById(credentialId: string): Promise<boolean> {
    const response = await this.fetchWithLogging(`${this.getApiBase()}/webauthn/devices/${encodeURIComponent(credentialId)}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logError('حذف دستگاه با خطا مواجه شد', new Error(body || response.statusText));
      return false;
    }

    this.logSuccess('دستگاه حذف شد', credentialId);
    return true;
  }

  private async handleExcludedCredentials(encodedIds: string[]): Promise<boolean> {
    if (!encodedIds.length) {
      return true;
    }

    this.logError('این دستگاه از قبل ثبت شده است', { encodedIds });
    const confirmed = window.confirm(
      `این دستگاه قبلاً ${encodedIds.length} اعتبارنامه ثبت شده دارد.\n` +
      `مرورگر کروم از ثبت دوباره جلوگیری می‌کند تا زمانی که آن‌ها را حذف کنید.\n\n` +
      `برای حذف خودکار و تلاش مجدد روی OK کلیک کنید.`
    );

    if (!confirmed) {
      this.log('فرآیند ثبت‌نام توسط کاربر لغو شد.');
      return false;
    }

    for (const credentialId of encodedIds) {
      const deleted = await this.deleteCredentialById(credentialId);
      if (!deleted) {
        this.logError('حذف خودکار اعتبارنامه با خطا مواجه شد', new Error(credentialId));
        return false;
      }
    }

    await this.listDevices();
    this.logSuccess('اعتبارنامه‌های قبلی حذف شدند. لطفاً دوباره تلاش کنید.');
    return true;
  }

  private async readJson<T = any>(response: Response): Promise<T> {
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

  private convertProperty(object: Record<string, any>, from: string, to: string): void {
    if (object && Object.hasOwn(object, from)) {
      object[to] = object[from];
      delete object[from];
    }
  }

  private normaliseRegistrationOptions(publicKey: any): PublicKeyCredentialCreationOptions {
    this.log('نرمال‌سازی گزینه‌های ثبت‌نام', publicKey);
    const copy: any = typeof structuredClone === 'function'
      ? structuredClone(publicKey)
      : JSON.parse(JSON.stringify(publicKey));

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

    this.logSuccess('گزینه‌های ثبت‌نام آماده شد', copy);
    return copy as PublicKeyCredentialCreationOptions;
  }

  private normaliseAuthenticationOptions(publicKey: any): PublicKeyCredentialRequestOptions {
    this.log('نرمال‌سازی گزینه‌های احراز هویت', publicKey);
    const copy: any = typeof structuredClone === 'function'
      ? structuredClone(publicKey)
      : JSON.parse(JSON.stringify(publicKey));

    copy.challenge = this.bufferDecode(copy.challenge);

    const allowCredentials = (copy.allow_credentials ?? copy.allowCredentials ?? []).map((cred: any) => ({
      ...cred,
      id: this.toBufferSource(cred.id),
    }));

    copy.allowCredentials = allowCredentials;
    delete copy.allow_credentials;

    if (copy.authenticator_selection) {
      this.convertProperty(copy, 'authenticator_selection', 'authenticatorSelection');
    }

    if (copy.authenticatorSelection) {
      this.convertProperty(copy.authenticatorSelection, 'user_verification', 'userVerification');
      this.convertProperty(copy.authenticatorSelection, 'resident_key', 'residentKey');
      this.convertProperty(copy.authenticatorSelection, 'require_resident_key', 'requireResidentKey');
    }

    this.logSuccess('گزینه‌های احراز هویت آماده شد', copy);
    return copy as PublicKeyCredentialRequestOptions;
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
      return value as ArrayBuffer | ArrayBufferView;
    }

    if (typeof value === 'string') {
      return this.bufferDecode(value);
    }

    throw new TypeError('Unsupported credential buffer value');
  }
}
