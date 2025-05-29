import React, { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import NotFound from '../pages/NotFound';
import Layout from '../components/Layout';

const Home = lazy(() => import('../pages/Home'));

// Types
type AppRoute = RouteObject & {
  title?: string;
  category?: string;
};

// Common wrapper for error boundary with suspense
const withErrorBoundary = (Component: React.LazyExoticComponent<any>): React.ReactElement => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Component />
    </Suspense>
  );
};

// Lazy imports by category
// Encode/Decode Tools
const encodingTools = {
  GuidGenerator: lazy(() => import('../pages/Encode-Decode/GuidGenerator')),
  PasswordGenerator: lazy(() => import('../pages/Encode-Decode/PasswordGenerator')),
  HashGenerator: lazy(() => import('../pages/Encode-Decode/HashGenerator')),
  BaseEncoderDecoder: lazy(() => import('../pages/Encode-Decode/BaseEncoderDecoder')),
  CipherEncoderDecoder: lazy(() => import('../pages/Encode-Decode/CipherEncoderDecoder')),
  JWTEncoderDecoder: lazy(() => import('../pages/Encode-Decode/JWTDecoder')),
  HtmlEntities: lazy(() => import('../pages/Encode-Decode/HTMLEntities')),
  ULIDGenerator: lazy(() => import('../pages/Encode-Decode/ULIDGenerator')),
  MorseCodeTranslator: lazy(() => import('../pages/Encode-Decode/MorseCodeTranslator')),
  URLEncoderDecoder: lazy(() => import('../pages/Encode-Decode/URLEncoderDecoder')),
};

// Converter Tools
const converterTools = {
  XMLJSONConverter: lazy(() => import('../pages/Converters/XmlJsonConverter')),
  YAMLJSONConverter: lazy(() => import('../pages/Converters/YamlJsonConverter')),
  CSVJSONConverter: lazy(() => import('../pages/Converters/CsvJsonConverter')),
  JSONTypescriptConverter: lazy(() => import('../pages/Converters/JsonTypescriptConverter')),
  JSONPythonClassConverter: lazy(() => import('../pages/Converters/JsonPythonConverter')),
  JSONPydanticClassConverter: lazy(() => import('../pages/Converters/JsonPydanticConverter')),
  BaseNumberConverter: lazy(() => import('../pages/Converters/BaseNumberConverter')),
  TextBaseConverter: lazy(() => import('../pages/Converters/TextBaseConverter')),
  UnixUtcConverter: lazy(() => import('../pages/Converters/UnixUTCTimeConverter')),
  TimezoneConverter: lazy(() => import('../pages/Converters/TimezoneConverter')),
};

// General Converter Tools
const generalConverterTools = {
  TimeUnitConverter: lazy(() => import('../pages/GeneralConverters/TimeUnitConverter')),
  BitByteConverter: lazy(() => import('../pages/GeneralConverters/BitByteConverter')),
  TemperatureConverter: lazy(() => import('../pages/GeneralConverters/TemperatureConverter')),
  LengthConverter: lazy(() => import('../pages/GeneralConverters/LengthConverter')),
  AreaConverter: lazy(() => import('../pages/GeneralConverters/AreaConverter')),
  WeightConverter: lazy(() => import('../pages/GeneralConverters/WeightConverter')),
  VolumeConverter: lazy(() => import('../pages/GeneralConverters/VolumeConverter')),
  SpeedConverter: lazy(() => import('../pages/GeneralConverters/SpeedConverter')),
  EnergyConverter: lazy(() => import('../pages/GeneralConverters/EnergyConverter')),
  PowerConverter: lazy(() => import('../pages/GeneralConverters/PowerConverter')),
  PressureConverter: lazy(() => import('../pages/GeneralConverters/PressureConverter')),
  FrequencyConverter: lazy(() => import('../pages/GeneralConverters/FrequencyConverter')),
  AngleConverter: lazy(() => import('../pages/GeneralConverters/AngleConverter')),
  FuelEconomyConverter: lazy(() => import('../pages/GeneralConverters/FuelEconomyConverter')),
};

// Text Utility Tools
const textTools = {
  LoremIpsumGenerator: lazy(() => import('../pages/Text-Utilities/LoremIpsumGenerator')),
  SlugGenerator: lazy(() => import('../pages/Text-Utilities/SlugGenerator')),
  TextCompare: lazy(() => import('../pages/Text-Utilities/TextCompare')),
  JSONValidator: lazy(() => import('../pages/Text-Utilities/JSONValidator')),
  TextCaseConverter: lazy(() => import('../pages/Text-Utilities/TextCaseConverter')),
  RegexTester: lazy(() => import('../pages/Text-Utilities/RegexTester')),
  MarkdownPreviewer: lazy(() => import('../pages/Text-Utilities/MarkdownPreviewer')),
  DuplicateLineRemover: lazy(() => import('../pages/Text-Utilities/DuplicateLineRemover')),
  LineBreakWhiteSpaceRemover: lazy(() => import('../pages/Text-Utilities/LineBreakWhiteSpaceRemover')),
  StringCounter: lazy(() => import('../pages/Text-Utilities/StringCounter')),
  URLParser: lazy(() => import('../pages/Text-Utilities/URLParser')),
  RegexCheatsheet: lazy(() => import('../pages/Text-Utilities/RegexCheatSheet')),
};

// Fun Text Tools
const funTextTools = {
  PalindromeChecker: lazy(() => import('../pages/Fun-Text-Utilities/PalindromeChecker')),
  StringReverserRotator: lazy(() => import('../pages/Fun-Text-Utilities/StringReverserRotator')),
  RomanNumeralConverter: lazy(() => import('../pages/Fun-Text-Utilities/RomanNumeralConverter')),
  NATOPhoneticAlphabetConverter: lazy(() => import('../pages/Fun-Text-Utilities/NATOPhonetic')),
  PigLatinConverter: lazy(() => import('../pages/Fun-Text-Utilities/PigLatinConverter')),
  NumeronymGenerator: lazy(() => import('../pages/Fun-Text-Utilities/NumeroNymGenerator')),
  LeetSpeakTranslator: lazy(() => import('../pages/Fun-Text-Utilities/LeetSpeakTranslator')),
  WordFrequencyCounter: lazy(() => import('../pages/Fun-Text-Utilities/WordFrequencyCounter')),
};

// Image Tools
const imageTools = {
  QRCodeGenerator: lazy(() => import('../pages/Image-Tools/QRCodeGenerator')),
  BarcodeGenerator: lazy(() => import('../pages/Image-Tools/BarCodeGenerator')),
  BarcodeReader: lazy(() => import('../pages/Image-Tools/BarcodeReader')),
  ColorPicker: lazy(() => import('../pages/Image-Tools/ColorPicker')),
  FaviconGenerator: lazy(() => import('../pages/Image-Tools/FaviconGenerator')),
  ImageCompressor: lazy(() => import('../pages/Image-Tools/ImageCompressor')),
  GradientGenerator: lazy(() => import('../pages/Image-Tools/GradientGenerator')),
  BoxShadowGenerator: lazy(() => import('../pages/Image-Tools/BoxShadowGenerator')),
};

// Helper function to create routes with error boundary
const createRoutes = (routes: Record<string, React.LazyExoticComponent<any>>, category: string): AppRoute[] => {
  return Object.entries(routes).map(([key, Component]) => ({
    path: key.toLowerCase().replace(/generator|converter|decoder|encoder/g, '').replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, ''),
    element: withErrorBoundary(Component),
    errorElement: <ErrorBoundary />,
    category,
    title: key.replace(/([A-Z])/g, ' $1').trim(), // Add readable titles
  }));
};

// Main routes configuration
export const appRoutes: AppRoute[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { 
        path: '', 
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Home />
          </Suspense>
        ), 
        errorElement: <ErrorBoundary /> 
      },
      ...createRoutes(encodingTools, 'Encoding & Decoding'),
      ...createRoutes(converterTools, 'Converters'),
      ...createRoutes(generalConverterTools, 'General Converters'),
      ...createRoutes(textTools, 'Text Utilities'),
      ...createRoutes(funTextTools, 'Fun Text Tools'),
      ...createRoutes(imageTools, 'Image Tools'),
      { path: '*', element: <NotFound /> },
    ],
  }
];