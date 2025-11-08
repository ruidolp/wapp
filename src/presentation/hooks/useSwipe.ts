'use client'

import { useState, useEffect, useRef } from 'react'

interface UseSwipeOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  minSwipeDistance?: number
}

interface SwipeState {
  touchStart: number | null
  touchEnd: number | null
  isDragging: boolean
  currentOffset: number
}

export function useSwipe(options: UseSwipeOptions = {}) {
  const { onSwipeLeft, onSwipeRight, minSwipeDistance = 50 } = options
  const [state, setState] = useState<SwipeState>({
    touchStart: null,
    touchEnd: null,
    isDragging: false,
    currentOffset: 0,
  })

  const onTouchStart = (e: React.TouchEvent) => {
    setState(prev => ({
      ...prev,
      touchStart: e.targetTouches[0].clientX,
      touchEnd: null,
      isDragging: true,
    }))
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (state.touchStart === null) return

    const currentTouch = e.targetTouches[0].clientX
    const offset = currentTouch - state.touchStart

    setState(prev => ({
      ...prev,
      touchEnd: currentTouch,
      currentOffset: offset,
    }))
  }

  const onTouchEnd = () => {
    if (!state.touchStart || !state.touchEnd) {
      setState(prev => ({ ...prev, isDragging: false, currentOffset: 0 }))
      return
    }

    const distance = state.touchStart - state.touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft()
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight()
    }

    setState(prev => ({
      ...prev,
      touchStart: null,
      touchEnd: null,
      isDragging: false,
      currentOffset: 0,
    }))
  }

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    isDragging: state.isDragging,
    currentOffset: state.currentOffset,
  }
}

interface UseCarouselOptions {
  itemCount: number
  initialIndex?: number
  onIndexChange?: (index: number) => void
}

export function useCarousel(options: UseCarouselOptions) {
  const { itemCount, initialIndex = 0, onIndexChange } = options
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const goToNext = () => {
    if (activeIndex < itemCount - 1) {
      setIsTransitioning(true)
      const newIndex = activeIndex + 1
      setActiveIndex(newIndex)
      onIndexChange?.(newIndex)
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }

  const goToPrevious = () => {
    if (activeIndex > 0) {
      setIsTransitioning(true)
      const newIndex = activeIndex - 1
      setActiveIndex(newIndex)
      onIndexChange?.(newIndex)
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }

  const goToIndex = (index: number) => {
    if (index >= 0 && index < itemCount && index !== activeIndex) {
      setIsTransitioning(true)
      setActiveIndex(index)
      onIndexChange?.(index)
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }

  const swipeHandlers = useSwipe({
    onSwipeLeft: goToNext,
    onSwipeRight: goToPrevious,
  })

  return {
    activeIndex,
    goToNext,
    goToPrevious,
    goToIndex,
    isTransitioning,
    canGoNext: activeIndex < itemCount - 1,
    canGoPrevious: activeIndex > 0,
    swipeHandlers,
  }
}
