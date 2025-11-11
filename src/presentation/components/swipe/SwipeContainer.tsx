'use client';
import { ReactNode, useState, useRef, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

export interface SwipeItem {
  id: string;
  name: string;
  color?: string;
  content: ReactNode;
}

interface SwipeContainerProps {
  items: SwipeItem[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
}

export function SwipeContainer({
  items,
  initialIndex = 0,
  onIndexChange,
}: SwipeContainerProps) {
  const [index, setIndex] = useState(initialIndex);
  const indexRef = useRef(initialIndex);
  const startIndexRef = useRef(initialIndex);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [{ page }, api] = useSpring(() => ({
    page: initialIndex,
    config: { tension: 220, friction: 26 },
  }));

  useEffect(() => {
    const clamped = Math.max(0, Math.min(items.length - 1, initialIndex));
    setIndex(clamped);
    api.start({ page: clamped });
  }, [initialIndex, items.length, api]);

  const bind = useDrag(
    ({ active, movement: [mx], velocity: [vx], memo, cancel, last }) => {
      if (items.length <= 1) return;

      const width = containerRef.current?.offsetWidth || window.innerWidth || 1;
      const currentIndex = memo ?? index;
      const deltaPages = mx / width;
      let newPage = currentIndex - deltaPages;

      if (active) {
        if (newPage < 0) newPage = -Math.pow(-newPage, 0.7);
        else if (newPage > items.length - 1) {
          const overflow = newPage - (items.length - 1);
          newPage = (items.length - 1) + Math.pow(overflow, 0.7);
        }
        api.start({ page: newPage, immediate: true });
        return currentIndex;
      }

      if (last) {
        cancel();
        let target = Math.round(newPage);
        if (Math.abs(deltaPages) > 0.25 || Math.abs(vx) > 0.3) {
          target = mx < 0 ? currentIndex + 1 : currentIndex - 1;
        }
        target = Math.max(0, Math.min(items.length - 1, target));

        api.start({
          page: target,
          immediate: false,
          onRest: () => {
            setIndex(target);
            onIndexChange?.(target);
          },
        });
      }
    },
    { axis: 'x', filterTaps: true, pointer: { touch: true } }
  );

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <div
        {...bind()}
        style={{ touchAction: 'pan-y pinch-zoom' }}
        className="relative w-full h-full"
      >
        {items.map((item, i) => (
          <animated.div
            key={item.id}
            className="absolute inset-0 w-full h-full"
            style={{
              transform: page.to((p) => `translate3d(${(i - p) * 100}%,0,0)`),
            }}
          >
            <div className="w-full h-full">{item.content}</div>
          </animated.div>
        ))}
      </div>
    </div>
  );
}

