import { using, spec, h, variant, val } from 'forest';
import { styled, StyledRoot } from 'foliage';
import { combine } from 'effector';

import {
  $list,
  $show,
  toggle,
  $hitBottom,
  $hitTop,
  prev,
  next,
  deleteRandomRange,
} from './model';
import { virtualList } from './virtual-list';

const Wrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;

  & > * {
    margin-bottom: 8px;
  }
`;

const List = styled.ul`
  max-width: 80%;
  min-width: 40vw;
  max-height: 80vh;
  overflow: hidden scroll;
  border: 1px solid red;
  padding: 0;
  margin: 0;
  resize: vertical;
`;

const Item = styled.li`
  display: flex;
  flex-flow: column;
  background-color: var(--bgColor);
  padding: 8px;
  height: 100px;
  width: 100%;
  box-sizing: border-box;
`;

const Line = styled.div``;

$hitBottom.watch(console.log);
$hitTop.watch(console.log);

const App = () => {
  Wrapper(() => {
    h('h1', () => {
      spec({
        text: 'Virtual list with `forest`',
      });
    });
    h('h2', () => {
      spec({
        text: val`Item's count: ${$list.map((l) => l.length)}`,
      });
    });

    h('button', () => {
      spec({
        handler: {
          click: toggle,
        },
        text: $show.map((s) => (s ? 'Hide list' : 'Show list')),
      });
    });

    h('button', () => {
      spec({
        handler: {
          click: prev,
        },
        text: 'Add items to top',
      });
    });
    h('button', () => {
      spec({
        handler: {
          click: next,
        },
        text: 'Add items to bottom',
      });
    });
    h('button', () => {
      spec({
        handler: {
          click: deleteRandomRange,
        },
        text: 'Delete random items',
      });
    });
    h('div', () => {
      spec({
        text: combine($hitTop, $hitBottom, (top, bottom) =>
          top
            ? 'This is top of the list'
            : bottom
            ? 'You hit the bottom'
            : 'Scrolling...',
        ),
      });
    });
    variant({
      source: $show,
      cases: {
        true: () =>
          List(() => {
            virtualList({
              options: {
                overscan: 2,
                estimateSize: () => 100,
                onTopHit: $hitTop,
                onBottomHit: $hitBottom,
              },
              source: $list,
              key: 'account',
              fields: ['color', 'type', 'name', 'amount', 'size'],
              fn: ({ fields: [color, type, name, amount, size] }) =>
                Item(() => {
                  spec({
                    styleVar: {
                      bgColor: color,
                    },
                    style: {
                      height: val`${size}px`,
                      overflow: 'hidden',
                    },
                  });

                  Line({ text: type });
                  Line({ text: name });
                  Line({ text: amount });
                  Line({ text: val`Random height: ${size}px` });
                }),
            });
          }),
      },
    });
  });
};

using(document.querySelector('#app'), App);
using(document.querySelector('head'), StyledRoot);
