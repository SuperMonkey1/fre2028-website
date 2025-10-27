import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="nl-BE">
      <Head>
        {/* Primary Meta Tags */}
        <meta charSet="utf-8" />
        <link rel="icon" href="/logo/fre-logo.png" />
        
        {/* Geo Tags for Belgium/Leuven */}
        <meta name="geo.region" content="BE-VBR" />
        <meta name="geo.placename" content="Leuven" />
        <meta name="geo.position" content="50.879844;4.700518" />
        <meta name="ICBM" content="50.879844, 4.700518" />
        
        {/* Keywords for SEO */}
        <meta name="keywords" content="paraclimbing, paralympics, Leuven, België, Belgium, adaptive climbing, paraklimmen, gehandicaptensport, Los Angeles 2028, Frederik Leys, Fré Leys, klimmen Leuven, paraclimbing België, Paralympic athlete Belgium, sportklimmen, adaptive sports Belgium, IFSC paraclimbing, World Cup paraclimbing, paraclimbing.be" />
        
        {/* Verification Tags (add your codes when you have them) */}
        {/* <meta name="google-site-verification" content="YOUR_GOOGLE_CODE" /> */}
        {/* <meta name="msvalidate.01" content="YOUR_BING_CODE" /> */}
        
        {/* Fonts (if using Google Fonts or similar) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
