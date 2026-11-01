#!/usr/bin/env node
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, relative, dirname, isAbsolute } from 'node:path';
import { createTheme } from '@primedesign/tokens';
const registry = {
  button: ['react', 'Button', 'ButtonProps'],
  input: ['react', 'Input', 'InputProps'],
  dialog: ['react', 'Dialog', 'DialogProps'],
  drawer: ['react', 'Drawer', 'DialogProps'],
  select: ['react', 'Select', 'SelectProps'],
  combobox: ['react', 'Combobox', 'ComboboxProps'],
  'date-picker': ['react', 'DatePicker', 'DatePickerProps'],
  'date-range-picker': ['react', 'DateRangePicker', 'DateRange'],
  tabs: ['react', 'Tabs'],
  badge: ['react', 'Badge'],
  'file-upload': ['react', 'FileUpload', 'Uploader'],
  'data-table': ['data', 'DataTable', 'DataTableProps'],
  'product-card': ['commerce', 'ProductCard', 'ProductCardProps'],
  'product-grid': ['commerce', 'ProductGrid'],
  'cart-summary': ['commerce', 'CartSummary'],
  'mini-cart': ['commerce', 'MiniCart'],
  'order-card': ['commerce', 'OrderCard'],
  'category-card': ['commerce', 'CategoryCard'],
  'promo-card': ['commerce', 'PromoCard'],
  'address-card': ['commerce', 'AddressCard'],
  'schema-form': ['forms', 'SchemaForm', 'SchemaField'],
  'app-shell': ['blocks', 'AppShell'],
  'ticket-list': ['blocks', 'TicketList', 'Ticket'],
  'conversation-view': ['blocks', 'ConversationView', 'Message'],
  'pricing-card': ['blocks', 'PricingCard'],
  'auth-card': ['blocks', 'AuthCard'],
};
const args = process.argv.slice(2),
  command = args.shift() ?? 'help',
  options = {},
  names = [];
try {
  while (args.length) {
    const arg = args.shift();
    if (arg.startsWith('--')) {
      if (['--force', '--dry-run', '--help'].includes(arg)) options[arg.slice(2)] = true;
      else if (['--cwd', '--brand', '--radius'].includes(arg)) {
        const value = args.shift();
        if (!value || value.startsWith('--')) throw new Error(`Missing value for ${arg}`);
        options[arg.slice(2)] = value;
      } else throw new Error(`Unknown option: ${arg}`);
    } else names.push(arg);
  }
  if (command === 'help' || options.help) {
    console.log(
      'PrimeDesign\n\n  primedesign init [--cwd path]\n  primedesign add button product-card [--cwd path]\n  primedesign theme --brand "#6254df" [--radius 16]\n  primedesign list\n\nOptions: --force, --dry-run. Existing files are never overwritten by default.',
    );
    process.exit(0);
  }
  if (command === 'list') {
    for (const [name, [pkg]] of Object.entries(registry))
      console.log(`${name.padEnd(22)} @primedesign/${pkg}`);
    process.exit(0);
  }
  const cwd = resolve(options.cwd ?? process.cwd());
  if (!existsSync(resolve(cwd, 'package.json')))
    throw new Error('Choose an existing application directory containing package.json');
  const safePath = (path) => {
    if (isAbsolute(path)) throw new Error('Use a project-relative output path');
    const absolute = resolve(cwd, path),
      rel = relative(cwd, absolute);
    if (
      rel.startsWith('..') ||
      isAbsolute(rel) ||
      rel.split(/[\\/]/).some((p) => p === '.git' || p === 'node_modules')
    )
      throw new Error('Output must stay inside your application source');
    return absolute;
  };
  const configPath = resolve(cwd, 'primedesign.config.json'),
    config = existsSync(configPath)
      ? JSON.parse(readFileSync(configPath, 'utf8'))
      : { components: 'src/components/ui', styles: 'src/styles' };
  const outputs = [];
  if (command === 'init') {
    outputs.push([
      'primedesign.config.json',
      JSON.stringify(
        {
          components: 'src/components/ui',
          styles: 'src/styles',
          locale: 'fa-IR',
          direction: 'rtl',
        },
        null,
        2,
      ) + '\n',
    ]);
    outputs.push([
      'src/components/prime-provider.tsx',
      `"use client";\nimport type { ReactNode } from "react";\nimport { PrimeProvider, ToastProvider } from "@primedesign/react";\n\nexport function Providers({ children }: { children: ReactNode }) {\n  return <PrimeProvider locale="fa-IR" defaultTheme="system"><ToastProvider>{children}</ToastProvider></PrimeProvider>;\n}\n`,
    ]);
    outputs.push([
      'src/styles/primedesign.css',
      '@import "@primedesign/css";\n/* Put brand-specific overrides below the import. */\n',
    ]);
  } else if (command === 'add') {
    if (!names.length) throw new Error('Specify at least one component; run primedesign list');
    for (const name of new Set(names)) {
      const entry = registry[name];
      if (!entry) throw new Error(`Unknown component: ${name}`);
      const [pkg, component, type] = entry;
      outputs.push([
        `${config.components}/${name}.tsx`,
        `"use client";\n// Your application owns this facade. Compose or wrap the component here.\nexport { ${component} } from "@primedesign/${pkg}";\n${type ? `export type { ${type} } from "@primedesign/${pkg}";\n` : ''}`,
      ]);
    }
  } else if (command === 'theme')
    outputs.push([
      `${config.styles}/primedesign-theme.css`,
      createTheme({
        brand: options.brand ?? '#6254df',
        radius: options.radius ? Number(options.radius) : 16,
      }),
    ]);
  else throw new Error(`Unknown command: ${command}`);
  const paths = outputs.map(([path, content]) => [safePath(path), content]);
  for (const [path] of paths)
    if (existsSync(path) && !options.force)
      throw new Error(`File already exists: ${relative(cwd, path)} (use --force to replace)`);
  for (const [path, content] of paths) {
    if (!options['dry-run']) {
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, content);
    }
    console.log(`${options['dry-run'] ? 'Would write' : 'Created'} ${relative(cwd, path)}`);
  }
  if (command === 'init')
    console.log(
      '\nInstall the local PrimeDesign tarballs (or publish to your registry first), import src/styles/primedesign.css once, then wrap the app in Providers.',
    );
} catch (error) {
  console.error(`PrimeDesign: ${error.message}`);
  process.exitCode = 1;
}
