import {
    ArrowRight as ArrowRightIcon,
    Circle as CircleIcon,
    CircleDot as DotIcon,
    Route as PathIcon,
} from 'lucide-react'
import type { NavigateFunction } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

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
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest-100 text-forest-700">
                    <PathIcon className="h-4.5 w-4.5" />
                </span>
            )
        }

        if (result.type === 'module') {
            return (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <CircleIcon className="h-4.5 w-4.5" />
                </span>
            )
        }

        return (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <DotIcon className="h-4.5 w-4.5" />
            </span>
        )
    }

    return (
        <div className="absolute inset-x-0 top-[110px] z-50 pointer-events-none lg:hidden">
            <AnimatePresence>
                {isSearchActive && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        className="flex max-h-[calc(100vh-235px)] flex-col overflow-hidden pointer-events-auto"
                    >
                    <AnimatePresence mode="wait">
                        {isSearching ? (
                            <motion.div
                                key="searching"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex h-24 shrink-0 items-center justify-center rounded-2xl border border-[#eadfce] bg-white/70 text-sm text-[#706b60] shadow-sm backdrop-blur-md"
                            >
                                <div className="flex items-center gap-2 font-medium">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                                    >
                                        <CircleIcon className="h-4 w-4 text-[#31583b]" />
                                    </motion.div>
                                    Iščem...
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col"
                            >
                                <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                    <AnimatePresence mode="popLayout">
                                        {searchResults.length > 0 ? (
                                            searchResults.slice(0, 3).map((result, index) => (
                                                <motion.button
                                                    key={result.id}
                                                    type="button"
                                                    onClick={() => navigateToResult(result)}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{
                                                        type: 'spring',
                                                        stiffness: 400,
                                                        damping: 30,
                                                        delay: index * 0.05,
                                                    }}
                                                    whileTap={{ scale: 0.97 }}
                                                    className="flex w-full items-start gap-3.5 rounded-2xl border border-[#eadfce] bg-white/90 p-3.5 text-left shadow-sm backdrop-blur-xl transition-colors hover:border-[#31583b]/35"
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
                                                </motion.button>
                                            ))
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="flex h-24 items-center justify-center rounded-2xl border border-[#eadfce] bg-white/70 px-4 text-center text-sm text-[#706b60]"
                                            >
                                                Ni bilo najdenih zadetkov za "{searchQuery}".
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex shrink-0 justify-center pt-3"
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                `/search${
                                                    searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''
                                                }`,
                                            )
                                        }
                                        className="inline-flex items-center justify-center gap-2 rounded-full border border-[#31583b] bg-[#31583b] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#274a31]"
                                    >
                                        {searchResults.length > 0
                                            ? 'Prikaži vse zadetke'
                                            : 'Napredno iskanje'}
                                        <ArrowRightIcon className="h-4 w-4" />
                                    </motion.button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
        </div>
    )
}

export default MobileHeroSearchResults