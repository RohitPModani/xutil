import { lazy } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import NotFound from '../pages/NotFound';
import Layout from '../components/Layout';

const Home = lazy(() => import('../pages/Home'));
const GuidGenerator = lazy(() => import('../pages/Encode-Decode/GuidGenerator'));
const PasswordGenerator = lazy(() => import('../pages/Encode-Decode/PasswordGenerator'));
const HashGenerator = lazy(() => import('../pages/Encode-Decode/HashGenerator'));
const BaseEncoderDecoder = lazy(() => import('../pages/Encode-Decode/BaseEncoderDecoder'));
const CipherEncoderDecoder = lazy(() => import('../pages/Encode-Decode/CipherEncoderDecoder'));
const JWTEncoderDecoder = lazy(() => import('../pages/Encode-Decode/JWTEncoderDecoder'));
const HtmlEntities = lazy(() => import('../pages/Encode-Decode/HTMLEntities'));
const ULIDGenerator = lazy(() => import('../pages/Encode-Decode/ULIDGenerator'));
const MorseCodeTranslator = lazy(() => import('../pages/Encode-Decode/MorseCodeTranslator'));
const URLEncoderDecoder = lazy(() => import('../pages/Encode-Decode/URLEncoderDecoder'));
const XMLJSONConverter = lazy(() => import('../pages/Converters/XmlJsonConverter'));
const YAMLJSONConverter = lazy(() => import('../pages/Converters/YamlJsonConverter'));
const CSVJSONConverter = lazy(() => import('../pages/Converters/CsvJsonConverter'));
const JSONTypescriptConverter = lazy(() => import('../pages/Converters/JsonTypescriptConverter'));
const JSONPythonClassConverter = lazy(() => import('../pages/Converters/JsonPythonConverter'));
const JSONPydanticClassConverter = lazy(() => import('../pages/Converters/JsonPydanticConverter'));
const BaseNumberConverter = lazy(() => import('../pages/Converters/BaseNumberConverter'));
const TextBaseConverter = lazy(() => import('../pages/Converters/TextBaseConverter'));
const UnixUtcConverter = lazy(() => import('../pages/Converters/UnixUTCTimeConverter'));
const TimezoneConverter = lazy(() => import('../pages/Converters/TimezoneConverter'));
const PxRemEmConverter = lazy(() => import('../pages/Converters/PxRemEmConverter'));
const TimeUnitConverter = lazy(() => import('../pages/GeneralConverters/TimeUnitConverter'));
const BitByteConverter = lazy(() => import('../pages/GeneralConverters/BitByteConverter'));
const TemperatureConverter = lazy(() => import('../pages/GeneralConverters/TemperatureConverter'));
const LengthConverter = lazy(() => import('../pages/GeneralConverters/LengthConverter'));
const AreaConverter = lazy(() => import('../pages/GeneralConverters/AreaConverter'));

export const appRoutes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '', element: <Home />, errorElement: <ErrorBoundary /> },
      { path: 'guid', element: <GuidGenerator />, errorElement: <ErrorBoundary /> },
      { path: 'password', element: <PasswordGenerator />, errorElement: <ErrorBoundary /> },
      { path: 'hash', element: <HashGenerator />, errorElement: <ErrorBoundary /> },
      { path: 'base', element: <BaseEncoderDecoder />, errorElement: <ErrorBoundary /> },
      { path: 'cipher', element: <CipherEncoderDecoder />, errorElement: <ErrorBoundary /> },
      { path: 'jwt', element: <JWTEncoderDecoder />, errorElement: <ErrorBoundary /> },
      { path: 'html', element: <HtmlEntities />, errorElement: <ErrorBoundary />},
      { path: 'ulid', element: <ULIDGenerator />, errorElement: <ErrorBoundary />},
      { path: 'morse', element: <MorseCodeTranslator />, errorElement: <ErrorBoundary />},
      { path: 'eurl', element: <URLEncoderDecoder />, errorElement: <ErrorBoundary />},
      { path: 'xml_json', element: <XMLJSONConverter />, errorElement: <ErrorBoundary />},
      { path: 'yaml_json', element: <YAMLJSONConverter />, errorElement: <ErrorBoundary />},
      { path: 'csv_json', element: <CSVJSONConverter />, errorElement: <ErrorBoundary />},
      { path: 'json_ts', element: <JSONTypescriptConverter />, errorElement: <ErrorBoundary />},
      { path: 'json_python', element: <JSONPythonClassConverter />, errorElement: <ErrorBoundary />},
      { path: 'json_pydantic', element: <JSONPydanticClassConverter />, errorElement: <ErrorBoundary />},
      { path: 'base_number', element: <BaseNumberConverter />, errorElement: <ErrorBoundary />},
      { path: 'text_base', element: <TextBaseConverter />, errorElement: <ErrorBoundary />},
      { path: 'unix_utc', element: <UnixUtcConverter />, errorElement: <ErrorBoundary />},
      { path: 'timezone', element: <TimezoneConverter />, errorElement: <ErrorBoundary />},
      { path: 'px_rem_em', element: <PxRemEmConverter />, errorElement: <ErrorBoundary />},
      { path: 'time', element: <TimeUnitConverter />, errorElement: <ErrorBoundary />},
      { path: 'bit_byte', element: <BitByteConverter />, errorElement: <ErrorBoundary />},
      { path: 'temperature', element: <TemperatureConverter />, errorElement: <ErrorBoundary />},
      { path: 'length', element: <LengthConverter />, errorElement: <ErrorBoundary />},
      { path: 'area', element: <AreaConverter />, errorElement: <ErrorBoundary />},
      { path: '*', element: <NotFound /> },
    ],
  }
];