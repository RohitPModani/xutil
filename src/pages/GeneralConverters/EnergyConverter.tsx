import UnitConverter from './UnitConverter';
import seoDescriptions from '../../data/seoDescriptions';

function EnergyConverter() {
    const seo = seoDescriptions.energy;

    const units = [
        { value: 'j', label: 'Joules (J)' },
        { value: 'kj', label: 'Kilojoules (kJ)' },
        { value: 'cal', label: 'Calories (cal)' },
        { value: 'kcal', label: 'Kilocalories (kcal)' },
        { value: 'wh', label: 'Watt-hours (Wh)' },
        { value: 'kwh', label: 'Kilowatt-hours (kWh)' },
        { value: 'ev', label: 'Electronvolts (eV)' },
        { value: 'btu', label: 'British Thermal Units (BTU)' },
      ];

    return (
        <UnitConverter
        seo={seo}
        defaultValue="1"
        defaultUnit="j"
        units={units}
        apiEndpoint="/energy/convert"
        converterName="Energy Converter"
        validationMessage="Energy must be greater than zero."
        />
    );
}

export default EnergyConverter;