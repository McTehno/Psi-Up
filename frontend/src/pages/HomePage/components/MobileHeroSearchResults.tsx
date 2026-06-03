import {
    ArrowRight as ArrowRightIcon,
    Circle as CircleIcon,
    CircleDot as DotIcon,
    Route as PathIcon,
} from 'lucide-react'
import type { NavigateFunction } from 'react-router-dom'

import type { SearchResult } from '../../../types/search'

type MobileHeroSearchResultsProps = {
    isSearchActive: boolean
    searchQuery: string
    searchResults: SearchResult[]
    isSearching: boolean
    navigate: NavigateFunction
}

function MobileHeroSearchResults({
    isSearchActive,
    searchQuery,
    searchResults,
    isSearching,
    navigate,
}: MobileHeroSearchResultsProps) {
    if (!isSearchActive) return null

    function navigateToResult(result: SearchResult) {
        if (result.type === 'learning_path') {
            navigate(`/learning-paths/${result.id}`)
        } else if (result.type === 'module') {
            navigate(`/modules/${result.id}`)
        } else {
            navigate(`/learning-units/${result.id}`)
        }
    }

    function getResultLabel(type: SearchResult['type']) {
        if (type === 'learning_path') return 'Učna pot'
        if (type === 'module') return 'Modul'
        return 'Učna enota'
    }

    function renderIcon(result: SearchResult) {
        if (result.type === 'learning_path') {
            return (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f2f8f1] text-[#31583b]">
                    <PathIcon className="h-4.5 w-4.5" />
                </span>
            )
        }

        if (result.type === 'module') {
            return (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef7fb] text-[#31576b]">
                    <CircleIcon className="h-4.5 w-4.5" />
                </span>
            )
        }

        return (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff4e6] text-[#d07a12]">
                <DotIcon className="h-4.5 w-4.5" />
            </span>
        )
    }

    return (
        <div className="relative z-50 mt-24 flex max-h-[calc(100vh-235px)] flex-col overflow-hidden lg:hidden">
            {isSearching ? (
                <div className="flex h-24 shrink-0 animate-pulse items-center justify-center rounded-2xl border border-[#eadfce] bg-white/70 text-sm text-[#706b60]">
                    Iščem...
                </div>
            ) : (
                <>
                    <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">                        {searchResults.length > 0 ? (
                        searchResults.slice(0, 3).map((result) => (
                            <button
                                type="button"
                                key={result.id}
                                onClick={() => navigateToResult(result)}
                                className="flex w-full items-start gap-3 rounded-2xl border border-[#eadfce] bg-white/90 p-3 text-left shadow-sm backdrop-blur-xl transition active:scale-[0.99]"
                            >
                                {renderIcon(result)}

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-[#111111]">
                                            {result.title}
                                        </h3>

                                        <span className="shrink-0 rounded-full bg-[#fff6eb] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#706b60]">
                                            {getResultLabel(result.type)}
                                        </span>
                                    </div>

                                    {result.description && (
                                        <p className="mt-1 line-clamp-1 text-[11px] leading-4 text-[#706b60]">
                                            {result.description}
                                        </p>
                                    )}

                                    {result.keywords && result.keywords.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {result.keywords.slice(0, 2).map((keyword) => (
                                                <span
                                                    key={keyword}
                                                    className="rounded-md bg-[#f2f8f1] px-2 py-0.5 text-[9px] font-semibold text-[#31583b]"
                                                >
                                                    #{keyword}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="flex h-24 items-center justify-center rounded-2xl border border-[#eadfce] bg-white/70 px-4 text-center text-sm text-[#706b60]">
                            Ni bilo najdenih zadetkov za "{searchQuery}".
                        </div>
                    )}
                    </div>

                    <div className="flex shrink-0 justify-center pt-3">
                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    `/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''
                                    }`,
                                )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#31583b] bg-[#31583b] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#274a31]"
                        >
                            {searchResults.length > 0
                                ? 'Prikaži vse zadetke'
                                : 'Napredno iskanje'}
                            <ArrowRightIcon className="h-4 w-4" />
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

export default MobileHeroSearchResults