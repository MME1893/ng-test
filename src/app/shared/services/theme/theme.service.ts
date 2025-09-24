import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeType = 'default' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly themeKey = 'app-theme';
  private previousTheme: ThemeType | null = null;
  public currentTheme = new BehaviorSubject<ThemeType>('default');

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    let initialTheme: ThemeType;
    const savedTheme = localStorage.getItem(this.themeKey) as ThemeType;

    if (savedTheme) {
      initialTheme = savedTheme;
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      initialTheme = prefersDark ? 'dark' : 'default';
    }

    this.setTheme(initialTheme, true);
  }

  toggleTheme(): void {
    const nextTheme = this.currentTheme.value === 'default' ? 'dark' : 'default';
    if (!document.startViewTransition) {
      this.setTheme(nextTheme);
    } else {
      document.startViewTransition(() => {
        this.setTheme(nextTheme);
      })
    }
  }

  private setTheme(theme: ThemeType, firstLoad = false): void {
    if (!firstLoad) {
      this.previousTheme = this.currentTheme.value;
    }

    this.currentTheme.next(theme);
    localStorage.setItem(this.themeKey, theme);
    this.loadThemeStyles(firstLoad);
  }

  private loadThemeStyles(firstLoad: boolean): void {
    const theme = this.currentTheme.value;

    if (firstLoad) {
      document.documentElement.classList.add(theme);
    }

    this.loadCss(`${theme}.css`, theme).then(() => {
      if (!firstLoad) {
        document.documentElement.classList.add(theme);
      }
      this.removeUnusedTheme(this.previousTheme);
    }).catch(e => console.error("Error loading theme:", e));
  }

  private loadCss(href: string, id: string): Promise<Event> {
    return new Promise((resolve, reject) => {
      const style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = href;
      style.id = id;
      style.onload = resolve;
      style.onerror = reject;
      document.head.append(style);
    });
  }

  private removeUnusedTheme(theme: ThemeType | null): void {
    if (!theme) return;
    document.documentElement.classList.remove(theme);
    const removedThemeStyle = document.getElementById(theme);
    if (removedThemeStyle) {
      document.head.removeChild(removedThemeStyle);
    }
  }
}