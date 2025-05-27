export interface TimezoneOption {
  value: string;
  label: string;
  abbreviation?: string;
}

export interface TimezoneGroup {
  label: string;
  options: TimezoneOption[];
}

export const CITY_TIMEZONES: TimezoneGroup[] = [
  {
    label: 'Africa',
    options: [
      {
        value: 'Africa/Algiers',
        label: 'Algeria / Algiers (CET)',
        abbreviation: 'CET'
      },
      {
        value: 'Africa/Luanda',
        label: 'Angola / Luanda (WAT)',
        abbreviation: 'WAT'
      },
      {
        value: 'Africa/Porto-Novo',
        label: 'Benin / Porto-Novo (WAT)',
        abbreviation: 'WAT'
      },
      {
        value: 'Africa/Gaborone',
        label: 'Botswana / Gaborone (CAT)',
        abbreviation: 'CAT'
      },
      {
        value: 'Africa/Ouagadougou',
        label: 'Burkina Faso / Ouagadougou (GMT)',
        abbreviation: 'GMT'
      },
      {
        value: 'Africa/Bujumbura',
        label: 'Burundi / Bujumbura (CAT)',
        abbreviation: 'CAT'
      },
      {
        value: 'Africa/Douala',
        label: 'Cameroon / Douala (WAT)',
        abbreviation: 'WAT'
      },
      {
        value: 'Atlantic/Cape_Verde',
        label: 'Cape Verde / Praia (CVT)',
        abbreviation: 'CVT'
      },
      {
        value: 'Africa/Bangui',
        label: 'Central African Republic / Bangui (WAT)',
        abbreviation: 'WAT'
      },
      {
        value: 'Africa/Ndjamena',
        label: 'Chad / N\'Djamena (WAT)',
        abbreviation: 'WAT'
      },
      {
        value: 'Indian/Comoro',
        label: 'Comoros / Moroni (EAT)',
        abbreviation: 'EAT'
      },
      {
        value: 'Africa/Abidjan',
        label: 'C\u00f4te d\'Ivoire / Abidjan (GMT)',
        abbreviation: 'GMT'
      },
      {
        value: 'Africa/Djibouti',
        label: 'Djibouti / Djibouti (EAT)',
        abbreviation: 'EAT'
      },
      {
        value: 'Africa/Kinshasa',
        label: 'DR Congo / Kinshasa (WAT)',
        abbreviation: 'WAT'
      },
      {
        value: 'Africa/Lubumbashi',
        label: 'DR Congo / Lubumbashi (CAT)',
        abbreviation: 'CAT'
      },
      {
        value: 'Africa/Cairo',
        label: 'Egypt / Cairo (EET)',
        abbreviation: 'EET'
      },
      {
        value: 'Africa/Malabo',
        label: 'Equatorial Guinea / Malabo (WAT)',
        abbreviation: 'WAT'
      },
      {
        value: 'Africa/Asmara',
        label: 'Eritrea / Asmara (EAT)',
        abbreviation: 'EAT'
      },
      {
        value: 'Africa/Mbabane',
        label: 'Eswatini / Mbabane (SAST)',
        abbreviation: 'SAST'
      },
      {
        value: 'Africa/Addis_Ababa',
        label: 'Ethiopia / Addis Ababa (EAT)',
        abbreviation: 'EAT'
      },
      {
        value: 'Africa/Libreville',
        label: 'Gabon / Libreville (WAT)',
        abbreviation: 'WAT'
      },
      {
        value: 'Africa/Banjul',
        label: 'Gambia / Banjul (GMT)',
        abbreviation: 'GMT'
      },
      {
        value: 'Africa/Accra',
        label: 'Ghana / Accra (GMT)',
        abbreviation: 'GMT'
      },
      {
        value: 'Africa/Conakry',
        label: 'Guinea / Conakry (GMT)',
        abbreviation: 'GMT'
      },
      {
        value: 'Africa/Bissau',
        label: 'Guinea-Bissau / Bissau (GMT)',
        abbreviation: 'GMT'
      },
      {
        value: 'Africa/Nairobi',
        label: 'Kenya / Nairobi (EAT)',
        abbreviation: 'EAT'
      },
      {
        value: 'Africa/Maseru',
        label: 'Lesotho / Maseru (SAST)',
        abbreviation: 'SAST'
      },
      {
        value: 'Africa/Monrovia',
        label: 'Liberia / Monrovia (GMT)',
        abbreviation: 'GMT'
      },
      {
        value: 'Africa/Tripoli',
        label: 'Libya / Tripoli (EET)',
        abbreviation: 'EET'
      },
      {
        value: 'Indian/Antananarivo',
        label: 'Madagascar / Antananarivo (EAT)',
        abbreviation: 'EAT'
      },
      {
        value: 'Africa/Blantyre',
        label: 'Malawi / Blantyre (CAT)',
        abbreviation: 'CAT'
      },
      {
        value: 'Africa/Bamako',
        label: 'Mali / Bamako (GMT)',
        abbreviation: 'GMT'
      },
      {
        value: 'Africa/Nouakchott',
        label: 'Mauritania / Nouakchott (GMT)',
        abbreviation: 'GMT'
      },
      {
        value: 'Indian/Mauritius',
        label: 'Mauritius / Port Louis (MUT)',
        abbreviation: 'MUT'
      },
      {
        value: 'Indian/Mayotte',
        label: 'Mayotte / Mamoudzou (EAT)',
        abbreviation: 'EAT'
      },
      {
        value: 'Africa/Casablanca',
        label: 'Morocco / Casablanca (WET)',
        abbreviation: 'WET'
      },
      {
        value: 'Africa/Maputo',
        label: 'Mozambique / Maputo (CAT)',
        abbreviation: 'CAT'
      },
      {
        value: 'Africa/Windhoek',
        label: 'Namibia / Windhoek (WAT)',
        abbreviation: 'WAT'
      },
      {
        value: 'Africa/Niamey',
        label: 'Niger / Niamey (WAT)',
        abbreviation: 'WAT'
      },
      {
        value: 'Africa/Lagos',
        label: 'Nigeria / Lagos (WAT)',
        abbreviation: 'WAT'
      },
      {
        value: 'Africa/Brazzaville',
        label: 'Republic of the Congo / Brazzaville (WAT)',
        abbreviation: 'WAT'
      },
      {
        value: 'Africa/Kigali',
        label: 'Rwanda / Kigali (CAT)',
        abbreviation: 'CAT'
      },
      {
        value: 'Indian/Reunion',
        label: 'R\u00e9union / Saint-Denis (RET)',
        abbreviation: 'RET'
      },
      {
        value: 'Atlantic/St_Helena',
        label: 'Saint Helena / Jamestown (GMT)',
        abbreviation: 'GMT'
      },
      {
        value: 'Africa/Dakar',
        label: 'Senegal / Dakar (GMT)',
        abbreviation: 'GMT'
      },
      {
        value: 'Africa/Freetown',
        label: 'Sierra Leone / Freetown (GMT)',
        abbreviation: 'GMT'
      },
      {
        value: 'Africa/Mogadishu',
        label: 'Somalia / Mogadishu (EAT)',
        abbreviation: 'EAT'
      },
      {
        value: 'Africa/Johannesburg',
        label: 'South Africa / Johannesburg (SAST)',
        abbreviation: 'SAST'
      },
      {
        value: 'Africa/Juba',
        label: 'South Sudan / Juba (EAT)',
        abbreviation: 'EAT'
      },
      {
        value: 'Atlantic/Canary',
        label: 'Spain / Canary Islands (WET/WEST)',
        abbreviation: 'WET'
      },
      {
        value: 'Africa/Ceuta',
        label: 'Spain / Ceuta (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Africa/Khartoum',
        label: 'Sudan / Khartoum (EAT)',
        abbreviation: 'EAT'
      },
      {
        value: 'Africa/Sao_Tome',
        label: 'S\u00e3o Tom\u00e9 and Pr\u00edncipe / S\u00e3o Tom\u00e9 (GMT)',
        abbreviation: 'GMT'
      },
      {
        value: 'Africa/Dar_es_Salaam',
        label: 'Tanzania / Dar es Salaam (EAT)',
        abbreviation: 'EAT'
      },
      {
        value: 'Africa/Lome',
        label: 'Togo / Lom\u00e9 (GMT)',
        abbreviation: 'GMT'
      },
      {
        value: 'Africa/Tunis',
        label: 'Tunisia / Tunis (CET)',
        abbreviation: 'CET'
      },
      {
        value: 'Africa/Kampala',
        label: 'Uganda / Kampala (EAT)',
        abbreviation: 'EAT'
      },
      {
        value: 'Africa/Lusaka',
        label: 'Zambia / Lusaka (CAT)',
        abbreviation: 'CAT'
      },
      {
        value: 'Africa/Harare',
        label: 'Zimbabwe / Harare (CAT)',
        abbreviation: 'CAT'
      }
    ]
  },
  {
    label: 'Antarctica',
    options: [
      {
        value: 'Antarctica/Casey',
        label: 'Antarctica / Casey Station (AWST)',
        abbreviation: 'AWST'
      },
      {
        value: 'Antarctica/Davis',
        label: 'Antarctica / Davis Station (DAVT)',
        abbreviation: 'DAVT'
      },
      {
        value: 'Antarctica/DumontDUrville',
        label: 'Antarctica / Dumont d\'Urville Station (DDUT)',
        abbreviation: 'DDUT'
      },
      {
        value: 'Antarctica/Mawson',
        label: 'Antarctica / Mawson Station (MAWT)',
        abbreviation: 'MAWT'
      },
      {
        value: 'Antarctica/McMurdo',
        label: 'Antarctica / McMurdo Station (NZST/NZDT)',
        abbreviation: 'NZST'
      },
      {
        value: 'Antarctica/Palmer',
        label: 'Antarctica / Palmer Station (CLT)',
        abbreviation: 'CLT'
      },
      {
        value: 'Antarctica/Rothera',
        label: 'Antarctica / Rothera Station (ROTT)',
        abbreviation: 'ROTT'
      },
      {
        value: 'Antarctica/Syowa',
        label: 'Antarctica / Syowa Station (SYOT)',
        abbreviation: 'SYOT'
      },
      {
        value: 'Antarctica/Troll',
        label: 'Antarctica / Troll Station (UTC)',
        abbreviation: 'UTC'
      },
      {
        value: 'Antarctica/Vostok',
        label: 'Antarctica / Vostok Station (VOST)',
        abbreviation: 'VOST'
      }
    ]
  },
  {
    label: 'Asia',
    options: [
      {
        value: 'Asia/Kabul',
        label: 'Afghanistan / Kabul (AFT)',
        abbreviation: 'AFT'
      },
      {
        value: 'Asia/Yerevan',
        label: 'Armenia / Yerevan (AMT)',
        abbreviation: 'AMT'
      },
      {
        value: 'Asia/Baku',
        label: 'Azerbaijan / Baku (AZT)',
        abbreviation: 'AZT'
      },
      {
        value: 'Asia/Dhaka',
        label: 'Bangladesh / Dhaka (BDT)',
        abbreviation: 'BDT'
      },
      {
        value: 'Asia/Thimphu',
        label: 'Bhutan / Thimphu (BTT)',
        abbreviation: 'BTT'
      },
      {
        value: 'Asia/Brunei',
        label: 'Brunei / Bandar Seri Begawan (BNT)',
        abbreviation: 'BNT'
      },
      {
        value: 'Asia/Phnom_Penh',
        label: 'Cambodia / Phnom Penh (ICT)',
        abbreviation: 'ICT'
      },
      {
        value: 'Asia/Shanghai',
        label: 'China / Beijing (CST)',
        abbreviation: 'CST'
      },
      {
        value: 'Asia/Tbilisi',
        label: 'Georgia / Tbilisi (GET)',
        abbreviation: 'GET'
      },
      {
        value: 'Asia/Hong_Kong',
        label: 'Hong Kong / Hong Kong (HKT)',
        abbreviation: 'HKT'
      },
      {
        value: 'Asia/Kolkata',
        label: 'India / Kolkata (IST)',
        abbreviation: 'IST'
      },
      {
        value: 'Asia/Jakarta',
        label: 'Indonesia / Jakarta (WIB)',
        abbreviation: 'WIB'
      },
      {
        value: 'Asia/Tokyo',
        label: 'Japan / Tokyo (JST)',
        abbreviation: 'JST'
      },
      {
        value: 'Asia/Almaty',
        label: 'Kazakhstan / Almaty (ALMT)',
        abbreviation: 'ALMT'
      },
      {
        value: 'Asia/Bishkek',
        label: 'Kyrgyzstan / Bishkek (KGT)',
        abbreviation: 'KGT'
      },
      {
        value: 'Asia/Vientiane',
        label: 'Laos / Vientiane (ICT)',
        abbreviation: 'ICT'
      },
      {
        value: 'Asia/Macau',
        label: 'Macau / Macau (CST)',
        abbreviation: 'CST'
      },
      {
        value: 'Asia/Kuala_Lumpur',
        label: 'Malaysia / Kuala Lumpur (MYT)',
        abbreviation: 'MYT'
      },
      {
        value: 'Asia/Ulaanbaatar',
        label: 'Mongolia / Ulaanbaatar (ULAT)',
        abbreviation: 'ULAT'
      },
      {
        value: 'Asia/Yangon',
        label: 'Myanmar / Yangon (MMT)',
        abbreviation: 'MMT'
      },
      {
        value: 'Asia/Kathmandu',
        label: 'Nepal / Kathmandu (NPT)',
        abbreviation: 'NPT'
      },
      {
        value: 'Asia/Pyongyang',
        label: 'North Korea / Pyongyang (KST)',
        abbreviation: 'KST'
      },
      {
        value: 'Asia/Karachi',
        label: 'Pakistan / Karachi (PKT)',
        abbreviation: 'PKT'
      },
      {
        value: 'Asia/Manila',
        label: 'Philippines / Manila (PHT)',
        abbreviation: 'PHT'
      },
      {
        value: 'Asia/Singapore',
        label: 'Singapore / Singapore (SGT)',
        abbreviation: 'SGT'
      },
      {
        value: 'Asia/Seoul',
        label: 'South Korea / Seoul (KST)',
        abbreviation: 'KST'
      },
      {
        value: 'Asia/Colombo',
        label: 'Sri Lanka / Colombo (IST)',
        abbreviation: 'IST'
      },
      {
        value: 'Asia/Taipei',
        label: 'Taiwan / Taipei (CST)',
        abbreviation: 'CST'
      },
      {
        value: 'Asia/Dushanbe',
        label: 'Tajikistan / Dushanbe (TJT)',
        abbreviation: 'TJT'
      },
      {
        value: 'Asia/Bangkok',
        label: 'Thailand / Bangkok (ICT)',
        abbreviation: 'ICT'
      },
      {
        value: 'Asia/Dili',
        label: 'Timor-Leste / Dili (TLT)',
        abbreviation: 'TLT'
      },
      {
        value: 'Asia/Ashgabat',
        label: 'Turkmenistan / Ashgabat (TMT)',
        abbreviation: 'TMT'
      },
      {
        value: 'Asia/Tashkent',
        label: 'Uzbekistan / Tashkent (UZT)',
        abbreviation: 'UZT'
      },
      {
        value: 'Asia/Ho_Chi_Minh',
        label: 'Vietnam / Ho Chi Minh City (ICT)',
        abbreviation: 'ICT'
      }
    ]
  },
  {
    label: 'Australia',
    options: [
      {
        value: 'Australia/Adelaide',
        label: 'Australia / Adelaide (ACST/ACDT)',
        abbreviation: 'ACST'
      },
      {
        value: 'Australia/Brisbane',
        label: 'Australia / Brisbane (AEST)',
        abbreviation: 'AEST'
      },
      {
        value: 'Australia/Canberra',
        label: 'Australia / Canberra (AEST/AEDT)',
        abbreviation: 'AEST'
      },
      {
        value: 'Australia/Darwin',
        label: 'Australia / Darwin (ACST)',
        abbreviation: 'ACST'
      },
      {
        value: 'Australia/Hobart',
        label: 'Australia / Hobart (AEST/AEDT)',
        abbreviation: 'AEST'
      },
      {
        value: 'Australia/Melbourne',
        label: 'Australia / Melbourne (AEST/AEDT)',
        abbreviation: 'AEST'
      },
      {
        value: 'Australia/Perth',
        label: 'Australia / Perth (AWST)',
        abbreviation: 'AWST'
      },
      {
        value: 'Australia/Sydney',
        label: 'Australia / Sydney (AEST/AEDT)',
        abbreviation: 'AEST'
      }
    ]
  },
  {
    label: 'Canada',
    options: [
      {
        value: 'America/Edmonton',
        label: 'Canada / Alberta / Edmonton (MST/MDT)',
        abbreviation: 'MST'
      },
      {
        value: 'America/Vancouver',
        label: 'Canada / British Columbia / Vancouver (PST/PDT)',
        abbreviation: 'PST'
      },
      {
        value: 'America/Winnipeg',
        label: 'Canada / Manitoba / Winnipeg (CST/CDT)',
        abbreviation: 'CST'
      },
      {
        value: 'America/Moncton',
        label: 'Canada / New Brunswick / Moncton (AST/ADT)',
        abbreviation: 'AST'
      },
      {
        value: 'America/St_Johns',
        label: 'Canada / Newfoundland and Labrador / St. John\'s (NST/NDT)',
        abbreviation: 'NST'
      },
      {
        value: 'America/Yellowknife',
        label: 'Canada / Northwest Territories / Yellowknife (MST/MDT)',
        abbreviation: 'MST'
      },
      {
        value: 'America/Glace_Bay',
        label: 'Canada / Nova Scotia / Cape Breton (AST/ADT)',
        abbreviation: 'AST'
      },
      {
        value: 'America/Halifax',
        label: 'Canada / Nova Scotia / Halifax (AST/ADT)',
        abbreviation: 'AST'
      },
      {
        value: 'America/Iqaluit',
        label: 'Canada / Nunavut / Iqaluit (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'America/Toronto',
        label: 'Canada / Ontario / Toronto (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'America/Toronto',
        label: 'Canada / Quebec / Montreal (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'America/Regina',
        label: 'Canada / Saskatchewan / Regina (CST)',
        abbreviation: 'CST'
      },
      {
        value: 'America/Whitehorse',
        label: 'Canada / Yukon / Whitehorse (MST)',
        abbreviation: 'MST'
      }
    ]
  },
  {
    label: 'Caribbean',
    options: [
      {
        value: 'America/Anguilla',
        label: 'Anguilla / The Valley (AST)',
        abbreviation: 'AST'
      },
      {
        value: 'America/Antigua',
        label: 'Antigua and Barbuda / St. John\'s (AST)',
        abbreviation: 'AST'
      },
      {
        value: 'America/Aruba',
        label: 'Aruba / Oranjestad (AST)',
        abbreviation: 'AST'
      },
      {
        value: 'America/Nassau',
        label: 'Bahamas / Nassau (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'America/Barbados',
        label: 'Barbados / Bridgetown (AST)',
        abbreviation: 'AST'
      },
      {
        value: 'America/Kralendijk',
        label: 'Bonaire / Kralendijk (AST)',
        abbreviation: 'AST'
      },
      {
        value: 'America/Havana',
        label: 'Cuba / Havana (CST/CDT)',
        abbreviation: 'CST'
      },
      {
        value: 'America/Curacao',
        label: 'Cura\u00e7ao / Willemstad (AST)',
        abbreviation: 'AST'
      },
      {
        value: 'America/Dominica',
        label: 'Dominica / Roseau (AST)',
        abbreviation: 'AST'
      },
      {
        value: 'America/Santo_Domingo',
        label: 'Dominican Republic / Santo Domingo (AST)',
        abbreviation: 'AST'
      },
      {
        value: 'America/Grenada',
        label: 'Grenada / St. George\'s (AST)',
        abbreviation: 'AST'
      },
      {
        value: 'America/Guadeloupe',
        label: 'Guadeloupe / Basse-Terre (AST)',
        abbreviation: 'AST'
      },
      {
        value: 'America/Port-au-Prince',
        label: 'Haiti / Port-au-Prince (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'America/Jamaica',
        label: 'Jamaica / Kingston (EST)',
        abbreviation: 'EST'
      },
      {
        value: 'America/Martinique',
        label: 'Martinique / Fort-de-France (AST)',
        abbreviation: 'AST'
      },
      {
        value: 'America/Montserrat',
        label: 'Montserrat / Plymouth (AST)',
        abbreviation: 'AST'
      },
      {
        value: 'America/Puerto_Rico',
        label: 'Puerto Rico / San Juan (AST)',
        abbreviation: 'AST'
      },
      {
        value: 'America/St_Kitts',
        label: 'Saint Kitts and Nevis / Basseterre (AST)',
        abbreviation: 'AST'
      },
      {
        value: 'America/St_Lucia',
        label: 'Saint Lucia / Castries (AST)',
        abbreviation: 'AST'
      },
      {
        value: 'America/Marigot',
        label: 'Saint Martin / Marigot (AST)',
        abbreviation: 'AST'
      },
      {
        value: 'America/St_Vincent',
        label: 'Saint Vincent and the Grenadines / Kingstown (AST)',
        abbreviation: 'AST'
      },
      {
        value: 'America/Lower_Princes',
        label: 'Sint Maarten / Philipsburg (AST)',
        abbreviation: 'AST'
      },
      {
        value: 'America/Port_of_Spain',
        label: 'Trinidad and Tobago / Port of Spain (AST)',
        abbreviation: 'AST'
      },
      {
        value: 'America/Grand_Turk',
        label: 'Turks and Caicos / Grand Turk (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'America/St_Thomas',
        label: 'U.S. Virgin Islands / Charlotte Amalie (AST)',
        abbreviation: 'AST'
      }
    ]
  },
  {
    label: 'Central America',
    options: [
      {
        value: 'America/Belize',
        label: 'Belize / Belmopan (CST)',
        abbreviation: 'CST'
      },
      {
        value: 'America/Costa_Rica',
        label: 'Costa Rica / San Jos\u00e9 (CST)',
        abbreviation: 'CST'
      },
      {
        value: 'America/El_Salvador',
        label: 'El Salvador / San Salvador (CST)',
        abbreviation: 'CST'
      },
      {
        value: 'America/Guatemala',
        label: 'Guatemala / Guatemala City (CST)',
        abbreviation: 'CST'
      },
      {
        value: 'America/Tegucigalpa',
        label: 'Honduras / Tegucigalpa (CST)',
        abbreviation: 'CST'
      },
      {
        value: 'America/Managua',
        label: 'Nicaragua / Managua (CST)',
        abbreviation: 'CST'
      },
      {
        value: 'America/Panama',
        label: 'Panama / Panama City (EST)',
        abbreviation: 'EST'
      }
    ]
  },
  {
    label: 'Europe',
    options: [
      {
        value: 'Europe/Tirane',
        label: 'Albania / Tirana (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Andorra',
        label: 'Andorra / Andorra la Vella (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Vienna',
        label: 'Austria / Vienna (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Minsk',
        label: 'Belarus / Minsk (MSK)',
        abbreviation: 'MSK'
      },
      {
        value: 'Europe/Brussels',
        label: 'Belgium / Brussels (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Sarajevo',
        label: 'Bosnia and Herzegovina / Sarajevo (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Sofia',
        label: 'Bulgaria / Sofia (EET/EEST)',
        abbreviation: 'EET'
      },
      {
        value: 'Europe/Zagreb',
        label: 'Croatia / Zagreb (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Prague',
        label: 'Czech Republic / Prague (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Copenhagen',
        label: 'Denmark / Copenhagen (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Tallinn',
        label: 'Estonia / Tallinn (EET/EEST)',
        abbreviation: 'EET'
      },
      {
        value: 'Atlantic/Faroe',
        label: 'Faroe Islands / T\u00f3rshavn (WET)',
        abbreviation: 'WET'
      },
      {
        value: 'Europe/Helsinki',
        label: 'Finland / Helsinki (EET/EEST)',
        abbreviation: 'EET'
      },
      {
        value: 'Europe/Paris',
        label: 'France / Paris (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Berlin',
        label: 'Germany / Berlin (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Gibraltar',
        label: 'Gibraltar / Gibraltar (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Athens',
        label: 'Greece / Athens (EET/EEST)',
        abbreviation: 'EET'
      },
      {
        value: 'Europe/Guernsey',
        label: 'Guernsey / St Peter Port (GMT/BST)',
        abbreviation: 'GMT'
      },
      {
        value: 'Europe/Budapest',
        label: 'Hungary / Budapest (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Reykjavik',
        label: 'Iceland / Reykjavik (GMT)',
        abbreviation: 'GMT'
      },
      {
        value: 'Europe/Dublin',
        label: 'Ireland / Dublin (GMT/IST)',
        abbreviation: 'GMT'
      },
      {
        value: 'Europe/Isle_of_Man',
        label: 'Isle of Man / Douglas (GMT/BST)',
        abbreviation: 'GMT'
      },
      {
        value: 'Europe/Rome',
        label: 'Italy / Rome (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Jersey',
        label: 'Jersey / Saint Helier (GMT/BST)',
        abbreviation: 'GMT'
      },
      {
        value: 'Europe/Riga',
        label: 'Latvia / Riga (EET/EEST)',
        abbreviation: 'EET'
      },
      {
        value: 'Europe/Vilnius',
        label: 'Lithuania / Vilnius (EET/EEST)',
        abbreviation: 'EET'
      },
      {
        value: 'Europe/Luxembourg',
        label: 'Luxembourg / Luxembourg (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Malta',
        label: 'Malta / Valletta (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Chisinau',
        label: 'Moldova / Chi\u0219in\u0103u (EET/EEST)',
        abbreviation: 'EET'
      },
      {
        value: 'Europe/Monaco',
        label: 'Monaco / Monaco (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Podgorica',
        label: 'Montenegro / Podgorica (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Amsterdam',
        label: 'Netherlands / Amsterdam (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Skopje',
        label: 'North Macedonia / Skopje (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Oslo',
        label: 'Norway / Oslo (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Warsaw',
        label: 'Poland / Warsaw (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Lisbon',
        label: 'Portugal / Lisbon (WET/WEST)',
        abbreviation: 'WET'
      },
      {
        value: 'Europe/Bucharest',
        label: 'Romania / Bucharest (EET/EEST)',
        abbreviation: 'EET'
      },
      {
        value: 'Asia/Irkutsk',
        label: 'Russia / Irkutsk (IRKT)',
        abbreviation: 'IRKT'
      },
      {
        value: 'Europe/Kaliningrad',
        label: 'Russia / Kaliningrad (EET)',
        abbreviation: 'EET'
      },
      {
        value: 'Asia/Krasnoyarsk',
        label: 'Russia / Krasnoyarsk (KRAT)',
        abbreviation: 'KRAT'
      },
      {
        value: 'Asia/Magadan',
        label: 'Russia / Magadan (MAGT)',
        abbreviation: 'MAGT'
      },
      {
        value: 'Europe/Moscow',
        label: 'Russia / Moscow (MSK)',
        abbreviation: 'MSK'
      },
      {
        value: 'Asia/Novosibirsk',
        label: 'Russia / Novosibirsk (NOVT)',
        abbreviation: 'NOVT'
      },
      {
        value: 'Asia/Omsk',
        label: 'Russia / Omsk (OMST)',
        abbreviation: 'OMST'
      },
      {
        value: 'Asia/Kamchatka',
        label: 'Russia / Petropavlovsk-Kamchatsky (PETT)',
        abbreviation: 'PETT'
      },
      {
        value: 'Europe/Samara',
        label: 'Russia / Samara (SAMT)',
        abbreviation: 'SAMT'
      },
      {
        value: 'Asia/Vladivostok',
        label: 'Russia / Vladivostok (VLAT)',
        abbreviation: 'VLAT'
      },
      {
        value: 'Europe/Volgograd',
        label: 'Russia / Volgograd (MSK)',
        abbreviation: 'MSK'
      },
      {
        value: 'Asia/Yakutsk',
        label: 'Russia / Yakutsk (YAKT)',
        abbreviation: 'YAKT'
      },
      {
        value: 'Asia/Yekaterinburg',
        label: 'Russia / Yekaterinburg (YEKT)',
        abbreviation: 'YEKT'
      },
      {
        value: 'Europe/San_Marino',
        label: 'San Marino / San Marino (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Belgrade',
        label: 'Serbia / Belgrade (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Bratislava',
        label: 'Slovakia / Bratislava (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Ljubljana',
        label: 'Slovenia / Ljubljana (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Barcelona',
        label: 'Spain / Barcelona (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Madrid',
        label: 'Spain / Madrid (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Stockholm',
        label: 'Sweden / Stockholm (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Zurich',
        label: 'Switzerland / Zurich (CET/CEST)',
        abbreviation: 'CET'
      },
      {
        value: 'Europe/Istanbul',
        label: 'Turkey / Istanbul (TRT)',
        abbreviation: 'TRT'
      },
      {
        value: 'Europe/Kiev',
        label: 'Ukraine / Kyiv (EET/EEST)',
        abbreviation: 'EET'
      },
      {
        value: 'Europe/London',
        label: 'United Kingdom / London (GMT/BST)',
        abbreviation: 'GMT'
      },
      {
        value: 'Europe/Vatican',
        label: 'Vatican City / Vatican City (CET/CEST)',
        abbreviation: 'CET'
      }
    ]
  },
  {
    label: 'Mexico',
    options: [
      {
        value: 'America/Cancun',
        label: 'Mexico / Canc\u00fan (EST)',
        abbreviation: 'EST'
      },
      {
        value: 'America/Chihuahua',
        label: 'Mexico / Chihuahua (MST/MDT)',
        abbreviation: 'MST'
      },
      {
        value: 'America/Hermosillo',
        label: 'Mexico / Hermosillo (MST)',
        abbreviation: 'MST'
      },
      {
        value: 'America/Mexico_City',
        label: 'Mexico / Mexico City (CST/CDT)',
        abbreviation: 'CST'
      },
      {
        value: 'America/Monterrey',
        label: 'Mexico / Monterrey (CST/CDT)',
        abbreviation: 'CST'
      },
      {
        value: 'America/Merida',
        label: 'Mexico / M\u00e9rida (CST)',
        abbreviation: 'CST'
      },
      {
        value: 'America/Tijuana',
        label: 'Mexico / Tijuana (PST/PDT)',
        abbreviation: 'PST'
      }
    ]
  },
  {
    label: 'Middle East',
    options: [
      {
        value: 'Asia/Bahrain',
        label: 'Bahrain / Manama (AST)',
        abbreviation: 'AST'
      },
      {
        value: 'Asia/Tehran',
        label: 'Iran / Tehran (IRST/IRDT)',
        abbreviation: 'IRST'
      },
      {
        value: 'Asia/Baghdad',
        label: 'Iraq / Baghdad (AST)',
        abbreviation: 'AST'
      },
      {
        value: 'Asia/Jerusalem',
        label: 'Israel / Jerusalem (IST/IDT)',
        abbreviation: 'IST'
      },
      {
        value: 'Asia/Amman',
        label: 'Jordan / Amman (EET/EEST)',
        abbreviation: 'EET'
      },
      {
        value: 'Asia/Kuwait',
        label: 'Kuwait / Kuwait City (AST)',
        abbreviation: 'AST'
      },
      {
        value: 'Asia/Beirut',
        label: 'Lebanon / Beirut (EET/EEST)',
        abbreviation: 'EET'
      },
      {
        value: 'Asia/Muscat',
        label: 'Oman / Muscat (GST)',
        abbreviation: 'GST'
      },
      {
        value: 'Asia/Gaza',
        label: 'Palestine / Gaza (EET/EEST)',
        abbreviation: 'EET'
      },
      {
        value: 'Asia/Hebron',
        label: 'Palestine / Hebron (EET/EEST)',
        abbreviation: 'EET'
      },
      {
        value: 'Asia/Qatar',
        label: 'Qatar / Doha (AST)',
        abbreviation: 'AST'
      },
      {
        value: 'Asia/Riyadh',
        label: 'Saudi Arabia / Riyadh (AST)',
        abbreviation: 'AST'
      },
      {
        value: 'Asia/Damascus',
        label: 'Syria / Damascus (EET/EEST)',
        abbreviation: 'EET'
      },
      {
        value: 'Asia/Dubai',
        label: 'United Arab Emirates / Dubai (GST)',
        abbreviation: 'GST'
      },
      {
        value: 'Asia/Aden',
        label: 'Yemen / Sana\'a (AST)',
        abbreviation: 'AST'
      }
    ]
  },
  {
    label: 'Other Timezones',
    options: [
      {
        value: 'GMT',
        label: 'GMT (Greenwich Mean Time)',
        abbreviation: 'GMT'
      },
      {
        value: 'Pacific/Guam',
        label: 'Guam (ChST)',
        abbreviation: 'ChST'
      },
      {
        value: 'Etc/GMT+12',
        label: 'International Date Line West (GMT-12)',
        abbreviation: 'GMT-12'
      },
      {
        value: 'Pacific/Midway',
        label: 'Midway Island (SST)',
        abbreviation: 'SST'
      },
      {
        value: 'UTC',
        label: 'UTC (Coordinated Universal Time)',
        abbreviation: 'UTC'
      }
    ]
  },
  {
    label: 'Pacific',
    options: [
      {
        value: 'Pacific/Pago_Pago',
        label: 'American Samoa / Pago Pago (SST)',
        abbreviation: 'SST'
      },
      {
        value: 'Pacific/Fiji',
        label: 'Fiji / Suva (FJT)',
        abbreviation: 'FJT'
      },
      {
        value: 'Pacific/Tahiti',
        label: 'French Polynesia / Tahiti (TAHT)',
        abbreviation: 'TAHT'
      },
      {
        value: 'Pacific/Guam',
        label: 'Guam / Hag\u00e5t\u00f1a (ChST)',
        abbreviation: 'ChST'
      },
      {
        value: 'Pacific/Enderbury',
        label: 'Kiribati / Enderbury (PHOT)',
        abbreviation: 'PHOT'
      },
      {
        value: 'Pacific/Kiritimati',
        label: 'Kiribati / Kiritimati (LINT)',
        abbreviation: 'LINT'
      },
      {
        value: 'Pacific/Tarawa',
        label: 'Kiribati / Tarawa (GILT)',
        abbreviation: 'GILT'
      },
      {
        value: 'Pacific/Majuro',
        label: 'Marshall Islands / Majuro (MHT)',
        abbreviation: 'MHT'
      },
      {
        value: 'Pacific/Nauru',
        label: 'Nauru / Yaren (NRT)',
        abbreviation: 'NRT'
      },
      {
        value: 'Pacific/Noumea',
        label: 'New Caledonia / Noum\u00e9a (NCT)',
        abbreviation: 'NCT'
      },
      {
        value: 'Pacific/Auckland',
        label: 'New Zealand / Auckland (NZST/NZDT)',
        abbreviation: 'NZST'
      },
      {
        value: 'Pacific/Chatham',
        label: 'New Zealand / Chatham Islands (CHAST/CHADT)',
        abbreviation: 'CHAST'
      },
      {
        value: 'Pacific/Saipan',
        label: 'Northern Mariana Islands / Saipan (ChST)',
        abbreviation: 'ChST'
      },
      {
        value: 'Pacific/Palau',
        label: 'Palau / Ngerulmud (PWT)',
        abbreviation: 'PWT'
      },
      {
        value: 'Pacific/Port_Moresby',
        label: 'Papua New Guinea / Port Moresby (PGT)',
        abbreviation: 'PGT'
      },
      {
        value: 'Pacific/Apia',
        label: 'Samoa / Apia (WST)',
        abbreviation: 'WST'
      },
      {
        value: 'Pacific/Tongatapu',
        label: 'Tonga / Nuku\u02bbalofa (TOT)',
        abbreviation: 'TOT'
      },
      {
        value: 'Pacific/Funafuti',
        label: 'Tuvalu / Funafuti (TVT)',
        abbreviation: 'TVT'
      },
      {
        value: 'Pacific/Wake',
        label: 'Wake Island / Wake Island (WAKT)',
        abbreviation: 'WAKT'
      },
      {
        value: 'Pacific/Wallis',
        label: 'Wallis and Futuna / Mata-Utu (WFT)',
        abbreviation: 'WFT'
      }
    ]
  },
  {
    label: 'South America',
    options: [
      {
        value: 'America/Buenos_Aires',
        label: 'Argentina / Buenos Aires (ART)',
        abbreviation: 'ART'
      },
      {
        value: 'America/La_Paz',
        label: 'Bolivia / La Paz (BOT)',
        abbreviation: 'BOT'
      },
      {
        value: 'America/Belem',
        label: 'Brazil / Bel\u00e9m (BRT)',
        abbreviation: 'BRT'
      },
      {
        value: 'America/Fortaleza',
        label: 'Brazil / Fortaleza (BRT)',
        abbreviation: 'BRT'
      },
      {
        value: 'America/Manaus',
        label: 'Brazil / Manaus (AMT)',
        abbreviation: 'AMT'
      },
      {
        value: 'America/Recife',
        label: 'Brazil / Recife (BRT)',
        abbreviation: 'BRT'
      },
      {
        value: 'America/Rio_Branco',
        label: 'Brazil / Rio Branco (ACT)',
        abbreviation: 'ACT'
      },
      {
        value: 'America/Bahia',
        label: 'Brazil / Salvador (BRT/BRST)',
        abbreviation: 'BRT'
      },
      {
        value: 'America/Sao_Paulo',
        label: 'Brazil / S\u00e3o Paulo (BRT/BRST)',
        abbreviation: 'BRT'
      },
      {
        value: 'America/Santiago',
        label: 'Chile / Santiago (CLT/CLST)',
        abbreviation: 'CLT'
      },
      {
        value: 'America/Bogota',
        label: 'Colombia / Bogot\u00e1 (COT)',
        abbreviation: 'COT'
      },
      {
        value: 'Pacific/Galapagos',
        label: 'Ecuador / Gal\u00e1pagos (GALT)',
        abbreviation: 'GALT'
      },
      {
        value: 'America/Guayaquil',
        label: 'Ecuador / Guayaquil (ECT)',
        abbreviation: 'ECT'
      },
      {
        value: 'America/Guyana',
        label: 'Guyana / Georgetown (GYT)',
        abbreviation: 'GYT'
      },
      {
        value: 'America/Asuncion',
        label: 'Paraguay / Asunci\u00f3n (PYT/PYST)',
        abbreviation: 'PYT'
      },
      {
        value: 'America/Lima',
        label: 'Peru / Lima (PET)',
        abbreviation: 'PET'
      },
      {
        value: 'America/Paramaribo',
        label: 'Suriname / Paramaribo (SRT)',
        abbreviation: 'SRT'
      },
      {
        value: 'America/Montevideo',
        label: 'Uruguay / Montevideo (UYT/UYST)',
        abbreviation: 'UYT'
      },
      {
        value: 'America/Caracas',
        label: 'Venezuela / Caracas (VET)',
        abbreviation: 'VET'
      }
    ]
  },
  {
    label: 'United States',
    options: [
      {
        value: 'America/New_York',
        label: 'USA / Alabama / Birmingham (CST/CDT)',
        abbreviation: 'CST'
      },
      {
        value: 'America/Chicago',
        label: 'USA / Alabama / Huntsville (CST/CDT)',
        abbreviation: 'CST'
      },
      {
        value: 'America/Anchorage',
        label: 'USA / Alaska / Anchorage (AKST/AKDT)',
        abbreviation: 'AKST'
      },
      {
        value: 'America/Denver',
        label: 'USA / Arizona / Phoenix (MST)',
        abbreviation: 'MST'
      },
      {
        value: 'America/Chicago',
        label: 'USA / Arkansas / Little Rock (CST/CDT)',
        abbreviation: 'CST'
      },
      {
        value: 'America/Los_Angeles',
        label: 'USA / California / Los Angeles (PST/PDT)',
        abbreviation: 'PST'
      },
      {
        value: 'America/Los_Angeles',
        label: 'USA / California / San Francisco (PST/PDT)',
        abbreviation: 'PST'
      },
      {
        value: 'America/Denver',
        label: 'USA / Colorado / Denver (MST/MDT)',
        abbreviation: 'MST'
      },
      {
        value: 'America/New_York',
        label: 'USA / Connecticut / Hartford (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'America/New_York',
        label: 'USA / Delaware / Dover (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'America/New_York',
        label: 'USA / Florida / Miami (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'America/New_York',
        label: 'USA / Georgia / Atlanta (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'Pacific/Honolulu',
        label: 'USA / Hawaii / Honolulu (HST)',
        abbreviation: 'HST'
      },
      {
        value: 'America/Denver',
        label: 'USA / Idaho / Boise (MST/MDT)',
        abbreviation: 'MST'
      },
      {
        value: 'America/Chicago',
        label: 'USA / Illinois / Chicago (CST/CDT)',
        abbreviation: 'CST'
      },
      {
        value: 'America/New_York',
        label: 'USA / Indiana / Indianapolis (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'America/Chicago',
        label: 'USA / Iowa / Des Moines (CST/CDT)',
        abbreviation: 'CST'
      },
      {
        value: 'America/Chicago',
        label: 'USA / Kansas / Topeka (CST/CDT)',
        abbreviation: 'CST'
      },
      {
        value: 'America/Chicago',
        label: 'USA / Kentucky / Bowling Green (CST/CDT)',
        abbreviation: 'CST'
      },
      {
        value: 'America/New_York',
        label: 'USA / Kentucky / Louisville (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'America/Chicago',
        label: 'USA / Louisiana / New Orleans (CST/CDT)',
        abbreviation: 'CST'
      },
      {
        value: 'America/New_York',
        label: 'USA / Maine / Augusta (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'America/New_York',
        label: 'USA / Maryland / Baltimore (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'America/New_York',
        label: 'USA / Massachusetts / Boston (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'America/New_York',
        label: 'USA / Michigan / Detroit (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'America/Chicago',
        label: 'USA / Minnesota / Minneapolis (CST/CDT)',
        abbreviation: 'CST'
      },
      {
        value: 'America/Chicago',
        label: 'USA / Mississippi / Jackson (CST/CDT)',
        abbreviation: 'CST'
      },
      {
        value: 'America/Chicago',
        label: 'USA / Missouri / Kansas City (CST/CDT)',
        abbreviation: 'CST'
      },
      {
        value: 'America/Denver',
        label: 'USA / Montana / Billings (MST/MDT)',
        abbreviation: 'MST'
      },
      {
        value: 'America/Chicago',
        label: 'USA / Nebraska / Omaha (CST/CDT)',
        abbreviation: 'CST'
      },
      {
        value: 'America/Los_Angeles',
        label: 'USA / Nevada / Las Vegas (PST/PDT)',
        abbreviation: 'PST'
      },
      {
        value: 'America/New_York',
        label: 'USA / New Hampshire / Concord (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'America/New_York',
        label: 'USA / New Jersey / Trenton (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'America/Denver',
        label: 'USA / New Mexico / Albuquerque (MST/MDT)',
        abbreviation: 'MST'
      },
      {
        value: 'America/New_York',
        label: 'USA / New York / New York City (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'America/New_York',
        label: 'USA / North Carolina / Raleigh (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'America/Denver',
        label: 'USA / North Dakota / Bismarck (MST/MDT)',
        abbreviation: 'MST'
      },
      {
        value: 'America/Chicago',
        label: 'USA / North Dakota / Fargo (CST/CDT)',
        abbreviation: 'CST'
      },
      {
        value: 'America/New_York',
        label: 'USA / Ohio / Columbus (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'America/Chicago',
        label: 'USA / Oklahoma / Oklahoma City (CST/CDT)',
        abbreviation: 'CST'
      },
      {
        value: 'America/Los_Angeles',
        label: 'USA / Oregon / Portland (PST/PDT)',
        abbreviation: 'PST'
      },
      {
        value: 'America/New_York',
        label: 'USA / Pennsylvania / Philadelphia (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'America/New_York',
        label: 'USA / Rhode Island / Providence (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'America/New_York',
        label: 'USA / South Carolina / Columbia (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'America/Denver',
        label: 'USA / South Dakota / Rapid City (MST/MDT)',
        abbreviation: 'MST'
      },
      {
        value: 'America/Chicago',
        label: 'USA / South Dakota / Sioux Falls (CST/CDT)',
        abbreviation: 'CST'
      },
      {
        value: 'America/New_York',
        label: 'USA / Tennessee / Knoxville (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'America/Chicago',
        label: 'USA / Tennessee / Memphis (CST/CDT)',
        abbreviation: 'CST'
      },
      {
        value: 'America/Chicago',
        label: 'USA / Texas / Dallas (CST/CDT)',
        abbreviation: 'CST'
      },
      {
        value: 'America/Denver',
        label: 'USA / Texas / El Paso (MST/MDT)',
        abbreviation: 'MST'
      },
      {
        value: 'America/Chicago',
        label: 'USA / Texas / Houston (CST/CDT)',
        abbreviation: 'CST'
      },
      {
        value: 'America/Denver',
        label: 'USA / Utah / Salt Lake City (MST/MDT)',
        abbreviation: 'MST'
      },
      {
        value: 'America/New_York',
        label: 'USA / Vermont / Montpelier (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'America/New_York',
        label: 'USA / Virginia / Richmond (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'America/Los_Angeles',
        label: 'USA / Washington / Seattle (PST/PDT)',
        abbreviation: 'PST'
      },
      {
        value: 'America/New_York',
        label: 'USA / Washington DC (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'America/New_York',
        label: 'USA / West Virginia / Charleston (EST/EDT)',
        abbreviation: 'EST'
      },
      {
        value: 'America/Chicago',
        label: 'USA / Wisconsin / Milwaukee (CST/CDT)',
        abbreviation: 'CST'
      },
      {
        value: 'America/Denver',
        label: 'USA / Wyoming / Cheyenne (MST/MDT)',
        abbreviation: 'MST'
      }
    ]
  }
];
