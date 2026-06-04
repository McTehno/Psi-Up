import type { AdvancedSearchFilters, SearchContentType } from '../../../types/search';

interface SearchFiltersProps {
    filters: AdvancedSearchFilters;
    onChange: (newFilters: AdvancedSearchFilters) => void;
}

export function SearchFilters({ filters, onChange }: SearchFiltersProps) {
    const handleTypeChange = (typeStr: SearchContentType) => {
        const types = filters.types.includes(typeStr)
            ? filters.types.filter((t: SearchContentType) => t !== typeStr)
            : [...filters.types, typeStr];
        onChange({ ...filters, types });
    };

    return (
        <aside className="flex flex-col gap-6 p-6 bg-white rounded-3xl border border-sand-200 shadow-sm sticky top-8">
            <h2 className="text-xl font-display font-semibold text-brown-900 border-b border-sand-200 pb-4">
                Napredno filtriranje
            </h2>

            <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-brown-500">Tip vsebine</h3>
                <div className="flex flex-col gap-2">
                    {([
                        { label: 'Učne poti', value: 'learning_path' as SearchContentType },
                        { label: 'Moduli', value: 'module' as SearchContentType },
                        { label: 'Učne enote', value: 'learning_unit' as SearchContentType }
                    ] as { label: string; value: SearchContentType }[]).map(option => (
                        <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                            <input 
                                type="checkbox"
                                checked={filters.types.includes(option.value)}
                                onChange={() => handleTypeChange(option.value)}
                                className="w-5 h-5 rounded border-sand-300 text-forest-600 focus:ring-forest-500 transition-all"
                            />
                            <span className="text-brown-700 group-hover:text-brown-900 transition-colors">
                                {option.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
            
            {filters.types.length > 0 && (
                <button 
                    onClick={() => onChange({ ...filters, types: [] })}
                    className="mt-4 pt-4 border-t border-sand-200 text-sm font-medium text-forest-700 hover:text-forest-900 transition-colors text-left"
                >
                    Počisti vse filtre
                </button>
            )}
        </aside>
    );
}

