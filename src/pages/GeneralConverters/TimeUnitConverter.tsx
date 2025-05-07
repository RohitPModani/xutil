import UnitConverter from './UnitConverter';
import seoDescriptions from '../../data/seoDescriptions';

function TimeConverter() {
    const seo = seoDescriptions.timeUnit;

    const units = [
      { value: 'ns', label: 'Nanoseconds (ns)' },
      { value: 'μs', label: 'Microseconds (μs)' },
      { value: 'ms', label: 'Milliseconds (ms)' },
      { value: 's', label: 'Seconds (s)' },
      { value: 'min', label: 'Minutes (min)' },
      { value: 'hr', label: 'Hours (hr)' },
      { value: 'day', label: 'Days (day)' },
      { value: 'week', label: 'Weeks (week)' },
      { value: 'month', label: 'Months (month)' },
      { value: 'year', label: 'Years (year)' },
      { value: 'decade', label: 'Decades (decade)' },
      { value: 'century', label: 'Centuries (century)' },
    ];

  return (
    <UnitConverter
      seo={seo}
      defaultValue="1"
      defaultUnit="hr"
      units={units}
      apiEndpoint="time"
      converterName="Time Unit Converter"
      validationMessage="Time must be greater than zero."
    />
  );
}

export default TimeConverter;