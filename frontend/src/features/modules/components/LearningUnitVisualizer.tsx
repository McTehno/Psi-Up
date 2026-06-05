import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LearningUnitReferenceResponse, LearningUnitResponse } from '../../../types/learning-unit';
import { BookOpen, Check, ArrowRight, X } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import EmptyState from '../../../components/common/EmptyState';
import AssessmentPositionMarker from '../../../components/detail/AssessmentPositionMarker';
import { GoalBadge } from './GoalBadge';
import { normalizeDetailContent } from '../../../utils/normalizers/detail-normalizers'

import bg0 from '../../../assets/module-details-background/module-details-background0.webp';
import bg1 from '../../../assets/module-details-background/module-details-background1.webp';
import bg2 from '../../../assets/module-details-background/module-details-background2.webp';
import bg3 from '../../../assets/module-details-background/module-details-background3.webp';
import bg4 from '../../../assets/module-details-background/module-details-background4.webp';

import bgMob0 from '../../../assets/module-details-background-mobile/module-details-background-mobile0.webp';
import bgMob1 from '../../../assets/module-details-background-mobile/module-details-background-mobile1.webp';
import bgMob2 from '../../../assets/module-details-background-mobile/module-details-background-mobile2.webp';
import bgMob3 from '../../../assets/module-details-background-mobile/module-details-background-mobile3.webp';
import bgMob4 from '../../../assets/module-details-background-mobile/module-details-background-mobile4.webp';

const desktopBgs = [bg0, bg1, bg2, bg3, bg4];
const mobileBgs = [bgMob0, bgMob1, bgMob2, bgMob3, bgMob4];


interface LearningUnitVisualizerProps {
  references: LearningUnitReferenceResponse[];
  details?: LearningUnitResponse[];
  completedUnitIds?: string[];
  moduleId?: string;
  assessmentPositionUnitId?: string | null;
}

export const LearningUnitVisualizer: React.FC<LearningUnitVisualizerProps> = ({
  references,
  details = [],
  completedUnitIds = [],
  moduleId,
  assessmentPositionUnitId
}) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeNodeIdx, setActiveNodeIdx] = useState<number | null>(null);

  const isContainerInView = useInView(containerRef, { once: true, margin: "-100px" });


  const safeReferences = Array.isArray(references)
    ? references.filter(
      (reference) =>
        typeof reference.learning_unit_id === 'string' &&
        reference.learning_unit_id.trim().length > 0,
    )
    : []

  const safeDetails = Array.isArray(details) ? details : []

  const safeCompletedUnitIds = Array.isArray(completedUnitIds)
    ? completedUnitIds
    : []
  const bgIndex = useMemo(() => {
    if (!moduleId) return 0;
    let hash = 0;
    for (let i = 0; i < moduleId.length; i++) {
      hash = moduleId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 5;
  }, [moduleId]);

  const currentDesktopBg = desktopBgs[bgIndex];
  const currentMobileBg = mobileBgs[bgIndex];

  // Detect mobile viewport (below Tailwind xl breakpoint to prevent card cutoffs)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1199px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      setActiveNodeIdx(null);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Close popup on outside click/tap
  useEffect(() => {
    if (activeNodeIdx === null) return;
    const handler = (e: PointerEvent) => {
      const target = e.target as Element;
      if (popupRef.current?.contains(target)) return;
      if (target.closest?.('[data-lu-node]')) return;
      setActiveNodeIdx(null);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [activeNodeIdx]);

  const parallaxBg1Ref = useRef<HTMLDivElement>(null);
  const parallaxBg2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    const handleScroll = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        // Calculate offset based on how far the container is from the viewport center
        const centerOffset = (rect.top - window.innerHeight / 2);
        // Move the background slightly slower than the scroll speed
        const offset = centerOffset * -0.15;

        if (parallaxBg1Ref.current) {
          parallaxBg1Ref.current.style.transform = `translate3d(0, ${offset}px, 0) scale(1.15)`;
        }
        if (parallaxBg2Ref.current) {
          parallaxBg2Ref.current.style.transform = `translate3d(0, ${offset}px, 0) scale(1.15)`;
        }
      });
    };

    // Use capture to ensure we catch scroll events from any nested scroll containers
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    handleScroll(); // Initial position
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleUnitClick = useCallback((unitId: string) => {
    navigate(`/learning-units/${unitId}`);
  }, [navigate]);

  const handleNodeClick = useCallback((idx: number, unitId: string) => {
    if (isMobile) {
      setActiveNodeIdx(prev => prev === idx ? null : idx);
    } else {
      handleUnitClick(unitId);
    }
  }, [isMobile, handleUnitClick]);

  const groupedUnits = safeReferences.reduce((acc, ref) => {
    const order = ref.order ?? 999;
    if (!acc[order]) {
      acc[order] = [];
    }
    acc[order].push(ref);
    return acc;
  }, {} as Record<number, LearningUnitReferenceResponse[]>);

  const sortedOrders = Object.keys(groupedUnits).map(Number).sort((a, b) => a - b);
  const numRows = sortedOrders.length;

  const SWING = 160;
  const CENTER_X = 400;
  const OFFSET_TOP = 80;

  const nodePositions: {
    unit: LearningUnitReferenceResponse;
    order: number;
    rowIndex: number;
    x: number;
    y: number;
    isSingle: boolean;
    isOnRightSide: boolean;
  }[] = [];

  let currentY = OFFSET_TOP;

  for (let i = 0; i < numRows; i++) {
    const order = sortedOrders[i];
    const units = groupedUnits[order];
    const numUnits = units.length;

    const isRightRow = i % 2 === 0;

    if (numUnits === 1) {
      nodePositions.push({
        unit: units[0],
        order,
        rowIndex: i,
        x: isRightRow ? CENTER_X + SWING : CENTER_X - SWING,
        y: currentY,
        isSingle: true,
        isOnRightSide: isRightRow
      });
      currentY += 200;
    } else if (numUnits === 2) {
      if (isMobile) {
        nodePositions.push({ unit: units[0], order, rowIndex: i, x: CENTER_X - 140, y: currentY, isSingle: false, isOnRightSide: false });
        nodePositions.push({ unit: units[1], order, rowIndex: i, x: CENTER_X + 140, y: currentY + 140, isSingle: false, isOnRightSide: true });
        currentY += 340;
      } else {
        nodePositions.push({ unit: units[0], order, rowIndex: i, x: CENTER_X - 180, y: currentY, isSingle: false, isOnRightSide: false });
        nodePositions.push({ unit: units[1], order, rowIndex: i, x: CENTER_X + 180, y: currentY, isSingle: false, isOnRightSide: false });
        currentY += 320;
      }
    } else {
      const spread = isMobile ? 320 : 560;
      const staggerAmount = isMobile ? 140 : 0;
      for (let j = 0; j < numUnits; j++) {
        const x = CENTER_X - spread / 2 + (spread / (numUnits - 1)) * j;
        const staggeredY = currentY + (j * staggerAmount);
        nodePositions.push({ unit: units[j], order, rowIndex: i, x, y: staggeredY, isSingle: false, isOnRightSide: false });
      }
      currentY += (isMobile ? 200 + (numUnits - 1) * staggerAmount : 320);
    }
  }

  const finalGoalY = numRows > 0 ? currentY + 40 : OFFSET_TOP + 100;
  const totalHeight = finalGoalY + 160;

  type PathSegment = {
    d: string;
    delay: number;
    duration: number;
  };

  const pathSegments: PathSegment[] = [];
  const DRAW_DURATION = 0.8;

  if (numRows > 0) {
    const firstRow = nodePositions.filter(n => n.rowIndex === 0);
    for (const tgt of firstRow) {
      const cpY = tgt.y / 2;
      pathSegments.push({
        d: `M ${CENTER_X} 0 C ${CENTER_X} ${cpY}, ${tgt.x} ${cpY}, ${tgt.x} ${tgt.y}`,
        delay: 0,
        duration: DRAW_DURATION
      });
    }

    for (let i = 0; i < numRows - 1; i++) {
      const currNodes = nodePositions.filter(n => n.rowIndex === i);
      const nextNodes = nodePositions.filter(n => n.rowIndex === i + 1);

      for (const src of currNodes) {
        for (const tgt of nextNodes) {
          const cpY = (src.y + tgt.y) / 2;
          pathSegments.push({
            d: `M ${src.x} ${src.y} C ${src.x} ${cpY}, ${tgt.x} ${cpY}, ${tgt.x} ${tgt.y}`,
            delay: (i + 1) * DRAW_DURATION,
            duration: DRAW_DURATION
          });
        }
      }
    }

    const lastRow = nodePositions.filter(n => n.rowIndex === numRows - 1);
    for (const src of lastRow) {
      const cpY = (src.y + finalGoalY) / 2;
      pathSegments.push({
        d: `M ${src.x} ${src.y} C ${src.x} ${cpY}, ${CENTER_X} ${cpY}, ${CENTER_X} ${finalGoalY}`,
        delay: numRows * DRAW_DURATION,
        duration: DRAW_DURATION
      });
    }
  } else {
    pathSegments.push({
      d: `M ${CENTER_X} 0 L ${CENTER_X} ${finalGoalY}`,
      delay: 0,
      duration: DRAW_DURATION * 2
    });
  }

  // Mobile popup data
  const activeNode = activeNodeIdx !== null ? nodePositions[activeNodeIdx] : null;
  const activeRef = activeNode?.unit;
  const activeDetail = activeRef
    ? safeDetails.find((detail) => detail._id === activeRef.learning_unit_id)
    : undefined

  const activeNormalizedDetail = activeRef
    ? normalizeDetailContent(
      activeDetail ?? { learning_unit_id: activeRef.learning_unit_id },
      'Neimenovana učna enota',
    )
    : null

  const isActiveCompleted = activeRef
    ? safeCompletedUnitIds.includes(activeRef.learning_unit_id)
      : false

  // Compute mobile popup position (clamped to container bounds)
  const getPopupStyle = (): React.CSSProperties => {
    if (!activeNode || !containerRef.current) return {};
    const containerWidth = containerRef.current.offsetWidth;
    const nodeXPx = (activeNode.x / 800) * containerWidth;
    const popupWidth = Math.min(280, containerWidth - 24);
    const halfPopup = popupWidth / 2;
    const clampedLeft = Math.max(12, Math.min(nodeXPx - halfPopup, containerWidth - popupWidth - 12));
    const showAbove = activeNode.y > totalHeight * 0.65;

    return {
      left: `${clampedLeft}px`,
      width: `${popupWidth}px`,
      ...(showAbove
        ? { top: `${activeNode.y - 44}px`, transform: 'translateY(-100%)' }
        : { top: `${activeNode.y + 44}px` }
      ),
    };
  };

  // Arrow position pointing at the node
  const getArrowOffset = (): number => {
    if (!activeNode || !containerRef.current) return 0;
    const containerWidth = containerRef.current.offsetWidth;
    const nodeXPx = (activeNode.x / 800) * containerWidth;
    const popupWidth = Math.min(280, containerWidth - 24);
    const halfPopup = popupWidth / 2;
    const clampedLeft = Math.max(12, Math.min(nodeXPx - halfPopup, containerWidth - popupWidth - 12));
    return nodeXPx - clampedLeft;
  };

  const showPopupAbove = activeNode ? activeNode.y > totalHeight * 0.65 : false;

  return (
    <div className={`relative w-full py-12 flex flex-col items-center rounded-3xl ${isMobile ? 'overflow-visible' : 'overflow-hidden'}`}>

      {/* Sleek Nature Background Layer */}
      <div className="absolute inset-0 pointer-events-none z-0 rounded-3xl overflow-hidden border border-[#eadfce]/60 bg-[#fffdf8] shadow-[inset_0_2px_20px_rgba(0,0,0,0.02)]">
        {/* Soft base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#fffdf8] via-[#f9f5ed] to-[#f4eee1] opacity-60" />

        {/* Mountain Image for Landscape Screens */}
        <div
          ref={parallaxBg1Ref}
          className="absolute inset-0 mix-blend-multiply opacity-[0.35] portrait:hidden"
          style={{
            backgroundImage: `url(${currentDesktopBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            willChange: 'transform'
          }}
        />

        {/* Mountain Image for Portrait Screens */}
        <div
          ref={parallaxBg2Ref}
          className="absolute inset-0 mix-blend-multiply opacity-[0.35] hidden portrait:block"
          style={{
            backgroundImage: `url(${currentMobileBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            willChange: 'transform'
          }}
        />

        {/* Subtle radial glows for depth */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-white/60 blur-[100px] rounded-full mix-blend-overlay" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#EACE9B]/10 blur-[80px] rounded-full mix-blend-multiply" />
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-[#7DAE8C]/10 blur-[80px] rounded-full mix-blend-multiply" />
      </div>

      {numRows === 0 ? (
        <div className="relative z-10 w-full flex justify-center">
          <EmptyState
            title="Ni učnih enot"
            message="Za ta modul trenutno ni učnih enot."
          />
        </div>
      ) : (
        <div
          ref={containerRef}
          className="relative w-full max-w-[800px] overflow-visible z-10"
          style={{ height: `${totalHeight}px` }}
        >

          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 800 ${totalHeight}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="lu-path-gradient" x1="0%" y1="0%" x2="0%" y2="100%" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#7DAE8C" />
                <stop offset="60%" stopColor="#A4B98E" />
                <stop offset="100%" stopColor="#C4B491" />
              </linearGradient>
            </defs>
            {pathSegments.map((segment, idx) => (
              <motion.path
                key={`path-${idx}`}
                d={segment.d}
                fill="none"
                stroke="url(#lu-path-gradient)"
                strokeWidth="5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isContainerInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                transition={{ 
                  pathLength: { duration: segment.duration, delay: segment.delay, ease: "linear" },
                  opacity: { duration: 0.01, delay: segment.delay } 
                }}
              />
            ))}
          </svg>

          {nodePositions.map((pos, idx) => {
            const ref = pos.unit;
            const detail = safeDetails.find((d) => d._id === ref.learning_unit_id)

            const normalizedDetail = normalizeDetailContent(
              detail ?? { learning_unit_id: ref.learning_unit_id },
              'Neimenovana učna enota',
            )
            const isUnitCompleted = safeCompletedUnitIds.includes(ref.learning_unit_id);
            const isNodeActive = isMobile && activeNodeIdx === idx;
            const isAssessmentPosition = assessmentPositionUnitId === ref.learning_unit_id;
            const nodeDelay = (pos.rowIndex + 1) * DRAW_DURATION;

            return (
              <div
                key={`${ref.learning_unit_id}-${idx}`}
                className="absolute z-10 flex flex-col items-center justify-start transform -translate-x-1/2"
                style={{ left: `${(pos.x / 800) * 100}%`, top: `${pos.y - 28}px` }}
              >
                {isAssessmentPosition && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isContainerInView ? 1 : 0 }}
                    transition={{ duration: 0.8, delay: nodeDelay + 0.2, ease: "easeInOut" }}
                    className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2"
                  >
                    <AssessmentPositionMarker
                      label="Tukaj se nahajaš"
                    />
                  </motion.div>
                )}

                {/* Center Node */}
                <motion.button
                  type="button"
                  data-lu-node={idx}
                  onClick={() => handleNodeClick(idx, ref.learning_unit_id)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isContainerInView ? 1 : 0 }}
                  transition={{ duration: 0.8, delay: nodeDelay, ease: "easeInOut" }}
                  className={`
                    w-[56px] h-[56px] shrink-0 rounded-full flex items-center justify-center relative z-20 shadow-sm cursor-pointer
                    transition-all duration-300
                    ${isNodeActive
                      ? 'ring-4 ring-[#C98A43]/60 scale-110'
                      : 'hover:ring-8'}
                    ${isAssessmentPosition
                      ? 'border-[#d08a34] bg-[#d08a34] text-white shadow-[0_16px_34px_rgba(208,138,52,0.28)]'
                      : isUnitCompleted
                        ? 'bg-[#31583b] border border-[#31583b] hover:ring-[#31583b]/30 scale-105'
                        : 'bg-[#F2EDE1] border-[1.5px] border-[#DECFB3] hover:ring-[#EACE9B]/40 hover:scale-105 hover:bg-white'}
                  `}
                >
                  {isAssessmentPosition ? (
                    <BookOpen className="w-6 h-6 text-white" strokeWidth={2} />
                  ) : isUnitCompleted ? (
                    <Check className="w-6 h-6 text-white" strokeWidth={3} />
                  ) : (
                    <BookOpen className="w-6 h-6 text-[#5c4d3c]" strokeWidth={2} />
                  )}
                </motion.button>

                {/* Mobile Node Label */}
                {isMobile && !isUnitCompleted && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isContainerInView ? 1 : 0 }}
                    transition={{ duration: 0.8, delay: nodeDelay + 0.1, ease: "easeInOut" }}
                    className="mt-2.5 flex flex-col items-center justify-center px-3 py-2 rounded-[14px] shadow-[0_8px_16px_rgba(0,0,0,0.06)] backdrop-blur-md border border-[#eadfce] bg-white/95 text-center w-[140px] pointer-events-none transition-all duration-300"
                  >
                    <h4 className="text-[11px] font-bold leading-snug line-clamp-2 text-[#4a392b]">
                      {normalizedDetail.title}
                    </h4>
                  </motion.div>
                )}

                {/* Desktop cards â€” hidden on mobile */}
                {!isMobile && pos.isSingle && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isContainerInView ? 1 : 0 }}
                    transition={{ duration: 0.8, delay: nodeDelay + 0.2, ease: "easeInOut" }}
                    className={`absolute top-[28px] ${pos.isOnRightSide ? 'left-[70px] md:left-[90px]' : 'right-[70px] md:right-[90px]'} z-0`}
                  >
                    <button
                      type="button"
                      onClick={() => handleUnitClick(ref.learning_unit_id)}
                      className={`-translate-y-1/2 w-[240px] md:w-[260px] backdrop-blur-md p-4 rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-[calc(50%+4px)] cursor-pointer flex flex-col group/card ${isUnitCompleted ? 'bg-[#f4f7f5]/95 border-[#31583b] hover:border-[#31583b]' : 'bg-white/95 border-[#DECFB3] hover:border-[#C98A43]/50'}`}
                    >
                      <div className={`uppercase tracking-[0.2em] text-[#86968B] text-[10px] font-bold opacity-90 mb-2 w-full ${pos.isOnRightSide ? 'text-left' : 'text-right'}`}>
                        Stopnja {ref.order}
                      </div>

                      <div className={`w-full flex items-start gap-2 ${pos.isOnRightSide ? 'justify-between' : 'justify-between flex-row-reverse'}`}>
                        <h4 className={`font-serif text-[1.1rem] font-bold leading-tight mb-1 transition-colors ${isUnitCompleted ? 'text-[#31583b]' : 'text-[#5c3724] group-hover/card:text-[#C98A43]'} ${pos.isOnRightSide ? 'text-left' : 'text-right'}`}>
                          {normalizedDetail.title}
                        </h4>
                        {isUnitCompleted ? (
                          <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-[#31583b] flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </div>
                        ) : (
                          <ArrowRight className={`w-4 h-4 mt-1 text-[#C98A43] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex-shrink-0 ${pos.isOnRightSide ? '' : 'rotate-180'}`} />
                        )}
                      </div>
                      {normalizedDetail.description && (
                        <p className={`text-xs line-clamp-2 mt-1.5 leading-relaxed w-full ${isUnitCompleted ? 'text-[#4a6b53]' : 'text-[#64594c]'} ${pos.isOnRightSide ? 'text-left' : 'text-right'}`}>
                          {normalizedDetail.description || 'Opis učne enote trenutno ni na voljo.'}
                        </p>
                      )}
                      {!ref.is_required && (
                        <span className={`mt-3 inline-block px-2 py-1 border rounded text-[9px] uppercase font-bold ${isUnitCompleted ? 'bg-[#e9f2eb] border-[#31583b]/30 text-[#31583b]' : 'bg-[#F5F0E8] border-[#DECFB3] text-[#A68D6A]'} ${pos.isOnRightSide ? 'self-start' : 'self-end'}`}>
                          Izbirno
                        </span>
                      )}
                    </button>
                  </motion.div>
                )}

                {!isMobile && !pos.isSingle && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isContainerInView ? 1 : 0 }}
                    transition={{ duration: 0.8, delay: nodeDelay + 0.2, ease: "easeInOut" }}
                    className="mt-4"
                  >
                    <button
                      type="button"
                      onClick={() => handleUnitClick(ref.learning_unit_id)}
                      className={`w-[240px] md:w-[260px] backdrop-blur-md p-4 rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col group/card text-left ${isUnitCompleted ? 'bg-[#f4f7f5]/95 border-[#31583b] hover:border-[#31583b]' : 'bg-white/95 border-[#DECFB3] hover:border-[#C98A43]/50'}`}
                    >
                      <div className="uppercase tracking-[0.2em] text-[#86968B] text-[10px] font-bold opacity-90 mb-2">
                        Stopnja {ref.order}
                      </div>

                      <div className="w-full flex items-start justify-between gap-2">
                        <h4 className={`font-serif text-[1.1rem] font-bold leading-tight mb-1 transition-colors ${isUnitCompleted ? 'text-[#31583b]' : 'text-[#5c3724] group-hover/card:text-[#C98A43]'}`}>
                          {normalizedDetail.title}
                        </h4>
                        {isUnitCompleted ? (
                          <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-[#31583b] flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </div>
                        ) : (
                          <ArrowRight className="w-4 h-4 mt-1 text-[#C98A43] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex-shrink-0" />
                        )}
                      </div>
                      {normalizedDetail.description && (
                        <p className={`text-xs line-clamp-2 mt-1.5 leading-relaxed ${isUnitCompleted ? 'text-[#4a6b53]' : 'text-[#64594c]'}`}>
                          {normalizedDetail.description}
                        </p>
                      )}
                      {!ref.is_required && (
                        <span className={`mt-3 inline-block px-2 py-1 border rounded text-[9px] uppercase font-bold self-start ${isUnitCompleted ? 'bg-[#e9f2eb] border-[#31583b]/30 text-[#31583b]' : 'bg-[#F5F0E8] border-[#DECFB3] text-[#A68D6A]'}`}>
                          Izbirno
                        </span>
                      )}
                    </button>
                  </motion.div>
                )}
              </div>
            );
          })}

          {/* Mobile popup card â€” only rendered on mobile when a node is active */}
          {isMobile && activeNode && activeRef && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              ref={popupRef}
              className="absolute z-50"
              style={getPopupStyle()}
            >
              {/* Arrow pointing at the node */}
              <div
                className={`absolute left-0 w-3 h-3 rotate-45 ${isActiveCompleted ? 'bg-[#f4f7f5] border-[#31583b]' : 'bg-white border-[#DECFB3]'} ${showPopupAbove ? 'bottom-[-6px] border-r border-b' : 'top-[-6px] border-l border-t'}`}
                style={{ left: `${getArrowOffset()}px`, transform: 'translateX(-50%) rotate(45deg)' }}
              />

              <div className={`relative backdrop-blur-md p-4 rounded-xl border shadow-lg ${isActiveCompleted ? 'bg-[#f4f7f5]/98 border-[#31583b]' : 'bg-white/98 border-[#DECFB3]'}`}>
                {/* Close button */}
                <button
                  type="button"
                  onClick={() => setActiveNodeIdx(null)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#F5F0E8] flex items-center justify-center text-[#8B7355] hover:bg-[#EDE5D8] transition-colors z-10"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="uppercase tracking-[0.2em] text-[#86968B] text-[10px] font-bold opacity-90 mb-2">
                  Stopnja {activeRef.order}
                </div>

                <h4 className={`font-serif text-[1.1rem] font-bold leading-tight mb-1 pr-6 ${isActiveCompleted ? 'text-[#31583b]' : 'text-[#5c3724]'}`}>
                  {activeNormalizedDetail?.title ?? 'Neimenovana učna enota'}
                </h4>

                {activeNormalizedDetail?.description && (
                  <p className={`text-xs line-clamp-3 mt-1.5 leading-relaxed ${isActiveCompleted ? 'text-[#4a6b53]' : 'text-[#64594c]'}`}>
                    {activeNormalizedDetail.description}
                  </p>
                )}

                {!activeRef.is_required && (
                  <span className={`mt-2 inline-block px-2 py-0.5 border rounded text-[9px] uppercase font-bold ${isActiveCompleted ? 'bg-[#e9f2eb] border-[#31583b]/30 text-[#31583b]' : 'bg-[#F5F0E8] border-[#DECFB3] text-[#A68D6A]'}`}>
                    Izbirno
                  </span>
                )}

                {/* Navigate to detail page */}
                <button
                  type="button"
                  onClick={() => handleUnitClick(activeRef.learning_unit_id)}
                  className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#C98A43] to-[#BF7B56] text-white text-sm font-bold shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  Odpri podrobnosti
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Goal Node */}
          <GoalBadge finalGoalY={finalGoalY} />

        </div>
      )}
    </div>
  );
};




