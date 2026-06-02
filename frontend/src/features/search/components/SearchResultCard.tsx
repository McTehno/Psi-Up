import type { SearchResult } from '../../../types/search';
import { Route as PathIcon, Circle as CircleIcon, CircleDot as DotIcon } from 'lucide-react';

interface SearchResultCardProps {
    result: SearchResult;
    onClick?: (result: SearchResult) => void;
}

export function SearchResultCard({ result, onClick }: SearchResultCardProps) {
    return (
        <article 
            onClick={() => onClick && onClick(result)}
            className="group flex flex-col sm:flex-row cursor-pointer items-start gap-5 rounded-2xl border border-sand-300 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-forest-300 hover:shadow-md animate-fade-in-up"
        >
            <div className="flex-shrink-0">
                {result.type === 'learning_path' ? (
                    <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-forest-100 text-forest-700">
                        <PathIcon className="h-7 w-7" />
                    </span>
                ) : result.type === 'module' ? (
                    <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                        <CircleIcon className="h-7 w-7" />
                    </span>
                ) : (
                    <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                        <DotIcon className="h-7 w-7" />
                    </span>
                )}
            </div>
            
            <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                        <h3 className="font-display text-xl font-semibold tracking-tight text-brown-900 group-hover:text-forest-700 transition-colors">
                            {result.title}
                        </h3>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs font-semibold">
                            <span className="inline-flex items-center rounded-full bg-sand-100 px-2.5 py-0.5 uppercase tracking-wider text-brown-600 border border-sand-200">
                                {result.type === 'learning_path' ? 'Učna pot' : result.type === 'module' ? 'Modul' : 'Učna enota'}
                            </span>
                        </div>
                    </div>
                </div>
                
                {result.description && (
                    <p className="mt-3 text-sm leading-relaxed text-brown-600 line-clamp-3">
                        {result.description}
                    </p>
                )}
                
                {result.keywords && result.keywords.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {result.keywords.slice(0, 5).map((kw: string) => (
                            <span key={kw} className="rounded-md bg-forest-50 px-2 py-1 text-xs font-medium text-forest-700 transition-colors group-hover:bg-forest-100">
                                #{kw}
                            </span>
                        ))}
                        {result.keywords.length > 5 && (
                            <span className="rounded-md bg-sand-100 px-2 py-1 text-xs font-medium text-brown-500">
                                +{result.keywords.length - 5}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
}