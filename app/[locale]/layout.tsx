import type { Metadata } from "next";
import "./globals.css";
import {Providers} from "./providers";
import { GoogleAnalytics } from '@next/third-parties/google'
import Script from 'next/script'
import { Open_Sans, Roboto_Mono, Anek_Latin } from 'next/font/google'
import localFont from 'next/font/local'
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from '../../routing';
// Font files can be colocated inside of `app`
const dingTalkFont = localFont({
  src: 'fonts/DingTalk JinBuTi.ttf',
  display: 'swap',
  variable: '--font-dingtalk',
})

const kingsoftFont = localFont({
  src: 'fonts/Kingsoft_Cloud_Font.ttf',
  display: 'swap',
  variable: '--font-kingsoft',
})

const xinYiGuanHeiFont = localFont({
  src: 'fonts/ZiTiQuanXinYiGuanHeiTi.ttf',
  display: 'swap',
  variable: '--font-xinyiguanhei',
})

const alibabaFont = localFont({
  src: 'fonts/AlibabaPuHuiTi-3-55-Regular.ttf',
  display: 'swap',
  variable: '--font-alibaba',
})
 
const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  //👇 Add variable to our object
  variable: '--font-opensans',
})
 

//👇 Configure the object for our second font
const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
})

//👇 Configure the object for our second font
const ankeLatin = Anek_Latin({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-anke',
})
 
export const metadata: Metadata = {
 
  title: " PicProse - Better Cover Image Generator Tools",
  description: "PicProse is a better cover image generator tool for Medium, YouTube, BiliBili, Blog and more.",
};

export default async function RootLayout({
    children,
    params
  }: {
    children: React.ReactNode;
    params: Promise<{locale: string}>;
  }) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  return (
    <html lang={locale} className={`${openSans.variable} ${robotoMono.variable} ${ankeLatin.variable} ${dingTalkFont.variable} ${kingsoftFont.variable} ${xinYiGuanHeiFont.variable} ${alibabaFont.variable} font-sans light`}>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png"/>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png"/>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png"/>
        <link rel="manifest" href="/favicon/site.webmanifest"/>
        <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#5bbad5"/>
        <meta name="msapplication-TileColor" content="#da532c"/>
        <meta name="theme-color" content="#ffffff"/>
      </head>
      <body>
      <NextIntlClientProvider messages={messages}>
        <Providers>
          {children}
        </Providers>
      </NextIntlClientProvider>
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID!} />
      <Script defer src="https://us.umami.is/script.js" data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID!}></Script>
      
    </html>
  );
}