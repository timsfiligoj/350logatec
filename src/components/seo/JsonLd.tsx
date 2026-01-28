export function JsonLd() {
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "350logatec",
    "description": "Koledar odvoza odpadkov za občino Logatec. Preverite kdaj je odvoz smeti, embalaže in bioloških odpadkov.",
    "url": "https://www.350logatec.si",
    "logo": "https://www.350logatec.si/logo_350logatec.png",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Logatec",
      "addressRegion": "Osrednjeslovenska",
      "postalCode": "1370",
      "addressCountry": "SI"
    },
    "areaServed": {
      "@type": "City",
      "name": "Logatec",
      "containedInPlace": {
        "@type": "Country",
        "name": "Slovenija"
      }
    },
    "serviceType": "Informacije o odvozu odpadkov",
    "knowsLanguage": "sl"
  }

  const webApplication = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "350logatec",
    "description": "Aplikacija za pregled koledarja odvoza odpadkov v Logatcu",
    "url": "https://www.350logatec.si",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR"
    }
  }

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Kdaj je odvoz odpadkov v Logatcu?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Odvoz odpadkov v Logatcu je odvisen od vašega okoliša. Obiščite 350logatec.si in izberite svoj okoliš za točne datume odvoza smeti, embalaže in bioloških odpadkov."
        }
      },
      {
        "@type": "Question",
        "name": "Kako izvem kateri okoliš odvoza imam?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Na 350logatec.si lahko izberete svoj E/M okoliš (za embalažo in mešane odpadke) ter Bio okoliš (za biološke odpadke) glede na vašo lokacijo v Logatcu."
        }
      },
      {
        "@type": "Question",
        "name": "Kako pogosto odvažajo smeti v Logatcu?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Mešani komunalni odpadki se odvažajo na 14 dni, embalaža na 14 dni, biološki odpadki pa tedensko v poletnih mesecih in na 14 dni v zimskih mesecih."
        }
      },
      {
        "@type": "Question",
        "name": "Ali lahko dobim obvestilo pred odvozom odpadkov?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Da, na 350logatec.si se lahko registrirate in vklopite e-poštna obvestila, ki vas opozorijo dan pred odvozom odpadkov."
        }
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplication) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
    </>
  )
}
