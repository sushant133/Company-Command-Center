import { forwardRef, useRef, useEffect, useState } from 'react'
import { cn } from '../../utils/cn'
import { ChevronUp, ChevronDown } from 'lucide-react'

/**
 * ScrollArea Component
 * Provides a custom scrollbar with smooth scrolling
 */
const ScrollArea = forwardRef(
  (
    {
      className,
      children,
      orientation = 'vertical',
      hideScrollbar = false,
      scrollbarSize = 'md',
      onScroll = null,
      autoHide = true,
      showButtons = false,
      maxHeight = null,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef(null)
    const scrollRef = ref || containerRef
    const [showScroll, setShowScroll] = useState(!autoHide)
    const [scrollPosition, setScrollPosition] = useState(0)
    const [canScrollUp, setCanScrollUp] = useState(false)
    const [canScrollDown, setCanScrollDown] = useState(false)

    // Scrollbar sizes
    const scrollbarSizes = {
      sm: 'w-1.5',
      md: 'w-2',
      lg: 'w-3',
    }

    const scrollbarSize_ = scrollbarSizes[scrollbarSize] || scrollbarSizes.md

    // Handle scroll event
    const handleScroll = (e) => {
      const element = e.target
      const scrollTop = element.scrollTop
      const scrollHeight = element.scrollHeight
      const clientHeight = element.clientHeight

      setScrollPosition(scrollTop)
      setCanScrollUp(scrollTop > 0)
      setCanScrollDown(scrollTop < scrollHeight - clientHeight - 10)

      if (onScroll) {
        onScroll({
          scrollTop,
          scrollHeight,
          clientHeight,
          scrollPercentage: (scrollTop / (scrollHeight - clientHeight)) * 100,
        })
      }

      // Show/hide scrollbar on scroll
      if (autoHide) {
        setShowScroll(true)
        clearTimeout(window.scrollHideTimeout)
        window.scrollHideTimeout = setTimeout(() => {
          setShowScroll(false)
        }, 1500)
      }
    }

    // Scroll to top
    const scrollToTop = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      }
    }

    // Scroll to bottom
    const scrollToBottom = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth',
        })
      }
    }

    // Scroll by amount
    const scrollBy = (amount) => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({
          top: amount,
          behavior: 'smooth',
        })
      }
    }

    // Initialize scroll state
    useEffect(() => {
      if (scrollRef.current) {
        const element = scrollRef.current
        setCanScrollDown(element.scrollHeight > element.clientHeight)
      }
    }, [])

    // Expose scroll methods
    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollToTop = scrollToTop
        scrollRef.current.scrollToBottom = scrollToBottom
        scrollRef.current.scrollBy = scrollBy
      }
    }, [])

    return (
      <div
        className={cn(
          'relative group',
          maxHeight && `max-h-[${maxHeight}]`,
          className
        )}
      >
        {/* Scroll Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseEnter={() => autoHide && setShowScroll(true)}
          onMouseLeave={() => autoHide && setShowScroll(false)}
          className={cn(
            'relative h-full overflow-y-auto',
            !hideScrollbar && 'pr-2',
            hideScrollbar && 'scrollbar-hide'
          )}
          {...props}
        >
          {/* Content */}
          <div className={cn('pr-2', hideScrollbar && 'pr-0')}>
            {children}
          </div>

          {/* Custom Scrollbar */}
          {!hideScrollbar && (
            <div
              className={cn(
                'absolute right-0 top-0 h-full bg-slate-200 rounded-full transition-opacity duration-300',
                scrollbarSize_,
                (showScroll || !autoHide)
                  ? 'opacity-50 hover:opacity-75'
                  : 'opacity-0'
              )}
            >
              {/* Scrollbar Track */}
              <div
                className="h-full bg-slate-400 rounded-full transition-all duration-200"
                style={{
                  height: `${Math.max(
                    20,
                    (scrollRef.current?.clientHeight /
                      scrollRef.current?.scrollHeight) *
                      100
                  )}%`,
                  transform: `translateY(${
                    (scrollPosition /
                      (scrollRef.current?.scrollHeight -
                        scrollRef.current?.clientHeight)) *
                    (scrollRef.current?.clientHeight -
                      (scrollRef.current?.clientHeight /
                        scrollRef.current?.scrollHeight) *
                        scrollRef.current?.clientHeight)
                  }px)`,
                }}
              />
            </div>
          )}
        </div>

        {/* Scroll Buttons */}
        {showButtons && (
          <>
            <button
              onClick={scrollToTop}
              disabled={!canScrollUp}
              className={cn(
                'absolute top-2 right-12 p-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-all',
                'disabled:opacity-30 disabled:cursor-not-allowed',
                'z-10'
              )}
              title="Scroll to top"
            >
              <ChevronUp className="h-4 w-4 text-slate-600" />
            </button>

            <button
              onClick={scrollToBottom}
              disabled={!canScrollDown}
              className={cn(
                'absolute bottom-2 right-12 p-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-all',
                'disabled:opacity-30 disabled:cursor-not-allowed',
                'z-10'
              )}
              title="Scroll to bottom"
            >
              <ChevronDown className="h-4 w-4 text-slate-600" />
            </button>
          </>
        )}

        {/* Scroll Indicator */}
        {showButtons && canScrollDown && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}
      </div>
    )
  }
)

ScrollArea.displayName = 'ScrollArea'

export default ScrollArea

/**
 * ScrollAreaWithIndicator Component
 * Shows scroll progress indicator
 */
export const ScrollAreaWithIndicator = forwardRef(
  (
    {
      className,
      children,
      onScroll = null,
      showPercentage = false,
      hideScrollbar = false,
      ...props
    },
    ref
  ) => {
    const [scrollPercentage, setScrollPercentage] = useState(0)

    const handleScroll = (scrollData) => {
      setScrollPercentage(Math.round(scrollData.scrollPercentage))
      if (onScroll) {
        onScroll(scrollData)
      }
    }

    return (
      <div className={cn('relative', className)}>
        <ScrollArea
          ref={ref}
          onScroll={handleScroll}
          hideScrollbar={hideScrollbar}
          {...props}
        >
          {children}
        </ScrollArea>

        {/* Scroll Indicator Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-slate-900 transition-all duration-300"
            style={{ width: `${scrollPercentage}%` }}
          />
        </div>

        {/* Percentage Text */}
        {showPercentage && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-lg font-medium">
            {scrollPercentage}%
          </div>
        )}
      </div>
    )
  }
)

ScrollAreaWithIndicator.displayName = 'ScrollAreaWithIndicator'

/**
 * HorizontalScrollArea Component
 * For horizontal scrolling
 */
export const HorizontalScrollArea = forwardRef(
  (
    {
      className,
      children,
      hideScrollbar = false,
      showButtons = false,
      onScroll = null,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef(null)
    const scrollRef = ref || containerRef
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

    const handleScroll = (e) => {
      const element = e.target
      const scrollLeft = element.scrollLeft
      const scrollWidth = element.scrollWidth
      const clientWidth = element.clientWidth

      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)

      if (onScroll) {
        onScroll({
          scrollLeft,
          scrollWidth,
          clientWidth,
          scrollPercentage: (scrollLeft / (scrollWidth - clientWidth)) * 100,
        })
      }
    }

    const scrollLeft = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({
          left: -200,
          behavior: 'smooth',
        })
      }
    }

    const scrollRight = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({
          left: 200,
          behavior: 'smooth',
        })
      }
    }

    useEffect(() => {
      if (scrollRef.current) {
        const element = scrollRef.current
        setCanScrollRight(element.scrollWidth > element.clientWidth)
      }
    }, [])

    return (
      <div className={cn('relative group', className)}>
        {/* Scroll Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className={cn(
            'relative overflow-x-auto',
            hideScrollbar && 'scrollbar-hide'
          )}
          {...props}
        >
          {/* Content */}
          <div className="inline-flex">
            {children}
          </div>
        </div>

        {/* Scroll Buttons */}
        {showButtons && (
          <>
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className={cn(
                'absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-lg bg-white border border-slate-200 shadow-md hover:shadow-lg transition-all',
                'disabled:opacity-30 disabled:cursor-not-allowed',
                'z-10'
              )}
              title="Scroll left"
            >
              <ChevronUp className="h-4 w-4 text-slate-600 rotate-90" />
            </button>

            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className={cn(
                'absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg bg-white border border-slate-200 shadow-md hover:shadow-lg transition-all',
                'disabled:opacity-30 disabled:cursor-not-allowed',
                'z-10'
              )}
              title="Scroll right"
            >
              <ChevronDown className="h-4 w-4 text-slate-600 -rotate-90" />
            </button>
          </>
        )}

        {/* Left Fade */}
        {showButtons && canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
        )}

        {/* Right Fade */}
        {showButtons && canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
        )}
      </div>
    )
  }
)

HorizontalScrollArea.displayName = 'HorizontalScrollArea'

/**
 * VirtualizedScrollArea Component
 * For large lists with virtualization
 */
export const VirtualizedScrollArea = forwardRef(
  (
    {
      items = [],
      itemHeight = 50,
      renderItem,
      className,
      overscan = 3,
      ...props
    },
    ref
  ) => {
    const scrollRef = useRef(null)
    const [scrollTop, setScrollTop] = useState(0)

    const handleScroll = (e) => {
      setScrollTop(e.target.scrollTop)
    }

    const visibleRange = {
      start: Math.max(0, Math.floor(scrollTop / itemHeight) - overscan),
      end: Math.ceil(
        (scrollTop + (scrollRef.current?.clientHeight || 0)) / itemHeight
      ) + overscan,
    }

    const visibleItems = items.slice(visibleRange.start, visibleRange.end)
    const offsetY = visibleRange.start * itemHeight

    return (
      <ScrollArea
        ref={scrollRef}
        onScroll={handleScroll}
        className={className}
        {...props}
      >
        {/* Virtual Container */}
        <div
          className="relative"
          style={{
            height: `${items.length * itemHeight}px`,
          }}
        >
          {/* Visible Items */}
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
              willChange: 'transform',
            }}
          >
            {visibleItems.map((item, index) => (
              <div
                key={visibleRange.start + index}
                style={{ height: `${itemHeight}px` }}
              >
                {renderItem(item, visibleRange.start + index)}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    )
  }
)

VirtualizedScrollArea.displayName = 'VirtualizedScrollArea'

/**
 * InfiniteScrollArea Component
 * For infinite scrolling/pagination
 */
export const InfiniteScrollArea = forwardRef(
  (
    {
      className,
      children,
      onLoadMore,
      hasMore = true,
      isLoading = false,
      threshold = 200,
      ...props
    },
    ref
  ) => {
    const scrollRef = useRef(null)

    const handleScroll = (e) => {
      const element = e.target
      const scrollTop = element.scrollTop
      const scrollHeight = element.scrollHeight
      const clientHeight = element.clientHeight

      // Check if near bottom
      if (
        scrollHeight - scrollTop - clientHeight < threshold &&
        hasMore &&
        !isLoading &&
        onLoadMore
      ) {
        onLoadMore()
      }
    }

    return (
      <ScrollArea
        ref={scrollRef || ref}
        onScroll={handleScroll}
        className={className}
        {...props}
      >
        {children}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
          </div>
        )}

        {/* No More Items */}
        {!hasMore && (
          <div className="text-center py-8 text-slate-500 text-sm">
            No more items to load
          </div>
        )}
      </ScrollArea>
    )
  }
)

InfiniteScrollArea.displayName = 'InfiniteScrollArea'