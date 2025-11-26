import 'zone.js/node';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';

// FIRMA OBLIGATORIA para Vite SSR: default export function que recibe context
export default function bootstrap(context: unknown) {
  return bootstrapApplication(App, {
    ...config,
    context
  } as any);
}
