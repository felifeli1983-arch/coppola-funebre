export default function StructuredData() {
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FuneralHome',
    '@id': 'https://www.eredicoppola.com/#organization',
    name: 'Onoranze Funebri Coppola',
    url: 'https://www.eredicoppola.com',
    logo: 'https://www.eredicoppola.com/img/new/logo-hd.jpg',
    image: 'https://www.eredicoppola.com/img/new/reception.jpg',
    description:
      'Onoranze Funebri Coppola: casa funeraria, sala del commiato, servizi funebri 24h, previdenza funebre. Operiamo in tutta Italia.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Via Pietro Nenni 10 (Circumvallazione Esterna)',
      addressLocality: 'Mugnano di Napoli',
      addressRegion: 'NA',
      postalCode: '80018',
      addressCountry: 'IT',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 40.9067,
      longitude: 14.2117,
    },
    telephone: '+39 081 571 3888',
    email: 'info@eredicoppola.com',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '00:00',
        closes: '23:59',
      },
    ],
    areaServed: {
      '@type': 'Country',
      name: 'Italia',
    },
    sameAs: [],
    priceRange: '€€',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+39 081 571 3888',
        contactType: 'customer service',
        availableLanguage: ['Italian'],
        areaServed: 'IT',
        contactOption: 'TollFree',
      },
    ],
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://www.eredicoppola.com/#website',
    url: 'https://www.eredicoppola.com',
    name: 'Onoranze Funebri Coppola',
    publisher: { '@id': 'https://www.eredicoppola.com/#organization' },
    inLanguage: 'it-IT',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
    </>
  );
}
