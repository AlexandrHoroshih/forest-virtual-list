import { createStore, createEvent, sample, combine } from 'effector';
import { list, node, h, spec, val } from 'forest';
import { debug } from 'patronum/debug';

export const virtualList = (config) => {
  // config
  const { options, ...baseConfig } = config;
  const { overscan, estimateSize, onTopHit, onBottomHit } = options;
  const $source = config.source;
  const getKey = (item) => (config.key ? item[config.key] : item);
  const mounted = createEvent();

  // parent properties
  const $bounds = createStore(null);
  const $height = $bounds.map((b) => (b ? b.height : null));
  const setBounds = createEvent();

  $bounds.on(setBounds, (_, next) => next);

  // sizes cache
  const $sizes = createStore({ ref: new Map() });
  const cacheSize = createEvent();

  $sizes.on(cacheSize, (sizes, p) => {
    const { key, size } = p;
    const { ref } = sizes;
    const prev = ref.get(key);

    ref.set(key, {
      ...prev,
      size,
    });

    return { ref };
  });

  $sizes.on(
    sample({
      source: $source,
      clock: [mounted, $source, cacheSize],
    }),
    (prev, list) => {
      const { ref } = prev;

      list.forEach((item, index) => {
        const key = getKey(item);
        const currItem = ref.get(key);
        const prevKey = index > 0 ? getKey(list[index - 1]) : null;
        const prevItem = prevKey ? ref.get(prevKey) : undefined;

        const size = currItem ? currItem.size : estimateSize(item);
        const start = prevItem ? prevItem.end : 0;
        const end = start + size;

        ref.set(key, {
          index,
          key,
          start,
          end,
          size,
        });
      });

      return { ref };
    },
  );

  debug($sizes);

  // virtual list properties
  const $scrollOffset = createStore(0);
  const setScrollOffset = createEvent();

  $scrollOffset.on(setScrollOffset, (_, next) => next);

  const $range = createStore(
    { start: 0, end: 0 },
    {
      updateFilter: (range, prev) =>
        range.start !== prev.start || range.end !== prev.end,
    },
  );

  const $totalSize = combine(
    $source,
    $sizes,
    $height,
    (list, sizes, height) => {
      if (list.length === 0) return height;

      const lastKey = getKey(list[list.length - 1]);
      const lastItem = sizes.ref.get(lastKey);
      const result = lastItem ? lastItem.end : 0;

      return result;
    },
  );

  sample({
    source: [$sizes, $height, $scrollOffset, $source],
    clock: [mounted, $scrollOffset, $height, $sizes, $source],
    fn: ([sizes, height, offset, items]) => {
      const { ref } = sizes;
      const total = items.length;

      let start = total - 1;
      while (start > 0 && ref.get(getKey(items[start])).end >= offset) {
        start -= 1;
      }
      let end = 0;
      while (
        end < total - 1 &&
        ref.get(getKey(items[end])).start <= offset + height
      ) {
        end += 1;
      }

      start = Math.max(start - overscan, 0);
      end = Math.min(end + overscan, total);

      return { start, end };
    },
    target: $range,
  });

  const $visible = combine($range, $source, (range, list) => {
    return list.slice(range.start, range.end);
  });

  // edge detection
  const $isBottomEdge = combine(
    [$range, $source],
    ([range, s]) => range.end === s.length,
  );
  const $isTopEdge = $range.map((range) => range.start === 0);

  sample({
    source: $isBottomEdge,
    clock: [mounted, $scrollOffset],
    target: onBottomHit,
  });

  sample({
    source: $isTopEdge,
    clock: [mounted, $scrollOffset],
    target: onTopHit,
  });

  // parent node setup
  node((root) => {
    mounted();
    console.log('m');
    const unwatch = setupScrollHanlder(root, (offset) => {
      setScrollOffset(offset);
    });
    const sizeObserver = setupRectObserver(root, setBounds);

    return () => {
      sizeObserver.disconnect();
      unwatch();
      console.log('un');
    };
  });

  // list setup
  h('div', () => {
    spec({
      style: {
        position: 'relative',
        width: '100%',
        height: val`${$totalSize}px`,
      },
    });

    list({
      ...baseConfig,
      source: $visible,
      fn: (item) => {
        console.log(item);
        h('div', () => {
          spec({
            style: {
              width: '100%',
              position: 'absolute',
              top: '0px',
              left: '0px',
              height: val`${combine(
                item.key,
                $sizes,
                (key, sizes) => sizes.ref.get(key).size,
              )}px`,
              transform: val`translateY(${combine(
                item.key,
                $sizes,
                (key, sizes) => sizes.ref.get(key).start,
              )}px)`,
            },
            data: {
              key: item.key,
            },
          });

          node((ref) => {
            setTimeout(() => {
              const itemNode = ref.firstChild;
              const key = ref.dataset.key;
              const { height } = itemNode.getBoundingClientRect();

              cacheSize({ key, size: height });
            });
          });
          config.fn(item);
        });
      },
    });
  });
};

function setupRectObserver(root, onChange) {
  const observer = new ResizeObserver((entries) => {
    const { width, height } = entries[0]?.target?.getBoundingClientRect() || {};

    if ((width || height) && onChange) {
      onChange({ width, height });
    }
  });

  observer.observe(root);

  return observer;
}

function setupScrollHanlder(root, onScrollBase) {
  const onScroll = () => {
    onScrollBase(root.scrollTop);
  };

  root.addEventListener('scroll', onScroll, {
    capture: false,
    passive: true,
  });

  return () => root.removeEventListener('scroll', onScroll);
}
