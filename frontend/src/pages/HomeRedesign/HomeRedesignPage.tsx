import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useGlobalSearch } from '../../contexts/SearchContext'
import { digcompAreas } from '../HomePage/constants'
import HomeBackground from './components/HomeBackground'
import HomeScrollJourney from './components/HomeScrollJourney'
import HomeHeroSection from './components/HomeHeroSection'
import HomeStorySection from './components/HomeStorySection'
import HomeDigCompSection from './components/HomeDigCompSection'
import HomeFinalCtaSection from './components/HomeFinalCtaSection'

function HomeRedesignPage() {
    const navigate = useNavigate()

    const [activeIndex, setActiveIndex] = useState(0)
    const [rotationCount, setRotationCount] = useState(0)

    const {
        isSearchActive,
        setIsSearchActive,
        activeFilters,
        toggleFilter,
        searchQuery,
        setSearchQuery,
        searchResults,
        setSearchResults,
        isSearching,
    } = useGlobalSearch()

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % digcompAreas.length)
            setRotationCount((prev) => prev + 1)
        }, 4000)

        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        document.body.style.overflow = isSearchActive ? 'hidden' : 'unset'

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isSearchActive])

    return (
        <main className="relative isolate min-h-screen overflow-x-hidden bg-[#fffdf8] text-[#2f3328]">
            <HomeBackground />

            <div
                className={`fixed inset-0 z-40 transition-all duration-500 ease-in-out ${isSearchActive
                    ? 'bg-[#fffdf8]/60 backdrop-blur-md'
                    : 'pointer-events-none bg-transparent backdrop-blur-none'
                    }`}
                onClick={() => setIsSearchActive(false)}
                aria-hidden="true"
            />

            <HomeScrollJourney />

            <div
                className={`relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-10 ${isSearchActive ? 'z-50' : 'z-20'
                    }`}
            >
                <HomeHeroSection
                    isSearchActive={isSearchActive}
                    setIsSearchActive={setIsSearchActive}
                    activeFilters={activeFilters}
                    toggleFilter={toggleFilter}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    setSearchResults={setSearchResults}
                    searchResults={searchResults}
                    isSearching={isSearching}
                    navigate={navigate}
                />


                <HomeStorySection
                    id="learning-paths"
                    eyebrow="Učne poti"
                    title="Preglej poti glede na področje ali cilj."
                    description="Učna pot povezuje vsebine v pregledno zaporedje, ki ti pomaga razumeti, kam lahko usmeriš svoje učenje."
                    align="left"
                    cards={[
                        {
                            title: 'Učna pot',
                            front: 'Pregleden začetek',
                            back: 'Povezuje module in učne enote v smiselno celoto.',
                        },
                        {
                            title: 'Raziskovanje',
                            front: 'Po področju ali cilju',
                            back: 'Vsebino lahko pregleduješ glede na svoje zanimanje.',
                        },
                    ]}
                />

                <HomeStorySection
                    id="modules"
                    eyebrow="Moduli"
                    title="Vsaka učna pot je razdeljena na pregledne module."
                    description="Moduli razdelijo večjo pot na manjše, razumljive dele. Tako lažje vidiš strukturo in napreduješ korak za korakom."
                    align="right"
                    cards={[
                        {
                            title: 'Modul',
                            front: 'Zaokrožen del poti',
                            back: 'Modul združuje povezane učne enote okoli jasnega cilja.',
                        },
                        {
                            title: 'Struktura',
                            front: 'Več reda, manj zmede',
                            back: 'Vsak modul pomaga razumeti, kaj sledi in zakaj je pomembno.',
                        },
                    ]}
                />

                <HomeStorySection
                    id="learning-units"
                    eyebrow="Učne enote"
                    title="Modul je sestavljen iz manjših učnih enot."
                    description="Učne enote so manjši koraki, ki jih lahko pregleduješ znotraj modula ali samostojno."
                    align="left"
                    cards={[
                        {
                            title: 'Učna enota',
                            front: 'Majhen korak',
                            back: 'Vsaka enota predstavi konkreten del znanja ali spretnosti.',
                        },
                        {
                            title: 'Samostojen pregled',
                            front: 'Razišči posamezno',
                            back: 'Učne enote lahko odpiraš tudi neodvisno od celotne poti.',
                        },
                    ]}
                />

                <HomeStorySection
                    id="questionnaire"
                    eyebrow="Vprašalnik"
                    title="Preveri svojo pozicijo znotraj izbrane poti."
                    description="Vprašalnik ti pomaga razumeti, kaj že obvladaš in kje imaš prostor za napredek."
                    align="right"
                    cards={[
                        {
                            title: 'Samoocena',
                            front: 'Kje sem zdaj?',
                            back: 'Odgovori pomagajo prikazati tvojo trenutno pozicijo.',
                        },
                        {
                            title: 'Naslednji korak',
                            front: 'Bolj jasna smer',
                            back: 'Lažje se odločiš, kje nadaljevati z učenjem.',
                        },
                    ]}
                />

                <HomeDigCompSection
                    activeIndex={activeIndex}
                    rotationCount={rotationCount}
                />

                <HomeFinalCtaSection />
            </div>
        </main>
    )
}

export default HomeRedesignPage